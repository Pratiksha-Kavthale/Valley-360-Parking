package com.app.entities;

import lombok.*;
import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing owner performance metrics and trust score
 * Calculated from review analysis and feedback
 */
@Entity
@Table(name = "owner_metrics", indexes = {
        @Index(name = "idx_owner_id", columnList = "owner_id"),
        @Index(name = "idx_trust_score", columnList = "trust_score"),
        @Index(name = "idx_risk_level", columnList = "risk_level")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    private User owner;

    @Builder.Default
    @Column(name = "total_reviews", nullable = false)
    private Integer totalReviews = 0;

    @Builder.Default
    @Column(name = "positive_reviews", nullable = false)
    private Integer positiveReviews = 0;

    @Builder.Default
    @Column(name = "neutral_reviews", nullable = false)
    private Integer neutralReviews = 0;

    @Builder.Default
    @Column(name = "negative_reviews", nullable = false)
    private Integer negativeReviews = 0;

    @Builder.Default
    @Column(name = "security_flags", nullable = false)
    private Integer securityFlags = 0;

    @Builder.Default
    @Column(name = "cleanliness_flags", nullable = false)
    private Integer cleanlinessFlags = 0;

    @Builder.Default
    @Column(name = "average_rating", nullable = false)
    private Double averageRating = 0.0;

    @Builder.Default
    @Column(name = "trust_score", nullable = false)
    private Double trustScore = 100.0;

    @Builder.Default
    @Column(name = "risk_level", length = 20)
    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel = RiskLevel.LOW;

    @Builder.Default
    @Column(name = "updated_at", nullable = false, updatable = true)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Get risk level based on trust score
     */
    public void updateRiskLevel() {
        if (this.trustScore >= 80) {
            this.riskLevel = RiskLevel.LOW;
        } else if (this.trustScore >= 60) {
            this.riskLevel = RiskLevel.MEDIUM;
        } else if (this.trustScore >= 40) {
            this.riskLevel = RiskLevel.HIGH;
        } else {
            this.riskLevel = RiskLevel.CRITICAL;
        }
    }

    public enum RiskLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }


    public Integer getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }


    public Integer getPositiveReviews() {
        return positiveReviews;
    }

    public void setPositiveReviews(Integer positiveReviews) {
        this.positiveReviews = positiveReviews;
    }


    public Integer getNeutralReviews() {
        return neutralReviews;
    }

    public void setNeutralReviews(Integer neutralReviews) {
        this.neutralReviews = neutralReviews;
    }


    public Integer getNegativeReviews() {
        return negativeReviews;
    }

    public void setNegativeReviews(Integer negativeReviews) {
        this.negativeReviews = negativeReviews;
    }


    public Integer getSecurityFlags() {
        return securityFlags;
    }

    public void setSecurityFlags(Integer securityFlags) {
        this.securityFlags = securityFlags;
    }


    public Integer getCleanlinessFlags() {
        return cleanlinessFlags;
    }

    public void setCleanlinessFlags(Integer cleanlinessFlags) {
        this.cleanlinessFlags = cleanlinessFlags;
    }


    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }


    public Double getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(Double trustScore) {
        this.trustScore = trustScore;
    }


    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
