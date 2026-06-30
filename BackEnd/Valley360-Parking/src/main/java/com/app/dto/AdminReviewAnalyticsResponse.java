package com.app.dto;

import java.util.List;

public class AdminReviewAnalyticsResponse {

    private Integer totalReviews;
    private Double positivePercent;
    private Double negativePercent;
    private Double neutralPercent;
    private Double avgRating;
    private List<String> topComplaints;


    public AdminReviewAnalyticsResponse() {
    }


    public Integer getTotalReviews() {
        return totalReviews;
    }

    public Double getPositivePercent() {
        return positivePercent;
    }

    public Double getNegativePercent() {
        return negativePercent;
    }

    public Double getNeutralPercent() {
        return neutralPercent;
    }

    public Double getAvgRating() {
        return avgRating;
    }

    public List<String> getTopComplaints() {
        return topComplaints;
    }


    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }

    public void setPositivePercent(Double positivePercent) {
        this.positivePercent = positivePercent;
    }

    public void setNegativePercent(Double negativePercent) {
        this.negativePercent = negativePercent;
    }

    public void setNeutralPercent(Double neutralPercent) {
        this.neutralPercent = neutralPercent;
    }

    public void setAvgRating(Double avgRating) {
        this.avgRating = avgRating;
    }

    public void setTopComplaints(List<String> topComplaints) {
        this.topComplaints = topComplaints;
    }


    public static Builder builder() {
        return new Builder();
    }


    public static class Builder {

        private final AdminReviewAnalyticsResponse obj =
                new AdminReviewAnalyticsResponse();


        public Builder totalReviews(Integer value) {
            obj.totalReviews = value;
            return this;
        }


        public Builder positivePercent(Double value) {
            obj.positivePercent = value;
            return this;
        }


        public Builder negativePercent(Double value) {
            obj.negativePercent = value;
            return this;
        }


        public Builder neutralPercent(Double value) {
            obj.neutralPercent = value;
            return this;
        }


        public Builder avgRating(Double value) {
            obj.avgRating = value;
            return this;
        }


        public Builder topComplaints(List<String> value) {
            obj.topComplaints = value;
            return this;
        }


        public AdminReviewAnalyticsResponse build() {
            return obj;
        }
    }
}