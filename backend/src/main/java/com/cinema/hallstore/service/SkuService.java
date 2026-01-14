package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.BomComponent;
import com.cinema.hallstore.domain.ComboItem;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuStatus;
import com.cinema.hallstore.domain.enums.SkuType;
import com.cinema.hallstore.dto.SkuCreateRequest;
import com.cinema.hallstore.repository.BomComponentJpaRepository;
import com.cinema.hallstore.repository.ComboItemRepository;
import com.cinema.hallstore.repository.SkuJpaRepository;
import com.cinema.hallstore.repository.SkuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * SKU业务服务层
 *
 * @since P001-sku-master-data
 */
@Service
public class SkuService {

    private final SkuRepository skuRepository;
    private final BomComponentJpaRepository bomComponentJpaRepository;
    private final ComboItemRepository comboItemRepository;
    private final CostCalculationService costCalculationService;
    private final StoreScopeValidationService storeScopeValidationService;

    public SkuService(SkuRepository skuRepository,
                      BomComponentJpaRepository bomComponentJpaRepository,
                      ComboItemRepository comboItemRepository,
                      CostCalculationService costCalculationService,
                      StoreScopeValidationService storeScopeValidationService) {
        this.skuRepository = skuRepository;
        this.bomComponentJpaRepository = bomComponentJpaRepository;
        this.comboItemRepository = comboItemRepository;
        this.costCalculationService = costCalculationService;
        this.storeScopeValidationService = storeScopeValidationService;
    }

    /**
     * 查询SKU列表
     */
    public List<Sku> findAll(SkuType skuType, SkuStatus status, String storeId, String keyword) {
        return skuRepository.findAll(skuType, status, storeId, keyword);
    }

    /**
     * 获取SKU详情
     */
    public Sku findById(UUID id) {
        Sku sku = skuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("SKU不存在: " + id));
        return sku;
    }

    /**
     * 创建SKU
     */
    @Transactional
    public Sku create(SkuCreateRequest request) {
        // 检查条码是否已存在
        if (skuRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("条码已存在: " + request.getCode());
        }

        // 创建SKU实体
        Sku sku = Sku.builder()
                .code(request.getCode())
                .name(request.getName())
                .spuId(request.getSpuId())
                .skuType(request.getSkuType())
                .mainUnit(request.getMainUnit())
                .storeScope(request.getStoreScope() != null ? request.getStoreScope() : new String[0])
                .status(request.getStatus() != null ? request.getStatus() : SkuStatus.DRAFT)
                .build();

        // 根据类型处理 (M001: 原料和包材已迁移到 Material 表)
        switch (request.getSkuType()) {
            case FINISHED_PRODUCT -> {
                // 成品需要BOM配置
                if (request.getBomComponents() == null || request.getBomComponents().isEmpty()) {
                    throw new IllegalArgumentException("成品必须配置BOM组件");
                }
                sku.setWasteRate(request.getWasteRate() != null ? request.getWasteRate() : BigDecimal.ZERO);
            }
            case COMBO -> {
                // 套餐需要子项配置
                if (request.getComboItems() == null || request.getComboItems().isEmpty()) {
                    throw new IllegalArgumentException("套餐必须配置子项");
                }
            }
        }

        // 保存SKU
        Sku createdSku = skuRepository.save(sku);

        // 处理BOM组件
        if (request.getSkuType() == SkuType.FINISHED_PRODUCT && request.getBomComponents() != null) {
            for (SkuCreateRequest.BomComponentInput input : request.getBomComponents()) {
                // 获取组件SKU以验证类型和获取成本
                // M001: BOM 组件现在应该引用 Material 表,暂时移除类型检查
                // TODO: 迁移 BOM 组件到 Material 引用
                Sku component = skuRepository.findById(input.getComponentId())
                        .orElseThrow(() -> new IllegalArgumentException("组件SKU不存在: " + input.getComponentId()));

                BomComponent bomComponent = BomComponent.builder()
                        .finishedProductId(createdSku.getId())
                        .componentId(input.getComponentId())
                        .quantity(input.getQuantity())
                        .unit(input.getUnit())
                        .unitCost(component.getStandardCost())
                        .isOptional(input.getIsOptional() != null ? input.getIsOptional() : false)
                        .sortOrder(input.getSortOrder() != null ? input.getSortOrder() : 0)
                        .build();

                bomComponentJpaRepository.save(bomComponent);
            }

            // 计算并更新成本
            List<BomComponent> components = bomComponentJpaRepository.findByFinishedProductIdOrderBySortOrderAsc(createdSku.getId());
            BigDecimal calculatedCost = costCalculationService.calculateFinishedProductCost(
                    components, createdSku.getWasteRate());
            createdSku.setStandardCost(calculatedCost);
            createdSku = skuRepository.update(createdSku);
        }

        // 处理套餐子项
        if (request.getSkuType() == SkuType.COMBO && request.getComboItems() != null) {
            for (SkuCreateRequest.ComboItemInput input : request.getComboItems()) {
                // 获取子项SKU以验证类型和获取成本
                Sku subItem = skuRepository.findById(input.getSubItemId())
                        .orElseThrow(() -> new IllegalArgumentException("套餐子项SKU不存在: " + input.getSubItemId()));

                if (subItem.getSkuType() == SkuType.COMBO) {
                    throw new IllegalArgumentException("套餐子项不能是套餐类型");
                }

                ComboItem comboItem = ComboItem.builder()
                        .comboId(createdSku.getId())
                        .subItemId(input.getSubItemId())
                        .quantity(input.getQuantity())
                        .unit(input.getUnit())
                        .unitCost(subItem.getStandardCost())
                        .sortOrder(input.getSortOrder() != null ? input.getSortOrder() : 0)
                        .build();

                comboItemRepository.save(comboItem);
            }

            // 计算并更新成本
            List<ComboItem> items = comboItemRepository.findByComboId(createdSku.getId());
            BigDecimal calculatedCost = costCalculationService.calculateComboCost(items);
            createdSku.setStandardCost(calculatedCost);
            createdSku = skuRepository.update(createdSku);
        }

        return createdSku;
    }

    /**
     * 更新SKU基本信息
     */
    @Transactional
    public Sku update(UUID id, String name, UUID spuId, String mainUnit, String[] storeScope,
                      BigDecimal standardCost, BigDecimal wasteRate, BigDecimal price, SkuStatus status) {
        Sku sku = findById(id);

        if (name != null) {
            sku.setName(name);
        }
        if (spuId != null) {
            sku.setSpuId(spuId);
        }
        if (mainUnit != null) {
            sku.setMainUnit(mainUnit);
        }
        if (storeScope != null) {
            sku.setStoreScope(storeScope);
        }
        // M001: 原料和包材已迁移到 Material 表
        // 成品和套餐的标准成本通过 BOM/Combo 计算,不允许手动修改
        // if (standardCost != null) { sku.setStandardCost(standardCost); }
        if (wasteRate != null && sku.getSkuType() == SkuType.FINISHED_PRODUCT) {
            sku.setWasteRate(wasteRate);
            // 重新计算成本
            recalculateCost(id);
        }
        // 零售价（仅成品/套餐类型）
        if (price != null && (sku.getSkuType() == SkuType.FINISHED_PRODUCT || sku.getSkuType() == SkuType.COMBO)) {
            sku.setPrice(price);
        }
        if (status != null) {
            sku.setStatus(status);
        }

        return skuRepository.update(sku);
    }

    /**
     * 删除SKU
     */
    @Transactional
    public void delete(UUID id) {
        Sku sku = findById(id);

        // 检查是否被BOM引用
        List<BomComponent> bomUsages = bomComponentJpaRepository.findByComponentId(id);
        if (!bomUsages.isEmpty()) {
            throw new IllegalStateException("该SKU正在被 " + bomUsages.size() + " 个成品的BOM使用,无法删除");
        }

        // 检查是否被套餐引用
        List<ComboItem> comboUsages = comboItemRepository.findBySubItemId(id);
        if (!comboUsages.isEmpty()) {
            throw new IllegalStateException("该SKU正在被 " + comboUsages.size() + " 个套餐使用,无法删除");
        }

        // 删除相关数据
        if (sku.getSkuType() == SkuType.FINISHED_PRODUCT) {
            bomComponentJpaRepository.deleteByFinishedProductId(id);
        } else if (sku.getSkuType() == SkuType.COMBO) {
            comboItemRepository.deleteByComboId(id);
        }

        // 使用 deleteAndFlush 立即执行 SQL，以便在方法内捕获约束异常
        skuRepository.deleteAndFlush(id);
    }

    /**
     * 重新计算成本
     */
    @Transactional
    public BigDecimal recalculateCost(UUID id) {
        Sku sku = findById(id);

        BigDecimal newCost;
        if (sku.getSkuType() == SkuType.FINISHED_PRODUCT) {
            List<BomComponent> components = bomComponentJpaRepository.findByFinishedProductIdOrderBySortOrderAsc(id);
            if (components.isEmpty()) {
                throw new IllegalStateException("成品SKU没有BOM配置");
            }
            newCost = costCalculationService.calculateFinishedProductCost(components, sku.getWasteRate());
        } else if (sku.getSkuType() == SkuType.COMBO) {
            List<ComboItem> items = comboItemRepository.findByComboId(id);
            if (items.isEmpty()) {
                throw new IllegalStateException("套餐SKU没有子项配置");
            }
            newCost = costCalculationService.calculateComboCost(items);
        } else {
            throw new IllegalArgumentException("只有成品和套餐类型的SKU支持自动计算成本");
        }

        sku.setStandardCost(newCost);
        skuRepository.update(sku);

        return newCost;
    }

    /**
     * 获取SKU的BOM配置
     */
    public List<BomComponent> getBom(UUID id) {
        Sku sku = findById(id);
        if (sku.getSkuType() != SkuType.FINISHED_PRODUCT) {
            throw new IllegalArgumentException("只有成品类型的SKU才有BOM配置");
        }
        // 使用带 JOIN FETCH 的查询，加载组件SKU信息供前端展示
        return bomComponentJpaRepository.findByFinishedProductIdWithComponent(id);
    }

    /**
     * 获取SKU的套餐子项
     */
    public List<ComboItem> getComboItems(UUID id) {
        Sku sku = findById(id);
        if (sku.getSkuType() != SkuType.COMBO) {
            throw new IllegalArgumentException("只有套餐类型的SKU才有子项配置");
        }
        return comboItemRepository.findByComboId(id);
    }

    /**
     * 更新BOM配置
     */
    @Transactional
    public List<BomComponent> updateBom(UUID finishedProductId, List<SkuCreateRequest.BomComponentInput> componentInputs, BigDecimal wasteRate) {
        Sku sku = findById(finishedProductId);
        if (sku.getSkuType() != SkuType.FINISHED_PRODUCT) {
            throw new IllegalArgumentException("只有成品类型的SKU才能配置BOM");
        }

        // 删除旧的BOM配置
        bomComponentJpaRepository.deleteByFinishedProductId(finishedProductId);

        // 创建新的BOM配置
        for (SkuCreateRequest.BomComponentInput input : componentInputs) {
            // 获取组件SKU以验证类型和获取成本
            // M001: BOM 组件现在应该引用 Material 表,暂时移除类型检查
            // TODO: 迁移 BOM 组件到 Material 引用
            Sku component = skuRepository.findById(input.getComponentId())
                    .orElseThrow(() -> new IllegalArgumentException("组件SKU不存在: " + input.getComponentId()));

            BomComponent bomComponent = BomComponent.builder()
                    .finishedProductId(finishedProductId)
                    .componentId(input.getComponentId())
                    .quantity(input.getQuantity())
                    .unit(input.getUnit())
                    .unitCost(component.getStandardCost())
                    .isOptional(input.getIsOptional() != null ? input.getIsOptional() : false)
                    .sortOrder(input.getSortOrder() != null ? input.getSortOrder() : 0)
                    .build();

            bomComponentJpaRepository.save(bomComponent);
        }

        // 更新损耗率(如果提供)
        if (wasteRate != null) {
            sku.setWasteRate(wasteRate);
        }

        // 重新计算成本
        List<BomComponent> components = bomComponentJpaRepository.findByFinishedProductIdOrderBySortOrderAsc(finishedProductId);
        BigDecimal calculatedCost = costCalculationService.calculateFinishedProductCost(
                components, sku.getWasteRate());
        sku.setStandardCost(calculatedCost);
        skuRepository.update(sku);

        return components;
    }

    /**
     * 更新套餐子项配置
     */
    @Transactional
    public List<ComboItem> updateComboItems(UUID comboId, List<SkuCreateRequest.ComboItemInput> itemInputs) {
        Sku sku = findById(comboId);
        if (sku.getSkuType() != SkuType.COMBO) {
            throw new IllegalArgumentException("只有套餐类型的SKU才能配置子项");
        }

        // 删除旧的套餐子项
        comboItemRepository.deleteByComboId(comboId);

        // 创建新的套餐子项
        for (SkuCreateRequest.ComboItemInput input : itemInputs) {
            // 获取子项SKU以验证类型和获取成本
            Sku subItem = skuRepository.findById(input.getSubItemId())
                    .orElseThrow(() -> new IllegalArgumentException("套餐子项SKU不存在: " + input.getSubItemId()));

            if (subItem.getSkuType() == SkuType.COMBO) {
                throw new IllegalArgumentException("套餐子项不能是套餐类型");
            }

            ComboItem comboItem = ComboItem.builder()
                    .comboId(comboId)
                    .subItemId(input.getSubItemId())
                    .quantity(input.getQuantity())
                    .unit(input.getUnit())
                    .unitCost(subItem.getStandardCost())
                    .sortOrder(input.getSortOrder() != null ? input.getSortOrder() : 0)
                    .build();

            comboItemRepository.save(comboItem);
        }

        // 重新计算成本
        List<ComboItem> items = comboItemRepository.findByComboId(comboId);
        BigDecimal calculatedCost = costCalculationService.calculateComboCost(items);
        sku.setStandardCost(calculatedCost);
        skuRepository.update(sku);

        return items;
    }

    /**
     * 验证门店范围可用性
     */
    public StoreScopeValidationService.ValidationResult validateStoreScope(UUID id, String[] targetStoreScope) {
        Sku sku = findById(id);

        if (sku.getSkuType() == SkuType.FINISHED_PRODUCT) {
            // 创建临时SKU用于验证
            Sku tempSku = Sku.builder()
                    .id(sku.getId())
                    .name(sku.getName())
                    .skuType(sku.getSkuType())
                    .storeScope(targetStoreScope)
                    .build();

            // 获取所有组件SKU
            List<BomComponent> bomComponents = bomComponentJpaRepository.findByFinishedProductIdOrderBySortOrderAsc(id);
            List<Sku> componentSkus = bomComponents.stream()
                    .map(bc -> skuRepository.findById(bc.getComponentId()).orElse(null))
                    .filter(s -> s != null)
                    .collect(java.util.stream.Collectors.toList());

            return storeScopeValidationService.validateForFinishedProduct(tempSku, componentSkus);
        } else if (sku.getSkuType() == SkuType.COMBO) {
            // 创建临时SKU用于验证
            Sku tempSku = Sku.builder()
                    .id(sku.getId())
                    .name(sku.getName())
                    .skuType(sku.getSkuType())
                    .storeScope(targetStoreScope)
                    .build();

            // 获取所有子项SKU
            List<ComboItem> comboItems = comboItemRepository.findByComboId(id);
            List<Sku> subItemSkus = comboItems.stream()
                    .map(ci -> skuRepository.findById(ci.getSubItemId()).orElse(null))
                    .filter(s -> s != null)
                    .collect(java.util.stream.Collectors.toList());

            return storeScopeValidationService.validateForCombo(tempSku, subItemSkus);
        } else {
            throw new IllegalArgumentException("只有成品和套餐类型的SKU支持门店范围验证");
        }
    }
}
