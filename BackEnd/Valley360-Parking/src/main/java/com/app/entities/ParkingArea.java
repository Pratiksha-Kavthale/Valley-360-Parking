package com.app.entities;

import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.app.enums.Status;

@Entity
// @Getter
// @Setter
@Table(name = "parking_area")

public class ParkingArea extends BaseEntity {

	private String area;
	private String city;
	private String pincode;
	private double latitude;
	private double longitude;
	private double avgRating;
	private long totalReviews;
	@Enumerated(EnumType.STRING)
	private Status status;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "owner_id")
	private User user;

	@OneToMany(mappedBy = "parking")
	private Set<ParkingSlot> parkingSlots;

	public ParkingArea() {
		super();
	}

	public ParkingArea(String area, String city, String pincode, double latitude, double longitude, Status status,
			Set<ParkingSlot> parkingSlots) {
		super();
		this.area = area;
		this.city = city;
		this.pincode = pincode;
		this.latitude = latitude;
		this.longitude = longitude;
		this.status = status;
		this.parkingSlots = parkingSlots;
	}

	public String getArea() {
		return area;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getPincode() {
		return pincode;
	}

	public void setPincode(String pincode) {
		this.pincode = pincode;
	}

	public double getLatitude() {
		return latitude;
	}

	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}

	public double getLongitude() {
		return longitude;
	}

	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}

	public double getAvgRating() {
		return avgRating;
	}

	public void setAvgRating(double avgRating) {
		this.avgRating = avgRating;
	}

	public long getTotalReviews() {
		return totalReviews;
	}

	public void setTotalReviews(long totalReviews) {
		this.totalReviews = totalReviews;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Set<ParkingSlot> getParkingSlots() {
		return parkingSlots;
	}

	public void setParkingSlots(Set<ParkingSlot> parkingSlots) {
		this.parkingSlots = parkingSlots;
	}

	public void setArea(String area) {
		this.area = area;
	}

}
