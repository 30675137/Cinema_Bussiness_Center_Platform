/**
 * @spec N001-purchase-inbound
 * @spec N004-procurement-material-selector
 * 创建收货入库单请求DTO
 */
package com.cinema.procurement.dto;

import com.cinema.procurement.entity.ItemType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CreateGoodsReceiptRequest {

    @NotNull(message = "采购订单ID不能为空")
    private UUID purchaseOrderId;

    @Size(max = 500, message = "备注最多500字符")
    private String remarks;

    @NotEmpty(message = "收货明细不能为空")
    @Valid
    private List<ItemRequest> items;

    public CreateGoodsReceiptRequest() {}

    // Getters and Setters

    public UUID getPurchaseOrderId() {
        return purchaseOrderId;
    }

    public void setPurchaseOrderId(UUID purchaseOrderId) {
        this.purchaseOrderId = purchaseOrderId;
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
    // N004: 支持 MATERIAL 和 SKU 两种类型
    public static class ItemRequest {

        /**
         * N004: Item type - MATERIAL or SKU
         * Required to determine which ID field to use
         */
        @NotNull(message = "明细类型不能为空")
        private ItemType itemType;

        /**
         * N004: Material ID (required when itemType = MATERIAL)
         */
        private UUID materialId;

        /**
         * SKU ID (required when itemType = SKU)
         * Changed from @NotNull to optional for N004 Material support
         */
        private UUID skuId;

        @NotNull(message = "收货数量不能为空")
        @PositiveOrZero(message = "收货数量不能为负数")
        private BigDecimal receivedQty;

        private String qualityStatus;

        private String rejectionReason;

        public ItemRequest() {}

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

        /**
         * N004: Get the item reference ID based on itemType
         */
        public UUID getItemReferenceId() {
            return itemType == ItemType.MATERIAL ? materialId : skuId;
        }

        public BigDecimal getReceivedQty() {
            return receivedQty;
        }

        public void setReceivedQty(BigDecimal receivedQty) {
            this.receivedQty = receivedQty;
        }

        public String getQualityStatus() {
            return qualityStatus;
        }

        public void setQualityStatus(String qualityStatus) {
            this.qualityStatus = qualityStatus;
        }

        public String getRejectionReason() {
            return rejectionReason;
        }

        public void setRejectionReason(String rejectionReason) {
            this.rejectionReason = rejectionReason;
        }
    }
}
