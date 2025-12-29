package com.cinema.reservation.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 时段库存快照实体
 * <p>
 * 记录预约创建时的时段库存状态，用于异常核对和审计。
 * 每个预约单对应一个库存快照。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@Entity
@Table(name = "slot_inventory_snapshots")
public class SlotInventorySnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * 关联的预约单（一对一关系）
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_order_id", nullable = false, unique = true)
    private ReservationOrder reservationOrder;

    /**
     * 时段模板ID
     */
    @NotNull(message = "时段模板ID不能为空")
    @Column(name = "time_slot_template_id", nullable = false)
    private UUID timeSlotTemplateId;

    /**
     * 预订日期
     */
    @NotNull(message = "预订日期不能为空")
    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    /**
     * 总容量
     */
    @NotNull(message = "总容量不能为空")
    @Min(value = 1, message = "总容量必须大于0")
    @Column(name = "total_capacity", nullable = false)
    private Integer totalCapacity;

    /**
     * 已预订数量
     */
    @NotNull(message = "已预订数量不能为空")
    @Min(value = 0, message = "已预订数量不能为负数")
    @Column(name = "booked_count", nullable = false)
    private Integer bookedCount;

    /**
     * 剩余容量
     */
    @NotNull(message = "剩余容量不能为空")
    @Column(name = "remaining_capacity", nullable = false)
    private Integer remainingCapacity;

    /**
     * 快照时间
     */
    @Column(name = "snapshot_time", nullable = false)
    private Instant snapshotTime;

    // Lifecycle callbacks

    @PrePersist
    protected void onCreate() {
        if (this.snapshotTime == null) {
            this.snapshotTime = Instant.now();
        }
        // 自动计算剩余容量
        if (this.remainingCapacity == null && this.totalCapacity != null && this.bookedCount != null) {
            this.remainingCapacity = this.totalCapacity - this.bookedCount;
        }
    }

    // Static factory method

    /**
     * 创建库存快照
     */
    public static SlotInventorySnapshot create(
            UUID timeSlotTemplateId,
            LocalDate reservationDate,
            int totalCapacity,
            int bookedCount) {
        SlotInventorySnapshot snapshot = new SlotInventorySnapshot();
        snapshot.setTimeSlotTemplateId(timeSlotTemplateId);
        snapshot.setReservationDate(reservationDate);
        snapshot.setTotalCapacity(totalCapacity);
        snapshot.setBookedCount(bookedCount);
        snapshot.setRemainingCapacity(totalCapacity - bookedCount);
        snapshot.setSnapshotTime(Instant.now());
        return snapshot;
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ReservationOrder getReservationOrder() {
        return reservationOrder;
    }

    public void setReservationOrder(ReservationOrder reservationOrder) {
        this.reservationOrder = reservationOrder;
    }

    public UUID getTimeSlotTemplateId() {
        return timeSlotTemplateId;
    }

    public void setTimeSlotTemplateId(UUID timeSlotTemplateId) {
        this.timeSlotTemplateId = timeSlotTemplateId;
    }

    public LocalDate getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDate reservationDate) {
        this.reservationDate = reservationDate;
    }

    public Integer getTotalCapacity() {
        return totalCapacity;
    }

    public void setTotalCapacity(Integer totalCapacity) {
        this.totalCapacity = totalCapacity;
    }

    public Integer getBookedCount() {
        return bookedCount;
    }

    public void setBookedCount(Integer bookedCount) {
        this.bookedCount = bookedCount;
    }

    public Integer getRemainingCapacity() {
        return remainingCapacity;
    }

    public void setRemainingCapacity(Integer remainingCapacity) {
        this.remainingCapacity = remainingCapacity;
    }

    public Instant getSnapshotTime() {
        return snapshotTime;
    }

    public void setSnapshotTime(Instant snapshotTime) {
        this.snapshotTime = snapshotTime;
    }

    @Override
    public String toString() {
        return "SlotInventorySnapshot{" +
                "id=" + id +
                ", timeSlotTemplateId=" + timeSlotTemplateId +
                ", reservationDate=" + reservationDate +
                ", totalCapacity=" + totalCapacity +
                ", bookedCount=" + bookedCount +
                ", remainingCapacity=" + remainingCapacity +
                '}';
    }
}
