package com.app.controller;

import com.app.dto.OwnerMetricsResponse;
import com.app.entities.OwnerMetrics;
import com.app.service.OwnerScoreService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.app.repository.UserRepository;
import com.app.entities.User;

import java.time.LocalDateTime;

/**
 * Owner controller for review analytics and trust score monitoring
 */
@Slf4j
@RestController
@RequestMapping("/owner/analytics")
//@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
@CrossOrigin(origins = {
	    "http://localhost:5173",
	    "https://valley-360-parking-7zi9-ript5gl4k.vercel.app"
	})
@PreAuthorize("hasRole('OWNER')")
public class OwnerAnalyticsController {

    private final OwnerScoreService ownerScoreService;
    private final UserRepository userRepository;

    public OwnerAnalyticsController(OwnerScoreService ownerScoreService, UserRepository userRepository) {
        this.ownerScoreService = ownerScoreService;
        this.userRepository = userRepository;
    }

    /**
     * Get authenticated owner's trust score and metrics
     * Used for owner dashboard analytics
     * 
     * GET /owner/analytics/my-metrics
     */
    @GetMapping("/my-metrics")
    public ResponseEntity<Object> getMyMetrics() {
        try {
            Long ownerId = getAuthenticatedOwnerId();
            log.info("Fetching metrics for owner: {}", ownerId);

            var metrics = ownerScoreService.getOwnerMetrics(ownerId);

            if (metrics.isEmpty()) {
                // Return default metrics if owner has no reviews yet
                return ResponseEntity.ok(getDefaultMetrics(ownerId));
            }

            OwnerMetricsResponse response = convertToResponse(metrics.get());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching owner metrics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching metrics: " + e.getMessage());
        }
    }

    /**
     * Get analytics summary for owner dashboard
     * Includes sentiment breakdown, recent complaints, etc.
     */
    @GetMapping("/summary")
    public ResponseEntity<Object> getAnalyticsSummary() {
        try {
            Long ownerId = getAuthenticatedOwnerId();
            log.info("Fetching analytics summary for owner: {}", ownerId);

            var metrics = ownerScoreService.getOwnerMetrics(ownerId);

            if (metrics.isEmpty()) {
                return ResponseEntity.ok(getDefaultMetrics(ownerId));
            }

            OwnerMetrics m = metrics.get();

            java.util.Map<String, Object> summary = new java.util.HashMap<>();
            summary.put("trustScore", m.getTrustScore());
            summary.put("riskLevel", m.getRiskLevel().toString());
            summary.put("averageRating", m.getAverageRating());
            summary.put("totalReviews", m.getTotalReviews());
            summary.put("positivePercentage", getTrustPercentage(m.getPositiveReviews(), m.getTotalReviews()));
            summary.put("neutralPercentage", getTrustPercentage(m.getNeutralReviews(), m.getTotalReviews()));
            summary.put("negativePercentage", getTrustPercentage(m.getNegativeReviews(), m.getTotalReviews()));
            summary.put("securityIssues", m.getSecurityFlags());
            summary.put("cleanlinessIssues", m.getCleanlinessFlags());
            summary.put("lastUpdated", m.getUpdatedAt());

            return ResponseEntity.ok(summary);

        } catch (Exception e) {
            log.error("Error fetching analytics summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching summary: " + e.getMessage());
        }
    }

    /**
     * Manually trigger recalculation of owner's trust score
     */
    @PostMapping("/recalculate")
    public ResponseEntity<Object> recalculateMyScore() {
        try {
            Long ownerId = getAuthenticatedOwnerId();
            log.info("Owner {} triggered manual score recalculation", ownerId);

            ownerScoreService.recalculateOwnerScore(ownerId);

            var metrics = ownerScoreService.getOwnerMetrics(ownerId);

            if (metrics.isEmpty()) {
                return ResponseEntity.ok(getDefaultMetrics(ownerId));
            }

            OwnerMetricsResponse response = convertToResponse(metrics.get());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error recalculating owner score", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error recalculating score: " + e.getMessage());
        }
    }

    /**
     * Get authenticated owner's ID from security context
     */
    private Long getAuthenticatedOwnerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Authentication required");
        }

        User owner = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new SecurityException("Owner not found"));

        return owner.getId();
    }

    /**
     * Convert OwnerMetrics entity to response DTO
     */
    private OwnerMetricsResponse convertToResponse(OwnerMetrics metrics) {
        double positivePercentage = getTrustPercentage(metrics.getPositiveReviews(), metrics.getTotalReviews());
        double negativePercentage = getTrustPercentage(metrics.getNegativeReviews(), metrics.getTotalReviews());
        double neutralPercentage = getTrustPercentage(metrics.getNeutralReviews(), metrics.getTotalReviews());

        Long ownerId = null;
        String ownerName = "Owner";
        if (metrics.getOwner() != null) {
            ownerId = metrics.getOwner().getId();
            String firstName = metrics.getOwner().getFirstName() != null ? metrics.getOwner().getFirstName().trim()
                    : "";
            String lastName = metrics.getOwner().getLastName() != null ? metrics.getOwner().getLastName().trim() : "";
            String fullName = (firstName + " " + lastName).trim();
            ownerName = fullName.isEmpty() ? "Owner #" + ownerId : fullName;
        }

        return OwnerMetricsResponse.builder()
                .ownerId(ownerId)
                .ownerName(ownerName)
                .totalReviews(Math.toIntExact(metrics.getTotalReviews()))
                .positiveReviews(metrics.getPositiveReviews())
                .neutralReviews(metrics.getNeutralReviews())
                .negativeReviews(metrics.getNegativeReviews())
                .securityFlags(metrics.getSecurityFlags())
                .cleanlinessFlags(metrics.getCleanlinessFlags())
                .averageRating(metrics.getAverageRating())
                .trustScore(metrics.getTrustScore())
                .riskLevel(metrics.getRiskLevel().toString())
                .updatedAt(metrics.getUpdatedAt())
                .positivePercentage(positivePercentage)
                .negativePercentage(negativePercentage)
                .neutralPercentage(neutralPercentage)
                .build();
    }

    /**
     * Get default metrics for owner with no reviews
     */
    private OwnerMetricsResponse getDefaultMetrics(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        return OwnerMetricsResponse.builder()
                .ownerId(ownerId)
                .ownerName(owner.getFirstName() + " " + owner.getLastName())
                .totalReviews(0)
                .positiveReviews(0)
                .neutralReviews(0)
                .negativeReviews(0)
                .securityFlags(0)
                .cleanlinessFlags(0)
                .averageRating(0.0)
                .trustScore(100.0)
                .riskLevel("LOW")
                .updatedAt(LocalDateTime.now())
                .positivePercentage(0.0)
                .negativePercentage(0.0)
                .neutralPercentage(0.0)
                .build();
    }

    /**
     * Helper to calculate percentage
     */
    private double getTrustPercentage(int count, Integer total) {
        if (total == null || total == 0) {
            return 0.0;
        }
        return Math.round((count * 100.0 / total) * 100.0) / 100.0;
    }
}
