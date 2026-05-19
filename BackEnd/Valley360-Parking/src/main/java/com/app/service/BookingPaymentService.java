package com.app.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.app.dto.BookingDTO;
import com.app.dto.BookingPaymentQrResponseDTO;
import com.app.dto.BookingPaymentSubmissionRequestDTO;
import com.app.dto.BookingPaymentVerificationRequestDTO;

public interface BookingPaymentService {

    BookingPaymentQrResponseDTO getPaymentQr(Long bookingId);

    BookingDTO submitPaymentProof(Long bookingId, BookingPaymentSubmissionRequestDTO request, MultipartFile screenshot);

    BookingDTO verifyPayment(Long bookingId, BookingPaymentVerificationRequestDTO request);

    BookingDTO rejectPayment(Long bookingId, BookingPaymentVerificationRequestDTO request);

    List<BookingDTO> getOwnerPaymentQueue();

    List<BookingDTO> getAdminPaymentQueue();

    byte[] getPaymentProof(Long bookingId);

    void expirePendingPayments();
}
