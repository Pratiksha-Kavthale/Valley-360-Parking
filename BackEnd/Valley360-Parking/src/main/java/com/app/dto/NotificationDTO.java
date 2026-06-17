package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for notification data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    
    private Long id;
    private String type;
    private String title;
    private String message;
    private Long userId;
    private boolean read;
    private LocalDateTime timestamp;
    private Map<String, Object> data;
    
    // Notification types
    public static final String BOOKING_CONFIRMED = "BOOKING_CONFIRMED";
    public static final String SLOT_RESERVED = "SLOT_RESERVED";
    public static final String PARKING_AREA_CLOSED = "PARKING_AREA_CLOSED";
    public static final String ADMIN_ANNOUNCEMENT = "ADMIN_ANNOUNCEMENT";
    public static final String PAYMENT_VERIFIED = "PAYMENT_VERIFIED";
    public static final String DELETION_WARNING = "DELETION_WARNING";
    public static final String BOOKING_CANCELLED = "BOOKING_CANCELLED";
    public static final String REVIEW_RECEIVED = "REVIEW_RECEIVED";
    public static final String SLOT_AVAILABLE = "SLOT_AVAILABLE";
    public static final String PRICE_UPDATED = "PRICE_UPDATED";
}
