package com.cinema.inventory.service;

import com.cinema.inventory.domain.InventoryStatus;
import com.cinema.inventory.domain.StoreInventory;
import com.cinema.inventory.dto.InventoryQueryParams;
import com.cinema.inventory.dto.InventoryListResponse;
import com.cinema.inventory.dto.StoreInventoryItemDto;
import com.cinema.inventory.dto.StoreInventoryDetailDto;
import com.cinema.inventory.entity.Inventory;
import com.cinema.inventory.repository.StoreInventoryJpaRepository;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 库存服务层
 * 提供库存查询、详情获取等业务逻辑。
 *
 * @since P003-inventory-query
 * @updated I003-inventory-query - 迁移到 JPA Repository
 */
@Service
public class InventoryService {

    private static final Logger logger = LoggerFactory.getLogger(InventoryService.class);

    private final StoreInventoryJpaRepository inventoryJpaRepository;

    public InventoryService(StoreInventoryJpaRepository inventoryJpaRepository) {
        this.inventoryJpaRepository = inventoryJpaRepository;
    }

    /**
     * 查询库存列表
     *
     * @param params 查询参数
     * @return 库存列表响应（含分页信息）
     */
    @Transactional(readOnly = true)
    public InventoryListResponse listInventory(InventoryQueryParams params) {
        logger.debug("Querying inventory with params: storeId={}, keyword={}, categoryId={}, statuses={}, page={}, pageSize={}",
                params.getStoreId(), params.getKeyword(), params.getCategoryId(),
                params.getStatuses(), params.getPage(), params.getPageSize());

        int page = params.getPage() != null ? params.getPage() : 1;
        int pageSize = params.getPageSize() != null ? params.getPageSize() : 20;
        Pageable pageable = PageRequest.of(page - 1, pageSize);

        UUID storeId = params.getStoreId() != null ? params.getStoreId() : null;
        String keyword = params.getKeyword() != null && !params.getKeyword().isBlank()
                ? params.getKeyword().trim() : null;

        // 查询库存列表
        List<Inventory> inventories;
        long total;

        if (keyword != null) {
            inventories = inventoryJpaRepository.findByStoreIdAndKeywordWithDetails(storeId, keyword, pageable);
            total = inventoryJpaRepository.countByStoreIdAndKeyword(storeId, keyword);
        } else {
            inventories = inventoryJpaRepository.findByStoreIdWithDetails(storeId, pageable);
            total = inventoryJpaRepository.countByStoreId(storeId);
        }

        // 转换为领域模型，然后过滤状态，最后转换为 DTO
        List<StoreInventoryItemDto> dtoList = inventories.stream()
                .map(this::toDomain)
                .filter(inv -> {
                    // 状态过滤（在内存中进行，因为状态是计算字段）
                    if (params.getStatuses() != null && !params.getStatuses().isEmpty()) {
                        return params.getStatuses().contains(inv.getInventoryStatus());
                    }
                    return true;
                })
                .map(this::toItemDto)
                .collect(Collectors.toList());

        logger.info("Found {} inventory items (total: {}, page: {}/{})",
                dtoList.size(), total, page, (total + pageSize - 1) / pageSize);

        return InventoryListResponse.of(dtoList, total, page, pageSize);
    }

    /**
     * 获取库存详情
     *
     * @param id 库存记录ID
     * @return 库存详情 DTO
     * @throws ResourceNotFoundException 如果库存记录不存在
     */
    @Transactional(readOnly = true)
    public StoreInventoryDetailDto getInventoryDetail(UUID id) {
        logger.debug("Getting inventory detail for id: {}", id);

        Inventory inventory = inventoryJpaRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("库存记录", id.toString()));

        StoreInventory domain = toDomain(inventory);

        logger.info("Found inventory detail: skuCode={}, storeName={}",
                domain.getSkuCode(), domain.getStoreName());

        return toDetailDto(domain);
    }

    // ========== 实体到领域模型转换 ==========

    private StoreInventory toDomain(Inventory entity) {
        StoreInventory domain = new StoreInventory();
        domain.setId(entity.getId());
        domain.setStoreId(entity.getStoreId());
        domain.setSkuId(entity.getSkuId());
        domain.setOnHandQty(entity.getOnHandQty() != null ? entity.getOnHandQty() : BigDecimal.ZERO);
        domain.setAvailableQty(entity.getAvailableQty() != null ? entity.getAvailableQty() : BigDecimal.ZERO);
        domain.setReservedQty(entity.getReservedQty() != null ? entity.getReservedQty() : BigDecimal.ZERO);
        domain.setSafetyStock(entity.getSafetyStock() != null ? entity.getSafetyStock() : BigDecimal.ZERO);
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setUpdatedAt(entity.getUpdatedAt());

        // 设置关联的 SKU 信息
        if (entity.getSku() != null) {
            domain.setSkuCode(entity.getSku().getCode());
            domain.setSkuName(entity.getSku().getName());
            domain.setMainUnit(entity.getSku().getMainUnit());
            // 注意：SKU 表没有 category_id 字段，分类信息暂不支持
        }

        // 设置门店信息
        if (entity.getStore() != null) {
            domain.setStoreCode(entity.getStore().getCode());
            domain.setStoreName(entity.getStore().getName());
        }

        return domain;
    }

    // ========== 领域模型到 DTO 转换 ==========

    private StoreInventoryItemDto toItemDto(StoreInventory inventory) {
        StoreInventoryItemDto dto = new StoreInventoryItemDto();
        dto.setId(inventory.getId().toString());
        dto.setStoreId(inventory.getStoreId().toString());
        dto.setStoreName(inventory.getStoreName());
        dto.setSkuId(inventory.getSkuId().toString());
        dto.setSkuCode(inventory.getSkuCode());
        dto.setSkuName(inventory.getSkuName());
        dto.setOnHandQty(inventory.getOnHandQty());
        dto.setAvailableQty(inventory.getAvailableQty());
        dto.setReservedQty(inventory.getReservedQty());
        dto.setSafetyStock(inventory.getSafetyStock());
        dto.setMainUnit(inventory.getMainUnit());
        if (inventory.getCategoryId() != null) {
            dto.setCategoryId(inventory.getCategoryId().toString());
        }
        dto.setCategoryName(inventory.getCategoryName());
        dto.setInventoryStatus(inventory.getInventoryStatus());
        dto.setUpdatedAt(inventory.getUpdatedAt());
        return dto;
    }

    private StoreInventoryDetailDto toDetailDto(StoreInventory inventory) {
        StoreInventoryDetailDto dto = new StoreInventoryDetailDto();
        dto.setId(inventory.getId().toString());
        dto.setStoreId(inventory.getStoreId().toString());
        dto.setStoreName(inventory.getStoreName());
        dto.setStoreCode(inventory.getStoreCode());
        dto.setSkuId(inventory.getSkuId().toString());
        dto.setSkuCode(inventory.getSkuCode());
        dto.setSkuName(inventory.getSkuName());
        dto.setOnHandQty(inventory.getOnHandQty());
        dto.setAvailableQty(inventory.getAvailableQty());
        dto.setReservedQty(inventory.getReservedQty());
        dto.setSafetyStock(inventory.getSafetyStock());
        dto.setMainUnit(inventory.getMainUnit());
        if (inventory.getCategoryId() != null) {
            dto.setCategoryId(inventory.getCategoryId().toString());
        }
        dto.setCategoryName(inventory.getCategoryName());
        dto.setInventoryStatus(inventory.getInventoryStatus());
        dto.setUpdatedAt(inventory.getUpdatedAt());
        dto.setCreatedAt(inventory.getCreatedAt());
        return dto;
    }
}
