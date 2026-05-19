package com.app.service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.app.entities.Booking;
import com.app.entities.OwnerPaymentConfig;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;

@Service
public class PaymentQrCodeService {

    public String buildPaymentUri(OwnerPaymentConfig config, Booking booking, double amount) {
        String upiId = encodeValue(config.getUpiId());
        String displayName = encodeValue(config.getUpiDisplayName());
        String formattedAmount = String.format(java.util.Locale.US, "%.2f", amount);

        return "upi://pay?pa=" + upiId + "&pn=" + displayName + "&am=" + formattedAmount + "&cu=INR";
    }

    public String generateQrCodeBase64(String content) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.MARGIN, 1);
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, 300, 300, hints);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);
            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (WriterException | java.io.IOException ex) {
            throw new IllegalStateException("Unable to generate payment QR code.", ex);
        }
    }

    private String encodeValue(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.name());
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to encode UPI payment value.", ex);
        }
    }
}
