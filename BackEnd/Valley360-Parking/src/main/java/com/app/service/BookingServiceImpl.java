package com.app.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.dto.BookingDTO;
import com.app.dto.QrValidationResponseDTO;
import com.app.entities.Booking;
import com.app.entities.ParkingSlot;
import com.app.entities.User;
import com.app.enums.BookingPaymentStatus;
import com.app.enums.BookingStatus;
import com.app.exception.BookingConflictException;
import com.app.exception.ParkingNotFoundException;
import com.app.exception.UserNotFoundException;
import com.app.repository.BookingRepository;
import com.app.repository.ParkingSlotRepository;
import com.app.repository.ReviewRepository;
import com.app.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
public class BookingServiceImpl implements BookingService {

	private static final String QR_STATUS_INVALID = "INVALID";

	private final BookingRepository bookingRepo;
	private final UserRepository userRepo;
	private final ParkingSlotRepository parkingSlotRepo;
	private final ModelMapper mapper;
	private final ReviewRepository reviewRepository;

	@Value("${app.payment.expiry-minutes:10}")
	private long paymentExpiryMinutes;

	public BookingServiceImpl(BookingRepository bookingRepo, UserRepository userRepo, ParkingSlotRepository parkingSlotRepo,
			ModelMapper mapper, ReviewRepository reviewRepository) {
		this.bookingRepo = bookingRepo;
		this.userRepo = userRepo;
		this.parkingSlotRepo = parkingSlotRepo;
		this.mapper = mapper;
		this.reviewRepository = reviewRepository;
	}

	@Override
	public BookingDTO bookParkingSlot(BookingDTO booking) {
		log.debug("Booking request received: bookingId={}, customerId={}, parkingSlotId={}", booking.getId(),
				booking.getCustomer_id(), booking.getParking_slot_id());
		User user = userRepo.findById(booking.getCustomer_id())
				.orElseThrow(() -> new UserNotFoundException("Invalid id !!"));

		ParkingSlot parkingSlot = parkingSlotRepo.findById(booking.getParking_slot_id())
				.orElseThrow(() -> new ParkingNotFoundException("Invalid id !!"));

		Booking book = mapper.map(booking, Booking.class);
		log.debug("Mapped booking entity id={}", book.getId());

		LocalDateTime start = booking.getStartTime() != null ? booking.getStartTime() : booking.getArrivalDate();
		LocalDateTime end = booking.getEndTime() != null ? booking.getEndTime() : booking.getDepartureDate();
		validateBookingConflict(parkingSlot.getId(), start, end);

		double resolvedTotalPrice = booking.getTotalPrice() > 0 ? booking.getTotalPrice() : booking.getPrice();

		book.setStartTime(start);
		book.setArrivalDate(start);
		book.setEndTime(end);
		book.setDepartureDate(end);
		book.setTotalPrice(resolvedTotalPrice);
		book.setPrice(resolvedTotalPrice);

		book.setUser(user);
		book.setParkingSlot(parkingSlot);
		book.setStatus(BookingStatus.ACTIVE);
		book.setPaymentStatus(BookingPaymentStatus.PENDING_PAYMENT);
		book.setPaymentExpiresAt(LocalDateTime.now().plusMinutes(paymentExpiryMinutes));
		book.setQrToken(generateUniqueQrToken());
		book.setOtp(generateUniqueOtp());

		Booking savedBooking = bookingRepo.save(book);

		BookingDTO response = mapper.map(savedBooking, BookingDTO.class);
		response.setCustomer_id(savedBooking.getUser() != null ? savedBooking.getUser().getId() : null);
		response.setParking_slot_id(
				savedBooking.getParkingSlot() != null ? savedBooking.getParkingSlot().getId() : null);
		response.setSlotNumber(savedBooking.getParkingSlot() != null ? savedBooking.getParkingSlot().getId() : null);
		response.setParkingAreaName(
				savedBooking.getParkingSlot() != null && savedBooking.getParkingSlot().getParking() != null
						? savedBooking.getParkingSlot().getParking().getArea()
						: null);
		response.setStartTime(savedBooking.getStartTime());
		response.setEndTime(savedBooking.getEndTime());
		response.setArrivalDate(savedBooking.getStartTime());
		response.setDepartureDate(savedBooking.getEndTime());
		response.setTotalPrice(savedBooking.getTotalPrice());
		response.setPrice(savedBooking.getTotalPrice());
		response.setStatus(BookingStatus.valueOf(getBookingStatus(savedBooking)));
		response.setOtp(savedBooking.getOtp());
		return response;

	}

	private void validateBookingConflict(Long parkingSlotId, LocalDateTime newStartTime, LocalDateTime newEndTime) {
		if (newStartTime == null || newEndTime == null) {
			throw new IllegalArgumentException("Start time and end time are required.");
		}

		if (!newStartTime.isBefore(newEndTime)) {
			throw new IllegalArgumentException("Start time must be before end time.");
		}

		LocalDateTime now = LocalDateTime.now();
		List<Booking> existingBookings = bookingRepo.findAllbyParkingSlotId(parkingSlotId);

		List<Booking> conflicts = existingBookings.stream()
				.filter(existing -> isConflictingBooking(existing, newStartTime, newEndTime, now))
				.collect(Collectors.toList());

		if (!conflicts.isEmpty()) {
			Booking nearestConflict = conflicts.stream().min(Comparator.comparingLong(existing ->
					Math.abs(ChronoUnit.MINUTES.between(newStartTime, getStartTime(existing)))))
					.orElse(conflicts.get(0));

			LocalDateTime conflictStart = getStartTime(nearestConflict);
			LocalDateTime conflictEnd = getEndTime(nearestConflict);

			DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
			String message = String.format(
					"This slot is already booked from %s to %s. Please choose a time before or after this period.",
					conflictStart.format(timeFormatter),
					conflictEnd.format(timeFormatter));
			throw new BookingConflictException(message);
		}
	}

	private boolean isConflictingBooking(Booking existing, LocalDateTime newStartTime, LocalDateTime newEndTime,
			LocalDateTime now) {
		if (isCancelled(existing) || shouldCancelExpiredPending(existing, now)) {
			return false;
		}

		LocalDateTime existingStart = getStartTime(existing);
		LocalDateTime existingEnd = getEndTime(existing);

		if (existingStart == null || existingEnd == null || !existingEnd.isAfter(now)) {
			return false;
		}

		return newStartTime.isBefore(existingEnd) && newEndTime.isAfter(existingStart);
	}

	private boolean isCancelled(Booking existing) {
		return existing.getPaymentStatus() == BookingPaymentStatus.BOOKING_CANCELLED;
	}

	private boolean shouldCancelExpiredPending(Booking existing, LocalDateTime now) {
		boolean isExpiredPending = existing.getPaymentExpiresAt() != null
				&& now.isAfter(existing.getPaymentExpiresAt())
				&& existing.getPaymentStatus() == BookingPaymentStatus.PENDING_PAYMENT;
		if (!isExpiredPending) {
			return false;
		}
		existing.setPaymentStatus(BookingPaymentStatus.BOOKING_CANCELLED);
		existing.setStatus(BookingStatus.CANCELLED);
		bookingRepo.save(existing);
		return true;
	}

	private LocalDateTime getStartTime(Booking booking) {
		return booking.getStartTime() != null ? booking.getStartTime() : booking.getArrivalDate();
	}

	private LocalDateTime getEndTime(Booking booking) {
		return booking.getEndTime() != null ? booking.getEndTime() : booking.getDepartureDate();
	}

	private String generateUniqueQrToken() {
		String token;
		do {
			token = UUID.randomUUID().toString();
		} while (bookingRepo.findByQrToken(token).isPresent());
		return token;
	}

	private String generateUniqueOtp() {
		String otp;
		do {
			otp = String.format("%06d", (int)(Math.random() * 1_000_000));
		} while (bookingRepo.findByOtp(otp).isPresent());
		return otp;
	}

	@Override
	public QrValidationResponseDTO validateOtp(String otp) {
		if (otp == null || otp.trim().isEmpty()) {
			return new QrValidationResponseDTO(QR_STATUS_INVALID, "OTP is required.", null);
		}

		Booking booking = bookingRepo.findByOtp(otp.trim()).orElse(null);

		if (booking == null) {
			return new QrValidationResponseDTO(QR_STATUS_INVALID, "Invalid OTP. No matching booking found.", null);
		}

		if (booking.getPaymentStatus() != null
				&& booking.getPaymentStatus() != BookingPaymentStatus.BOOKING_CONFIRMED) {
			return new QrValidationResponseDTO(QR_STATUS_INVALID, "Booking payment is not confirmed yet.", booking.getId());
		}

		LocalDateTime now = LocalDateTime.now();

		if (booking.getDepartureDate() != null && now.isAfter(booking.getDepartureDate())) {
			if (booking.getStatus() != BookingStatus.EXPIRED) {
				booking.setStatus(BookingStatus.EXPIRED);
				bookingRepo.save(booking);
			}
			return new QrValidationResponseDTO("EXPIRED", "Booking has expired.", booking.getId());
		}

		if (booking.getStatus() == BookingStatus.USED) {
			return new QrValidationResponseDTO(QR_STATUS_INVALID, "OTP already used.", booking.getId());
		}

		if (booking.getArrivalDate() != null && now.isBefore(booking.getArrivalDate())) {
			return new QrValidationResponseDTO(QR_STATUS_INVALID, "Booking window has not started yet.", booking.getId());
		}

		booking.setStatus(BookingStatus.USED);
		bookingRepo.save(booking);
		return new QrValidationResponseDTO("SUCCESS", "OTP validated successfully. Entry granted.", booking.getId());
	}

	@Override
	public QrValidationResponseDTO validateQrToken(String qrToken) {
		if (qrToken == null || qrToken.trim().isEmpty()) {
			return new QrValidationResponseDTO(QR_STATUS_INVALID, "QR token is required.", null);
		}

		Booking booking = bookingRepo.findByQrToken(qrToken)
				.orElse(null);

		if (booking == null) {
			return new QrValidationResponseDTO(QR_STATUS_INVALID, "QR token not found.", null);
		}

		if (booking.getPaymentStatus() != null
				&& booking.getPaymentStatus() != BookingPaymentStatus.BOOKING_CONFIRMED) {
			return new QrValidationResponseDTO(QR_STATUS_INVALID, "Booking payment is not confirmed yet.", booking.getId());
		}

		LocalDateTime now = LocalDateTime.now();

		if (booking.getDepartureDate() != null && now.isAfter(booking.getDepartureDate())) {
			if (booking.getStatus() != BookingStatus.EXPIRED) {
				booking.setStatus(BookingStatus.EXPIRED);
				bookingRepo.save(booking);
			}
			return new QrValidationResponseDTO("EXPIRED", "Booking has expired.", booking.getId());
		}

		if (booking.getStatus() == BookingStatus.USED) {
			return new QrValidationResponseDTO(QR_STATUS_INVALID, "QR already used.", booking.getId());
		}

		if (booking.getStatus() == BookingStatus.EXPIRED) {
			return new QrValidationResponseDTO("EXPIRED", "Booking has expired.", booking.getId());
		}

		if (booking.getArrivalDate() != null && now.isBefore(booking.getArrivalDate())) {
			return new QrValidationResponseDTO(QR_STATUS_INVALID, "Booking window has not started yet.", booking.getId());
		}

		booking.setStatus(BookingStatus.USED);
		bookingRepo.save(booking);
		return new QrValidationResponseDTO("SUCCESS", "QR validated successfully.", booking.getId());
	}

	@Override
	public List<Booking> viewBookingHistory(Long id) {
		return bookingRepo.findAllbyParkingSlotId(id);
	}

	@Override
	public List<BookingDTO> getTodaysBookings(Long ownerId) {
		LocalDate today = LocalDate.now();
		List<Booking> bookings = bookingRepo.findTodaysBookingsByOwnerId(ownerId, today);
		return bookings.stream().map(book -> {
			BookingDTO dto = mapper.map(book, BookingDTO.class);
			applyBookingTimeAndPrice(dto, book);
			dto.setCustomer_id(book.getUser() != null ? book.getUser().getId() : null);
			dto.setParking_slot_id(book.getParkingSlot() != null ? book.getParkingSlot().getId() : null);
			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public List<BookingDTO> getPreviousBookings(Long ownerId) {
		LocalDateTime today = LocalDateTime.now();
		List<Booking> bookings = bookingRepo.findPreviousBookingsByOwnerId(ownerId, today);

		return bookings.stream().map(book -> {
			BookingDTO dto = mapper.map(book, BookingDTO.class);
			applyBookingTimeAndPrice(dto, book);
			dto.setCustomer_id(book.getUser() != null ? book.getUser().getId() : null);
			dto.setParking_slot_id(book.getParkingSlot() != null ? book.getParkingSlot().getId() : null);
			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public List<BookingDTO> getUserBookings(Long userId) {
		User authenticatedUser = getAuthenticatedUser();
		if (!authenticatedUser.getId().equals(userId)) {
			throw new SecurityException("You can only view your own bookings.");
		}

		List<Booking> bookings = bookingRepo.findByUserIdOrderByLatest(userId);
		return bookings.stream().map(book -> {
			BookingDTO dto = mapper.map(book, BookingDTO.class);
			applyBookingTimeAndPrice(dto, book);
			dto.setCustomer_id(book.getUser() != null ? book.getUser().getId() : null);
			dto.setParking_slot_id(book.getParkingSlot() != null ? book.getParkingSlot().getId() : null);
			dto.setParkingAreaName(book.getParkingSlot() != null && book.getParkingSlot().getParking() != null
					? book.getParkingSlot().getParking().getArea()
					: null);
			dto.setSlotNumber(book.getParkingSlot() != null ? book.getParkingSlot().getId() : null);
			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public BookingDTO extendBooking(Long bookingId, int additionalHours) {
		if (additionalHours <= 0) {
			throw new IllegalArgumentException("additionalHours must be greater than 0.");
		}

		Booking booking = bookingRepo.findById(bookingId)
				.orElseThrow(() -> new ParkingNotFoundException("Booking not found for id: " + bookingId));

		User authenticatedUser = getAuthenticatedUser();
		if (booking.getUser() == null || !authenticatedUser.getId().equals(booking.getUser().getId())) {
			throw new SecurityException("You can only extend your own booking.");
		}

		if (booking.getPaymentStatus() != null
				&& booking.getPaymentStatus() != BookingPaymentStatus.BOOKING_CONFIRMED) {
			throw new IllegalStateException("Only confirmed bookings can be extended.");
		}

		LocalDateTime resolvedEndTime = booking.getEndTime() != null ? booking.getEndTime()
				: booking.getDepartureDate();
		if (resolvedEndTime == null) {
			throw new IllegalStateException("Booking end time is missing.");
		}

		String computedStatus = getBookingStatus(booking);
		if (!"ACTIVE".equals(computedStatus)) {
			throw new IllegalStateException("Only ACTIVE bookings can be extended.");
		}

		if ("COMPLETED".equals(computedStatus)) {
			booking.setStatus(BookingStatus.EXPIRED);
			bookingRepo.save(booking);
			throw new IllegalStateException("Cannot extend expired booking.");
		}

		double currentTotalPrice = booking.getTotalPrice() > 0 ? booking.getTotalPrice() : booking.getPrice();
		double ratePerHour = resolveRatePerHour(booking, currentTotalPrice);
		double updatedTotalPrice = currentTotalPrice + (ratePerHour * additionalHours);

		LocalDateTime updatedEndTime = resolvedEndTime.plusHours(additionalHours);
		booking.setEndTime(updatedEndTime);
		booking.setDepartureDate(updatedEndTime);
		booking.setTotalPrice(updatedTotalPrice);
		booking.setPrice(updatedTotalPrice);
		booking.setParkingHours(Math.max(0, booking.getParkingHours()) + additionalHours);

		Booking updatedBooking = bookingRepo.save(booking);

		BookingDTO dto = mapper.map(updatedBooking, BookingDTO.class);
		applyBookingTimeAndPrice(dto, updatedBooking);
		dto.setCustomer_id(updatedBooking.getUser() != null ? updatedBooking.getUser().getId() : null);
		dto.setParking_slot_id(
				updatedBooking.getParkingSlot() != null ? updatedBooking.getParkingSlot().getId() : null);
		dto.setParkingAreaName(
				updatedBooking.getParkingSlot() != null && updatedBooking.getParkingSlot().getParking() != null
						? updatedBooking.getParkingSlot().getParking().getArea()
						: null);
		dto.setSlotNumber(updatedBooking.getParkingSlot() != null ? updatedBooking.getParkingSlot().getId() : null);
		return dto;
	}

	private double resolveRatePerHour(Booking booking, double currentTotalPrice) {
		if (booking.getParkingSlot() != null && booking.getParkingSlot().getPrice() > 0) {
			return booking.getParkingSlot().getPrice();
		}

		if (booking.getParkingHours() > 0 && currentTotalPrice > 0) {
			return currentTotalPrice / booking.getParkingHours();
		}

		throw new IllegalStateException("Unable to resolve hourly rate for booking extension.");
	}

	private User getAuthenticatedUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || authentication.getName() == null) {
			throw new SecurityException("Authentication required.");
		}

		String email = authentication.getName();
		return userRepo.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException("Authenticated user not found with email: " + email));
	}

	private void applyBookingTimeAndPrice(BookingDTO dto, Booking booking) {
		LocalDateTime start = booking.getStartTime() != null ? booking.getStartTime() : booking.getArrivalDate();
		LocalDateTime end = booking.getEndTime() != null ? booking.getEndTime() : booking.getDepartureDate();
		double total = booking.getTotalPrice() > 0 ? booking.getTotalPrice() : booking.getPrice();

		dto.setStartTime(start);
		dto.setArrivalDate(start);
		dto.setEndTime(end);
		dto.setDepartureDate(end);
		dto.setTotalPrice(total);
		dto.setPrice(total);
		dto.setStatus(BookingStatus.valueOf(getBookingStatus(booking)));
		dto.setHasReview(booking.getId() != null && reviewRepository.existsByBookingId(booking.getId()));
	}

	public String getBookingStatus(Booking booking) {
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime start = booking.getStartTime() != null ? booking.getStartTime() : booking.getArrivalDate();
		LocalDateTime end = booking.getEndTime() != null ? booking.getEndTime() : booking.getDepartureDate();

		if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.EXPIRED
				|| booking.getStatus() == BookingStatus.USED) {
			return booking.getStatus().name();
		}

		log.debug("Booking status context: now={}, start={}, end={}", now, start, end);

		if (start != null && now.isBefore(start))
			return "RESERVED";
		if (end != null && now.isAfter(end))
			return "COMPLETED";
		return "ACTIVE";
	}

	@Transactional
	@Override
	public void deleteBySlotId(Long id) {

		List<Booking> b = bookingRepo.findAllbyParkingSlotId(id);
		if (b != null) {
			for (Booking booking : b) {
				log.debug("Deleting booking by parking slot mapping for bookingId={}", booking.getId());
				bookingRepo.deleteBookingsByParkingSlotId(booking.getId());
				log.debug("Deleted bookingId={}", booking.getId());
			}
		}

	}

}