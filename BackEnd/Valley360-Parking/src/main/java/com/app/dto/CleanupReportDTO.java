package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for cleanup report data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
}
