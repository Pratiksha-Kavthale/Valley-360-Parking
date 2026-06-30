package com.app.service;

import com.app.dto.CleanupReportDTO;
import com.app.dto.NotificationDTO;
import com.app.entities.User;
import com.app.enums.RoleEnum;
import com.app.repository.UserRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    
    // Optional - may need to create this repository
    // private final NotificationRepository notificationRepository;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${spring.mail.username:noreply@valley360.com}")
    private String fromEmail;

    @Value("${twilio.accountSid}")
    private String twilioAccountSid;

    @Value("${twilio.authToken}")
    private String twilioAuthToken;

    @Value("${twilio.fromPhone}")
    private String twilioFromPhone;

    @PostConstruct
    public void initTwilio() {
        try {
            log.info("Initializing Twilio with SID={}, fromPhone={}",
                twilioAccountSid != null ? twilioAccountSid.substring(0, Math.min(10, twilioAccountSid.length())) + "..." : "null",
                twilioFromPhone);
            Twilio.init(twilioAccountSid, twilioAuthToken);
            log.info("Twilio SMS service initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize Twilio: {}", e.getMessage());
        }
    }

    @Override
    public void sendRealTimeNotification(Long userId, NotificationDTO notification) {
        try {
            notification.setTimestamp(LocalDateTime.now());
            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notification
            );
            log.info("Sent real-time notification to user {}: {}", userId, notification.getType());
        } catch (Exception e) {
            log.error("Failed to send real-time notification to user {}: {}", userId, e.getMessage());
        }
    }

    @Override
    public void broadcastNotification(NotificationDTO notification) {
        try {
            notification.setTimestamp(LocalDateTime.now());
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            log.info("Broadcast notification: {}", notification.getType());
        } catch (Exception e) {
            log.error("Failed to broadcast notification: {}", e.getMessage());
        }
    }

    @Override
    public void sendBookingConfirmation(Long userId, Long bookingId) {
        NotificationDTO notification = NotificationDTO.builder()
            .type(NotificationDTO.BOOKING_CONFIRMED)
            .title("Booking Confirmed!")
            .message("Your parking booking #" + bookingId + " has been confirmed.")
            .userId(userId)
            .data(Map.of("bookingId", bookingId))
            .build();

        sendRealTimeNotification(userId, notification);
        saveNotification(notification);

        // Also send email
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getEmail() != null) {
            sendEmail(
                user.getEmail(),
                "Booking Confirmed - Valley360 Parking",
                "Your parking booking #" + bookingId + " has been confirmed. " +
                "Please arrive on time and present your QR code at the parking area."
            );
        }
    }

    @Override
    public void sendSlotReservedNotification(Long userId, Long slotId) {
        NotificationDTO notification = NotificationDTO.builder()
            .type(NotificationDTO.SLOT_RESERVED)
            .title("Slot Reserved")
            .message("Parking slot has been reserved for you.")
            .userId(userId)
            .data(Map.of("slotId", slotId))
            .build();

        sendRealTimeNotification(userId, notification);
        saveNotification(notification);
    }

    @Override
    public void sendParkingAreaClosedNotification(Long areaId) {
        NotificationDTO notification = NotificationDTO.builder()
            .type(NotificationDTO.PARKING_AREA_CLOSED)
            .title("Parking Area Closed")
            .message("A parking area you have used has been temporarily closed.")
            .data(Map.of("areaId", areaId))
            .build();

        // Broadcast to all users who have used this area
        broadcastNotification(notification);
    }

    @Override
    public void sendAdminAnnouncement(String title, String message) {
        NotificationDTO notification = NotificationDTO.builder()
            .type(NotificationDTO.ADMIN_ANNOUNCEMENT)
            .title(title)
            .message(message)
            .build();

        broadcastNotification(notification);
    }

    @Override
    public void sendPaymentVerifiedNotification(Long userId, Long bookingId) {
        NotificationDTO notification = NotificationDTO.builder()
            .type(NotificationDTO.PAYMENT_VERIFIED)
            .title("Payment Verified")
            .message("Your payment for booking #" + bookingId + " has been verified.")
            .userId(userId)
            .data(Map.of("bookingId", bookingId))
            .build();

        sendRealTimeNotification(userId, notification);
        saveNotification(notification);
    }

    @Override
    public void sendDeletionWarning(String resourceType, Long resourceId, Long ownerId,
                                    String cancellationToken, LocalDate deletionDate) {
        User owner = userRepository.findById(ownerId).orElse(null);
        if (owner == null) {
            log.warn("Owner not found for deletion warning: {}", ownerId);
            return;
        }

        String resourceName = resourceType.equals("area") ? "parking area" : "parking slot";
        String cancellationLink = baseUrl + "/cancel-deletion?token=" + cancellationToken;

        // Send real-time notification
        NotificationDTO notification = NotificationDTO.builder()
            .type(NotificationDTO.DELETION_WARNING)
            .title("Deletion Warning")
            .message("Your " + resourceName + " is scheduled for deletion on " + deletionDate + 
                    " due to inactivity. Click the link to cancel.")
            .userId(ownerId)
            .data(Map.of(
                "resourceType", resourceType,
                "resourceId", resourceId,
                "cancellationToken", cancellationToken,
                "deletionDate", deletionDate.toString()
            ))
            .build();

        sendRealTimeNotification(ownerId, notification);
        saveNotification(notification);

        // Send email
        if (owner.getEmail() != null) {
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Your %s has been inactive for more than 45 days and is scheduled for deletion on %s.\n\n" +
                "If you wish to keep this resource, please click the link below to cancel the deletion:\n" +
                "%s\n\n" +
                "If you do not take action, the resource will be permanently deleted.\n\n" +
                "Best regards,\n" +
                "Valley360 Parking Team",
                owner.getFirstName() + " " + owner.getLastName(),
                resourceName,
                deletionDate,
                cancellationLink
            );

            sendEmail(
                owner.getEmail(),
                "Action Required: Your " + resourceName + " is scheduled for deletion",
                emailBody
            );
        }

        // Send SMS
        if (owner.getContact() != null) {
            String smsMessage = String.format(
                "Valley360: Your %s is scheduled for deletion on %s due to inactivity. " +
                "Click to cancel: %s",
                resourceName,
                deletionDate,
                cancellationLink
            );
            sendSms(owner.getContact(), smsMessage);
        }

        log.info("Sent deletion warning for {} {} to owner {}", resourceType, resourceId, ownerId);
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    @Override
    public void sendSms(String phoneNumber, String message) {
        try {
            Message.creator(
                new PhoneNumber(phoneNumber),
                new PhoneNumber(twilioFromPhone),
                message
            ).create();
            log.info("SMS sent to {}: {}", phoneNumber, message);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
        }
    }

    @Override
    public void sendBookingSmsNotifications(String customerPhone, String ownerPhone,
                                              String customerName, String ownerName,
                                              String parkingAreaName, String slotInfo,
                                              LocalDateTime startTime, LocalDateTime endTime,
                                              double totalPrice) {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm a");

        String customerMsg = String.format(
            "Dear %s, your parking slot has been booked successfully!\n\n" +
            "Parking Area: %s\n" +
            "Slot: %s\n" +
            "From: %s\n" +
            "To: %s\n" +
            "Total Amount: Rs. %.2f\n\n" +
            "Thank you for choosing Valley 360 Parking.",
            customerName, parkingAreaName, slotInfo,
            startTime.format(dtf), endTime.format(dtf), totalPrice
        );

        if (customerPhone != null && !customerPhone.isBlank()) {
            System.out.println("done");
        	sendSms(customerPhone, customerMsg);
        }

        String ownerMsg = String.format(
            "Dear %s, a parking slot has been booked by a customer.\n\n" +
            "Customer: %s\n" +
            "Parking Area: %s\n" +
            "Slot: %s\n" +
            "From: %s\n" +
            "To: %s\n" +
            "Total Amount: Rs. %.2f\n\n" +
            "Please ensure the slot is ready for the customer.",
            ownerName, customerName, parkingAreaName, slotInfo,
            startTime.format(dtf), endTime.format(dtf), totalPrice
        );

        if (ownerPhone != null && !ownerPhone.isBlank()) {
        	System.out.println("done2");
        	sendSms(ownerPhone, ownerMsg);
        }
    }

    @Override
    public void sendMonthlyCleanupReport(CleanupReportDTO report) {
        // Get admin users
        List<User> admins = userRepository.findAllByRoleName(RoleEnum.ROLE_ADMIN);

        String reportBody = String.format(
            "Monthly Cleanup Report - %d/%d\n\n" +
            "Summary:\n" +
            "- Inactive Parking Areas: %d\n" +
            "- Inactive Parking Slots: %d\n" +
            "- Critical (>60 days): %d\n" +
            "- Total Archived Areas: %d\n" +
            "- Total Archived Slots: %d\n" +
            "- Potential Revenue Impact: ₹%.2f\n\n" +
            "Actions Taken:\n" +
            "- Areas Deleted: %d\n" +
            "- Slots Deleted: %d\n" +
            "- Areas Archived: %d\n" +
            "- Slots Archived: %d\n\n" +
            "Report generated at: %s",
            report.getReportMonth(),
            report.getReportYear(),
            report.getTotalInactiveAreas(),
            report.getTotalInactiveSlots(),
            report.getCriticalAreas(),
            report.getTotalArchivedAreas(),
            report.getTotalArchivedSlots(),
            report.getPotentialRevenueImpact(),
            report.getAreasDeleted(),
            report.getSlotsDeleted(),
            report.getAreasArchived(),
            report.getSlotsArchived(),
            report.getReportGeneratedAt()
        );

        for (User admin : admins) {
            if (admin.getEmail() != null) {
                sendEmail(
                    admin.getEmail(),
                    "Monthly Cleanup Report - Valley360 Parking",
                    reportBody
                );
            }
        }

        log.info("Monthly cleanup report sent to {} admins", admins.size());
    }

    @Override
    public int getUnreadCount(Long userId) {
        // return notificationRepository.countByUserIdAndReadFalse(userId);
        return 0; // Placeholder
    }

    @Override
    public List<NotificationDTO> getNotifications(Long userId, int page, int size) {
        // return notificationRepository.findByUserIdOrderByTimestampDesc(userId, PageRequest.of(page, size))
        //     .stream()
        //     .map(this::toDTO)
        //     .collect(Collectors.toList());
        return List.of(); // Placeholder
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        // Notification notification = notificationRepository.findById(notificationId).orElse(null);
        // if (notification != null) {
        //     notification.setRead(true);
        //     notificationRepository.save(notification);
        // }
        log.info("Marked notification {} as read", notificationId);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        // notificationRepository.markAllAsReadByUserId(userId);
        log.info("Marked all notifications as read for user {}", userId);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        // notificationRepository.deleteById(notificationId);
        log.info("Deleted notification {}", notificationId);
    }

    @Override
    @Transactional
    public void clearAllNotifications(Long userId) {
        // notificationRepository.deleteByUserId(userId);
        log.info("Cleared all notifications for user {}", userId);
    }

    private void saveNotification(NotificationDTO dto) {
        // Notification notification = Notification.builder()
        //     .type(dto.getType())
        //     .title(dto.getTitle())
        //     .message(dto.getMessage())
        //     .userId(dto.getUserId())
        //     .read(false)
        //     .timestamp(LocalDateTime.now())
        //     .build();
        // notificationRepository.save(notification);
        log.debug("Saved notification: {}", dto.getType());
    }
}
