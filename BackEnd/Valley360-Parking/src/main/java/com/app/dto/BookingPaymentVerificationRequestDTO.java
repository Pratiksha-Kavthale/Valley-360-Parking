package com.app.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class BookingPaymentVerificationRequestDTO {

    @NotBlank(message = "decision is required")
    @Size(max = 20, message = "decision must be at most 20 characters")
    private String decision;

    @Size(max = 500, message = "note must be at most 500 characters")
    private String note;

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}