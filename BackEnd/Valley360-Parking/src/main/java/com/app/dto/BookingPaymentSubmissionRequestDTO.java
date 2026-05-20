package com.app.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

public class BookingPaymentSubmissionRequestDTO {

    @Pattern(regexp = "^[A-Za-z0-9]{10,35}$", message = "utrNumber must be an alphanumeric UTR reference")
    @Size(max = 35, message = "utrNumber must be at most 35 characters")
    private String utrNumber;

    @NotBlank(message = "paymentMethod is required")
    @Size(max = 20, message = "paymentMethod must be at most 20 characters")
    private String paymentMethod;

    public String getUtrNumber() {
        return utrNumber;
    }

    public void setUtrNumber(String utrNumber) {
        this.utrNumber = utrNumber;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}