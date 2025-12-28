package com.cinema.common.dto;

import java.time.Instant;
import java.util.List;

/**
 * @spec O003-beverage-order
 * 列表响应包装类
 */
public class ListResponse<T> {
    private boolean success;
    private List<T> data;
    private long total;
    private int page;
    private int pageSize;
    private String message;

    public ListResponse(boolean success, List<T> data, long total, int page, int pageSize, String message) {
        this.success = success;
        this.data = data;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
        this.message = message;
    }

    public static <T> ListResponse<T> success(List<T> data, long total, int page, int pageSize) {
        return new ListResponse<>(true, data, total, page, pageSize, "");
    }

    public static <T> ListResponse<T> success(List<T> data, long total) {
        return new ListResponse<>(true, data, total, 0, (int)total, "");
    }

    public static <T> ListResponse<T> failure(String message) {
        return new ListResponse<>(false, null, 0, 0, 0, message);
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public List<T> getData() { return data; }
    public long getTotal() { return total; }
    public int getPage() { return page; }
    public int getPageSize() { return pageSize; }
    public String getMessage() { return message; }

    public void setSuccess(boolean success) { this.success = success; }
    public void setData(List<T> data) { this.data = data; }
    public void setTotal(long total) { this.total = total; }
    public void setPage(int page) { this.page = page; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
    public void setMessage(String message) { this.message = message; }
}
