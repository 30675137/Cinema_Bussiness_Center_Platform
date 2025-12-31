package com.cinema.product.service;

import com.cinema.hallstore.domain.BomComponent;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.repository.BomComponentRepository;
import com.cinema.hallstore.repository.SkuRepository;
import com.cinema.product.dto.BOMComponentDTO;
import com.cinema.product.dto.BOMDetailDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @spec P006-fix-sku-edit-data
 * BOM业务逻辑服务层
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BOMService {

    private final BomComponentRepository bomComponentRepository;
    private final SkuRepository skuRepository;

    /**
     * 根据SKU ID查找关联的BOM配方
     *
     * @param skuId SKU的UUID (finished_product_id)
     * @return BOMDetailDTO的Optional包装，不存在时返回empty
     */
    public Optional<BOMDetailDTO> findBySKUId(UUID skuId) {
        log.debug("Finding BOM components for SKU: {}", skuId);

        // 查询该SKU作为成品的所有BOM组件
        List<BomComponent> components = bomComponentRepository.findByFinishedProductId(skuId);

        if (components == null || components.isEmpty()) {
            log.debug("No BOM components found for SKU: {}", skuId);
            return Optional.empty();
        }

        // 查询SKU信息（用于获取名称和损耗率）
        Optional<Sku> skuOpt = skuRepository.findById(skuId);

        if (skuOpt.isEmpty()) {
            log.warn("SKU not found while building BOM: skuId={}", skuId);
            return Optional.empty();
        }

        Sku sku = skuOpt.get();

        // 构建BOMDetailDTO
        BOMDetailDTO bomDetail = BOMDetailDTO.builder()
            .id(skuId) // BOM ID使用SKU ID（因为没有独立的BOM表）
            .skuId(skuId)
            .name(sku.getName() + " - BOM配方")
            .wasteRate(sku.getWasteRate())
            .status(sku.getStatus() != null ? sku.getStatus().name() : "DRAFT")
            .components(mapToComponentDTOs(components))
            .createdAt(sku.getCreatedAt())
            .updatedAt(sku.getUpdatedAt())
            .createdBy(null) // 创建人由审计模块管理
            .updatedBy(null) // 更新人由审计模块管理
            .build();

        log.debug("BOM found: skuId={}, componentCount={}", skuId, components.size());
        return Optional.of(bomDetail);
    }

    /**
     * 将BomComponent列表映射为BOMComponentDTO列表
     */
    private List<BOMComponentDTO> mapToComponentDTOs(List<BomComponent> components) {
        return components.stream()
            .map(this::mapToComponentDTO)
            .collect(Collectors.toList());
    }

    /**
     * 将BomComponent实体映射为BOMComponentDTO
     */
    private BOMComponentDTO mapToComponentDTO(BomComponent component) {
        // 查询组件SKU信息（用于获取编码和名称）
        String ingredientCode = null;
        String ingredientName = null;

        try {
            Optional<Sku> componentSkuOpt = skuRepository.findById(component.getComponentId());
            if (componentSkuOpt.isPresent()) {
                Sku componentSku = componentSkuOpt.get();
                ingredientCode = componentSku.getCode();
                ingredientName = componentSku.getName();
            }
        } catch (Exception e) {
            log.warn("Failed to load component SKU: componentId={}", component.getComponentId(), e);
        }

        return BOMComponentDTO.builder()
            .id(component.getId())
            .bomId(component.getFinishedProductId())
            .ingredientSkuId(component.getComponentId())
            .ingredientSkuCode(ingredientCode)
            .ingredientSkuName(ingredientName)
            .quantity(component.getQuantity())
            .unit(component.getUnit())
            .standardCost(component.getUnitCost())
            .status(component.getIsOptional() ? "OPTIONAL" : "REQUIRED")
            .sortOrder(component.getSortOrder())
            .createdAt(component.getCreatedAt())
            .updatedAt(null) // BomComponent没有updatedAt字段
            .createdBy(null)
            .updatedBy(null)
            .build();
    }
}
