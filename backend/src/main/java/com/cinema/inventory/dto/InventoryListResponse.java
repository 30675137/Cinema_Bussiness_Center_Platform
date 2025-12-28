package com.cinema.inventory.dto;

import java.util.List;

/**
 * 库存列表响应 DTO - 包含分页信息
 * 符合统一响应格式规范。
 * 
 * @since P003-inventory-query
 */
public class InventoryListResponse {

    /** 是否成功 */
    private boolean success = true;

    /** 库存列表数据 */
    private List<StoreInventoryItemDto> data;

    /** 总记录数 */
    private long total;

    /** 当前页码 */
    private int page;

    /** 每页条数 */
    private int pageSize;

    /** 提示信息 */
    private String message;

    public InventoryListResponse() {
    }

    public InventoryListResponse(List<StoreInventoryItemDto> data, long total, int page, int pageSize) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }

    public static InventoryListResponse of(List<StoreInventoryItemDto> data, long total, int page, int pageSize) {
        return new InventoryListResponse(data, total, page, pageSize);
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<StoreInventoryItemDto> getData() {
        return data;
    }

    public void setData(List<StoreInventoryItemDto> data) {
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
}
