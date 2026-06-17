package com.app.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.app.dto.BookingDTO;
import com.app.dto.BookingPaymentQrResponseDTO;
import com.app.dto.BookingPaymentSubmissionRequestDTO;
import com.app.dto.BookingPaymentVerificationRequestDTO;
import com.app.dto.ExtendBookingRequestDTO;
import com.app.dto.QrValidationRequestDTO;
import com.app.dto.QrValidationResponseDTO;
import com.app.service.BookingService;
import com.app.service.BookingPaymentService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/booking")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;
    private final BookingPaymentService bookingPaymentService;

    public BookingController(BookingService bookingService, BookingPaymentService bookingPaymentService) {
        this.bookingService = bookingService;
        this.bookingPaymentService = bookingPaymentService;
    }

    @PostMapping("/add")
    public ResponseEntity<BookingDTO> bookParkingSlot(@RequestBody BookingDTO dto) {
        BookingDTO createdBooking = bookingService.bookParkingSlot(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
    }

    @PostMapping("/validate-qr")
    public ResponseEntity<QrValidationResponseDTO> validateQr(@RequestBody QrValidationRequestDTO request) {
        QrValidationResponseDTO response = bookingService.validateQrToken(request.getQrToken());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/today/{ownerId}")
    public ResponseEntity<List<BookingDTO>> getTodaysBookings(@PathVariable Long ownerId) {
        log.debug("Fetching today's bookings for ownerId={}", ownerId);
        List<BookingDTO> bookings = bookingService.getTodaysBookings(ownerId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/previous/{ownerId}")
    public ResponseEntity<List<BookingDTO>> getPreviousBookings(@PathVariable Long ownerId) {
        List<BookingDTO> bookings = bookingService.getPreviousBookings(ownerId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDTO>> getUserBookings(@PathVariable Long userId) {
        List<BookingDTO> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/extend/{bookingId}")
    public ResponseEntity<BookingDTO> extendBooking(@PathVariable Long bookingId, @RequestBody ExtendBookingRequestDTO request) {
        BookingDTO updatedBooking = bookingService.extendBooking(bookingId, request.getAdditionalHours());
        return ResponseEntity.ok(updatedBooking);
    }

    @GetMapping("/{bookingId}/payment-qr")
    public ResponseEntity<BookingPaymentQrResponseDTO> getPaymentQr(@PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingPaymentService.getPaymentQr(bookingId));
    }

    @PostMapping(value = "/{bookingId}/payment-submission", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookingDTO> submitPaymentProof(@PathVariable Long bookingId,
            @Valid @ModelAttribute BookingPaymentSubmissionRequestDTO request,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingPaymentService.submitPaymentProof(bookingId, request, screenshot));
    }

    @PostMapping("/{bookingId}/payment-verify")
    public ResponseEntity<BookingDTO> verifyPayment(@PathVariable Long bookingId,
            @Valid @RequestBody BookingPaymentVerificationRequestDTO request) {
        return ResponseEntity.ok(bookingPaymentService.verifyPayment(bookingId, request));
    }

    @PostMapping("/{bookingId}/payment-reject")
    public ResponseEntity<BookingDTO> rejectPayment(@PathVariable Long bookingId,
            @Valid @RequestBody BookingPaymentVerificationRequestDTO request) {
        return ResponseEntity.ok(bookingPaymentService.rejectPayment(bookingId, request));
    }

    @GetMapping("/{bookingId}/payment-proof")
    public ResponseEntity<byte[]> getPaymentProof(@PathVariable Long bookingId) {
        byte[] proof = bookingPaymentService.getPaymentProof(bookingId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=payment-proof.png")
                .contentType(MediaType.IMAGE_PNG)
                .body(proof);
    }

}
