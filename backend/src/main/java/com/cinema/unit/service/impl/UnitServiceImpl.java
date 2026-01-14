package com.cinema.unit.service.impl;

import com.cinema.unit.domain.Unit;
import com.cinema.unit.domain.UnitCategory;
import com.cinema.unit.dto.UnitRequest;
import com.cinema.unit.dto.UnitResponse;
import com.cinema.unit.exception.UnitInUseException;
import com.cinema.unit.exception.UnitNotFoundException;
import com.cinema.unit.repository.UnitRepository;
import com.cinema.unit.service.UnitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 单位服务实现类
 * 
 * @author Cinema Platform Team
 * @version 1.0
 * @since 2025-01-11
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

    private final UnitRepository unitRepository;

    @Override
    @Transactional
    public UnitResponse createUnit(UnitRequest request) {
        log.info("Creating unit with code: {}", request.getCode());
        
        // 检查单位代码是否已存在
        if (unitRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Unit code already exists: " + request.getCode());
        }
        
        // 创建单位实体
        Unit unit = Unit.builder()
                .code(request.getCode())
                .name(request.getName())
                .category(request.getCategory())
                .decimalPlaces(request.getDecimalPlaces())
                .isBaseUnit(request.getIsBaseUnit())
                .description(request.getDescription())
                .build();
        
        // 保存单位
        Unit savedUnit = unitRepository.save(unit);
        log.info("Unit created successfully: {}", savedUnit.getCode());
        
        return convertToResponse(savedUnit);
    }

    @Override
    @Transactional
    public UnitResponse updateUnit(UUID id, UnitRequest request) {
        log.info("Updating unit with id: {}", id);
        
        // 查询单位
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitNotFoundException("Unit not found with id: " + id));
        
        // 如果修改了单位代码,检查新代码是否已存在
        if (!unit.getCode().equals(request.getCode()) && unitRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Unit code already exists: " + request.getCode());
        }
        
        // 更新单位属性
        unit.setCode(request.getCode());
        unit.setName(request.getName());
        unit.setCategory(request.getCategory());
        unit.setDecimalPlaces(request.getDecimalPlaces());
        unit.setIsBaseUnit(request.getIsBaseUnit());
        unit.setDescription(request.getDescription());
        
        // 保存更新
        Unit updatedUnit = unitRepository.save(unit);
        log.info("Unit updated successfully: {}", updatedUnit.getCode());
        
        return convertToResponse(updatedUnit);
    }

    @Override
    @Transactional
    public void deleteUnit(UUID id) {
        log.info("Deleting unit with id: {}", id);
        
        // 查询单位
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitNotFoundException("Unit not found with id: " + id));
        
        // 检查是否为基础单位
        if (Boolean.TRUE.equals(unit.getIsBaseUnit())) {
            throw new UnitInUseException("Cannot delete base unit: " + unit.getCode());
        }
        
        // TODO: 检查是否被物料引用
        // TODO: 检查是否被换算规则引用
        
        // 删除单位
        unitRepository.delete(unit);
        log.info("Unit deleted successfully: {}", unit.getCode());
    }

    @Override
    @Transactional(readOnly = true)
    public UnitResponse getUnitById(UUID id) {
        log.debug("Getting unit by id: {}", id);
        
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new UnitNotFoundException("Unit not found with id: " + id));
        
        return convertToResponse(unit);
    }

    @Override
    @Transactional(readOnly = true)
    public UnitResponse getUnitByCode(String code) {
        log.debug("Getting unit by code: {}", code);
        
        Unit unit = unitRepository.findByCode(code)
                .orElseThrow(() -> new UnitNotFoundException("Unit not found with code: " + code));
        
        return convertToResponse(unit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getAllUnits() {
        log.debug("Getting all units");
        
        List<Unit> units = unitRepository.findAll();
        
        return units.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getUnitsByCategory(UnitCategory category) {
        log.debug("Getting units by category: {}", category);
        
        List<Unit> units = unitRepository.findByCategory(category);
        
        return units.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getBaseUnits() {
        log.debug("Getting base units");
        
        List<Unit> units = unitRepository.findByIsBaseUnit(true);
        
        return units.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 将单位实体转换为响应DTO
     */
    private UnitResponse convertToResponse(Unit unit) {
        return UnitResponse.builder()
                .id(unit.getId())
                .code(unit.getCode())
                .name(unit.getName())
                .category(unit.getCategory())
                .decimalPlaces(unit.getDecimalPlaces())
                .isBaseUnit(unit.getIsBaseUnit())
                .description(unit.getDescription())
                .createdAt(unit.getCreatedAt())
                .updatedAt(unit.getUpdatedAt())
                .build();
    }
}
