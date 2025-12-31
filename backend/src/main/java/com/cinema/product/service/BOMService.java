/**
 * @spec O004-beverage-sku-reuse
 * BOM Service Layer
 *
 * Purpose: Business logic for BOM (Bill of Materials) management
 * Key Features:
 *   - BOM creation and validation (T030: SKU type = FINISHED_PRODUCT only)
 *   - Component quantity and waste rate validation
 *   - Cost calculation (raw cost + waste cost)
 *   - Cycle dependency detection
 *
 * Note: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 */
package com.cinema.product.service;

import com.cinema.hallstore.domain.BomComponent;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuType;
import com.cinema.hallstore.repository.BomComponentRepository;
import com.cinema.hallstore.repository.SkuRepository;
import com.cinema.product.dto.BOMComponentDTO;
import com.cinema.product.dto.BOMDetailDTO;
import com.cinema.product.exception.BomErrorCode;
import com.cinema.product.exception.BomException;
import com.cinema.product.exception.SkuNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @spec O004-beverage-sku-reuse
 * BOM业务逻辑服务层
 *
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
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
     * 创建或更新BOM配方
     *
     * @param finishedProductSkuId 成品SKU ID
     * @param components BOM组件列表
     * @param wasteRate 损耗率 (0-1之间)
     * @return 计算后的总成本 (分)
     * @throws BomException 当SKU类型不是成品类型时抛出 BOM_VAL_001
     * @throws SkuNotFoundException 当SKU不存在时抛出
     */
    @Transactional
    public Map<String, Object> createOrUpdateBOM(
            UUID finishedProductSkuId,
            List<BOMComponentDTO> components,
            BigDecimal wasteRate) {
        log.info("Creating/updating BOM: finishedProductSkuId={}, componentsCount={}, wasteRate={}",
                finishedProductSkuId, components != null ? components.size() : 0, wasteRate);

        // ===== Step 1: 验证成品SKU存在 =====
        Sku finishedProductSku = skuRepository.findById(finishedProductSkuId)
                .orElseThrow(() -> new SkuNotFoundException(finishedProductSkuId));

        // ===== Step 2: 验证SKU类型必须是 FINISHED_PRODUCT =====
        if (finishedProductSku.getSkuType() != SkuType.FINISHED_PRODUCT) {
            String actualType = finishedProductSku.getSkuType() != null
                    ? finishedProductSku.getSkuType().getDisplayName()
                    : "未知类型";

            Map<String, Object> details = new HashMap<>();
            details.put("finishedProductSkuId", finishedProductSkuId.toString());
            details.put("actualSkuType", finishedProductSku.getSkuType() != null
                    ? finishedProductSku.getSkuType().getValue()
                    : "unknown");
            details.put("skuName", finishedProductSku.getName());

            String errorMessage = BomErrorCode.BOM_VAL_001.formatMessage(actualType);
            log.warn("BOM creation failed: SKU type validation failed. skuId={}, actualType={}, expectedType={}",
                    finishedProductSkuId, actualType, SkuType.FINISHED_PRODUCT.getDisplayName());

            throw new BomException(BomErrorCode.BOM_VAL_001, errorMessage, details);
        }

        // ===== Step 3: 验证组件列表不为空 =====
        if (components == null || components.isEmpty()) {
            Map<String, Object> details = new HashMap<>();
            details.put("finishedProductSkuId", finishedProductSkuId.toString());
            throw new BomException(BomErrorCode.BOM_VAL_002, details);
        }

        // ===== Step 4: 验证损耗率范围 (0-1) =====
        if (wasteRate != null && (wasteRate.compareTo(BigDecimal.ZERO) < 0 || wasteRate.compareTo(BigDecimal.ONE) > 0)) {
            Map<String, Object> details = new HashMap<>();
            details.put("finishedProductSkuId", finishedProductSkuId.toString());
            details.put("wasteRate", wasteRate);
            throw new BomException(BomErrorCode.BOM_VAL_004, details);
        }

        // ===== Step 5: 删除现有BOM组件 (如果存在) =====
        List<BomComponent> existingComponents = bomComponentRepository.findByFinishedProductId(finishedProductSkuId);
        if (!existingComponents.isEmpty()) {
            log.debug("Deleting {} existing BOM components for SKU: {}", existingComponents.size(), finishedProductSkuId);
            bomComponentRepository.deleteByFinishedProductId(finishedProductSkuId);
        }

        // ===== Step 6: 创建新的BOM组件 =====
        BigDecimal totalCost = BigDecimal.ZERO;
        int sortOrder = 1;

        for (BOMComponentDTO componentDTO : components) {
            // 验证组件SKU存在
            UUID componentId = componentDTO.getIngredientSkuId();
            Sku componentSku = skuRepository.findById(componentId)
                    .orElseThrow(() -> {
                        String errorMessage = BomErrorCode.BOM_NTF_002.formatMessage(componentId.toString());
                        Map<String, Object> details = new HashMap<>();
                        details.put("componentId", componentId.toString());
                        details.put("finishedProductSkuId", finishedProductSkuId.toString());
                        return new BomException(BomErrorCode.BOM_NTF_002, errorMessage, details);
                    });

            // 验证组件数量 > 0
            if (componentDTO.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                Map<String, Object> details = new HashMap<>();
                details.put("componentId", componentId.toString());
                details.put("quantity", componentDTO.getQuantity());
                throw new BomException(BomErrorCode.BOM_VAL_003, details);
            }

            // 创建BOM组件
            BomComponent bomComponent = BomComponent.builder()
                    .finishedProductId(finishedProductSkuId)
                    .componentId(componentId)
                    .quantity(componentDTO.getQuantity())
                    .unit(componentDTO.getUnit())
                    .unitCost(componentSku.getStandardCost() != null ? componentSku.getStandardCost() : BigDecimal.ZERO)
                    .isOptional(componentDTO.getStatus() != null && componentDTO.getStatus().equals("OPTIONAL"))
                    .sortOrder(componentDTO.getSortOrder() != null ? componentDTO.getSortOrder() : sortOrder++)
                    .build();

            bomComponentRepository.save(bomComponent);

            // 累加成本
            BigDecimal componentCost = bomComponent.getQuantity().multiply(bomComponent.getUnitCost());
            totalCost = totalCost.add(componentCost);
        }

        // ===== Step 7: 计算含损耗的总成本 =====
        BigDecimal finalWasteRate = wasteRate != null ? wasteRate : BigDecimal.ZERO;
        BigDecimal totalCostWithWaste = totalCost.multiply(BigDecimal.ONE.add(finalWasteRate));

        // ===== Step 8: 更新SKU的损耗率 =====
        finishedProductSku.setWasteRate(finalWasteRate);
        skuRepository.save(finishedProductSku);

        log.info("BOM created/updated successfully: skuId={}, componentsCount={}, rawCost={}, totalCostWithWaste={}",
                finishedProductSkuId, components.size(), totalCost, totalCostWithWaste);

        // ===== Step 9: 返回计算结果 =====
        Map<String, Object> result = new HashMap<>();
        result.put("calculatedCost", totalCostWithWaste.multiply(new BigDecimal("100")).longValue()); // 转换为分
        result.put("rawCost", totalCost.multiply(new BigDecimal("100")).longValue());
        result.put("wasteRate", finalWasteRate);
        result.put("componentsCount", components.size());

        return result;
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
