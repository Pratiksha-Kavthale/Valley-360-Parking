package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for inactive parking resources (areas and slots)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InactiveResourceDTO {
    
    private Long id;
    private String name;
    private String slotNumber;
    private String areaName;
    private String city;
    private String status;
    
    private LocalDateTime lastActiveDate;
    private LocalDateTime archivedDate;
    
    private Integer totalSlots;
    private Integer totalBookings;
    private Double totalRevenue;
    
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private Long ownerId;
    
    private boolean archived;
}
