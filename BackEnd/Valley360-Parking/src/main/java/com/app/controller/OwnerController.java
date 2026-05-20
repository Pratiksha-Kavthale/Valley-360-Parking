package com.app.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.BookingDTO;
import com.app.dto.OwnerPaymentConfigDTO;
import com.app.dto.OwnerPaymentConfigRequestDTO;
import com.app.dto.OwnerSlotTimelineDTO;
import com.app.dto.ParkingAreaDTO;
import com.app.dto.ParkingSlotDTO;
import com.app.service.BookingPaymentService;
import com.app.service.OwnerPaymentConfigService;
import com.app.service.OwnerViewService;

@RestController
@RequestMapping("/owner")
@CrossOrigin(origins = "*")
public class OwnerController {

    @Autowired
    private OwnerViewService ownerViewService;

    @Autowired
    private OwnerPaymentConfigService ownerPaymentConfigService;

    @Autowired
    private BookingPaymentService bookingPaymentService;

    @GetMapping("/parking-areas")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<ParkingAreaDTO>> getOwnerParkingAreas() {
        return ResponseEntity.ok(ownerViewService.getOwnerParkingAreas());
    }

    @GetMapping("/parking-area/{areaId}/slots")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<ParkingSlotDTO>> getOwnerAreaSlots(@PathVariable Long areaId) {
        return ResponseEntity.ok(ownerViewService.getOwnerParkingAreaSlots(areaId));
    }

    @GetMapping("/slot/{slotId}/timeline")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<OwnerSlotTimelineDTO>> getOwnerSlotTimeline(@PathVariable Long slotId) {
        return ResponseEntity.ok(ownerViewService.getOwnerSlotTimeline(slotId));
    }

    @GetMapping("/payment-settings")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<OwnerPaymentConfigDTO> getPaymentSettings() {
        return ResponseEntity.ok(ownerPaymentConfigService.getMyPaymentConfig());
    }

    @PutMapping("/payment-settings")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<OwnerPaymentConfigDTO> updatePaymentSettings(
            @Valid @RequestBody OwnerPaymentConfigRequestDTO request) {
        return ResponseEntity.ok(ownerPaymentConfigService.updateMyPaymentConfig(request));
    }

    @GetMapping("/payment-review-queue")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<BookingDTO>> getPaymentReviewQueue() {
        return ResponseEntity.ok(bookingPaymentService.getOwnerPaymentQueue());
    }
}
