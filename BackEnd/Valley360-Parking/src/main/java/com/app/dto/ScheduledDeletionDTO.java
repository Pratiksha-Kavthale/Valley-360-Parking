package com.app.dto;

import java.time.LocalDate;

/**
 * DTO for scheduled deletion data
 */
public class ScheduledDeletionDTO {
    
    private Long id;
    private String resourceType;
    private Long resourceId;
    private String resourceName;
    private LocalDate scheduledDate;
    private String cancellationToken;
    private boolean notificationSent;
    private boolean cancelled;

    public ScheduledDeletionDTO() {
    }

    public ScheduledDeletionDTO(Long id, String resourceType, Long resourceId, String resourceName,
            LocalDate scheduledDate, String cancellationToken, boolean notificationSent, boolean cancelled) {
        this.id = id;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.scheduledDate = scheduledDate;
        this.cancellationToken = cancellationToken;
        this.notificationSent = notificationSent;
        this.cancelled = cancelled;
    }

    public static Builder builder() {
        return new Builder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }
    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }
    public String getCancellationToken() { return cancellationToken; }
    public void setCancellationToken(String cancellationToken) { this.cancellationToken = cancellationToken; }
    public boolean isNotificationSent() { return notificationSent; }
    public void setNotificationSent(boolean notificationSent) { this.notificationSent = notificationSent; }
    public boolean isCancelled() { return cancelled; }
    public void setCancelled(boolean cancelled) { this.cancelled = cancelled; }

    public static class Builder {
        private final ScheduledDeletionDTO dto = new ScheduledDeletionDTO();

        public Builder id(Long id) { dto.setId(id); return this; }
        public Builder resourceType(String resourceType) { dto.setResourceType(resourceType); return this; }
        public Builder resourceId(Long resourceId) { dto.setResourceId(resourceId); return this; }
        public Builder resourceName(String resourceName) { dto.setResourceName(resourceName); return this; }
        public Builder scheduledDate(LocalDate scheduledDate) { dto.setScheduledDate(scheduledDate); return this; }
        public Builder cancellationToken(String cancellationToken) { dto.setCancellationToken(cancellationToken); return this; }
        public Builder notificationSent(boolean notificationSent) { dto.setNotificationSent(notificationSent); return this; }
        public Builder cancelled(boolean cancelled) { dto.setCancelled(cancelled); return this; }

        public ScheduledDeletionDTO build() {
            return dto;
        }
    }
}
