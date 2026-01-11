/**
 * @spec N001-purchase-inbound
 * @spec N004-procurement-material-selector
 * 创建采购订单请求DTO
 */
package com.cinema.procurement.dto;

import com.cinema.procurement.entity.ItemType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class CreatePurchaseOrderRequest {

    @NotNull(message = "供应商ID不能为空")
    private UUID supplierId;

    @NotNull(message = "门店ID不能为空")
    private UUID storeId;

    private LocalDate plannedArrivalDate;

    @Size(max = 500, message = "备注最多500字符")
    private String remarks;

    @NotEmpty(message = "订单明细不能为空")
    @Valid
    private List<ItemRequest> items;

    public CreatePurchaseOrderRequest() {}

    // Getters and Setters

    public UUID getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(UUID supplierId) {
        this.supplierId = supplierId;
    }

    public UUID getStoreId() {
        return storeId;
    }

    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    public LocalDate getPlannedArrivalDate() {
        return plannedArrivalDate;
    }

    public void setPlannedArrivalDate(LocalDate plannedArrivalDate) {
        this.plannedArrivalDate = plannedArrivalDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public List<ItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ItemRequest> items) {
        this.items = items;
    }

    // Inner class for item request
    public static class ItemRequest {

        /**
         * N004: Item type (MATERIAL or SKU)
         * Required field - determines which ID to use
         */
        @NotNull(message = "物品类型不能为空")
        private ItemType itemType;

        /**
         * N004: Material ID (required if itemType = MATERIAL)
         */
        private UUID materialId;

        /**
         * SKU ID (required if itemType = SKU)
         * N004: Changed from @NotNull to nullable
         */
        private UUID skuId;

        @NotNull(message = "数量不能为空")
        @Positive(message = "数量必须大于0")
        private BigDecimal quantity;

        @NotNull(message = "单价不能为空")
        @Positive(message = "单价必须大于0")
        private BigDecimal unitPrice;

        public ItemRequest() {}

        /**
         * N004: Validate item type and ID consistency
         * MATERIAL items must have materialId, SKU items must have skuId
         */
        @AssertTrue(message = "物品类型与ID不匹配: MATERIAL项目必须有materialId, SKU项目必须有skuId")
        public boolean isValidItemTypeAndId() {
            if (itemType == null) {
                return false;
            }
            if (itemType == ItemType.MATERIAL) {
                return materialId != null && skuId == null;
            } else if (itemType == ItemType.SKU) {
                return skuId != null && materialId == null;
            }
            return false;
        }

        // Getters and Setters

        public ItemType getItemType() {
            return itemType;
        }

        public void setItemType(ItemType itemType) {
            this.itemType = itemType;
        }

        public UUID getMaterialId() {
            return materialId;
        }

        public void setMaterialId(UUID materialId) {
            this.materialId = materialId;
        }

        public UUID getSkuId() {
            return skuId;
        }

        public void setSkuId(UUID skuId) {
            this.skuId = skuId;
        }

        public BigDecimal getQuantity() {
            return quantity;
        }

        public void setQuantity(BigDecimal quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }
    }
}
