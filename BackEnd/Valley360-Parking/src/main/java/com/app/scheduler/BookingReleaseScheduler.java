package com.app.scheduler;

import com.app.entities.Booking;
import com.app.entities.ParkingSlot;
import com.app.enums.BookingStatus;
import com.app.enums.Status;
import com.app.repository.BookingRepository;
import com.app.repository.ParkingSlotRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Scheduler that automatically releases parking slots when booking end time passes.
 * Runs every minute to check for expired bookings.
 */
@Slf4j
@Component
public class BookingReleaseScheduler {

    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    public BookingReleaseScheduler(BookingRepository bookingRepository,
                                   ParkingSlotRepository parkingSlotRepository) {
        this.bookingRepository = bookingRepository;
        this.parkingSlotRepository = parkingSlotRepository;
    }

    /**
     * Runs every minute. Finds all bookings whose end time has passed and whose status
     * is still RESERVED or ACTIVE, then marks them COMPLETED and frees the slot.
     */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void releaseExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();

        List<Booking> expired = bookingRepository.findExpiredActiveBookings(
                Arrays.asList(BookingStatus.RESERVED, BookingStatus.ACTIVE),
                now);

        if (expired.isEmpty()) {
            return;
        }

        log.info("BookingReleaseScheduler: releasing {} expired booking(s)", expired.size());

        for (Booking booking : expired) {
            try {
                // Mark booking as COMPLETED
                booking.setStatus(BookingStatus.COMPLETED);
                bookingRepository.save(booking);

                // Free the parking slot
                ParkingSlot slot = booking.getParkingSlot();
                if (slot != null) {
                    slot.setStatus(Status.AVAILABLE);
                    parkingSlotRepository.save(slot);
                    log.debug("Slot {} released for booking {}", slot.getId(), booking.getId());
                }
            } catch (Exception e) {
                log.error("Error releasing booking {}: {}", booking.getId(), e.getMessage());
            }
        }
    }
}
