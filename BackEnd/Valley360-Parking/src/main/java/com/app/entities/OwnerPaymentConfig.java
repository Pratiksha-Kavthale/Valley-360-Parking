package com.app.entities;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

@Entity
@Table(name = "owner_payment_config")
public class OwnerPaymentConfig extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String upiId;

    @Column(nullable = false, length = 255)
    private String upiDisplayName;

    @Column(nullable = false)
    private boolean paymentEnabled = true;

    @OneToOne(optional = false)
    @JoinColumn(name = "owner_id", unique = true, nullable = false)
    private User owner;

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

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }
}