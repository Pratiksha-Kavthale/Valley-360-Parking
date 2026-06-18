package com.app.service;

import java.util.List;

import com.app.dto.BookingDTO;
import com.app.dto.QrValidationResponseDTO;
import com.app.entities.Booking;

public interface BookingService {

	BookingDTO bookParkingSlot(BookingDTO booking);

	QrValidationResponseDTO validateQrToken(String qrToken);

	QrValidationResponseDTO validateOtp(String otp);

	List<Booking> viewBookingHistory(Long id);

	List<BookingDTO> getTodaysBookings(Long ownerId);

	List<BookingDTO> getPreviousBookings(Long ownerId);

	List<BookingDTO> getUserBookings(Long userId);

	BookingDTO extendBooking(Long bookingId, int additionalHours);

	void deleteBySlotId(Long id);
}
