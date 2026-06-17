package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for scheduled deletion data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduledDeletionDTO {
    
    private Long id;
    private String resourceType;
    private Long resourceId;
    private String resourceName;
    private LocalDate scheduledDate;
    private String cancellationToken;
    private boolean notificationSent;
    private boolean cancelled;
}
