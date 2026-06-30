package com.app.dto;

import java.time.LocalDateTime;

/**
 * DTO for cleanup report data
 */
public class CleanupReportDTO {
    
    private int totalInactiveAreas;
    private int totalInactiveSlots;
    private int criticalAreas;
    private int totalArchivedAreas;
    private int totalArchivedSlots;
    private double potentialRevenueImpact;
    
    private int areasDeleted;
    private int slotsDeleted;
    private int areasArchived;
    private int slotsArchived;
    
    private Integer reportMonth;
    private Integer reportYear;
    private LocalDateTime reportGeneratedAt;

    public CleanupReportDTO() {
    }

    public CleanupReportDTO(int totalInactiveAreas, int totalInactiveSlots, int criticalAreas, int totalArchivedAreas,
            int totalArchivedSlots, double potentialRevenueImpact, int areasDeleted, int slotsDeleted,
            int areasArchived, int slotsArchived, Integer reportMonth, Integer reportYear,
            LocalDateTime reportGeneratedAt) {
        this.totalInactiveAreas = totalInactiveAreas;
        this.totalInactiveSlots = totalInactiveSlots;
        this.criticalAreas = criticalAreas;
        this.totalArchivedAreas = totalArchivedAreas;
        this.totalArchivedSlots = totalArchivedSlots;
        this.potentialRevenueImpact = potentialRevenueImpact;
        this.areasDeleted = areasDeleted;
        this.slotsDeleted = slotsDeleted;
        this.areasArchived = areasArchived;
        this.slotsArchived = slotsArchived;
        this.reportMonth = reportMonth;
        this.reportYear = reportYear;
        this.reportGeneratedAt = reportGeneratedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public int getTotalInactiveAreas() { return totalInactiveAreas; }
    public void setTotalInactiveAreas(int totalInactiveAreas) { this.totalInactiveAreas = totalInactiveAreas; }
    public int getTotalInactiveSlots() { return totalInactiveSlots; }
    public void setTotalInactiveSlots(int totalInactiveSlots) { this.totalInactiveSlots = totalInactiveSlots; }
    public int getCriticalAreas() { return criticalAreas; }
    public void setCriticalAreas(int criticalAreas) { this.criticalAreas = criticalAreas; }
    public int getTotalArchivedAreas() { return totalArchivedAreas; }
    public void setTotalArchivedAreas(int totalArchivedAreas) { this.totalArchivedAreas = totalArchivedAreas; }
    public int getTotalArchivedSlots() { return totalArchivedSlots; }
    public void setTotalArchivedSlots(int totalArchivedSlots) { this.totalArchivedSlots = totalArchivedSlots; }
    public double getPotentialRevenueImpact() { return potentialRevenueImpact; }
    public void setPotentialRevenueImpact(double potentialRevenueImpact) { this.potentialRevenueImpact = potentialRevenueImpact; }
    public int getAreasDeleted() { return areasDeleted; }
    public void setAreasDeleted(int areasDeleted) { this.areasDeleted = areasDeleted; }
    public int getSlotsDeleted() { return slotsDeleted; }
    public void setSlotsDeleted(int slotsDeleted) { this.slotsDeleted = slotsDeleted; }
    public int getAreasArchived() { return areasArchived; }
    public void setAreasArchived(int areasArchived) { this.areasArchived = areasArchived; }
    public int getSlotsArchived() { return slotsArchived; }
    public void setSlotsArchived(int slotsArchived) { this.slotsArchived = slotsArchived; }
    public Integer getReportMonth() { return reportMonth; }
    public void setReportMonth(Integer reportMonth) { this.reportMonth = reportMonth; }
    public Integer getReportYear() { return reportYear; }
    public void setReportYear(Integer reportYear) { this.reportYear = reportYear; }
    public LocalDateTime getReportGeneratedAt() { return reportGeneratedAt; }
    public void setReportGeneratedAt(LocalDateTime reportGeneratedAt) { this.reportGeneratedAt = reportGeneratedAt; }

    public static class Builder {
        private final CleanupReportDTO dto = new CleanupReportDTO();

        public Builder totalInactiveAreas(int totalInactiveAreas) { dto.setTotalInactiveAreas(totalInactiveAreas); return this; }
        public Builder totalInactiveSlots(int totalInactiveSlots) { dto.setTotalInactiveSlots(totalInactiveSlots); return this; }
        public Builder criticalAreas(int criticalAreas) { dto.setCriticalAreas(criticalAreas); return this; }
        public Builder totalArchivedAreas(int totalArchivedAreas) { dto.setTotalArchivedAreas(totalArchivedAreas); return this; }
        public Builder totalArchivedSlots(int totalArchivedSlots) { dto.setTotalArchivedSlots(totalArchivedSlots); return this; }
        public Builder potentialRevenueImpact(double potentialRevenueImpact) { dto.setPotentialRevenueImpact(potentialRevenueImpact); return this; }
        public Builder areasDeleted(int areasDeleted) { dto.setAreasDeleted(areasDeleted); return this; }
        public Builder slotsDeleted(int slotsDeleted) { dto.setSlotsDeleted(slotsDeleted); return this; }
        public Builder areasArchived(int areasArchived) { dto.setAreasArchived(areasArchived); return this; }
        public Builder slotsArchived(int slotsArchived) { dto.setSlotsArchived(slotsArchived); return this; }
        public Builder reportMonth(Integer reportMonth) { dto.setReportMonth(reportMonth); return this; }
        public Builder reportYear(Integer reportYear) { dto.setReportYear(reportYear); return this; }
        public Builder reportGeneratedAt(LocalDateTime reportGeneratedAt) { dto.setReportGeneratedAt(reportGeneratedAt); return this; }

        public CleanupReportDTO build() {
            return dto;
        }
    }
}
