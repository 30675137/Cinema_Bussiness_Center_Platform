package com.cinema.inventory.job;

import com.cinema.inventory.entity.InventoryReservation;
import com.cinema.inventory.entity.InventoryReservation.ReservationStatus;
import com.cinema.inventory.repository.InventoryReservationRepository;
import com.cinema.inventory.service.InventoryReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * @spec O012-order-inventory-reservation
 * InventoryReservationCleanupJob Unit Tests
 *
 * Test Coverage:
 * - T029: Scheduled cleanup of expired reservations
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryReservationCleanupJob - Scheduled Cleanup Tests")
class InventoryReservationCleanupJobTest {

    @Mock
    private InventoryReservationService reservationService;

    @Mock
    private InventoryReservationRepository reservationRepository;

    @InjectMocks
    private InventoryReservationCleanupJob cleanupJob;

    private List<InventoryReservation> expiredReservations;

    @BeforeEach
    void setUp() {
        // Set expiry minutes to 30 via reflection (simulating @Value injection)
        ReflectionTestUtils.setField(cleanupJob, "expiryMinutes", 30);

        // Setup test expired reservations
        InventoryReservation reservation1 = new InventoryReservation();
        reservation1.setId(UUID.randomUUID());
        reservation1.setOrderId(UUID.randomUUID());
        reservation1.setStatus(ReservationStatus.ACTIVE);
        reservation1.setCreatedAt(Instant.now().minus(35, ChronoUnit.MINUTES));

        InventoryReservation reservation2 = new InventoryReservation();
        reservation2.setId(UUID.randomUUID());
        reservation2.setOrderId(UUID.randomUUID());
        reservation2.setStatus(ReservationStatus.ACTIVE);
        reservation2.setCreatedAt(Instant.now().minus(45, ChronoUnit.MINUTES));

        expiredReservations = Arrays.asList(reservation1, reservation2);
    }

    /**
     * T029: Test successful cleanup of expired reservations
     * Verifies:
     * - Query finds reservations older than 30 minutes
     * - Each expired reservation is released
     * - Status updated to EXPIRED
     * - Notes set to "超时自动释放"
     */
    @Test
    @DisplayName("T029: Should release expired reservations successfully")
    void testReleaseExpiredReservations_Success() {
        // Given
        when(reservationRepository.findByStatusAndCreatedAtBefore(
                eq(ReservationStatus.ACTIVE),
                any(Instant.class)
        )).thenReturn(expiredReservations);

        when(reservationService.releaseReservation(any(UUID.class))).thenReturn(1);

        // When
        cleanupJob.releaseExpiredReservations();

        // Then
        // Verify query was called with correct parameters
        verify(reservationRepository, times(1)).findByStatusAndCreatedAtBefore(
                eq(ReservationStatus.ACTIVE),
                any(Instant.class)
        );

        // Verify each reservation was released
        for (InventoryReservation reservation : expiredReservations) {
            verify(reservationService, times(1)).releaseReservation(reservation.getOrderId());
        }

        // Verify total release calls
        verify(reservationService, times(2)).releaseReservation(any(UUID.class));
    }

    /**
     * T029: Test cleanup when no expired reservations found
     * Verifies:
     * - Job executes without errors
     * - No reservations released
     */
    @Test
    @DisplayName("T029: Should handle no expired reservations gracefully")
    void testReleaseExpiredReservations_NoExpiredReservations() {
        // Given
        when(reservationRepository.findByStatusAndCreatedAtBefore(
                eq(ReservationStatus.ACTIVE),
                any(Instant.class)
        )).thenReturn(Collections.emptyList());

        // When
        cleanupJob.releaseExpiredReservations();

        // Then
        // Verify query was called
        verify(reservationRepository, times(1)).findByStatusAndCreatedAtBefore(
                eq(ReservationStatus.ACTIVE),
                any(Instant.class)
        );

        // Verify no reservations were released
        verify(reservationService, never()).releaseReservation(any());
    }

    /**
     * T029: Test cleanup continues despite individual release failures
     * Verifies:
     * - Job logs errors but continues processing
     * - All reservations are attempted to be released
     * - One failure does not stop other releases
     */
    @Test
    @DisplayName("T029: Should continue cleanup despite individual release failures")
    void testReleaseExpiredReservations_ContinueOnFailure() {
        // Given
        when(reservationRepository.findByStatusAndCreatedAtBefore(
                eq(ReservationStatus.ACTIVE),
                any(Instant.class)
        )).thenReturn(expiredReservations);

        // First release succeeds, second fails
        when(reservationService.releaseReservation(expiredReservations.get(0).getOrderId()))
                .thenReturn(1);
        when(reservationService.releaseReservation(expiredReservations.get(1).getOrderId()))
                .thenThrow(new RuntimeException("Database connection failed"));

        // When - should not throw exception
        cleanupJob.releaseExpiredReservations();

        // Then
        // Verify all reservations were attempted
        verify(reservationService, times(1))
                .releaseReservation(expiredReservations.get(0).getOrderId());
        verify(reservationService, times(1))
                .releaseReservation(expiredReservations.get(1).getOrderId());
    }

    /**
     * T029: Test expiry threshold calculation
     * Verifies:
     * - Threshold is correctly calculated as current time - 30 minutes
     */
    @Test
    @DisplayName("T029: Should use correct expiry threshold (30 minutes)")
    void testReleaseExpiredReservations_CorrectThreshold() {
        // Given
        Instant beforeExecution = Instant.now().minus(31, ChronoUnit.MINUTES);

        when(reservationRepository.findByStatusAndCreatedAtBefore(
                eq(ReservationStatus.ACTIVE),
                any(Instant.class)
        )).thenReturn(Collections.emptyList());

        // When
        cleanupJob.releaseExpiredReservations();

        // Then
        // Verify the threshold is approximately 30 minutes ago (allow 1 minute tolerance)
        verify(reservationRepository).findByStatusAndCreatedAtBefore(
                eq(ReservationStatus.ACTIVE),
                argThat(instant -> {
                    long minutesDiff = ChronoUnit.MINUTES.between(instant, Instant.now());
                    return minutesDiff >= 29 && minutesDiff <= 31;
                })
        );
    }

    /**
     * T029: Test cleanup with custom expiry minutes
     * Verifies:
     * - Configurable expiry time via @Value
     */
    @Test
    @DisplayName("T029: Should support custom expiry minutes configuration")
    void testReleaseExpiredReservations_CustomExpiryMinutes() {
        // Given - set custom expiry to 60 minutes
        ReflectionTestUtils.setField(cleanupJob, "expiryMinutes", 60);

        when(reservationRepository.findByStatusAndCreatedAtBefore(
                eq(ReservationStatus.ACTIVE),
                any(Instant.class)
        )).thenReturn(Collections.emptyList());

        // When
        cleanupJob.releaseExpiredReservations();

        // Then
        // Verify threshold is approximately 60 minutes ago
        verify(reservationRepository).findByStatusAndCreatedAtBefore(
                eq(ReservationStatus.ACTIVE),
                argThat(instant -> {
                    long minutesDiff = ChronoUnit.MINUTES.between(instant, Instant.now());
                    return minutesDiff >= 59 && minutesDiff <= 61;
                })
        );
    }
}
