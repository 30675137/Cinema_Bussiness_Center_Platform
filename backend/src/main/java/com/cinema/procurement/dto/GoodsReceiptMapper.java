/**
 * @spec N001-purchase-inbound
 * 收货入库单实体与DTO映射器
 */
package com.cinema.procurement.dto;

import com.cinema.procurement.entity.GoodsReceiptEntity;
import com.cinema.procurement.entity.GoodsReceiptItemEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class GoodsReceiptMapper {

    public GoodsReceiptDTO toDTO(GoodsReceiptEntity entity) {
        if (entity == null) {
            return null;
        }
        GoodsReceiptDTO dto = new GoodsReceiptDTO();
        dto.setId(entity.getId());
        dto.setReceiptNumber(entity.getReceiptNumber());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setReceivedBy(entity.getReceivedBy());
        dto.setReceivedByName(entity.getReceivedByName());
        dto.setReceivedAt(entity.getReceivedAt());
        dto.setRemarks(entity.getRemarks());
        dto.setVersion(entity.getVersion());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Map purchase order summary
        if (entity.getPurchaseOrder() != null) {
            SupplierDTO supplierDTO = null;
            if (entity.getPurchaseOrder().getSupplier() != null) {
                supplierDTO = new SupplierDTO(
                    entity.getPurchaseOrder().getSupplier().getId(),
                    entity.getPurchaseOrder().getSupplier().getCode(),
                    entity.getPurchaseOrder().getSupplier().getName(),
                    entity.getPurchaseOrder().getSupplier().getContactName(),
                    entity.getPurchaseOrder().getSupplier().getContactPhone(),
                    entity.getPurchaseOrder().getSupplier().getStatus() != null
                        ? entity.getPurchaseOrder().getSupplier().getStatus().name() : null
                );
            }
            GoodsReceiptDTO.PurchaseOrderSummary poSummary = new GoodsReceiptDTO.PurchaseOrderSummary(
                entity.getPurchaseOrder().getId(),
                entity.getPurchaseOrder().getOrderNumber(),
                supplierDTO
            );
            dto.setPurchaseOrder(poSummary);
        }

        // Map store
        if (entity.getStore() != null) {
            PurchaseOrderDTO.StoreDTO storeDTO = new PurchaseOrderDTO.StoreDTO(
                entity.getStore().getId(),
                entity.getStore().getCode(),
                entity.getStore().getName()
            );
            dto.setStore(storeDTO);
        }

        return dto;
    }

    public GoodsReceiptDTO toDTOWithItems(GoodsReceiptEntity entity) {
        GoodsReceiptDTO dto = toDTO(entity);
        if (dto != null && entity.getItems() != null) {
            dto.setItems(entity.getItems().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList()));
        }
        return dto;
    }

    public GoodsReceiptItemDTO toItemDTO(GoodsReceiptItemEntity item) {
        if (item == null) {
            return null;
        }
        GoodsReceiptItemDTO dto = new GoodsReceiptItemDTO();
        dto.setId(item.getId());
        dto.setOrderedQty(item.getOrderedQty());
        dto.setReceivedQty(item.getReceivedQty());
        dto.setQualityStatus(item.getQualityStatus() != null ? item.getQualityStatus().name() : null);
        dto.setRejectionReason(item.getRejectionReason());

        // Map SKU
        if (item.getSku() != null) {
            PurchaseOrderItemDTO.SkuDTO skuDTO = new PurchaseOrderItemDTO.SkuDTO(
                item.getSku().getId(),
                item.getSku().getCode(),
                item.getSku().getName(),
                item.getSku().getMainUnit()
            );
            dto.setSku(skuDTO);
        }

        return dto;
    }

    public List<GoodsReceiptDTO> toDTOList(List<GoodsReceiptEntity> entities) {
        return entities.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
}
