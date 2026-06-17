package com.app.service;

import com.app.dto.CleanupReportDTO;
import com.app.dto.NotificationDTO;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for notifications (WebSocket, Email, SMS)
 */
public interface NotificationService {
    
    /**
     * Send real-time notification via WebSocket
     */
    void sendRealTimeNotification(Long userId, NotificationDTO notification);
    
    /**
     * Send notification to all connected users
     */
    void broadcastNotification(NotificationDTO notification);
    
    /**
     * Send booking confirmation notification
     */
    void sendBookingConfirmation(Long userId, Long bookingId);
    
    /**
     * Send slot reservation notification
     */
    void sendSlotReservedNotification(Long userId, Long slotId);
    
    /**
     * Send parking area closure notification
     */
    void sendParkingAreaClosedNotification(Long areaId);
    
    /**
     * Send admin announcement to all users
     */
    void sendAdminAnnouncement(String title, String message);
    
    /**
     * Send payment verification notification
     */
    void sendPaymentVerifiedNotification(Long userId, Long bookingId);
    
    /**
     * Send deletion warning notification (email + SMS)
     */
    void sendDeletionWarning(String resourceType, Long resourceId, Long ownerId, 
                             String cancellationToken, LocalDate deletionDate);
    
    /**
     * Send email notification
     */
    void sendEmail(String to, String subject, String body);
    
    /**
     * Send SMS notification
     */
    void sendSms(String phoneNumber, String message);
    
    /**
     * Send monthly cleanup report to admins
     */
    void sendMonthlyCleanupReport(CleanupReportDTO report);
    
    /**
     * Get unread notifications count for user
     */
    int getUnreadCount(Long userId);
    
    /**
     * Get notifications for user
     */
    List<NotificationDTO> getNotifications(Long userId, int page, int size);
    
    /**
     * Mark notification as read
     */
    void markAsRead(Long notificationId);
    
    /**
     * Mark all notifications as read
     */
    void markAllAsRead(Long userId);
    
    /**
     * Delete notification
     */
    void deleteNotification(Long notificationId);
    
    /**
     * Clear all notifications for user
     */
    void clearAllNotifications(Long userId);
}
