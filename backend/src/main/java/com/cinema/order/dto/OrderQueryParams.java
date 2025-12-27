/**
 * @spec O001-product-order-list
 * 订单查询参数 DTO
 */
package com.cinema.order.dto;

import com.cinema.order.domain.OrderStatus;

/**
 * 订单查询参数 DTO
 *
 * 用于订单列表筛选和分页查询
 */
public class OrderQueryParams {
    private Integer page = 1;
    private Integer pageSize = 20;
    private OrderStatus status;
    private String startDate;
    private String endDate;
    private String search;
    private String sortBy = "createdAt";
    private String sortOrder = "desc";

    public OrderQueryParams() {
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(String sortOrder) {
        this.sortOrder = sortOrder;
    }
}
