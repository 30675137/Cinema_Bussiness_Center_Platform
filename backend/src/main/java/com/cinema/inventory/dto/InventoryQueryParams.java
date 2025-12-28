package com.cinema.inventory.dto;

import com.cinema.inventory.domain.InventoryStatus;

import java.util.List;
import java.util.UUID;

/**
 * 库存查询参数 DTO
 * 支持分页、搜索和多维筛选。
 * 
 * @since P003-inventory-query
 */
public class InventoryQueryParams {

    /** 门店ID - 筛选指定门店的库存 */
    private UUID storeId;

    /** 搜索关键词 - 匹配 SKU 名称或编码 */
    private String keyword;

    /** 分类ID - 筛选指定分类的 SKU */
    private UUID categoryId;

    /** 库存状态列表 - 支持多选筛选 */
    private List<InventoryStatus> statuses;

    /** 页码 - 从1开始，默认1 */
    private Integer page = 1;

    /** 每页条数 - 默认20，最大100 */
    private Integer pageSize = 20;

    // Getters and Setters
    public UUID getStoreId() {
        return storeId;
    }

    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }

    public List<InventoryStatus> getStatuses() {
        return statuses;
    }

    public void setStatuses(List<InventoryStatus> statuses) {
        this.statuses = statuses;
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

    /**
     * 构建查询参数的Builder
     */
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final InventoryQueryParams params = new InventoryQueryParams();

        public Builder storeId(UUID storeId) {
            params.setStoreId(storeId);
            return this;
        }

        public Builder keyword(String keyword) {
            params.setKeyword(keyword);
            return this;
        }

        public Builder categoryId(UUID categoryId) {
            params.setCategoryId(categoryId);
            return this;
        }

        public Builder statuses(List<InventoryStatus> statuses) {
            params.setStatuses(statuses);
            return this;
        }

        public Builder page(Integer page) {
            params.setPage(page);
            return this;
        }

        public Builder pageSize(Integer pageSize) {
            params.setPageSize(pageSize);
            return this;
        }

        public InventoryQueryParams build() {
            return params;
        }
    }
}
