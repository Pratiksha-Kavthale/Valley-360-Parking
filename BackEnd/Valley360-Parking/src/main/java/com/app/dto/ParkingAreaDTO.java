package com.app.dto;

import com.app.enums.Status;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import lombok.ToString;


@ToString
public class ParkingAreaDTO extends BaseDTO{

	private String area;
	private String city;
	private String pincode;
	private double latitude;
	private double longitude;
	private double avgRating;
	private long totalReviews;
	private Status status;
	@JsonProperty(access = Access.WRITE_ONLY)
	private Long ownerId;

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
	public Long getOwnerId() {
		return ownerId;
	}
	public void setOwnerId(Long ownerId) {
		this.ownerId = ownerId;
	}
	public String getArea() {
		return area;
	}
	public void setArea(String area) {
		this.area = area;
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
	
	
	
}
