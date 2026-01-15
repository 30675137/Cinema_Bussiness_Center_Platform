package com.cinema.reservation.dto;

import com.cinema.reservation.domain.enums.ReservationStatus;

import java.util.List;
import java.util.UUID;

/**
 * 预约单列表查询请求 DTO (B端)
 * <p>
 * 用于 B 端运营平台预约单列表查询时的筛选条件。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class ReservationListQueryRequest {

    /**
     * 预约单号 (模糊搜索)
     */
    private String orderNumber;

    /**
     * 联系人手机号
     */
    private String contactPhone;

    /**
     * 状态列表 (多选筛选)
     */
    private List<ReservationStatus> statuses;

    /**
     * 场景包ID
     */
    private UUID scenarioPackageId;

    /**
     * 预订日期 - 开始 (格式: yyyy-MM-dd)
     */
    private String reservationDateStart;

    /**
     * 预订日期 - 结束 (格式: yyyy-MM-dd)
     */
    private String reservationDateEnd;

    /**
     * 创建日期 - 开始 (格式: yyyy-MM-dd)
     */
    private String createdAtStart;

    /**
     * 创建日期 - 结束 (格式: yyyy-MM-dd)
     */
    private String createdAtEnd;

    /**
     * 页码 (从0开始)
     */
    private Integer page = 0;

    /**
     * 每页条数
     */
    private Integer size = 20;

    /**
     * 排序字段
     */
    private String sortBy = "createdAt";

    /**
     * 排序方向 (asc/desc)
     */
    private String sortDirection = "desc";

    // Getters and Setters

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public List<ReservationStatus> getStatuses() {
        return statuses;
    }

    public void setStatuses(List<ReservationStatus> statuses) {
        this.statuses = statuses;
    }

    public UUID getScenarioPackageId() {
        return scenarioPackageId;
    }

    public void setScenarioPackageId(UUID scenarioPackageId) {
        this.scenarioPackageId = scenarioPackageId;
    }

    public String getReservationDateStart() {
        return reservationDateStart;
    }

    public void setReservationDateStart(String reservationDateStart) {
        this.reservationDateStart = reservationDateStart;
    }

    public String getReservationDateEnd() {
        return reservationDateEnd;
    }

    public void setReservationDateEnd(String reservationDateEnd) {
        this.reservationDateEnd = reservationDateEnd;
    }

    public String getCreatedAtStart() {
        return createdAtStart;
    }

    public void setCreatedAtStart(String createdAtStart) {
        this.createdAtStart = createdAtStart;
    }

    public String getCreatedAtEnd() {
        return createdAtEnd;
    }

    public void setCreatedAtEnd(String createdAtEnd) {
        this.createdAtEnd = createdAtEnd;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }
}
