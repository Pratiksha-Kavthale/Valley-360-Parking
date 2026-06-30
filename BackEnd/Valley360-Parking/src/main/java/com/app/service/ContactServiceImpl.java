package com.app.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.dto.ContactRequestDTO;
import com.app.dto.ContactResponseDTO;
import com.app.entities.ContactMessage;
import com.app.repository.ContactRepository;

@Service
@Transactional
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final NotificationService notificationService;

    public ContactServiceImpl(ContactRepository contactRepository, NotificationService notificationService) {
        this.contactRepository = contactRepository;
        this.notificationService = notificationService;
    }

    @Override
    public ContactResponseDTO sendMessage(ContactRequestDTO request) {
        ContactMessage message = new ContactMessage();
        message.setFullName(request.getFullName().trim());
        message.setMobileNumber(request.getMobileNumber().trim());
        message.setEmail(request.getEmail().trim());
        message.setSubject(request.getSubject() != null ? request.getSubject().trim() : null);
        message.setMessage(request.getMessage().trim());

        ContactMessage saved = contactRepository.save(message);

        sendNotificationEmail(saved);

        return mapToResponse(saved);
    }

    private void sendNotificationEmail(ContactMessage msg) {
        String subject = "New Contact Message" +
            (msg.getSubject() != null && !msg.getSubject().isBlank()
                ? " - " + msg.getSubject()
                : "");

        String body = "A new contact message has been received.\n\n" +
            "-- Contact Details --\n" +
            "Name:    " + msg.getFullName() + "\n" +
            "Phone:   " + msg.getMobileNumber() + "\n" +
            "Email:   " + msg.getEmail() + "\n" +
            "Subject: " + (msg.getSubject() != null && !msg.getSubject().isBlank() ? msg.getSubject() : "(not provided)") + "\n" +
            "-- Message --\n" +
            msg.getMessage() + "\n" +
            "--\n" +
            "Received at: " + (msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : "just now");

        notificationService.sendEmail("pratikshakavthale.iacsd@gmail.com", subject, body);
    }

    private ContactResponseDTO mapToResponse(ContactMessage message) {
        ContactResponseDTO dto = new ContactResponseDTO();
        dto.setId(message.getId());
        dto.setFullName(message.getFullName());
        dto.setMobileNumber(message.getMobileNumber());
        dto.setEmail(message.getEmail());
        dto.setSubject(message.getSubject());
        dto.setMessage(message.getMessage());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}
