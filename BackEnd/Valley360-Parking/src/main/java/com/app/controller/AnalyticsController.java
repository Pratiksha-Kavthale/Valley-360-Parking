package com.app.controller;

import com.app.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "https://spirited-essence-production.up.railway.app/")
public class AnalyticsController {

    private final AnalyticsService analyticsService = null;

    // ==================
    // Dashboard Analytics
    // ==================

    @GetMapping("/bookings/daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyBookings(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(analyticsService.getDailyBookings(startDate, endDate));
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyRevenue(
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(analyticsService.getMonthlyRevenue(year));
    }

    @GetMapping("/occupancy/trends")
    public ResponseEntity<List<Map<String, Object>>> getOccupancyTrends(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getOccupancyTrends(period));
    }

    @GetMapping("/usage/peak-hours")
    public ResponseEntity<List<Map<String, Object>>> getPeakUsageHours(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(analyticsService.getPeakUsageHours(startDate, endDate));
    }

    // ==================
    // Owner Analytics
    // ==================

    @GetMapping("/owner/{ownerId}/dashboard")
    public ResponseEntity<Map<String, Object>> getOwnerDashboard(@PathVariable Long ownerId) {
        return ResponseEntity.ok(analyticsService.getOwnerDashboard(ownerId));
    }

    @GetMapping("/owner/{ownerId}/revenue")
    public ResponseEntity<List<Map<String, Object>>> getOwnerRevenue(
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getOwnerRevenue(ownerId, period));
    }

    @GetMapping("/owner/{ownerId}/bookings")
    public ResponseEntity<List<Map<String, Object>>> getOwnerBookings(
            @PathVariable Long ownerId,
            @RequestParam(defaultValue = "7d") String period) {
        return ResponseEntity.ok(analyticsService.getOwnerBookings(ownerId, period));
    }

    // ==================
    // User Analytics
    // ==================

    @GetMapping("/user/{userId}/dashboard")
    public ResponseEntity<Map<String, Object>> getUserDashboard(@PathVariable Long userId) {
        return ResponseEntity.ok(analyticsService.getUserDashboard(userId));
    }

    @GetMapping("/user/{userId}/booking-history")
    public ResponseEntity<List<Map<String, Object>>> getUserBookingHistory(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getUserBookingHistory(userId, period));
    }

    @GetMapping("/user/{userId}/spending")
    public ResponseEntity<List<Map<String, Object>>> getUserSpending(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getUserSpending(userId, period));
    }

    // ==================
    // Utilization Analytics
    // ==================

    @GetMapping("/utilization/current")
    public ResponseEntity<Map<String, Object>> getCurrentUtilization() {
        return ResponseEntity.ok(analyticsService.getCurrentUtilization());
    }

    @GetMapping("/utilization/area/{areaId}")
    public ResponseEntity<Map<String, Object>> getAreaUtilization(@PathVariable Long areaId) {
        return ResponseEntity.ok(analyticsService.getAreaUtilization(areaId));
    }

    @GetMapping("/utilization/history")
    public ResponseEntity<List<Map<String, Object>>> getUtilizationHistory(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getUtilizationHistory(period));
    }

    @GetMapping("/utilization/heatmap")
    public ResponseEntity<List<Map<String, Object>>> getUtilizationHeatmap(
            @RequestParam(required = false) Long areaId) {
        return ResponseEntity.ok(analyticsService.getUtilizationHeatmap(areaId));
    }

    // ==================
    // Admin Analytics
    // ==================

    @GetMapping("/admin/platform-stats")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        return ResponseEntity.ok(analyticsService.getPlatformStats());
    }

    @GetMapping("/admin/revenue-by-area")
    public ResponseEntity<List<Map<String, Object>>> getRevenueByArea(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getRevenueByArea(period));
    }

    @GetMapping("/admin/top-areas")
    public ResponseEntity<List<Map<String, Object>>> getTopAreas(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getTopAreas(limit));
    }

    @GetMapping("/admin/conversion-rate")
    public ResponseEntity<Map<String, Object>> getConversionRate(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getConversionRate(period));
    }
}
