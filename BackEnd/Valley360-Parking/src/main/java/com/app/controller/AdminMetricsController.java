//package com.app.controller;
//
//import com.app.dto.AdminReviewAnalyticsResponse;
//import com.app.dto.OwnerMetricsResponse;
//import com.app.entities.OwnerMetrics;
//import com.app.service.OwnerScoreService;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
///**
// * Admin controller for owner risk monitoring and metrics
// */
//@Slf4j
//@RestController
//@RequestMapping({ "/admin/metrics", "/Admin" })
//@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
//@PreAuthorize("hasRole('ADMIN')")
//public class AdminMetricsController {
//
//    private final OwnerScoreService ownerScoreService;
//
//    public AdminMetricsController(OwnerScoreService ownerScoreService) {
//        this.ownerScoreService = ownerScoreService;
//    }
//
//    /**
//     * Get all owners with risk metrics sorted by trust score
//     * Used by admin dashboard for risk monitoring
//     * 
//     * GET /admin/metrics/owner-risk-monitor
//     */
//    @GetMapping("/owner-risk-monitor")
//    public ResponseEntity<Object> getOwnerRiskMonitor() {
//        try {
//            log.info("Fetching owner risk metrics for admin dashboard");
//
//            List<OwnerMetrics> ownerMetrics = ownerScoreService.getAllOwnersByTrustScore();
//
//            List<OwnerMetricsResponse> response = ownerMetrics.stream()
//                    .map(this::convertToResponse)
//                    .collect(Collectors.toList());
//
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            log.error("Error fetching owner risk metrics", e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error fetching owner metrics: " + e.getMessage());
//        }
//    }
//
//    /**
//     * Get all owners sorted by trust score (high to low risk)
//     */
//    @GetMapping("/all-owners")
//    public ResponseEntity<Object> getAllOwnersMetrics(
//            @RequestParam(required = false, defaultValue = "trust_score") String sortBy) {
//        try {
//            log.info("Fetching all owner metrics, sorted by: {}", sortBy);
//
//            List<OwnerMetrics> ownerMetrics;
//            if ("high-risk".equalsIgnoreCase(sortBy)) {
//                ownerMetrics = ownerScoreService.getHighRiskOwners();
//            } else {
//                ownerMetrics = ownerScoreService.getAllOwnersByTrustScore();
//            }
//
//            List<OwnerMetricsResponse> response = ownerMetrics.stream()
//                    .map(this::convertToResponse)
//                    .collect(Collectors.toList());
//
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            log.error("Error fetching all owner metrics", e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error fetching owner metrics: " + e.getMessage());
//        }
//    }
//
//    /**
//     * Get metrics for a specific owner
//     */
//    @GetMapping("/owner/{ownerId}")
//    public ResponseEntity<Object> getOwnerMetrics(@PathVariable Long ownerId) {
//        try {
//            log.info("Fetching metrics for owner: {}", ownerId);
//
//            var metrics = ownerScoreService.getOwnerMetrics(ownerId);
//
//            if (metrics.isEmpty()) {
//                return ResponseEntity.notFound().build();
//            }
//
//            OwnerMetricsResponse response = convertToResponse(metrics.get());
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            log.error("Error fetching owner metrics for owner: {}", ownerId, e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error fetching metrics: " + e.getMessage());
//        }
//    }
//
//    /**
//     * Manually trigger recalculation of owner trust score
//     */
//    @PostMapping("/recalculate/{ownerId}")
//    public ResponseEntity<Object> recalculateOwnerScore(@PathVariable Long ownerId) {
//        try {
//            log.info("Manually triggering score recalculation for owner: {}", ownerId);
//
//            ownerScoreService.recalculateOwnerScore(ownerId);
//
//            var metrics = ownerScoreService.getOwnerMetrics(ownerId);
//
//            if (metrics.isEmpty()) {
//                return ResponseEntity.notFound().build();
//            }
//
//            OwnerMetricsResponse response = convertToResponse(metrics.get());
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            log.error("Error recalculating owner score", e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error recalculating score: " + e.getMessage());
//        }
//    }
//
//    /**
//     * Required endpoint for platform-wide review analytics.
//     *
//     * GET /Admin/review-analytics
//     */
//    @GetMapping("/review-analytics")
//    public ResponseEntity<AdminReviewAnalyticsResponse> getReviewAnalytics() {
//        AdminReviewAnalyticsResponse response = ownerScoreService.getPlatformReviewAnalytics();
//        return ResponseEntity.ok(response);
//    }
//
//    /**
//     * Convert OwnerMetrics entity to response DTO
//     */
//    private OwnerMetricsResponse convertToResponse(OwnerMetrics metrics) {
//        double positivePercentage = metrics.getTotalReviews() > 0
//                ? (metrics.getPositiveReviews() * 100.0) / metrics.getTotalReviews()
//                : 0;
//
//        double negativePercentage = metrics.getTotalReviews() > 0
//                ? (metrics.getNegativeReviews() * 100.0) / metrics.getTotalReviews()
//                : 0;
//
//        double neutralPercentage = metrics.getTotalReviews() > 0
//                ? (metrics.getNeutralReviews() * 100.0) / metrics.getTotalReviews()
//                : 0;
//
//        String ownerName = "Owner";
//        Long ownerId = null;
//        if (metrics.getOwner() != null) {
//            ownerId = metrics.getOwner().getId();
//            String firstName = metrics.getOwner().getFirstName() != null ? metrics.getOwner().getFirstName().trim()
//                    : "";
//            String lastName = metrics.getOwner().getLastName() != null ? metrics.getOwner().getLastName().trim() : "";
//            String fullName = (firstName + " " + lastName).trim();
//            ownerName = fullName.isEmpty() ? "Owner #" + ownerId : fullName;
//        }
//
//        return OwnerMetricsResponse.builder()
//                .ownerId(ownerId)
//                .ownerName(ownerName)
//                .totalReviews(Math.toIntExact(metrics.getTotalReviews()))
//                .positiveReviews(metrics.getPositiveReviews())
//                .neutralReviews(metrics.getNeutralReviews())
//                .negativeReviews(metrics.getNegativeReviews())
//                .securityFlags(metrics.getSecurityFlags())
//                .cleanlinessFlags(metrics.getCleanlinessFlags())
//                .averageRating(metrics.getAverageRating())
//                .trustScore(metrics.getTrustScore())
//                .riskLevel(metrics.getRiskLevel().toString())
//                .updatedAt(metrics.getUpdatedAt())
//                .positivePercentage(Math.round(positivePercentage * 100.0) / 100.0)
//                .negativePercentage(Math.round(negativePercentage * 100.0) / 100.0)
//                .neutralPercentage(Math.round(neutralPercentage * 100.0) / 100.0)
//                .build();
//    }
//}
