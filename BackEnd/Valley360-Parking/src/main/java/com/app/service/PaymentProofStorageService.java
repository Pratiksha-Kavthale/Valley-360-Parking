package com.app.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PaymentProofStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/png", "image/jpeg", "image/jpg",
            "image/webp");

    @Value("${app.payment.proof-upload-dir:uploads/payment-proofs}")
    private String uploadDirectory;

    public StoredPaymentProof store(MultipartFile file, Long bookingId) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("payment screenshot must be a PNG, JPG, JPEG, or WEBP image.");
        }

        String originalName = StringUtils
                .cleanPath(file.getOriginalFilename() == null ? "payment-proof" : file.getOriginalFilename());
        String extension = resolveExtension(originalName, contentType);
        String storedName = "booking-" + bookingId + "-" + UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            Path target = uploadPath.resolve(storedName).normalize();
            if (!target.startsWith(uploadPath)) {
                throw new IllegalArgumentException("Invalid payment proof file path.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return new StoredPaymentProof(target.toString(), originalName);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to store payment proof.", ex);
        }
    }

    public byte[] readProof(String storedPath) {
        if (storedPath == null || storedPath.trim().isEmpty()) {
            return new byte[0];
        }

        try {
            return Files.readAllBytes(Paths.get(storedPath));
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to read payment proof.", ex);
        }
    }

    private String resolveExtension(String originalName, String contentType) {
        String lowerName = originalName == null ? "" : originalName.toLowerCase(Locale.ROOT);
        if (lowerName.endsWith(".png") || "image/png".equals(contentType)) {
            return ".png";
        }
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || "image/jpeg".equals(contentType)) {
            return ".jpg";
        }
        if (lowerName.endsWith(".webp") || "image/webp".equals(contentType)) {
            return ".webp";
        }
        return ".img";
    }

    public static class StoredPaymentProof {
        private final String storedPath;
        private final String originalName;

        public StoredPaymentProof(String storedPath, String originalName) {
            this.storedPath = storedPath;
            this.originalName = originalName;
        }

        public String getStoredPath() {
            return storedPath;
        }

        public String getOriginalName() {
            return originalName;
        }
    }
}
