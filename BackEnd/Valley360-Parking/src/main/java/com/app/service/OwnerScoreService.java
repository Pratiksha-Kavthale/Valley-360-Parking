package com.app.service;

import com.app.dto.AdminOwnerRiskResponse;
import com.app.dto.AdminReviewAnalyticsResponse;
import com.app.entities.OwnerMetrics;
import com.app.entities.Review;
import com.app.entities.User;
import com.app.enums.RoleEnum;
import com.app.repository.OwnerMetricsRepository;
import com.app.repository.ReviewRepository;
import com.app.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for calculating and updating owner trust scores
 * Based on review analysis and metrics
 */
@Slf4j
@Service
@Transactional
public class OwnerScoreService {

    private static final String SENTIMENT_NEGATIVE = "NEGATIVE";
    private static final String RISK_NO_DATA = "NO DATA";
    private static final String TREND_STABLE = "Stable";
    private static final String TREND_WORSENING = "Worsening";

    private final OwnerMetricsRepository ownerMetricsRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public OwnerScoreService(OwnerMetricsRepository ownerMetricsRepository, ReviewRepository reviewRepository,
            UserRepository userRepository) {
        this.ownerMetricsRepository = ownerMetricsRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    /**
     * Recalculate owner trust score based on reviews
     * 
     * @param ownerId The owner ID to recalculate
     */
    public void recalculateOwnerScore(Long ownerId) {
        try {
            log.info("Recalculating trust score for owner: {}", ownerId);

            User owner = userRepository.findById(ownerId)
                    .orElse(null);
            if (owner == null) {
                log.warn("Skipping trust score recalculation. Owner not found: {}", ownerId);
                return;
            }

            // Get or create owner metrics
            OwnerMetrics metrics = ownerMetricsRepository.findByOwnerId(ownerId)
                    .orElseGet(() -> {
                        OwnerMetrics newMetrics = new OwnerMetrics();
                        newMetrics.setOwner(owner);
                        return newMetrics;
                    });

            if (metrics.getOwner() == null || metrics.getOwner().getId() == null) {
                metrics.setOwner(owner);
            }

            // Get all reviews for this owner
            List<Review> reviews = reviewRepository.findByOwnerIdAndAiProcessedTrue(ownerId);

            // Update metrics from reviews
            metrics.setTotalReviews(reviews.size());
            metrics.setSecurityFlags(0);
            metrics.setCleanlinessFlags(0);
            metrics.setPositiveReviews(0);
            metrics.setNeutralReviews(0);
            metrics.setNegativeReviews(0);

            double totalRating = 0;
            int securityCount = 0;
            int cleanlinessCount = 0;
            int positiveCount = 0;
            int neutralCount = 0;
            int negativeCount = 0;

            for (Review review : reviews) {
                // Aggregate sentiment
                if ("POSITIVE".equals(review.getSentimentLabel())) {
                    positiveCount++;
                } else if (SENTIMENT_NEGATIVE.equals(review.getSentimentLabel())) {
                    negativeCount++;
                } else {
                    neutralCount++;
                }

                // Count flags
                if (Boolean.TRUE.equals(review.getSecurityFlag())) {
                    securityCount++;
                }
                if (Boolean.TRUE.equals(review.getCleanlinessFlag())) {
                    cleanlinessCount++;
                }

                // Aggregate rating
                totalRating += review.getRating();
            }

            // Update metrics
            metrics.setPositiveReviews(positiveCount);
            metrics.setNeutralReviews(neutralCount);
            metrics.setNegativeReviews(negativeCount);
            metrics.setSecurityFlags(securityCount);
            metrics.setCleanlinessFlags(cleanlinessCount);

            // Calculate average rating
            if (metrics.getTotalReviews() > 0) {
                metrics.setAverageRating(totalRating / metrics.getTotalReviews());
            } else {
                metrics.setAverageRating(0.0);
            }

            // Recalculate trust score
            double trustScore = calculateTrustScore(metrics);
            metrics.setTrustScore(trustScore);

            // Update risk level based on score
            metrics.updateRiskLevel();

            // Save metrics
            ownerMetricsRepository.save(metrics);

            log.info("Trust score updated for owner {} - Score: {}, Risk Level: {}",
                    ownerId, trustScore, metrics.getRiskLevel());

        } catch (Exception e) {
            log.error("Error recalculating owner score for owner: {}", ownerId, e);
            // Don't throw exception - allow system to continue
        }
    }

    /**
     * Calculate trust score based on metrics
     * 
     * Formula:
     * - Start: 100
     * - Penalty if negative% > 30: -20
     * - Penalty if avg_rating < 3: -15
     * - Penalty if security_flags >= 3: -30
     * - Penalty if cleanliness_flags >= 5: -10
     * - No penalty if total_reviews < 5
     * 
     * @param metrics The owner metrics
     * @return Trust score (0-100)
     */
    private double calculateTrustScore(OwnerMetrics metrics) {
        double score = 100.0;

        // Only apply penalties if owner has minimum reviews
        if (metrics.getTotalReviews() < 5) {
            log.debug("Owner {} has < 5 reviews, not applying penalties yet", metrics.getOwner().getId());
            return score;
        }

        // Penalty: High negative review percentage
        if (metrics.getTotalReviews() > 0) {
            double negativePercentage = (metrics.getNegativeReviews() * 100.0) / metrics.getTotalReviews();
            if (negativePercentage > 30) {
                score -= 20;
                log.debug("Penalty for high negative percentage: {}%", negativePercentage);
            }
        }

        // Penalty: Low average rating
        if (metrics.getAverageRating() < 3) {
            score -= 15;
            log.debug("Penalty for low average rating: {}", metrics.getAverageRating());
        }

        // Penalty: Multiple security flags
        if (metrics.getSecurityFlags() >= 3) {
            score -= 30;
            log.debug("Penalty for {} security flags", metrics.getSecurityFlags());
        }

        // Penalty: Multiple cleanliness flags
        if (metrics.getCleanlinessFlags() >= 5) {
            score -= 10;
            log.debug("Penalty for {} cleanliness flags", metrics.getCleanlinessFlags());
        }

        // Clamp score between 0 and 100
        score = Math.max(0, Math.min(100, score));

        return score;
    }

    /**
     * Get owner metrics DTO for API response
     */
    public Optional<OwnerMetrics> getOwnerMetrics(Long ownerId) {
        return ownerMetricsRepository.findByOwnerId(ownerId);
    }

    /**
     * Get all high-risk owners for admin dashboard
     */
    public List<OwnerMetrics> getHighRiskOwners() {
        return ownerMetricsRepository.findHighRiskOwners(
                java.util.Arrays.asList(
                        OwnerMetrics.RiskLevel.HIGH,
                        OwnerMetrics.RiskLevel.CRITICAL));
    }

    /**
     * Get all owners sorted by trust score (ascending).
     */
    public List<OwnerMetrics> getAllOwnersByTrustScore() {
        return ownerMetricsRepository.findAllOrderByTrustScore();
    }

    /**
     * Get normalized owner risk data for admin screens.
     */
    public List<AdminOwnerRiskResponse> getAdminOwnerRiskSummaries() {
        List<User> owners = userRepository.findAllByRoleName(RoleEnum.ROLE_OWNER);

        return owners.stream()
                .map(owner -> {
                    List<Review> reviews = reviewRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId());

                    int totalReviews = reviews.size();
                    String ownerName = resolveOwnerName(owner);

                    if (totalReviews == 0) {
                        return AdminOwnerRiskResponse.builder()
                                .ownerId(owner.getId())
                                .ownerName(ownerName)
                                .trustScore(0.0)
                                .riskLevel(RISK_NO_DATA)
                                .totalReviews(0)
                                .negativePercent(0.0)
                                .securityComplaints(0)
                                .trend(TREND_STABLE)
                                .suggestedAction("Collect More Reviews")
                                .build();
                    }

                    double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
                    int negativeCount = countNegativeReviews(reviews);
                    int securityComplaints = (int) reviews.stream()
                            .filter(r -> Boolean.TRUE.equals(r.getSecurityFlag())).count();
                    int cleanlinessComplaints = (int) reviews.stream()
                            .filter(r -> Boolean.TRUE.equals(r.getCleanlinessFlag())).count();
                    int repeatedBadComplaints = countRepeatedBadComplaints(reviews);

                    double negativePercent = (negativeCount * 100.0) / totalReviews;
                    String trend = detectTrend(reviews);

                    double trustScore = calculateDynamicTrustScore(
                            avgRating,
                            negativePercent,
                            securityComplaints,
                            cleanlinessComplaints,
                            repeatedBadComplaints,
                            trend,
                            reviews);

                    String riskLevel = resolveRiskLevel(trustScore, totalReviews);
                    String suggestedAction = resolveSuggestedAction(riskLevel, trend, securityComplaints);

                    return AdminOwnerRiskResponse.builder()
                            .ownerId(owner.getId())
                            .ownerName(ownerName)
                            .trustScore(Math.round(trustScore * 100.0) / 100.0)
                            .riskLevel(riskLevel)
                            .totalReviews(totalReviews)
                            .negativePercent(Math.round(negativePercent * 100.0) / 100.0)
                            .securityComplaints(securityComplaints)
                            .trend(trend)
                            .suggestedAction(suggestedAction)
                            .build();
                })
                .sorted(Comparator.comparingDouble(AdminOwnerRiskResponse::getTrustScore))
                .collect(Collectors.toList());
    }

    /**
     * Aggregate platform-wide review analytics for admin dashboard.
     */
    public AdminReviewAnalyticsResponse getPlatformReviewAnalytics() {
        List<Review> allReviews = reviewRepository.findAll();
        if (allReviews.isEmpty()) {
            return emptyReviewAnalytics();
        }

        double avgRating = allReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        List<Review> analyzedReviews = reviewRepository.findByAiProcessedTrue();
        int[] sentimentCounts = resolveSentimentCounts(analyzedReviews, allReviews);
        int analyzedTotal = resolveAnalyzedTotal(analyzedReviews, allReviews);

        double positivePercent = percentage(sentimentCounts[0], analyzedTotal);
        double negativePercent = percentage(sentimentCounts[1], analyzedTotal);
        double neutralPercent = percentage(sentimentCounts[2], analyzedTotal);

        Map<String, Integer> complaintCounts = buildComplaintCounts(analyzedReviews, allReviews);

        List<String> topComplaints = complaintCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue(Comparator.reverseOrder()))
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return AdminReviewAnalyticsResponse.builder()
                .totalReviews(allReviews.size())
                .positivePercent(Math.round(positivePercent * 100.0) / 100.0)
                .negativePercent(Math.round(negativePercent * 100.0) / 100.0)
                .neutralPercent(Math.round(neutralPercent * 100.0) / 100.0)
                .avgRating(Math.round(avgRating * 100.0) / 100.0)
                .topComplaints(topComplaints)
                .build();
    }

    private AdminReviewAnalyticsResponse emptyReviewAnalytics() {
        return AdminReviewAnalyticsResponse.builder()
                .totalReviews(0)
                .positivePercent(0.0)
                .negativePercent(0.0)
                .neutralPercent(0.0)
                .avgRating(0.0)
                .topComplaints(new ArrayList<>())
                .build();
    }

    private int[] resolveSentimentCounts(List<Review> analyzedReviews, List<Review> allReviews) {
        int positiveCount = 0;
        int negativeCount = 0;
        int neutralCount = 0;

        List<Review> source = analyzedReviews.isEmpty() ? allReviews : analyzedReviews;
        for (Review review : source) {
            if (analyzedReviews.isEmpty()) {
                if (review.getRating() >= 4) {
                    positiveCount++;
                } else if (review.getRating() <= 2) {
                    negativeCount++;
                } else {
                    neutralCount++;
                }
            } else if ("POSITIVE".equalsIgnoreCase(review.getSentimentLabel())) {
                positiveCount++;
            } else if (SENTIMENT_NEGATIVE.equalsIgnoreCase(review.getSentimentLabel())) {
                negativeCount++;
            } else {
                neutralCount++;
            }
        }

        return new int[] { positiveCount, negativeCount, neutralCount };
    }

    private int resolveAnalyzedTotal(List<Review> analyzedReviews, List<Review> allReviews) {
        return analyzedReviews.isEmpty() ? allReviews.size() : analyzedReviews.size();
    }

    private double percentage(int count, int total) {
        return total > 0 ? (count * 100.0) / total : 0.0;
    }

    private Map<String, Integer> buildComplaintCounts(List<Review> analyzedReviews, List<Review> allReviews) {
        Map<String, Integer> complaintCounts = new HashMap<>();

        int securityFlags = (int) analyzedReviews.stream().filter(r -> Boolean.TRUE.equals(r.getSecurityFlag()))
                .count();
        int cleanlinessFlags = (int) analyzedReviews.stream().filter(r -> Boolean.TRUE.equals(r.getCleanlinessFlag()))
                .count();
        int lowRatingCount = (int) allReviews.stream().filter(r -> r.getRating() <= 2).count();

        if (securityFlags > 0) {
            complaintCounts.put("security", securityFlags);
        }
        if (cleanlinessFlags > 0) {
            complaintCounts.put("cleanliness", cleanlinessFlags);
        }
        if (lowRatingCount > 0) {
            complaintCounts.put("low-rating", lowRatingCount);
        }

        return complaintCounts;
    }

    private String resolveOwnerName(User owner) {
        String firstName = owner.getFirstName() != null ? owner.getFirstName().trim() : "";
        String lastName = owner.getLastName() != null ? owner.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();
        if (!fullName.isEmpty()) {
            return fullName;
        }
        return owner.getEmail() != null ? owner.getEmail() : ("Owner #" + owner.getId());
    }

    private int countNegativeReviews(List<Review> reviews) {
        int negativeCount = 0;
        for (Review review : reviews) {
            if (SENTIMENT_NEGATIVE.equalsIgnoreCase(review.getSentimentLabel()) || review.getRating() <= 2) {
                negativeCount++;
            }
        }
        return negativeCount;
    }

    private int countRepeatedBadComplaints(List<Review> reviews) {
        int repeated = 0;
        int streak = 0;
        for (Review review : reviews) {
            boolean bad = SENTIMENT_NEGATIVE.equalsIgnoreCase(review.getSentimentLabel())
                    || Boolean.TRUE.equals(review.getSecurityFlag())
                    || Boolean.TRUE.equals(review.getCleanlinessFlag())
                    || review.getRating() <= 2;
            if (bad) {
                streak++;
                if (streak >= 2) {
                    repeated++;
                }
            } else {
                streak = 0;
            }
        }
        return repeated;
    }

    private String detectTrend(List<Review> reviews) {
        if (reviews.size() < 4) {
            return TREND_STABLE;
        }

        int split = reviews.size() / 2;
        List<Review> recent = reviews.subList(0, split);
        List<Review> previous = reviews.subList(split, reviews.size());

        double recentAvg = recent.stream().mapToInt(Review::getRating).average().orElse(0.0);
        double previousAvg = previous.stream().mapToInt(Review::getRating).average().orElse(0.0);

        double recentNeg = recent.isEmpty() ? 0.0 : (countNegativeReviews(recent) * 100.0) / recent.size();
        double prevNeg = previous.isEmpty() ? 0.0 : (countNegativeReviews(previous) * 100.0) / previous.size();

        if (recentAvg >= previousAvg + 0.5 && recentNeg <= prevNeg - 10.0) {
            return "Improving";
        }
        if (recentAvg <= previousAvg - 0.5 || recentNeg >= prevNeg + 10.0) {
            return TREND_WORSENING;
        }
        return TREND_STABLE;
    }

    private double calculateDynamicTrustScore(
            double avgRating,
            double negativePercent,
            int securityComplaints,
            int cleanlinessComplaints,
            int repeatedBadComplaints,
            String trend,
            List<Review> reviews) {
        double score = 100.0;

        if (avgRating < 4.5) {
            score -= (4.5 - avgRating) * 8.0;
        }
        if (negativePercent > 15.0) {
            score -= ((negativePercent - 15.0) / 5.0) * 4.0;
        }

        score -= securityComplaints * 4.0;
        score -= cleanlinessComplaints * 2.0;
        score -= repeatedBadComplaints * 3.0;

        if (TREND_WORSENING.equals(trend)) {
            score -= 8.0;
        } else if ("Improving".equals(trend)) {
            score += 4.0;
        }

        long goodRecentReviews = reviews.stream().limit(5)
                .filter(r -> r.getRating() >= 4 && !SENTIMENT_NEGATIVE.equalsIgnoreCase(r.getSentimentLabel()))
                .count();
        score += goodRecentReviews * 1.5;

        return Math.max(0.0, Math.min(100.0, score));
    }

    private String resolveRiskLevel(double trustScore, int totalReviews) {
        if (totalReviews == 0) {
            return RISK_NO_DATA;
        }
        if (trustScore >= 80.0) {
            return "SAFE";
        }
        if (trustScore >= 60.0) {
            return "WARNING";
        }
        if (trustScore >= 40.0) {
            return "HIGH RISK";
        }
        return "CRITICAL";
    }

    private String resolveSuggestedAction(String riskLevel, String trend, int securityComplaints) {
        if (RISK_NO_DATA.equals(riskLevel)) {
            return "Collect More Reviews";
        }
        if ("CRITICAL".equals(riskLevel)) {
            return "Freeze Listings";
        }
        if ("HIGH RISK".equals(riskLevel)) {
            return "Warn Owner";
        }
        if ("WARNING".equals(riskLevel)) {
            return TREND_WORSENING.equals(trend) || securityComplaints >= 2 ? "Warn Owner" : "Monitor Closely";
        }
        return "None";
    }
}
