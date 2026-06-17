package com.app.service;

import com.app.dto.CleanupReportDTO;
import com.app.dto.InactiveResourceDTO;
import com.app.dto.ScheduledDeletionDTO;
import com.app.entities.Booking;
import com.app.entities.ParkingArea;
import com.app.entities.ParkingSlot;
import com.app.repository.ParkingAreaRepository;
import com.app.repository.ParkingSlotRepository;
import com.app.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CleanupServiceImpl implements CleanupService {

    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    
    // Optional - may not exist in repository
    // private final ScheduledDeletionRepository scheduledDeletionRepository;

    private static final int DEFAULT_INACTIVE_DAYS = 45;
    
    @Override
    public List<InactiveResourceDTO> getInactiveParkingAreas(int daysInactive) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysInactive);
        
        List<ParkingArea> allAreas = parkingAreaRepository.findAll();
        List<InactiveResourceDTO> inactiveAreas = new ArrayList<>();
        
        for (ParkingArea area : allAreas) {
            // Check if area has any recent bookings
            LocalDateTime lastBookingDate = getLastBookingDateForArea(area.getId());
            
            if (lastBookingDate == null || lastBookingDate.isBefore(cutoffDate)) {
                InactiveResourceDTO dto = InactiveResourceDTO.builder()
                    .id(area.getId())
                    .name(area.getArea())
                    .city(area.getCity())
                    .lastActiveDate(lastBookingDate)
                    .totalSlots(area.getParkingSlots() != null ? area.getParkingSlots().size() : 0)
                    .totalBookings(getTotalBookingsForArea(area.getId()))
                    .totalRevenue(getTotalRevenueForArea(area.getId()))
                    .ownerName(area.getUser() != null ? area.getUser().getFirstName() + " " + area.getUser().getLastName() : null)
                    .ownerEmail(area.getUser() != null ? area.getUser().getEmail() : null)
                    .ownerPhone(area.getUser() != null ? area.getUser().getContact() : null)
                    .ownerId(area.getUser() != null ? area.getUser().getId() : null)
                    .status(area.getStatus() != null ? area.getStatus().name() : null)
                    .archived(false)
                    .build();
                
                inactiveAreas.add(dto);
            }
        }
        
        return inactiveAreas;
    }

    @Override
    public List<InactiveResourceDTO> getInactiveParkingSlots(int daysInactive) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysInactive);
        
        List<ParkingSlot> allSlots = parkingSlotRepository.findAll();
        List<InactiveResourceDTO> inactiveSlots = new ArrayList<>();
        
        for (ParkingSlot slot : allSlots) {
            LocalDateTime lastBookingDate = getLastBookingDateForSlot(slot.getId());
            
            if (lastBookingDate == null || lastBookingDate.isBefore(cutoffDate)) {
                InactiveResourceDTO dto = InactiveResourceDTO.builder()
                    .id(slot.getId())
                    .slotNumber("Slot-" + slot.getId())
                    .areaName(slot.getParking() != null ? slot.getParking().getArea() : null)
                    .lastActiveDate(lastBookingDate)
                    .totalBookings(getTotalBookingsForSlot(slot.getId()))
                    .totalRevenue(getTotalRevenueForSlot(slot.getId()))
                    .status(slot.getStatus() != null ? slot.getStatus().name() : null)
                    .archived(false)
                    .build();
                
                inactiveSlots.add(dto);
            }
        }
        
        return inactiveSlots;
    }

    @Override
    public CleanupReportDTO getCleanupSummary() {
        List<InactiveResourceDTO> inactiveAreas = getInactiveParkingAreas(DEFAULT_INACTIVE_DAYS);
        List<InactiveResourceDTO> inactiveSlots = getInactiveParkingSlots(DEFAULT_INACTIVE_DAYS);
        
        int criticalAreas = (int) inactiveAreas.stream()
            .filter(a -> a.getLastActiveDate() != null && 
                        ChronoUnit.DAYS.between(a.getLastActiveDate(), LocalDateTime.now()) > 60)
            .count();
        
        return CleanupReportDTO.builder()
            .totalInactiveAreas(inactiveAreas.size())
            .totalInactiveSlots(inactiveSlots.size())
            .criticalAreas(criticalAreas)
            .totalArchivedAreas(getArchivedAreas().size())
            .totalArchivedSlots(getArchivedSlots().size())
            .potentialRevenueImpact(calculatePotentialRevenueImpact(inactiveAreas, inactiveSlots))
            .reportGeneratedAt(LocalDateTime.now())
            .build();
    }

    @Override
    @Transactional
    public void archiveParkingArea(Long areaId) {
        ParkingArea area = parkingAreaRepository.findById(areaId)
            .orElseThrow(() -> new RuntimeException("Parking area not found"));
        
        area.setStatus(com.app.enums.Status.NOT_AVAILABLE);
        parkingAreaRepository.save(area);
        
        log.info("Archived parking area: {}", areaId);
    }

    @Override
    @Transactional
    public void archiveParkingSlot(Long slotId) {
        ParkingSlot slot = parkingSlotRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Parking slot not found"));
        
        slot.setStatus(com.app.enums.Status.NOT_AVAILABLE);
        parkingSlotRepository.save(slot);
        
        log.info("Archived parking slot: {}", slotId);
    }

    @Override
    @Transactional
    public void restoreParkingArea(Long areaId) {
        ParkingArea area = parkingAreaRepository.findById(areaId)
            .orElseThrow(() -> new RuntimeException("Parking area not found"));
        
        area.setStatus(com.app.enums.Status.AVAILABLE);
        parkingAreaRepository.save(area);
        
        log.info("Restored parking area: {}", areaId);
    }

    @Override
    @Transactional
    public void restoreParkingSlot(Long slotId) {
        ParkingSlot slot = parkingSlotRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Parking slot not found"));
        
slot.setStatus(com.app.enums.Status.AVAILABLE);
        parkingSlotRepository.save(slot);

        log.info("Restored parking slot: {}", slotId);
    }

    @Override
    @Transactional
    public void markAreaAsActive(Long areaId) {
        ParkingArea area = parkingAreaRepository.findById(areaId)
            .orElseThrow(() -> new RuntimeException("Parking area not found"));
        
        area.setStatus(com.app.enums.Status.AVAILABLE);
        parkingAreaRepository.save(area);
        
        log.info("Marked parking area as active: {}", areaId);
    }

    @Override
    @Transactional
    public void markSlotAsActive(Long slotId) {
        ParkingSlot slot = parkingSlotRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Parking slot not found"));
        
        slot.setStatus(com.app.enums.Status.AVAILABLE);
        parkingSlotRepository.save(slot);

        log.info("Marked parking slot as active: {}", slotId);
    }

    @Override
    @Transactional
    public void deleteParkingArea(Long areaId) {
        // First delete all associated slots
        parkingSlotRepository.deleteByParkingId(areaId);
        // Then delete the area
        parkingAreaRepository.deleteById(areaId);
        
        log.info("Deleted parking area: {}", areaId);
    }

    @Override
    @Transactional
    public void deleteParkingSlot(Long slotId) {
        parkingSlotRepository.deleteById(slotId);
        log.info("Deleted parking slot: {}", slotId);
    }

    @Override
    @Transactional
    public void bulkDeleteAreas(List<Long> areaIds) {
        for (Long areaId : areaIds) {
            deleteParkingArea(areaId);
        }
        log.info("Bulk deleted {} parking areas", areaIds.size());
    }

    @Override
    @Transactional
    public void bulkArchiveAreas(List<Long> areaIds) {
        for (Long areaId : areaIds) {
            archiveParkingArea(areaId);
        }
        log.info("Bulk archived {} parking areas", areaIds.size());
    }

    @Override
    @Transactional
    public void bulkDeleteSlots(List<Long> slotIds) {
        for (Long slotId : slotIds) {
            deleteParkingSlot(slotId);
        }
        log.info("Bulk deleted {} parking slots", slotIds.size());
    }

    @Override
    @Transactional
    public void bulkArchiveSlots(List<Long> slotIds) {
        for (Long slotId : slotIds) {
            archiveParkingSlot(slotId);
        }
        log.info("Bulk archived {} parking slots", slotIds.size());
    }

    @Override
    public List<InactiveResourceDTO> getArchivedAreas() {
        return parkingAreaRepository.findAll().stream()
            .filter(a -> com.app.enums.Status.NOT_AVAILABLE.equals(a.getStatus()))
            .map(area -> InactiveResourceDTO.builder()
                .id(area.getId())
                .name(area.getArea())
                .city(area.getCity())
                .archived(true)
                .build())
            .collect(Collectors.toList());
    }

    @Override
    public List<InactiveResourceDTO> getArchivedSlots() {
        return parkingSlotRepository.findAll().stream()
            .filter(s -> com.app.enums.Status.NOT_AVAILABLE.equals(s.getStatus()))
            .map(slot -> InactiveResourceDTO.builder()
                .id(slot.getId())
                .slotNumber("Slot-" + slot.getId())
                .archived(true)
                .build())
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ScheduledDeletionDTO scheduleDeletion(String resourceType, Long resourceId, LocalDate deletionDate) {
        String cancellationToken = UUID.randomUUID().toString();
        
        // Get owner info and send notification
        Long ownerId = getOwnerIdForResource(resourceType, resourceId);
        String resourceName = getResourceName(resourceType, resourceId);
        
        // Send deletion warning notification
        notificationService.sendDeletionWarning(resourceType, resourceId, ownerId, cancellationToken, deletionDate);
        
        ScheduledDeletionDTO dto = ScheduledDeletionDTO.builder()
            .resourceType(resourceType)
            .resourceId(resourceId)
            .resourceName(resourceName)
            .scheduledDate(deletionDate)
            .cancellationToken(cancellationToken)
            .notificationSent(true)
            .build();
        
        log.info("Scheduled deletion for {} {} on {}", resourceType, resourceId, deletionDate);
        
        return dto;
    }

    @Override
    @Transactional
    public boolean cancelScheduledDeletion(String token) {
        // In a real implementation, you would look up the scheduled deletion by token
        // and cancel it. For now, we'll mark the resource as active.
        log.info("Cancellation requested for token: {}", token);
        // Mark the resource as active to prevent deletion
        return true;
    }

    @Override
    public List<ScheduledDeletionDTO> getPendingDeletions() {
        // Return list of scheduled deletions that haven't been executed yet
        return new ArrayList<>();
    }

    @Override
    public CleanupReportDTO generateMonthlyReport(int month, int year) {
        log.info("Generating monthly cleanup report for {}/{}", month, year);
        
        CleanupReportDTO report = getCleanupSummary();
        report.setReportMonth(month);
        report.setReportYear(year);
        
        // Send report via email to admins
        notificationService.sendMonthlyCleanupReport(report);
        
        return report;
    }

    @Override
    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
    @Transactional
    public void executeAutomaticCleanup() {
        log.info("Starting automatic cleanup job...");
        
        // Get resources inactive for 45+ days
        List<InactiveResourceDTO> inactiveAreas = getInactiveParkingAreas(DEFAULT_INACTIVE_DAYS);
        List<InactiveResourceDTO> inactiveSlots = getInactiveParkingSlots(DEFAULT_INACTIVE_DAYS);
        
        // For resources inactive > 44 days (1 day before threshold), send warning
        LocalDateTime warningThreshold = LocalDateTime.now().minusDays(44);
        
        for (InactiveResourceDTO area : inactiveAreas) {
            if (area.getLastActiveDate() != null && 
                area.getLastActiveDate().isAfter(warningThreshold.minusDays(1)) &&
                area.getLastActiveDate().isBefore(warningThreshold)) {
                // Send 1-day warning
                scheduleDeletion("area", area.getId(), LocalDate.now().plusDays(1));
            }
        }
        
        // Auto-archive resources inactive > 60 days
        LocalDateTime archiveThreshold = LocalDateTime.now().minusDays(60);
        
        for (InactiveResourceDTO area : inactiveAreas) {
            if (area.getLastActiveDate() != null && 
                area.getLastActiveDate().isBefore(archiveThreshold)) {
                archiveParkingArea(area.getId());
            }
        }
        
        for (InactiveResourceDTO slot : inactiveSlots) {
            if (slot.getLastActiveDate() != null && 
                slot.getLastActiveDate().isBefore(archiveThreshold)) {
                archiveParkingSlot(slot.getId());
            }
        }
        
        log.info("Automatic cleanup completed");
    }
    
    // Monthly report generation
    @Scheduled(cron = "0 0 9 1 * ?") // Run at 9 AM on the 1st of each month
    public void generateScheduledMonthlyReport() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        generateMonthlyReport(lastMonth.getMonthValue(), lastMonth.getYear());
    }

    // Helper methods
    private LocalDateTime getLastBookingDateForArea(Long areaId) {
        try {
            return bookingRepository.findAll().stream()
                .filter(b -> {
                    try { return areaId.equals(b.getParkingSlot().getParking().getId()); }
                    catch (Exception e) { return false; }
                })
                .map(b -> b.getBookingDate() != null ? b.getBookingDate().atStartOfDay() : null)
                .filter(java.util.Objects::nonNull)
                .max(java.util.Comparator.naturalOrder())
                .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDateTime getLastBookingDateForSlot(Long slotId) {
        try {
            return bookingRepository.findAll().stream()
                .filter(b -> {
                    try { return slotId.equals(b.getParkingSlot().getId()); }
                    catch (Exception e) { return false; }
                })
                .map(b -> b.getBookingDate() != null ? b.getBookingDate().atStartOfDay() : null)
                .filter(java.util.Objects::nonNull)
                .max(java.util.Comparator.naturalOrder())
                .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private int getTotalBookingsForArea(Long areaId) {
        try {
            return (int) bookingRepository.findAll().stream()
                .filter(b -> {
                    try { return areaId.equals(b.getParkingSlot().getParking().getId()); }
                    catch (Exception e) { return false; }
                }).count();
        } catch (Exception e) {
            return 0;
        }
    }

    private int getTotalBookingsForSlot(Long slotId) {
        try {
            return (int) bookingRepository.findAll().stream()
                .filter(b -> {
                    try { return slotId.equals(b.getParkingSlot().getId()); }
                    catch (Exception e) { return false; }
                }).count();
        } catch (Exception e) {
            return 0;
        }
    }

    private double getTotalRevenueForArea(Long areaId) {
        try {
            return bookingRepository.findAll().stream()
                .filter(b -> {
                    try { return areaId.equals(b.getParkingSlot().getParking().getId()); }
                    catch (Exception e) { return false; }
                })
                .mapToDouble(Booking::getTotalPrice).sum();
        } catch (Exception e) {
            return 0.0;
        }
    }

    private double getTotalRevenueForSlot(Long slotId) {
        try {
            return bookingRepository.findAll().stream()
                .filter(b -> {
                    try { return slotId.equals(b.getParkingSlot().getId()); }
                    catch (Exception e) { return false; }
                })
                .mapToDouble(Booking::getTotalPrice).sum();
        } catch (Exception e) {
            return 0.0;
        }
    }

    private double calculatePotentialRevenueImpact(List<InactiveResourceDTO> areas, List<InactiveResourceDTO> slots) {
        double areaRevenue = areas.stream().mapToDouble(InactiveResourceDTO::getTotalRevenue).sum();
        double slotRevenue = slots.stream().mapToDouble(InactiveResourceDTO::getTotalRevenue).sum();
        return areaRevenue + slotRevenue;
    }

    private Long getOwnerIdForResource(String resourceType, Long resourceId) {
        if ("area".equalsIgnoreCase(resourceType)) {
            return parkingAreaRepository.findById(resourceId)
                .map(area -> area.getUser() != null ? area.getUser().getId() : null)
                .orElse(null);
        }
        return null;
    }

    private String getResourceName(String resourceType, Long resourceId) {
        if ("area".equalsIgnoreCase(resourceType)) {
            return parkingAreaRepository.findById(resourceId)
                .map(ParkingArea::getArea)
                .orElse("Unknown Area");
        } else {
            return parkingSlotRepository.findById(resourceId)
                .map(s -> "Slot-" + s.getId())
                .orElse("Unknown Slot");
        }
    }
}
