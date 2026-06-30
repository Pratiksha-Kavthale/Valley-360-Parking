package com.app.dto;

public class AdminOwnerRiskResponse {

    private Long ownerId;
    private String ownerName;
    private Double trustScore;
    private String riskLevel;
    private Integer totalReviews;
    private Double negativePercent;
    private Integer securityComplaints;
    private String trend;
    private String suggestedAction;


    public AdminOwnerRiskResponse() {
    }


    public Long getOwnerId() {
        return ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public Double getTrustScore() {
        return trustScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public Integer getTotalReviews() {
        return totalReviews;
    }

    public Double getNegativePercent() {
        return negativePercent;
    }

    public Integer getSecurityComplaints() {
        return securityComplaints;
    }

    public String getTrend() {
        return trend;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }



    public static AdminOwnerRiskResponseBuilder builder() {
        return new AdminOwnerRiskResponseBuilder();
    }



    public static class AdminOwnerRiskResponseBuilder {

        private final AdminOwnerRiskResponse obj =
                new AdminOwnerRiskResponse();



        public AdminOwnerRiskResponseBuilder ownerId(Long value){
            obj.ownerId = value;
            return this;
        }


        public AdminOwnerRiskResponseBuilder ownerName(String value){
            obj.ownerName = value;
            return this;
        }


        public AdminOwnerRiskResponseBuilder trustScore(Double value){
            obj.trustScore = value;
            return this;
        }


        public AdminOwnerRiskResponseBuilder riskLevel(String value){
            obj.riskLevel = value;
            return this;
        }


        public AdminOwnerRiskResponseBuilder totalReviews(Integer value){
            obj.totalReviews = value;
            return this;
        }


        public AdminOwnerRiskResponseBuilder negativePercent(Double value){
            obj.negativePercent = value;
            return this;
        }


        public AdminOwnerRiskResponseBuilder securityComplaints(Integer value){
            obj.securityComplaints = value;
            return this;
        }


        public AdminOwnerRiskResponseBuilder trend(String value){
            obj.trend = value;
            return this;
        }


        public AdminOwnerRiskResponseBuilder suggestedAction(String value){
            obj.suggestedAction = value;
            return this;
        }



        // IMPORTANT
        // This was missing
        public AdminOwnerRiskResponse build(){
            return obj;
        }

    }
}