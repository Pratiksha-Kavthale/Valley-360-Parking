package com.app.service;

import com.app.dto.CleanupReportDTO;
import com.app.dto.InactiveResourceDTO;
import com.app.dto.ScheduledDeletionDTO;
import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for automated cleanup operations
 */
public interface CleanupService {
    
    /**
     * Get all parking areas inactive for more than specified days
     */
    List<InactiveResourceDTO> getInactiveParkingAreas(int daysInactive);
    
    /**
     * Get all parking slots inactive for more than specified days
     */
    List<InactiveResourceDTO> getInactiveParkingSlots(int daysInactive);
    
    /**
     * Get cleanup summary statistics
     */
    CleanupReportDTO getCleanupSummary();
    
    /**
     * Archive a parking area
     */
    void archiveParkingArea(Long areaId);
    
    /**
     * Archive a parking slot
     */
    void archiveParkingSlot(Long slotId);
    
    /**
     * Restore an archived parking area
     */
    void restoreParkingArea(Long areaId);
    
    /**
     * Restore an archived parking slot
     */
    void restoreParkingSlot(Long slotId);
    
    /**
     * Mark parking area as active
     */
    void markAreaAsActive(Long areaId);
    
    /**
     * Mark parking slot as active
     */
    void markSlotAsActive(Long slotId);
    
    /**
     * Delete parking area permanently
     */
    void deleteParkingArea(Long areaId);
    
    /**
     * Delete parking slot permanently
     */
    void deleteParkingSlot(Long slotId);
    
    /**
     * Bulk delete parking areas
     */
    void bulkDeleteAreas(List<Long> areaIds);
    
    /**
     * Bulk archive parking areas
     */
    void bulkArchiveAreas(List<Long> areaIds);
    
    /**
     * Bulk delete parking slots
     */
    void bulkDeleteSlots(List<Long> slotIds);
    
    /**
     * Bulk archive parking slots
     */
    void bulkArchiveSlots(List<Long> slotIds);
    
    /**
     * Get archived parking areas
     */
    List<InactiveResourceDTO> getArchivedAreas();
    
    /**
     * Get archived parking slots
     */
    List<InactiveResourceDTO> getArchivedSlots();
    
    /**
     * Schedule a resource for deletion with notification
     */
    ScheduledDeletionDTO scheduleDeletion(String resourceType, Long resourceId, LocalDate deletionDate);
    
    /**
     * Cancel scheduled deletion using token
     */
    boolean cancelScheduledDeletion(String token);
    
    /**
     * Get pending scheduled deletions
     */
    List<ScheduledDeletionDTO> getPendingDeletions();
    
    /**
     * Generate monthly cleanup report
     */
    CleanupReportDTO generateMonthlyReport(int month, int year);
    
    /**
     * Execute automatic cleanup (called by scheduled job)
     */
    void executeAutomaticCleanup();
}
