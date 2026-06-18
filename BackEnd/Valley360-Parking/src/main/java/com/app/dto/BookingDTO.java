package com.app.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import org.hibernate.annotations.CreationTimestamp;

import com.app.entities.ParkingSlot;
import com.app.entities.User;
import com.app.enums.BookingPaymentStatus;
import com.app.enums.BookingStatus;
import com.app.enums.VehicleType;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

//@Getter
//@Setter
@ToString
public class BookingDTO extends BaseDTO {

	@CreationTimestamp
	private LocalDate bookingDate;

	private LocalDateTime arrivalDate;

	private LocalDateTime startTime;

	private LocalDateTime departureDate;

	private LocalDateTime endTime;

	private String vehicleNo;

	private VehicleType VehicleType;

	private BookingStatus status;

	private BookingPaymentStatus paymentStatus;

	private String qrToken;

	private String otp;

	private String paymentUtrNumber;

	private String paymentScreenshotPath;

	private String paymentScreenshotOriginalName;

	private LocalDateTime paymentSubmittedAt;

	private LocalDateTime paymentVerifiedAt;

	private Long paymentVerifiedBy;

	private String paymentVerificationNote;

	private LocalDateTime paymentExpiresAt;

	private int parkingHours;

	private double price;

	private double totalPrice;

	private Long customer_id;

	private Long parking_slot_id;

	private String parkingAreaName;

	private Long slotNumber;

	private boolean hasReview;

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

	public Long getCustomer_id() {
		return customer_id;
	}

	public void setCustomer_id(Long customer_id) {
		this.customer_id = customer_id;
	}

	public Long getParking_slot_id() {
		return parking_slot_id;
	}

	public void setParking_slot_id(Long parking_slot_id) {
		this.parking_slot_id = parking_slot_id;
	}

	public String getParkingAreaName() {
		return parkingAreaName;
	}

	public void setParkingAreaName(String parkingAreaName) {
		this.parkingAreaName = parkingAreaName;
	}

	public Long getSlotNumber() {
		return slotNumber;
	}

	public void setSlotNumber(Long slotNumber) {
		this.slotNumber = slotNumber;
	}

	public boolean isHasReview() {
		return hasReview;
	}

	public void setHasReview(boolean hasReview) {
		this.hasReview = hasReview;
	}

}