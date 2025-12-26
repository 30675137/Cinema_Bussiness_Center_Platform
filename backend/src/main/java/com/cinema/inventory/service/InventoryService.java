package com.cinema.inventory.service;

import com.cinema.inventory.domain.StoreInventory;
import com.cinema.inventory.dto.InventoryQueryParams;
import com.cinema.inventory.dto.InventoryListResponse;
import com.cinema.inventory.dto.StoreInventoryItemDto;
import com.cinema.inventory.dto.StoreInventoryDetailDto;
import com.cinema.inventory.repository.StoreInventoryRepository;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 库存服务层
 * 提供库存查询、详情获取等业务逻辑。
 * 
 * @since P003-inventory-query
 */
@Service
public class InventoryService {

    private static final Logger logger = LoggerFactory.getLogger(InventoryService.class);

    private final StoreInventoryRepository inventoryRepository;

    public InventoryService(StoreInventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * 查询库存列表
     * 
     * @param params 查询参数
     * @return 库存列表响应（含分页信息）
     */
    public InventoryListResponse listInventory(InventoryQueryParams params) {
        logger.debug("Querying inventory with params: storeId={}, keyword={}, categoryId={}, statuses={}, page={}, pageSize={}",
                params.getStoreId(), params.getKeyword(), params.getCategoryId(), 
                params.getStatuses(), params.getPage(), params.getPageSize());

        // 查询库存列表
        List<StoreInventory> inventories = inventoryRepository.findByParams(params);
        
        // 统计总数
        long total = inventoryRepository.countByParams(params);
        
        // 转换为 DTO
        List<StoreInventoryItemDto> dtoList = inventories.stream()
                .map(this::toItemDto)
                .collect(Collectors.toList());

        int page = params.getPage() != null ? params.getPage() : 1;
        int pageSize = params.getPageSize() != null ? params.getPageSize() : 20;

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
    public StoreInventoryDetailDto getInventoryDetail(UUID id) {
        logger.debug("Getting inventory detail for id: {}", id);

        StoreInventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("库存记录", id.toString()));

        logger.info("Found inventory detail: skuCode={}, storeName={}", 
                inventory.getSkuCode(), inventory.getStoreName());

        return toDetailDto(inventory);
    }

    // ========== 转换方法 ==========

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
