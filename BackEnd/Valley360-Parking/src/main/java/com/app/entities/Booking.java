package com.app.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.beans.factory.annotation.Autowired;

import com.app.enums.BookingStatus;
import com.app.enums.BookingPaymentStatus;
import com.app.enums.VehicleType;

import lombok.ToString;

@Entity
@Table(name = "bookings")

@ToString
public class Booking extends BaseEntity {

	@CreationTimestamp
	private LocalDate bookingDate;

	private LocalDateTime arrivalDate;

	private LocalDateTime startTime;

	private LocalDateTime departureDate;

	private LocalDateTime endTime;

	private String vehicleNo;

	@Enumerated(EnumType.STRING)
	private VehicleType VehicleType;

	@Enumerated(EnumType.STRING)
	private BookingStatus status;

	@Enumerated(EnumType.STRING)
	private BookingPaymentStatus paymentStatus;

	@Column(unique = true, length = 64)
	private String qrToken;

	@Column(length = 6)
	private String otp;

	@Column(unique = true, length = 64)
	private String paymentUtrNumber;

	@Column(length = 255)
	private String paymentScreenshotPath;

	@Column(length = 255)
	private String paymentScreenshotOriginalName;

	private LocalDateTime paymentSubmittedAt;

	private LocalDateTime paymentVerifiedAt;

	private Long paymentVerifiedBy;

	@Column(length = 500)
	private String paymentVerificationNote;

	private LocalDateTime paymentExpiresAt;

	private int parkingHours;

	private double price;

	private double totalPrice;

	@ManyToOne(cascade = { CascadeType.ALL })
	@JoinColumn(name = "customer_id")
	private User user;

	@OneToOne
	@JoinColumn(name = "parking_slot_id")
	private ParkingSlot parkingSlot;

	public Booking() {
		super();
	}

	public Booking(LocalDate bookingDate, LocalDateTime arrivalDate, LocalDateTime departureDate, String vehicleNo,
			com.app.enums.VehicleType vehicleType, BookingStatus status, int parkingHours, double price) {
		super();
		this.bookingDate = bookingDate;
		this.arrivalDate = arrivalDate;
		this.departureDate = departureDate;
		this.vehicleNo = vehicleNo;
		VehicleType = vehicleType;
		this.status = status;
		this.parkingHours = parkingHours;
		this.price = price;
	}

	public LocalDate getBookingDate() {
		return bookingDate;
	}

	public void setBookingDate(LocalDate bookingDate) {
		this.bookingDate = bookingDate;
	}

	public LocalDateTime getArrivalDate() {
		return arrivalDate;
	}

	public void setArrivalDate(LocalDateTime arrivalDate) {
		this.arrivalDate = arrivalDate;
	}

	public LocalDateTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalDateTime startTime) {
		this.startTime = startTime;
	}

	public LocalDateTime getDepartureDate() {
		return departureDate;
	}

	public void setDepartureDate(LocalDateTime departureDate) {
		this.departureDate = departureDate;
	}

	public LocalDateTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalDateTime endTime) {
		this.endTime = endTime;
	}

	public String getVehicleNo() {
		return vehicleNo;
	}

	public void setVehicleNo(String vehicleNo) {
		this.vehicleNo = vehicleNo;
	}

	public VehicleType getVehicleType() {
		return VehicleType;
	}

	public void setVehicleType(VehicleType vehicleType) {
		VehicleType = vehicleType;
	}

	public BookingStatus getStatus() {
		return status;
	}

	public void setStatus(BookingStatus status) {
		this.status = status;
	}

	public BookingPaymentStatus getPaymentStatus() {
		return paymentStatus;
	}

	public void setPaymentStatus(BookingPaymentStatus paymentStatus) {
		this.paymentStatus = paymentStatus;
	}

	public String getQrToken() {
		return qrToken;
	}

	public void setQrToken(String qrToken) {
		this.qrToken = qrToken;
	}

	public String getOtp() {
		return otp;
	}

	public void setOtp(String otp) {
		this.otp = otp;
	}

	public String getPaymentUtrNumber() {
		return paymentUtrNumber;
	}

	public void setPaymentUtrNumber(String paymentUtrNumber) {
		this.paymentUtrNumber = paymentUtrNumber;
	}

	public String getPaymentScreenshotPath() {
		return paymentScreenshotPath;
	}

	public void setPaymentScreenshotPath(String paymentScreenshotPath) {
		this.paymentScreenshotPath = paymentScreenshotPath;
	}

	public String getPaymentScreenshotOriginalName() {
		return paymentScreenshotOriginalName;
	}

	public void setPaymentScreenshotOriginalName(String paymentScreenshotOriginalName) {
		this.paymentScreenshotOriginalName = paymentScreenshotOriginalName;
	}

	public LocalDateTime getPaymentSubmittedAt() {
		return paymentSubmittedAt;
	}

	public void setPaymentSubmittedAt(LocalDateTime paymentSubmittedAt) {
		this.paymentSubmittedAt = paymentSubmittedAt;
	}

	public LocalDateTime getPaymentVerifiedAt() {
		return paymentVerifiedAt;
	}

	public void setPaymentVerifiedAt(LocalDateTime paymentVerifiedAt) {
		this.paymentVerifiedAt = paymentVerifiedAt;
	}

	public Long getPaymentVerifiedBy() {
		return paymentVerifiedBy;
	}

	public void setPaymentVerifiedBy(Long paymentVerifiedBy) {
		this.paymentVerifiedBy = paymentVerifiedBy;
	}

	public String getPaymentVerificationNote() {
		return paymentVerificationNote;
	}

	public void setPaymentVerificationNote(String paymentVerificationNote) {
		this.paymentVerificationNote = paymentVerificationNote;
	}

	public LocalDateTime getPaymentExpiresAt() {
		return paymentExpiresAt;
	}

	public void setPaymentExpiresAt(LocalDateTime paymentExpiresAt) {
		this.paymentExpiresAt = paymentExpiresAt;
	}

	public int getParkingHours() {
		return parkingHours;
	}

	public void setParkingHours(int parkingHours) {
		this.parkingHours = parkingHours;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public double getTotalPrice() {
		return totalPrice;
	}

	public void setTotalPrice(double totalPrice) {
		this.totalPrice = totalPrice;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public ParkingSlot getParkingSlot() {
		return parkingSlot;
	}

	public void setParkingSlot(ParkingSlot parkingSlot) {
		this.parkingSlot = parkingSlot;
	}

}