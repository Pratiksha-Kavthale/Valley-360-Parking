package com.app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.dto.OwnerSlotTimelineDTO;
import com.app.dto.ParkingAreaDTO;
import com.app.dto.ParkingSlotDTO;
import com.app.entities.Booking;
import com.app.entities.ParkingArea;
import com.app.entities.ParkingSlot;
import com.app.entities.User;
import com.app.enums.RoleEnum;
import com.app.exception.ParkingNotFoundException;
import com.app.exception.UserNotFoundException;
import com.app.repository.BookingRepository;
import com.app.repository.ParkingAreaRepository;
import com.app.repository.ParkingSlotRepository;
import com.app.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class OwnerViewServiceImpl implements OwnerViewService {

    @Autowired
    private ParkingAreaRepository parkingAreaRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<ParkingAreaDTO> getOwnerParkingAreas() {
        User owner = getAuthenticatedOwner();
        return parkingAreaRepository.findByUserId(owner.getId())
                .stream()
                .map(this::toParkingAreaDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ParkingSlotDTO> getOwnerParkingAreaSlots(Long areaId) {
        User owner = getAuthenticatedOwner();
        ParkingArea area = parkingAreaRepository.findById(areaId)
                .orElseThrow(() -> new ParkingNotFoundException("Parking area not found."));

        if (area.getUser() == null || !area.getUser().getId().equals(owner.getId())) {
            throw new SecurityException("Access denied for another owner's data.");
        }

        return area.getParkingSlots().stream()
                .map(this::toParkingSlotDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OwnerSlotTimelineDTO> getOwnerSlotTimeline(Long slotId) {
        User owner = getAuthenticatedOwner();
        ParkingSlot slot = parkingSlotRepository.findById(slotId)
                .orElseThrow(() -> new ParkingNotFoundException("Parking slot not found."));

        if (slot.getParking() == null || slot.getParking().getUser() == null
                || !slot.getParking().getUser().getId().equals(owner.getId())) {
            throw new SecurityException("Access denied for another owner's data.");
        }

        List<Booking> bookings = bookingRepository.findTimelineBySlotId(slotId);
        return bookings.stream()
                .map(this::toTimelineDTO)
                .collect(Collectors.toList());
    }

    private OwnerSlotTimelineDTO toTimelineDTO(Booking booking) {
        OwnerSlotTimelineDTO dto = new OwnerSlotTimelineDTO();
        dto.setBookingId(booking.getId());
        dto.setUserName(resolveUserName(booking));

        LocalDateTime start = booking.getStartTime() != null ? booking.getStartTime() : booking.getArrivalDate();
        LocalDateTime end = booking.getEndTime() != null ? booking.getEndTime() : booking.getDepartureDate();

        dto.setStartTime(start);
        dto.setEndTime(end);
        dto.setStatus(computeTimelineStatus(start, end));
        return dto;
    }

    private String resolveUserName(Booking booking) {
        if (booking.getUser() == null) {
            return "Unknown User";
        }

        String first = booking.getUser().getFirstName() != null ? booking.getUser().getFirstName().trim() : "";
        String last = booking.getUser().getLastName() != null ? booking.getUser().getLastName().trim() : "";
        String fullName = (first + " " + last).trim();
        if (!fullName.isEmpty()) {
            return fullName;
        }

        return booking.getUser().getEmail() != null ? booking.getUser().getEmail() : "Unknown User";
    }

    private String computeTimelineStatus(LocalDateTime start, LocalDateTime end) {
        LocalDateTime now = LocalDateTime.now();
        if (start != null && now.isBefore(start)) {
            return "RESERVED";
        }
        if (start != null && end != null && (now.isEqual(start) || now.isAfter(start))
                && (now.isEqual(end) || now.isBefore(end))) {
            return "ACTIVE";
        }
        if (end != null && now.isAfter(end)) {
            return "COMPLETED";
        }
        return "ACTIVE";
    }

    private ParkingAreaDTO toParkingAreaDTO(ParkingArea area) {
        ParkingAreaDTO dto = new ParkingAreaDTO();
        dto.setId(area.getId());
        dto.setArea(area.getArea());
        dto.setCity(area.getCity());
        dto.setPincode(area.getPincode());
        dto.setLatitude(area.getLatitude());
        dto.setLongitude(area.getLongitude());
        dto.setStatus(area.getStatus());
        dto.setOwnerId(area.getUser() != null ? area.getUser().getId() : null);
        dto.setAvgRating(area.getAvgRating());
        dto.setTotalReviews(area.getTotalReviews());
        
        // Calculate slot stats
        Set<ParkingSlot> slots = area.getParkingSlots();
        if (slots != null && !slots.isEmpty()) {
            dto.setTotalSlots(slots.size());
            long availableCount = slots.stream()
                .filter(slot -> slot.getStatus() == com.app.enums.Status.AVAILABLE)
                .count();
            dto.setAvailableSlots((int) availableCount);
            
            // Calculate price range
            double minPrice = slots.stream()
                .mapToDouble(ParkingSlot::getPrice)
                .min()
                .orElse(0);
            double maxPrice = slots.stream()
                .mapToDouble(ParkingSlot::getPrice)
                .max()
                .orElse(0);
            dto.setPriceMin(minPrice);
            dto.setPriceMax(maxPrice);
        } else {
            dto.setTotalSlots(0);
            dto.setAvailableSlots(0);
            dto.setPriceMin(0.0);
            dto.setPriceMax(0.0);
        }
        
        return dto;
    }

    private ParkingSlotDTO toParkingSlotDTO(ParkingSlot slot) {
        ParkingSlotDTO dto = new ParkingSlotDTO();
        dto.setId(slot.getId());
        dto.setVehicleType(slot.getVehicleType());
        dto.setStatus(slot.getStatus());
        dto.setPrice(slot.getPrice());
        dto.setParkingId(slot.getParking() != null ? slot.getParking().getId() : null);
        return dto;
    }

    private User getAuthenticatedOwner() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Authentication required.");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("Authenticated user not found."));

        boolean ownerRole = user.getUserRoles() != null
                && user.getUserRoles().stream().anyMatch(role -> RoleEnum.ROLE_OWNER.equals(role.getRoleName()));
        if (!ownerRole) {
            throw new SecurityException("Owner access required.");
        }

        return user;
    }
}
