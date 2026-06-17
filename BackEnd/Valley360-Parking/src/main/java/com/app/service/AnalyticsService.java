package com.app.service;

import java.util.List;
import java.util.Map;

/**
 * Service interface for analytics operations
 */
public interface AnalyticsService {

    // Dashboard Analytics
    List<Map<String, Object>> getDailyBookings(String startDate, String endDate);
    List<Map<String, Object>> getMonthlyRevenue(Integer year);
    List<Map<String, Object>> getOccupancyTrends(String period);
    List<Map<String, Object>> getPeakUsageHours(String startDate, String endDate);

    // Owner Analytics
    Map<String, Object> getOwnerDashboard(Long ownerId);
    List<Map<String, Object>> getOwnerRevenue(Long ownerId, String period);
    List<Map<String, Object>> getOwnerBookings(Long ownerId, String period);

    // User Analytics
    Map<String, Object> getUserDashboard(Long userId);
    List<Map<String, Object>> getUserBookingHistory(Long userId, String period);
    List<Map<String, Object>> getUserSpending(Long userId, String period);

    // Utilization Analytics
    Map<String, Object> getCurrentUtilization();
    Map<String, Object> getAreaUtilization(Long areaId);
    List<Map<String, Object>> getUtilizationHistory(String period);
    List<Map<String, Object>> getUtilizationHeatmap(Long areaId);

    // Admin Analytics
    Map<String, Object> getPlatformStats();
    List<Map<String, Object>> getRevenueByArea(String period);
    List<Map<String, Object>> getTopAreas(int limit);
    Map<String, Object> getConversionRate(String period);
}
