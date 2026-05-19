package com.app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.dto.ParkingReviewSummaryDTO;
import com.app.dto.ReviewRequestDTO;
import com.app.dto.ReviewResponseDTO;
import com.app.entities.Booking;
import com.app.entities.ParkingArea;
import com.app.entities.ParkingSlot;
import com.app.entities.Review;
import com.app.entities.User;
import com.app.enums.BookingPaymentStatus;
import com.app.exception.ParkingNotFoundException;
import com.app.exception.UserNotFoundException;
import com.app.repository.BookingRepository;
import com.app.repository.ParkingAreaRepository;
import com.app.repository.ReviewRepository;
import com.app.repository.UserRepository;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingAreaRepository parkingAreaRepository;

    @Autowired
    private ReviewAIService reviewAIService;

    @Autowired
    private OwnerScoreService ownerScoreService;

    @Override
    public ReviewResponseDTO createReview(ReviewRequestDTO request) {
        validateRatingRange(request.getRating(), "rating");
        validateRatingRange(request.getCleanliness(), "cleanliness");
        validateRatingRange(request.getSecurity(), "security");
        validateRatingRange(request.getAccessibility(), "accessibility");

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ParkingNotFoundException("Booking not found for id: " + request.getBookingId()));

        User authenticatedUser = getAuthenticatedUser();
        if (booking.getUser() == null || !authenticatedUser.getId().equals(booking.getUser().getId())) {
            throw new SecurityException("You can only review your own booking.");
        }

        if (!"COMPLETED".equals(getBookingStatus(booking))) {
            throw new IllegalStateException("Only COMPLETED bookings can be reviewed.");
        }

        if (booking.getPaymentStatus() != null
                && booking.getPaymentStatus() != BookingPaymentStatus.BOOKING_CONFIRMED) {
            throw new IllegalStateException("Only confirmed bookings can be reviewed.");
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new IllegalStateException("A review for this booking already exists.");
        }

        ParkingSlot slot = booking.getParkingSlot();
        if (slot == null || slot.getParking() == null) {
            throw new IllegalStateException("Parking area not found for this booking.");
        }

        ParkingArea parkingArea = slot.getParking();

        Review review = new Review();
        review.setBooking(booking);
        review.setUser(authenticatedUser);
        review.setParkingArea(parkingArea);
        review.setOwner(parkingArea.getUser()); // Owner is mapped as user on ParkingArea
        review.setRating(request.getRating());
        review.setCleanliness(request.getCleanliness());
        review.setSecurity(request.getSecurity());
        review.setAccessibility(request.getAccessibility());
        review.setComment(normalizeComment(request.getComment()));

        Review saved = reviewRepository.save(review);

        // Call AI analysis service asynchronously
        analyzeReviewAsync(saved);

        refreshParkingStats(parkingArea.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsForParkingArea(Long parkingId) {
        if (!parkingAreaRepository.existsById(parkingId)) {
            throw new ParkingNotFoundException("Parking area not found for id: " + parkingId);
        }

        return reviewRepository.findByParkingAreaIdOrderByCreatedAtDesc(parkingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ParkingReviewSummaryDTO getParkingReviewSummary(Long parkingId) {
        if (!parkingAreaRepository.existsById(parkingId)) {
            throw new ParkingNotFoundException("Parking area not found for id: " + parkingId);
        }

        List<Review> reviews = reviewRepository.findAllByParkingAreaId(parkingId);
        return calculateSummary(reviews);
    }

    private void refreshParkingStats(Long parkingId) {
        ParkingArea parkingArea = parkingAreaRepository.findById(parkingId)
                .orElseThrow(() -> new ParkingNotFoundException("Parking area not found for id: " + parkingId));

        List<Review> reviews = reviewRepository.findAllByParkingAreaId(parkingId);
        ParkingReviewSummaryDTO summary = calculateSummary(reviews);

        parkingArea.setAvgRating(summary.getAvgRating());
        parkingArea.setTotalReviews(summary.getTotalReviews());
        parkingAreaRepository.save(parkingArea);
    }

    private ParkingReviewSummaryDTO calculateSummary(List<Review> reviews) {
        ParkingReviewSummaryDTO summary = new ParkingReviewSummaryDTO();
        long total = reviews.size();

        summary.setTotalReviews(total);
        if (total == 0) {
            summary.setAvgRating(0.0);
            summary.setAvgCleanliness(0.0);
            summary.setAvgSecurity(0.0);
            summary.setAvgAccessibility(0.0);
            return summary;
        }

        summary.setAvgRating(round2(reviews.stream().mapToInt(Review::getRating).average().orElse(0.0)));
        summary.setAvgCleanliness(round2(reviews.stream().mapToInt(Review::getCleanliness).average().orElse(0.0)));
        summary.setAvgSecurity(round2(reviews.stream().mapToInt(Review::getSecurity).average().orElse(0.0)));
        summary.setAvgAccessibility(round2(reviews.stream().mapToInt(Review::getAccessibility).average().orElse(0.0)));
        return summary;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private String normalizeComment(String comment) {
        if (comment == null) {
            return null;
        }
        String trimmed = comment.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void validateRatingRange(int value, String field) {
        if (value < 1 || value > 5) {
            throw new IllegalArgumentException(field + " must be between 1 and 5.");
        }
    }

    private String getBookingStatus(Booking booking) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = booking.getStartTime() != null ? booking.getStartTime() : booking.getArrivalDate();
        LocalDateTime end = booking.getEndTime() != null ? booking.getEndTime() : booking.getDepartureDate();

        if (start != null && now.isBefore(start)) {
            return "RESERVED";
        }
        if (end != null && now.isAfter(end)) {
            return "COMPLETED";
        }
        return "ACTIVE";
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Authentication required.");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Authenticated user not found with email: " + email));
    }

    private ReviewResponseDTO mapToResponse(Review review) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.setId(review.getId());
        dto.setBookingId(review.getBooking() != null ? review.getBooking().getId() : null);
        dto.setParkingAreaId(review.getParkingArea() != null ? review.getParkingArea().getId() : null);
        dto.setUserId(review.getUser() != null ? review.getUser().getId() : null);
        dto.setUserName(resolveUserName(review.getUser()));
        dto.setRating(review.getRating());
        dto.setCleanliness(review.getCleanliness());
        dto.setSecurity(review.getSecurity());
        dto.setAccessibility(review.getAccessibility());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }

    private String resolveUserName(User user) {
        if (user == null) {
            return "User";
        }

        String first = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String last = user.getLastName() != null ? user.getLastName().trim() : "";

        String fullName = (first + " " + last).trim();
        if (!fullName.isEmpty()) {
            return fullName;
        }

        return user.getEmail() != null ? user.getEmail() : "User";
    }

    /**
     * Analyze review using AI service (called after review is saved)
     * If AI service is unavailable, review is still saved without analysis
     */
    private void analyzeReviewAsync(Review review) {
        try {
            if (review.getComment() == null || review.getComment().isEmpty()) {
                return;
            }

            // Call AI service
            var aiResponse = reviewAIService.analyzeReview(review.getComment());

            if (aiResponse != null) {
                // Update review with AI analysis results
                review.setSentimentLabel(aiResponse.getSentimentLabel());
                review.setSentimentScore(aiResponse.getSentimentScore());
                review.setSecurityFlag(aiResponse.getSecurityFlag());
                review.setCleanlinessFlag(aiResponse.getCleanlinessFlag());
                review.setAiProcessed(true);
                review.setAiProcessedAt(LocalDateTime.now());

                // Save updated review
                reviewRepository.save(review);

                // Recalculate owner trust score
                if (review.getOwner() != null) {
                    ownerScoreService.recalculateOwnerScore(review.getOwner().getId());
                }
            }
        } catch (Exception e) {
            System.err.println("Error analyzing review: " + e.getMessage());
            // Don't throw exception - review already saved
        }
    }
}
