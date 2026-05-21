package com.app.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.app.dto.BookingDTO;
import com.app.dto.BookingPaymentQrResponseDTO;
import com.app.dto.BookingPaymentSubmissionRequestDTO;
import com.app.dto.BookingPaymentVerificationRequestDTO;
import com.app.entities.Booking;
import com.app.entities.OwnerPaymentConfig;
import com.app.entities.ParkingArea;
import com.app.entities.User;
import com.app.enums.BookingPaymentStatus;
import com.app.enums.BookingStatus;
import com.app.enums.RoleEnum;
import com.app.exception.BookingConflictException;
import com.app.exception.ParkingNotFoundException;
import com.app.exception.UserNotFoundException;
import com.app.repository.BookingRepository;
import com.app.repository.OwnerPaymentConfigRepository;
import com.app.repository.UserRepository;

@Slf4j
@Service
@Transactional
public class BookingPaymentServiceImpl implements BookingPaymentService {

    private static final List<BookingPaymentStatus> REVIEWABLE_STATUSES = Arrays.asList(
            BookingPaymentStatus.PAYMENT_SUBMITTED,
            BookingPaymentStatus.PAYMENT_VERIFIED);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private OwnerPaymentConfigRepository ownerPaymentConfigRepository;

    @Autowired
    private PaymentQrCodeService paymentQrCodeService;

    @Autowired
    private PaymentProofStorageService paymentProofStorageService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper mapper;

    @Value("${app.payment.expiry-minutes:10}")
    private long paymentExpiryMinutes;

    @Override
    @Transactional(readOnly = true)
    public BookingPaymentQrResponseDTO getPaymentQr(Long bookingId) {
        log.info("Requesting payment QR for booking: {}", bookingId);

        Booking booking = getBookingForCustomer(bookingId);
        ensurePaymentCanBeInitiated(booking);

        OwnerPaymentConfig config = resolveOwnerPaymentConfig(booking);
        if (!config.isPaymentEnabled()) {
            log.warn("Payment not enabled for owner: {}", booking.getParkingSlot().getParking().getUser().getId());
            throw new IllegalStateException("Owner has disabled UPI payment for this booking.");
        }

        double amount = resolveBookingAmount(booking);

        try {
            log.debug("Building payment URI - Booking: {}, UPI ID: {}, Amount: {}",
                    bookingId, config.getUpiId(), amount);
            String paymentUri = paymentQrCodeService.buildPaymentUri(config, booking, amount);

            log.debug("Generating QR code from URI: {}", paymentUri);
            String qrCodeBase64 = paymentQrCodeService.generateQrCodeBase64(paymentUri);

            log.info("QR code generated successfully for booking: {}, QR size: {} bytes",
                    bookingId, qrCodeBase64.length());

            BookingPaymentQrResponseDTO response = new BookingPaymentQrResponseDTO();
            response.setBookingId(booking.getId());
            response.setUpiId(config.getUpiId());
            response.setUpiDisplayName(config.getUpiDisplayName());
            response.setAmount(amount);
            response.setPaymentUri(paymentUri);
            response.setQrCodeBase64(qrCodeBase64);
            response.setQrCodeContentType("image/png");
            response.setQrToken(booking.getQrToken());
            response.setPaymentExpiresAt(booking.getPaymentExpiresAt());
            response.setPaymentStatus(normalizePaymentStatus(booking.getPaymentStatus()));
            response.setBookingStatus(resolveTimelineStatus(booking));
            return response;
        } catch (Exception e) {
            log.error("Error generating payment QR for booking: {}, UPI ID: {}",
                    bookingId, config.getUpiId(), e);
            throw e;
        }
    }

    @Override
    public BookingDTO submitPaymentProof(Long bookingId, BookingPaymentSubmissionRequestDTO request,
            MultipartFile screenshot) {
        Booking booking = getBookingForCustomer(bookingId);
        ensurePaymentCanBeSubmitted(booking);

        String utrNumber = normalize(request.getUtrNumber());
        String paymentMethod = normalize(request.getPaymentMethod());
        boolean hasScreenshot = screenshot != null && !screenshot.isEmpty();
        boolean hasUtr = utrNumber != null && !utrNumber.isEmpty();
        if (!hasScreenshot && !hasUtr) {
            throw new IllegalArgumentException("Provide a payment screenshot or UTR number.");
        }

        if (paymentMethod != null) {
            String normalizedMethod = paymentMethod.toUpperCase(Locale.ROOT);
            if (!Arrays.asList("SCREENSHOT", "UTR", "BOTH").contains(normalizedMethod)) {
                throw new IllegalArgumentException("paymentMethod must be SCREENSHOT, UTR, or BOTH.");
            }
        }

        if (utrNumber != null && !utrNumber.isEmpty()) {
            if (booking.getPaymentUtrNumber() != null && booking.getPaymentUtrNumber().equalsIgnoreCase(utrNumber)) {
                // same booking resubmission after rejection
            } else if (bookingRepository.existsByPaymentUtrNumberIgnoreCase(utrNumber)) {
                throw new BookingConflictException("This UTR number has already been submitted for another booking.");
            }
        }

        PaymentProofStorageService.StoredPaymentProof storedProof = paymentProofStorageService.store(screenshot,
                bookingId);

        booking.setPaymentUtrNumber(utrNumber);
        if (storedProof != null) {
            booking.setPaymentScreenshotPath(storedProof.getStoredPath());
            booking.setPaymentScreenshotOriginalName(storedProof.getOriginalName());
        }
        booking.setPaymentSubmittedAt(LocalDateTime.now());
        booking.setPaymentVerifiedAt(null);
        booking.setPaymentVerifiedBy(null);
        booking.setPaymentVerificationNote(null);
        booking.setPaymentStatus(BookingPaymentStatus.PAYMENT_SUBMITTED);

        Booking saved = bookingRepository.save(booking);
        return mapToDto(saved);
    }

    @Override
    public BookingDTO verifyPayment(Long bookingId, BookingPaymentVerificationRequestDTO request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ParkingNotFoundException("Booking not found for id: " + bookingId));

        User verifier = getAuthenticatedUser();
        ensureBookingCanBeReviewedByCurrentUser(booking, verifier);

        if (booking.getPaymentStatus() == null || !REVIEWABLE_STATUSES.contains(booking.getPaymentStatus())) {
            throw new IllegalStateException("Only submitted payments can be verified.");
        }

        String decision = normalize(request.getDecision()).toUpperCase(Locale.ROOT);
        if (!"VERIFY".equals(decision) && !"APPROVE".equals(decision) && !"CONFIRM".equals(decision)) {
            throw new IllegalArgumentException("decision must be VERIFY, APPROVE, or CONFIRM.");
        }

        booking.setPaymentVerifiedAt(LocalDateTime.now());
        booking.setPaymentVerifiedBy(verifier.getId());
        booking.setPaymentVerificationNote(normalize(request.getNote()));
        booking.setPaymentStatus(BookingPaymentStatus.BOOKING_CONFIRMED);
        booking.setStatus(resolveTimelineStatusEnum(booking));

        return mapToDto(bookingRepository.save(booking));
    }

    @Override
    public BookingDTO rejectPayment(Long bookingId, BookingPaymentVerificationRequestDTO request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ParkingNotFoundException("Booking not found for id: " + bookingId));

        User verifier = getAuthenticatedUser();
        ensureBookingCanBeReviewedByCurrentUser(booking, verifier);

        if (booking.getPaymentStatus() == null || !REVIEWABLE_STATUSES.contains(booking.getPaymentStatus())) {
            throw new IllegalStateException("Only submitted payments can be rejected.");
        }

        booking.setPaymentVerifiedAt(LocalDateTime.now());
        booking.setPaymentVerifiedBy(verifier.getId());
        booking.setPaymentVerificationNote(normalize(request.getNote()));
        booking.setPaymentStatus(BookingPaymentStatus.PAYMENT_REJECTED);
        booking.setStatus(BookingStatus.CANCELLED);

        return mapToDto(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDTO> getOwnerPaymentQueue() {
        User owner = getAuthenticatedOwner();
        return bookingRepository.findPaymentQueueByOwnerId(owner.getId(), REVIEWABLE_STATUSES).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDTO> getAdminPaymentQueue() {
        return bookingRepository.findPaymentQueueForAdmin(REVIEWABLE_STATUSES).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getPaymentProof(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ParkingNotFoundException("Booking not found for id: " + bookingId));

        User currentUser = getAuthenticatedUser();
        if (!canAccessBookingPayment(booking, currentUser)) {
            throw new SecurityException("You cannot access this payment proof.");
        }

        if (booking.getPaymentScreenshotPath() == null || booking.getPaymentScreenshotPath().trim().isEmpty()) {
            throw new IllegalStateException("No payment proof has been uploaded for this booking.");
        }

        return paymentProofStorageService.readProof(booking.getPaymentScreenshotPath());
    }

    @Override
    @Scheduled(fixedDelayString = "${app.payment.cleanup-delay-ms:60000}")
    public void expirePendingPayments() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expired = bookingRepository.findExpiredPendingPayments(BookingPaymentStatus.PENDING_PAYMENT, now);
        for (Booking booking : expired) {
            booking.setPaymentStatus(BookingPaymentStatus.BOOKING_CANCELLED);
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setPaymentVerificationNote("Payment window expired.");
            bookingRepository.save(booking);
        }
    }

    private void ensurePaymentCanBeInitiated(Booking booking) {
        BookingPaymentStatus status = booking.getPaymentStatus();
        if (status == BookingPaymentStatus.BOOKING_CANCELLED) {
            throw new IllegalStateException("This booking payment window has expired.");
        }
        if (status == BookingPaymentStatus.BOOKING_CONFIRMED) {
            throw new IllegalStateException("This booking has already been confirmed.");
        }
        if (status == BookingPaymentStatus.PAYMENT_SUBMITTED) {
            throw new IllegalStateException("Payment proof has already been submitted.");
        }
        if (booking.getPaymentExpiresAt() != null && LocalDateTime.now().isAfter(booking.getPaymentExpiresAt())
                && status == BookingPaymentStatus.PENDING_PAYMENT) {
            booking.setPaymentStatus(BookingPaymentStatus.BOOKING_CANCELLED);
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            throw new IllegalStateException("This booking payment window has expired.");
        }
    }

    private void ensurePaymentCanBeSubmitted(Booking booking) {
        BookingPaymentStatus status = booking.getPaymentStatus();
        if (status == BookingPaymentStatus.BOOKING_CANCELLED) {
            throw new IllegalStateException("This booking has been cancelled.");
        }
        if (status == BookingPaymentStatus.BOOKING_CONFIRMED) {
            throw new IllegalStateException("This booking is already confirmed.");
        }
        if (booking.getPaymentExpiresAt() != null && LocalDateTime.now().isAfter(booking.getPaymentExpiresAt())
                && status == BookingPaymentStatus.PENDING_PAYMENT) {
            booking.setPaymentStatus(BookingPaymentStatus.BOOKING_CANCELLED);
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            throw new IllegalStateException("This booking payment window has expired.");
        }
    }

    private void ensureBookingCanBeReviewedByCurrentUser(Booking booking, User currentUser) {
        boolean admin = hasRole(currentUser, RoleEnum.ROLE_ADMIN);
        if (admin) {
            return;
        }

        boolean owner = hasRole(currentUser, RoleEnum.ROLE_OWNER)
                && booking.getParkingSlot() != null
                && booking.getParkingSlot().getParking() != null
                && booking.getParkingSlot().getParking().getUser() != null
                && booking.getParkingSlot().getParking().getUser().getId().equals(currentUser.getId());
        if (!owner) {
            throw new SecurityException("Only the parking owner or admin can review this payment.");
        }
    }

    private boolean canAccessBookingPayment(Booking booking, User currentUser) {
        if (booking.getUser() != null && booking.getUser().getId().equals(currentUser.getId())) {
            return true;
        }
        if (hasRole(currentUser, RoleEnum.ROLE_ADMIN)) {
            return true;
        }
        return hasRole(currentUser, RoleEnum.ROLE_OWNER)
                && booking.getParkingSlot() != null
                && booking.getParkingSlot().getParking() != null
                && booking.getParkingSlot().getParking().getUser() != null
                && booking.getParkingSlot().getParking().getUser().getId().equals(currentUser.getId());
    }

    private boolean hasRole(User user, RoleEnum role) {
        return user.getUserRoles() != null
                && user.getUserRoles().stream().anyMatch(userRole -> role.equals(userRole.getRoleName()));
    }

    private BookingPaymentQrResponseDTO mapToQrResponse(Booking booking) {
        throw new UnsupportedOperationException();
    }

    private BookingDTO mapToDto(Booking booking) {
        BookingDTO dto = mapper.map(booking, BookingDTO.class);
        dto.setCustomer_id(booking.getUser() != null ? booking.getUser().getId() : null);
        dto.setParking_slot_id(booking.getParkingSlot() != null ? booking.getParkingSlot().getId() : null);
        dto.setParkingAreaName(resolveParkingAreaName(booking));
        dto.setSlotNumber(booking.getParkingSlot() != null ? booking.getParkingSlot().getId() : null);
        dto.setStartTime(resolveStart(booking));
        dto.setArrivalDate(resolveStart(booking));
        dto.setEndTime(resolveEnd(booking));
        dto.setDepartureDate(resolveEnd(booking));
        dto.setTotalPrice(resolveBookingAmount(booking));
        dto.setPrice(resolveBookingAmount(booking));
        dto.setStatus(resolveTimelineStatusEnum(booking));
        dto.setPaymentStatus(booking.getPaymentStatus());
        dto.setPaymentUtrNumber(booking.getPaymentUtrNumber());
        dto.setPaymentScreenshotPath(booking.getPaymentScreenshotPath());
        dto.setPaymentScreenshotOriginalName(booking.getPaymentScreenshotOriginalName());
        dto.setPaymentSubmittedAt(booking.getPaymentSubmittedAt());
        dto.setPaymentVerifiedAt(booking.getPaymentVerifiedAt());
        dto.setPaymentVerifiedBy(booking.getPaymentVerifiedBy());
        dto.setPaymentVerificationNote(booking.getPaymentVerificationNote());
        dto.setPaymentExpiresAt(booking.getPaymentExpiresAt());
        return dto;
    }

    private OwnerPaymentConfig resolveOwnerPaymentConfig(Booking booking) {
        if (booking.getParkingSlot() == null || booking.getParkingSlot().getParking() == null
                || booking.getParkingSlot().getParking().getUser() == null) {
            throw new IllegalStateException("Owner payment configuration not found for this booking.");
        }

        Long ownerId = booking.getParkingSlot().getParking().getUser().getId();
        return ownerPaymentConfigRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new IllegalStateException("Owner payment configuration not found."));
    }

    private Booking getBookingForCustomer(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ParkingNotFoundException("Booking not found for id: " + bookingId));
        User currentUser = getAuthenticatedUser();
        if (booking.getUser() == null || !booking.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("You can only manage your own booking payment.");
        }
        return booking;
    }

    private BookingStatus resolveTimelineStatusEnum(Booking booking) {
        String status = resolveTimelineStatus(booking);
        return BookingStatus.valueOf(status);
    }

    private String resolveTimelineStatus(Booking booking) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = resolveStart(booking);
        LocalDateTime end = resolveEnd(booking);

        if (booking.getPaymentStatus() == BookingPaymentStatus.BOOKING_CANCELLED) {
            return BookingStatus.CANCELLED.name();
        }
        if (start != null && now.isBefore(start)) {
            return BookingStatus.RESERVED.name();
        }
        if (end != null && now.isAfter(end)) {
            return BookingStatus.COMPLETED.name();
        }
        return BookingStatus.ACTIVE.name();
    }

    private LocalDateTime resolveStart(Booking booking) {
        return booking.getStartTime() != null ? booking.getStartTime() : booking.getArrivalDate();
    }

    private LocalDateTime resolveEnd(Booking booking) {
        return booking.getEndTime() != null ? booking.getEndTime() : booking.getDepartureDate();
    }

    private double resolveBookingAmount(Booking booking) {
        return booking.getTotalPrice() > 0 ? booking.getTotalPrice() : booking.getPrice();
    }

    private String resolveParkingAreaName(Booking booking) {
        if (booking.getParkingSlot() != null && booking.getParkingSlot().getParking() != null) {
            ParkingArea area = booking.getParkingSlot().getParking();
            return area.getArea();
        }
        return null;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Authentication required.");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Authenticated user not found with email: " + email));
    }

    private User getAuthenticatedOwner() {
        User currentUser = getAuthenticatedUser();
        if (!hasRole(currentUser, RoleEnum.ROLE_OWNER)) {
            throw new SecurityException("Owner access required.");
        }
        return currentUser;
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizePaymentStatus(BookingPaymentStatus status) {
        return status == null ? BookingPaymentStatus.PENDING_PAYMENT.name() : status.name();
    }
}
