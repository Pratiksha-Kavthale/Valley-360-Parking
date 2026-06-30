package com.app.controller;

import com.app.dto.CleanupReportDTO;
import com.app.dto.InactiveResourceDTO;
import com.app.dto.ScheduledDeletionDTO;
import com.app.service.CleanupService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/admin/cleanup")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://valley-360-parking-7zi9-ript5gl4k.vercel.app"
})
public class CleanupController {


    private static final Logger log =
            LoggerFactory.getLogger(CleanupController.class);


    private final CleanupService cleanupService;


    public CleanupController(CleanupService cleanupService) {
        this.cleanupService = cleanupService;
    }



    // ==================
    // Inactive Resources
    // ==================


    @GetMapping("/inactive-areas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InactiveResourceDTO>> getInactiveAreas(
            @RequestParam(defaultValue = "45") int daysInactive) {

        log.info("Getting inactive parking areas with {} days threshold", daysInactive);

        return ResponseEntity.ok(
                cleanupService.getInactiveParkingAreas(daysInactive)
        );
    }



    @GetMapping("/inactive-slots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InactiveResourceDTO>> getInactiveSlots(
            @RequestParam(defaultValue = "45") int daysInactive) {

        log.info("Getting inactive parking slots with {} days threshold", daysInactive);

        return ResponseEntity.ok(
                cleanupService.getInactiveParkingSlots(daysInactive)
        );
    }



    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CleanupReportDTO> getCleanupSummary() {

        return ResponseEntity.ok(
                cleanupService.getCleanupSummary()
        );
    }



    // ==================
    // Parking Area Actions
    // ==================


    @DeleteMapping("/area/{areaId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteParkingArea(
            @PathVariable Long areaId) {

        log.info("Deleting parking area: {}", areaId);

        cleanupService.deleteParkingArea(areaId);

        return ResponseEntity.ok().build();
    }



    @PostMapping("/area/{areaId}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> archiveParkingArea(
            @PathVariable Long areaId) {

        log.info("Archiving parking area: {}", areaId);

        cleanupService.archiveParkingArea(areaId);

        return ResponseEntity.ok().build();
    }



    @PostMapping("/area/{areaId}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restoreParkingArea(
            @PathVariable Long areaId) {

        log.info("Restoring parking area: {}", areaId);

        cleanupService.restoreParkingArea(areaId);

        return ResponseEntity.ok().build();
    }



    @PostMapping("/area/{areaId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markAreaAsActive(
            @PathVariable Long areaId) {

        log.info("Activating parking area: {}", areaId);

        cleanupService.markAreaAsActive(areaId);

        return ResponseEntity.ok().build();
    }



    // ==================
    // Parking Slot Actions
    // ==================


    @DeleteMapping("/slot/{slotId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteParkingSlot(
            @PathVariable Long slotId) {

        log.info("Deleting parking slot: {}", slotId);

        cleanupService.deleteParkingSlot(slotId);

        return ResponseEntity.ok().build();
    }



    @PostMapping("/slot/{slotId}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> archiveParkingSlot(
            @PathVariable Long slotId) {

        log.info("Archiving parking slot: {}", slotId);

        cleanupService.archiveParkingSlot(slotId);

        return ResponseEntity.ok().build();
    }



    @PostMapping("/slot/{slotId}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restoreParkingSlot(
            @PathVariable Long slotId) {

        log.info("Restoring parking slot: {}", slotId);

        cleanupService.restoreParkingSlot(slotId);

        return ResponseEntity.ok().build();
    }



    @PostMapping("/slot/{slotId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markSlotAsActive(
            @PathVariable Long slotId) {

        log.info("Activating parking slot: {}", slotId);

        cleanupService.markSlotAsActive(slotId);

        return ResponseEntity.ok().build();
    }



    // ==================
    // Bulk Actions
    // ==================


    @PostMapping("/areas/bulk-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> bulkDeleteAreas(
            @RequestBody Map<String, List<Long>> request) {

        List<Long> areaIds = request.get("areaIds");

        log.info("Bulk deleting parking areas: {}", areaIds);

        cleanupService.bulkDeleteAreas(areaIds);

        return ResponseEntity.ok().build();
    }



    @PostMapping("/areas/bulk-archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> bulkArchiveAreas(
            @RequestBody Map<String, List<Long>> request) {

        List<Long> areaIds = request.get("areaIds");

        log.info("Bulk archiving parking areas: {}", areaIds);

        cleanupService.bulkArchiveAreas(areaIds);

        return ResponseEntity.ok().build();
    }



    @PostMapping("/slots/bulk-delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> bulkDeleteSlots(
            @RequestBody Map<String, List<Long>> request) {

        List<Long> slotIds = request.get("slotIds");

        log.info("Bulk deleting parking slots: {}", slotIds);

        cleanupService.bulkDeleteSlots(slotIds);

        return ResponseEntity.ok().build();
    }



    @PostMapping("/slots/bulk-archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> bulkArchiveSlots(
            @RequestBody Map<String, List<Long>> request) {

        List<Long> slotIds = request.get("slotIds");

        log.info("Bulk archiving parking slots: {}", slotIds);

        cleanupService.bulkArchiveSlots(slotIds);

        return ResponseEntity.ok().build();
    }



    // ==================
    // Archived Resources
    // ==================


    @GetMapping("/archived-areas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InactiveResourceDTO>> getArchivedAreas() {

        return ResponseEntity.ok(
                cleanupService.getArchivedAreas()
        );
    }



    @GetMapping("/archived-slots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InactiveResourceDTO>> getArchivedSlots() {

        return ResponseEntity.ok(
                cleanupService.getArchivedSlots()
        );
    }



    // ==================
    // Scheduled Deletions
    // ==================


    @PostMapping("/schedule-deletion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ScheduledDeletionDTO> scheduleDeletion(
            @RequestBody Map<String,Object> request) {


        String resourceType =
                (String) request.get("resourceType");


        Long resourceId =
                Long.valueOf(request.get("resourceId").toString());


        LocalDate deletionDate =
                LocalDate.parse(
                        request.get("deletionDate").toString()
                );


        log.info(
                "Scheduling deletion {} {} on {}",
                resourceType,
                resourceId,
                deletionDate
        );


        return ResponseEntity.ok(
                cleanupService.scheduleDeletion(
                        resourceType,
                        resourceId,
                        deletionDate
                )
        );
    }



    @PostMapping("/cancel-deletion/{token}")
    public ResponseEntity<Map<String,Object>> cancelScheduledDeletion(
            @PathVariable String token) {


        log.info("Cancelling scheduled deletion token: {}", token);


        boolean success =
                cleanupService.cancelScheduledDeletion(token);


        return ResponseEntity.ok(
                Map.of(
                        "success", success,
                        "message",
                        success
                        ? "Deletion cancelled successfully"
                        : "Failed to cancel deletion"
                )
        );
    }



    @GetMapping("/pending-deletions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ScheduledDeletionDTO>> getPendingDeletions() {

        return ResponseEntity.ok(
                cleanupService.getPendingDeletions()
        );
    }



    // ==================
    // Reports
    // ==================


    @GetMapping("/report/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CleanupReportDTO> getMonthlyReport(
            @RequestParam int month,
            @RequestParam int year) {


        log.info(
                "Generating monthly cleanup report {}/{}",
                month,
                year
        );


        return ResponseEntity.ok(
                cleanupService.generateMonthlyReport(month, year)
        );
    }



    @PostMapping("/report/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CleanupReportDTO> generateReport() {


        log.info("Generating cleanup report");


        LocalDate now = LocalDate.now();


        return ResponseEntity.ok(
                cleanupService.generateMonthlyReport(
                        now.getMonthValue(),
                        now.getYear()
                )
        );
    }

}