/**
 * @spec O001-product-order-list
 * 订单列表响应 DTO
 */
package com.cinema.order.dto;

import java.time.Instant;
import java.util.List;

/**
 * 订单列表响应 DTO
 *
 * 包含分页信息的订单列表响应
 */
public class OrderListResponse {
    private boolean success = true;
    private List<ProductOrderDTO> data;
    private long total;
    private int page;
    private int pageSize;
    private String message;
    private String timestamp;

    public OrderListResponse() {
        this.timestamp = Instant.now().toString();
    }

    public OrderListResponse(List<ProductOrderDTO> data, long total, int page, int pageSize) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
        this.timestamp = Instant.now().toString();
    }

    public static OrderListResponse success(List<ProductOrderDTO> data, long total, int page, int pageSize) {
        return new OrderListResponse(data, total, page, pageSize);
    }

    public static OrderListResponse success(List<ProductOrderDTO> data, long total, int page, int pageSize, String message) {
        OrderListResponse response = new OrderListResponse(data, total, page, pageSize);
        response.setMessage(message);
        return response;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<ProductOrderDTO> getData() {
        return data;
    }

    public void setData(List<ProductOrderDTO> data) {
        this.data = data;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
