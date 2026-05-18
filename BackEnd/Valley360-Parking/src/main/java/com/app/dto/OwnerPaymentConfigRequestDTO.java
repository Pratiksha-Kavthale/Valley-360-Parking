package com.app.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

public class OwnerPaymentConfigRequestDTO {

    @NotBlank(message = "upiId is required")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$", message = "upiId must be a valid UPI handle")
    @Size(max = 255, message = "upiId must be at most 255 characters")
    private String upiId;

    @NotBlank(message = "upiDisplayName is required")
    @Size(max = 255, message = "upiDisplayName must be at most 255 characters")
    private String upiDisplayName;

    private boolean paymentEnabled;

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getUpiDisplayName() {
        return upiDisplayName;
    }

    public void setUpiDisplayName(String upiDisplayName) {
        this.upiDisplayName = upiDisplayName;
    }

    public boolean isPaymentEnabled() {
        return paymentEnabled;
    }

    public void setPaymentEnabled(boolean paymentEnabled) {
        this.paymentEnabled = paymentEnabled;
    }
}