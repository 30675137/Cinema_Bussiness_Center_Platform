package com.cinema.product.service;

import com.cinema.hallstore.domain.Spu;
import com.cinema.hallstore.repository.SpuRepository;
import com.cinema.product.dto.SPUBasicDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

/**
 * @spec P006-fix-sku-edit-data
 * SPU业务逻辑服务层
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SPUService {

    private final SpuRepository spuRepository;

    /**
     * 根据SPU ID查找SPU基本信息
     *
     * @param spuId SPU的UUID
     * @return SPUBasicDTO的Optional包装，不存在时返回empty
     */
    public Optional<SPUBasicDTO> findById(UUID spuId) {
        log.debug("Finding SPU by id: {}", spuId);

        Optional<Spu> spuOpt = spuRepository.findById(spuId);

        if (spuOpt.isEmpty()) {
            log.debug("SPU not found: id={}", spuId);
            return Optional.empty();
        }

        Spu spu = spuOpt.get();
        SPUBasicDTO dto = mapToDTO(spu);

        log.debug("SPU found: id={}, name={}", spuId, spu.getName());
        return Optional.of(dto);
    }

    /**
     * 将Spu实体映射为SPUBasicDTO
     */
    private SPUBasicDTO mapToDTO(Spu spu) {
        return SPUBasicDTO.builder()
            .id(spu.getId())
            .name(spu.getName())
            // 注意：Spu实体的categoryId和brandId是String类型，需要转换为UUID
            .categoryId(spu.getCategoryId() != null ? parseUUID(spu.getCategoryId()) : null)
            .categoryName(spu.getCategoryName())
            .brandId(spu.getBrandId() != null ? parseUUID(spu.getBrandId()) : null)
            .brandName(spu.getBrandName())
            .description(spu.getDescription())
            .status(spu.getStatus())
            // OffsetDateTime转LocalDateTime
            .createdAt(spu.getCreatedAt() != null
                ? LocalDateTime.ofInstant(spu.getCreatedAt().toInstant(), ZoneOffset.UTC)
                : null)
            .updatedAt(spu.getUpdatedAt() != null
                ? LocalDateTime.ofInstant(spu.getUpdatedAt().toInstant(), ZoneOffset.UTC)
                : null)
            .createdBy(spu.getCreatedBy())
            .updatedBy(spu.getUpdatedBy())
            .build();
    }

    /**
     * 安全解析UUID字符串，解析失败返回null
     */
    private UUID parseUUID(String uuidStr) {
        try {
            return UUID.fromString(uuidStr);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format: {}", uuidStr);
            return null;
        }
    }
}
