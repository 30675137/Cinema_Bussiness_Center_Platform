package com.cinema.product.service;

import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.repository.SkuRepository;
import com.cinema.product.dto.*;
import com.cinema.product.exception.SkuNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * @spec P006-fix-sku-edit-data
 * SKU业务逻辑服务层
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SKUService {

    private final SkuRepository skuRepository;
    private final SPUService spuService;
    private final BOMService bomService;

    /**
     * 获取SKU详情及关联数据（SPU + BOM）
     *
     * 实现单一聚合端点模式（Research Decision #1）
     * - 优雅处理部分加载失败（通过 metadata 标识）
     * - SPU未关联或失效时，仅标记状态，不抛异常
     * - BOM未配置时，仅标记状态，不抛异常
     *
     * @param skuId SKU的UUID
     * @return SKUDetailDTO 包含SKU、SPU、BOM和加载元数据
     * @throws SkuNotFoundException 当SKU不存在时抛出
     */
    @Transactional(readOnly = true)
    public SKUDetailDTO getSKUWithRelations(UUID skuId) {
        log.info("Fetching SKU details with relations for skuId={}", skuId);

        // 1. 加载SKU基本信息（必须存在）
        Sku sku = skuRepository.findById(skuId)
            .orElseThrow(() -> new SkuNotFoundException(skuId));

        SKUBasicDTO skuBasic = mapToSKUBasicDTO(sku);

        // 2. 加载SPU信息（可选，允许失败）
        SPUBasicDTO spu = null;
        String spuStatus = "not_linked";
        boolean spuLoadSuccess = false;

        if (sku.getSpuId() != null) {
            try {
                Optional<SPUBasicDTO> spuOpt = spuService.findById(sku.getSpuId());
                if (spuOpt.isPresent()) {
                    spu = spuOpt.get();
                    spuStatus = "valid";
                    spuLoadSuccess = true;
                    log.debug("SPU loaded successfully: spuId={}", sku.getSpuId());
                } else {
                    spuStatus = "invalid";
                    log.warn("SPU not found (may be deleted): skuId={}, spuId={}", skuId, sku.getSpuId());
                }
            } catch (Exception e) {
                spuStatus = "invalid";
                log.error("Failed to load SPU: skuId={}, spuId={}", skuId, sku.getSpuId(), e);
            }
        }

        // 3. 加载BOM信息（可选，允许失败）
        BOMDetailDTO bom = null;
        String bomStatus = "not_configured";
        boolean bomLoadSuccess = false;

        try {
            Optional<BOMDetailDTO> bomOpt = bomService.findBySKUId(skuId);
            if (bomOpt.isPresent()) {
                bom = bomOpt.get();
                bomStatus = "active".equals(bom.getStatus()) ? "active" : "inactive";
                bomLoadSuccess = true;
                log.debug("BOM loaded successfully: skuId={}, bomId={}", skuId, bom.getId());
            } else {
                log.debug("No BOM configured for SKU: skuId={}", skuId);
            }
        } catch (Exception e) {
            bomStatus = "not_configured";
            log.error("Failed to load BOM: skuId={}", skuId, e);
        }

        // 4. 构建加载元数据
        SKUDetailDTO.LoadMetadataDTO metadata = SKUDetailDTO.LoadMetadataDTO.builder()
            .spuLoadSuccess(spuLoadSuccess)
            .bomLoadSuccess(bomLoadSuccess)
            .spuStatus(spuStatus)
            .bomStatus(bomStatus)
            .build();

        // 5. 返回聚合结果
        SKUDetailDTO result = SKUDetailDTO.builder()
            .sku(skuBasic)
            .spu(spu)
            .bom(bom)
            .metadata(metadata)
            .build();

        log.info("SKU details loaded: skuId={}, spuStatus={}, bomStatus={}",
            skuId, spuStatus, bomStatus);

        return result;
    }

    /**
     * 将Sku实体映射为SKUBasicDTO
     */
    private SKUBasicDTO mapToSKUBasicDTO(Sku sku) {
        return SKUBasicDTO.builder()
            .id(sku.getId())
            .code(sku.getCode())
            .name(sku.getName())
            .price(sku.getPrice())
            .stockQuantity(null) // 库存数量由独立模块管理，此处不返回
            .status(sku.getStatus() != null ? sku.getStatus().name() : null)
            .spuId(sku.getSpuId())
            .version(sku.getVersion())
            .createdAt(sku.getCreatedAt())
            .updatedAt(sku.getUpdatedAt())
            .createdBy(null) // 创建人由审计模块管理，此处不返回
            .updatedBy(null) // 更新人由审计模块管理，此处不返回
            .build();
    }
}
