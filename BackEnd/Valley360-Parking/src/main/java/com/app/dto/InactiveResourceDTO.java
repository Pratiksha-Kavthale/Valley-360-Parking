package com.app.dto;

import java.time.LocalDateTime;

/**
 * DTO for inactive parking resources (areas and slots)
 */
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

    public InactiveResourceDTO() {
    }

    public InactiveResourceDTO(Long id, String name, String slotNumber, String areaName, String city, String status,
            LocalDateTime lastActiveDate, LocalDateTime archivedDate, Integer totalSlots, Integer totalBookings,
            Double totalRevenue, String ownerName, String ownerEmail, String ownerPhone, Long ownerId,
            boolean archived) {
        this.id = id;
        this.name = name;
        this.slotNumber = slotNumber;
        this.areaName = areaName;
        this.city = city;
        this.status = status;
        this.lastActiveDate = lastActiveDate;
        this.archivedDate = archivedDate;
        this.totalSlots = totalSlots;
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.ownerPhone = ownerPhone;
        this.ownerId = ownerId;
        this.archived = archived;
    }

    public static Builder builder() {
        return new Builder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastActiveDate() {
        return lastActiveDate;
    }

    public void setLastActiveDate(LocalDateTime lastActiveDate) {
        this.lastActiveDate = lastActiveDate;
    }

    public LocalDateTime getArchivedDate() {
        return archivedDate;
    }

    public void setArchivedDate(LocalDateTime archivedDate) {
        this.archivedDate = archivedDate;
    }

    public Integer getTotalSlots() {
        return totalSlots;
    }

    public void setTotalSlots(Integer totalSlots) {
        this.totalSlots = totalSlots;
    }

    public Integer getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(Integer totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getOwnerPhone() {
        return ownerPhone;
    }

    public void setOwnerPhone(String ownerPhone) {
        this.ownerPhone = ownerPhone;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public static class Builder {
        private final InactiveResourceDTO dto = new InactiveResourceDTO();

        public Builder id(Long id) { dto.setId(id); return this; }
        public Builder name(String name) { dto.setName(name); return this; }
        public Builder slotNumber(String slotNumber) { dto.setSlotNumber(slotNumber); return this; }
        public Builder areaName(String areaName) { dto.setAreaName(areaName); return this; }
        public Builder city(String city) { dto.setCity(city); return this; }
        public Builder status(String status) { dto.setStatus(status); return this; }
        public Builder lastActiveDate(LocalDateTime lastActiveDate) { dto.setLastActiveDate(lastActiveDate); return this; }
        public Builder archivedDate(LocalDateTime archivedDate) { dto.setArchivedDate(archivedDate); return this; }
        public Builder totalSlots(Integer totalSlots) { dto.setTotalSlots(totalSlots); return this; }
        public Builder totalBookings(Integer totalBookings) { dto.setTotalBookings(totalBookings); return this; }
        public Builder totalRevenue(Double totalRevenue) { dto.setTotalRevenue(totalRevenue); return this; }
        public Builder ownerName(String ownerName) { dto.setOwnerName(ownerName); return this; }
        public Builder ownerEmail(String ownerEmail) { dto.setOwnerEmail(ownerEmail); return this; }
        public Builder ownerPhone(String ownerPhone) { dto.setOwnerPhone(ownerPhone); return this; }
        public Builder ownerId(Long ownerId) { dto.setOwnerId(ownerId); return this; }
        public Builder archived(boolean archived) { dto.setArchived(archived); return this; }

        public InactiveResourceDTO build() {
            return dto;
        }
    }
}
