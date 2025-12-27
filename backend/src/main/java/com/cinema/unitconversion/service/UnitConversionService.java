package com.cinema.unitconversion.service;

import com.cinema.unitconversion.domain.UnitCategory;
import com.cinema.unitconversion.domain.UnitConversion;
import com.cinema.unitconversion.dto.*;
import com.cinema.unitconversion.repository.UnitConversionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 单位换算规则业务服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UnitConversionService {

    private final UnitConversionRepository repository;

    /**
     * 获取所有换算规则
     */
    public List<UnitConversionDto> getAll(String category, String search) {
        List<UnitConversion> conversions;

        if (category != null && search != null && !search.isBlank()) {
            UnitCategory cat = UnitCategory.fromString(category);
            conversions = repository.searchByCategoryAndKeyword(cat, search);
        } else if (category != null) {
            UnitCategory cat = UnitCategory.fromString(category);
            conversions = repository.findByCategory(cat);
        } else if (search != null && !search.isBlank()) {
            conversions = repository.searchByKeyword(search);
        } else {
            conversions = repository.findAll();
        }

        return conversions.stream()
                .map(UnitConversionDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 根据 ID 获取换算规则
     */
    public UnitConversionDto getById(UUID id) {
        UnitConversion conversion = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("换算规则不存在: " + id));
        return UnitConversionDto.from(conversion);
    }

    /**
     * 创建换算规则
     */
    @Transactional
    public UnitConversionDto create(CreateConversionRequest request) {
        // 验证源单位和目标单位不能相同
        if (request.getFromUnit().equals(request.getToUnit())) {
            throw new IllegalArgumentException("源单位和目标单位不能相同");
        }

        // 检查唯一约束
        if (repository.existsByFromUnitAndToUnit(request.getFromUnit(), request.getToUnit())) {
            throw new IllegalStateException(
                    String.format("换算规则 '%s' → '%s' 已存在", request.getFromUnit(), request.getToUnit())
            );
        }

        UnitConversion conversion = UnitConversion.builder()
                .fromUnit(request.getFromUnit())
                .toUnit(request.getToUnit())
                .conversionRate(request.getConversionRate())
                .category(UnitCategory.fromString(request.getCategory()))
                .build();

        UnitConversion saved = repository.save(conversion);
        log.info("创建换算规则: {} → {} = {}", saved.getFromUnit(), saved.getToUnit(), saved.getConversionRate());

        return UnitConversionDto.from(saved);
    }

    /**
     * 更新换算规则
     */
    @Transactional
    public UnitConversionDto update(UUID id, CreateConversionRequest request) {
        UnitConversion existing = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("换算规则不存在: " + id));

        // 验证源单位和目标单位不能相同
        if (request.getFromUnit().equals(request.getToUnit())) {
            throw new IllegalArgumentException("源单位和目标单位不能相同");
        }

        // 检查唯一约束（排除当前记录）
        if (repository.existsByFromUnitAndToUnitExcluding(request.getFromUnit(), request.getToUnit(), id)) {
            throw new IllegalStateException(
                    String.format("换算规则 '%s' → '%s' 已存在", request.getFromUnit(), request.getToUnit())
            );
        }

        existing.setFromUnit(request.getFromUnit());
        existing.setToUnit(request.getToUnit());
        existing.setConversionRate(request.getConversionRate());
        existing.setCategory(UnitCategory.fromString(request.getCategory()));

        UnitConversion saved = repository.save(existing);
        log.info("更新换算规则: {} → {} = {}", saved.getFromUnit(), saved.getToUnit(), saved.getConversionRate());

        return UnitConversionDto.from(saved);
    }

    /**
     * 删除换算规则
     */
    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("换算规则不存在: " + id);
        }

        // TODO: 检查 BOM 引用（FR-009）
        // 如果被引用，抛出异常阻止删除

        repository.deleteById(id);
        log.info("删除换算规则: {}", id);
    }

    /**
     * 获取统计信息
     */
    public ConversionStatsResponse getStats() {
        int volumeCount = (int) repository.countByCategory(UnitCategory.volume);
        int weightCount = (int) repository.countByCategory(UnitCategory.weight);
        int countCount = (int) repository.countByCategory(UnitCategory.quantity);

        return ConversionStatsResponse.of(volumeCount, weightCount, countCount);
    }
}
