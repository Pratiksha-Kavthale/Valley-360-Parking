package com.app.dto;

public class OwnerPaymentConfigDTO {

    private Long id;
    private String upiId;
    private String upiDisplayName;
    private boolean paymentEnabled;
    private Long ownerId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}