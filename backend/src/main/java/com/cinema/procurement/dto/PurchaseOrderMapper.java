/**
 * @spec N001-purchase-inbound
 * @spec N004-procurement-material-selector
 * 采购订单实体与DTO映射器
 */
package com.cinema.procurement.dto;

import com.cinema.procurement.entity.ItemType;
import com.cinema.procurement.entity.PurchaseOrderEntity;
import com.cinema.procurement.entity.PurchaseOrderItemEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PurchaseOrderMapper {

    public PurchaseOrderDTO toDTO(PurchaseOrderEntity entity) {
        if (entity == null) {
            return null;
        }
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(entity.getId());
        dto.setOrderNumber(entity.getOrderNumber());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setPlannedArrivalDate(entity.getPlannedArrivalDate());
        dto.setRemarks(entity.getRemarks());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setApprovedBy(entity.getApprovedBy());
        dto.setApprovedAt(entity.getApprovedAt());
        dto.setRejectionReason(entity.getRejectionReason());
        dto.setVersion(entity.getVersion());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Map supplier
        if (entity.getSupplier() != null) {
            SupplierDTO supplierDTO = new SupplierDTO(
                entity.getSupplier().getId(),
                entity.getSupplier().getCode(),
                entity.getSupplier().getName(),
                entity.getSupplier().getContactName(),
                entity.getSupplier().getContactPhone(),
                entity.getSupplier().getStatus() != null ? entity.getSupplier().getStatus().name() : null
            );
            dto.setSupplier(supplierDTO);
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

    public PurchaseOrderDTO toDTOWithItems(PurchaseOrderEntity entity) {
        PurchaseOrderDTO dto = toDTO(entity);
        if (dto != null && entity.getItems() != null) {
            dto.setItems(entity.getItems().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList()));
        }
        return dto;
    }

    public PurchaseOrderItemDTO toItemDTO(PurchaseOrderItemEntity item) {
        if (item == null) {
            return null;
        }
        PurchaseOrderItemDTO dto = new PurchaseOrderItemDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setLineAmount(item.getLineAmount());
        dto.setReceivedQty(item.getReceivedQty());
        dto.setPendingQty(item.getPendingQty());

        // N004: Map itemType
        dto.setItemType(item.getItemType());

        // N004: Map Material or SKU based on itemType
        if (item.getItemType() == ItemType.MATERIAL && item.getMaterial() != null) {
            // Map Material (N004 新增)
            PurchaseOrderItemDTO.MaterialDTO materialDTO = new PurchaseOrderItemDTO.MaterialDTO(
                item.getMaterial().getId(),
                item.getMaterial().getCode(),
                item.getMaterial().getName(),
                item.getMaterial().getSpecification(),
                item.getMaterial().getPurchaseUnit() != null ? item.getMaterial().getPurchaseUnit().getName() : null,
                item.getMaterial().getInventoryUnit() != null ? item.getMaterial().getInventoryUnit().getName() : null
            );
            dto.setMaterial(materialDTO);
            dto.setMaterialName(item.getMaterialName());
            // Unit from Material's purchaseUnit
            dto.setUnit(item.getMaterial().getPurchaseUnit() != null 
                ? item.getMaterial().getPurchaseUnit().getName() 
                : null);
        } else if (item.getItemType() == ItemType.SKU && item.getSku() != null) {
            // Map SKU (原有逻辑)
            PurchaseOrderItemDTO.SkuDTO skuDTO = new PurchaseOrderItemDTO.SkuDTO(
                item.getSku().getId(),
                item.getSku().getCode(),
                item.getSku().getName(),
                item.getSku().getMainUnit()
            );
            dto.setSku(skuDTO);
            // Unit from SKU's mainUnit
            dto.setUnit(item.getSku().getMainUnit());
        } else {
            // Fallback for legacy data (itemType might be null)
            if (item.getSku() != null) {
                PurchaseOrderItemDTO.SkuDTO skuDTO = new PurchaseOrderItemDTO.SkuDTO(
                    item.getSku().getId(),
                    item.getSku().getCode(),
                    item.getSku().getName(),
                    item.getSku().getMainUnit()
                );
                dto.setSku(skuDTO);
                dto.setUnit(item.getSku().getMainUnit());
            }
        }

        return dto;
    }

    public List<PurchaseOrderDTO> toDTOList(List<PurchaseOrderEntity> entities) {
        return entities.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
}
