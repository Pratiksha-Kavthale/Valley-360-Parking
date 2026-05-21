package com.app.service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.app.entities.Booking;
import com.app.entities.OwnerPaymentConfig;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;

/**
 * Service for generating UPI payment QR codes
 * 
 * IMPORTANT: The UPI URI format must be exactly:
 * upi://pay?pa={upiId}&pn={payeeName}&am={amount}&cu=INR
 * 
 * Key Points:
 * - UPI IDs like "merchant@okhdfcbank" must NOT be URL encoded (@ must stay
 * as @, not %40)
 * - Payee name MAY contain spaces but the URI structure itself should not be
 * encoded
 * - The QR payload must be the RAW UPI URI, not an encoded version
 * - UPI apps parse the QR content and expect the exact format
 */
@Slf4j
@Service
public class PaymentQrCodeService {

    // Valid UPI ID format: {username}@{bank} (e.g., merchant@okhdfcbank, user@ybl)
    private static final Pattern VALID_UPI_ID_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$");

    /**
     * Build UPI payment URI for QR code generation
     * 
     * FIXED: This method now generates the CORRECT UPI URI format that UPI apps
     * recognize
     * 
     * Example:
     * upi://pay?pa=merchant@okhdfcbank&pn=Valley360%20Parking&am=500.00&cu=INR
     * 
     * @param config  Owner payment configuration containing UPI ID and display name
     * @param booking Booking entity (for reference/logging)
     * @param amount  Payment amount in INR
     * @return Correctly formatted UPI URI (NOT fully URL encoded)
     */
    public String buildPaymentUri(OwnerPaymentConfig config, Booking booking, double amount) {
        // Validate UPI ID format
        String upiId = config.getUpiId();
        if (upiId == null || upiId.trim().isEmpty()) {
            throw new IllegalArgumentException("UPI ID cannot be empty");
        }

        upiId = upiId.trim();
        if (!VALID_UPI_ID_PATTERN.matcher(upiId).matches()) {
            log.error("Invalid UPI ID format: {} (must be username@bank, e.g., merchant@okhdfcbank)", upiId);
            throw new IllegalArgumentException(
                    "Invalid UPI ID format. Expected: username@bank (e.g., merchant@okhdfcbank)");
        }

        // Validate and encode payee name - ONLY encode the display name, NOT the entire
        // URI
        String displayName = config.getUpiDisplayName();
        if (displayName == null || displayName.trim().isEmpty()) {
            throw new IllegalArgumentException("Payee display name cannot be empty");
        }

        displayName = displayName.trim();

        // Encode ONLY the display name if it contains special characters
        // This prevents issues with spaces and special chars in the name
        String encodedDisplayName = encodeParameter(displayName);

        // Format amount to 2 decimal places
        String formattedAmount = String.format(java.util.Locale.US, "%.2f", amount);
        if (amount <= 0) {
            log.error("Invalid amount: {} (must be positive)", amount);
            throw new IllegalArgumentException("Amount must be positive");
        }

        // CORRECT: Build UPI URI with RAW UPI ID (no encoding of @ symbol)
        // Do NOT encode the entire URI - just the parameter values that need it
        String paymentUri = String.format(
                "upi://pay?pa=%s&pn=%s&am=%s&cu=INR",
                upiId, // ✓ Raw UPI ID - @ is NOT encoded
                encodedDisplayName, // ✓ Only display name encoded if needed
                formattedAmount // ✓ Amount as-is
        );

        // DEBUG: Log the generated URI for verification during testing
        log.debug("Generated UPI Payment URI - Booking: {}, UPI ID: {}, Amount: {}, URI: {}",
                booking != null ? booking.getId() : "N/A",
                upiId,
                formattedAmount,
                paymentUri);

        return paymentUri;
    }

    /**
     * Encode a parameter value for safe inclusion in UPI URI
     * 
     * This handles special characters in display names like spaces
     * BUT we use a selective approach - only encode what needs encoding
     * 
     * @param value The parameter value to encode
     * @return Encoded value safe for URI
     */
    private String encodeParameter(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }

        try {
            // URL encode the parameter, but this will handle spaces and special chars
            return URLEncoder.encode(value, StandardCharsets.UTF_8.name());
        } catch (Exception ex) {
            log.error("Error encoding parameter: {}", value, ex);
            // Fallback: just use the value as-is if encoding fails
            return value;
        }
    }

    /**
     * Generate QR code as base64-encoded PNG image
     * 
     * FIXED: Now accepts the correctly formatted UPI URI
     * ZXing encodes the URI payload exactly as provided
     * 
     * @param content The UPI URI to encode in QR (should be raw, not pre-encoded)
     * @return Base64-encoded PNG image
     */
    public String generateQrCodeBase64(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("QR content cannot be empty");
        }

        try {
            log.debug("Generating QR code for content: {}", content);

            QRCodeWriter writer = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.MARGIN, 1);
            hints.put(EncodeHintType.CHARACTER_SET, StandardCharsets.UTF_8.name());

            // Encode the UPI URI exactly as provided - no additional processing
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, 300, 300, hints);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);

            String base64Result = Base64.getEncoder().encodeToString(outputStream.toByteArray());
            log.debug("QR code generated successfully, size: {} bytes", base64Result.length());

            return base64Result;
        } catch (WriterException | java.io.IOException ex) {
            log.error("Error generating QR code for content: {}", content, ex);
            throw new IllegalStateException("Unable to generate payment QR code.", ex);
        }
    }
}
