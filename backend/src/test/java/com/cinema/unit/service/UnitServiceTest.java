package com.cinema.unit.service;

import com.cinema.unit.domain.Unit;
import com.cinema.unit.domain.UnitCategory;
import com.cinema.unit.dto.UnitRequest;
import com.cinema.unit.dto.UnitResponse;
import com.cinema.unit.exception.UnitInUseException;
import com.cinema.unit.exception.UnitNotFoundException;
import com.cinema.unit.repository.UnitRepository;
import com.cinema.unit.service.impl.UnitServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 单位服务测试类
 * 
 * @author Cinema Platform Team
 * @version 1.0
 * @since 2025-01-11
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("单位服务测试")
class UnitServiceTest {

    @Mock
    private UnitRepository unitRepository;

    @InjectMocks
    private UnitServiceImpl unitService;

    private Unit testUnit;
    private UnitRequest testRequest;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        
        testUnit = Unit.builder()
                .id(testId)
                .code("ml")
                .name("毫升")
                .category(UnitCategory.VOLUME)
                .decimalPlaces(1)
                .isBaseUnit(true)
                .description("基础体积单位")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testRequest = new UnitRequest();
        testRequest.setCode("ml");
        testRequest.setName("毫升");
        testRequest.setCategory(UnitCategory.VOLUME);
        testRequest.setDecimalPlaces(1);
        testRequest.setIsBaseUnit(true);
        testRequest.setDescription("基础体积单位");
    }

    @Test
    @DisplayName("创建单位 - 成功")
    void createUnit_Success() {
        // Given
        when(unitRepository.existsByCode(testRequest.getCode())).thenReturn(false);
        when(unitRepository.save(any(Unit.class))).thenReturn(testUnit);

        // When
        UnitResponse response = unitService.createUnit(testRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo(testRequest.getCode());
        assertThat(response.getName()).isEqualTo(testRequest.getName());
        assertThat(response.getCategory()).isEqualTo(testRequest.getCategory());
        
        verify(unitRepository).existsByCode(testRequest.getCode());
        verify(unitRepository).save(any(Unit.class));
    }

    @Test
    @DisplayName("创建单位 - 代码已存在")
    void createUnit_CodeExists() {
        // Given
        when(unitRepository.existsByCode(testRequest.getCode())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> unitService.createUnit(testRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unit code already exists");
        
        verify(unitRepository).existsByCode(testRequest.getCode());
        verify(unitRepository, never()).save(any(Unit.class));
    }

    @Test
    @DisplayName("更新单位 - 成功")
    void updateUnit_Success() {
        // Given
        testRequest.setName("毫升(更新)");
        when(unitRepository.findById(testId)).thenReturn(Optional.of(testUnit));
        when(unitRepository.save(any(Unit.class))).thenReturn(testUnit);

        // When
        UnitResponse response = unitService.updateUnit(testId, testRequest);

        // Then
        assertThat(response).isNotNull();
        verify(unitRepository).findById(testId);
        verify(unitRepository).save(any(Unit.class));
    }

    @Test
    @DisplayName("更新单位 - 单位不存在")
    void updateUnit_NotFound() {
        // Given
        when(unitRepository.findById(testId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> unitService.updateUnit(testId, testRequest))
                .isInstanceOf(UnitNotFoundException.class)
                .hasMessageContaining("Unit not found");
        
        verify(unitRepository).findById(testId);
        verify(unitRepository, never()).save(any(Unit.class));
    }

    @Test
    @DisplayName("删除单位 - 成功")
    void deleteUnit_Success() {
        // Given
        testUnit.setIsBaseUnit(false);
        when(unitRepository.findById(testId)).thenReturn(Optional.of(testUnit));

        // When
        unitService.deleteUnit(testId);

        // Then
        verify(unitRepository).findById(testId);
        verify(unitRepository).delete(testUnit);
    }

    @Test
    @DisplayName("删除单位 - 基础单位不能删除")
    void deleteUnit_BaseUnitCannotBeDeleted() {
        // Given
        when(unitRepository.findById(testId)).thenReturn(Optional.of(testUnit));

        // When & Then
        assertThatThrownBy(() -> unitService.deleteUnit(testId))
                .isInstanceOf(UnitInUseException.class)
                .hasMessageContaining("Cannot delete base unit");
        
        verify(unitRepository).findById(testId);
        verify(unitRepository, never()).delete(any(Unit.class));
    }

    @Test
    @DisplayName("根据ID获取单位 - 成功")
    void getUnitById_Success() {
        // Given
        when(unitRepository.findById(testId)).thenReturn(Optional.of(testUnit));

        // When
        UnitResponse response = unitService.getUnitById(testId);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(testId);
        assertThat(response.getCode()).isEqualTo(testUnit.getCode());
        
        verify(unitRepository).findById(testId);
    }

    @Test
    @DisplayName("根据ID获取单位 - 不存在")
    void getUnitById_NotFound() {
        // Given
        when(unitRepository.findById(testId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> unitService.getUnitById(testId))
                .isInstanceOf(UnitNotFoundException.class)
                .hasMessageContaining("Unit not found");
        
        verify(unitRepository).findById(testId);
    }

    @Test
    @DisplayName("根据代码获取单位 - 成功")
    void getUnitByCode_Success() {
        // Given
        when(unitRepository.findByCode("ml")).thenReturn(Optional.of(testUnit));

        // When
        UnitResponse response = unitService.getUnitByCode("ml");

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("ml");
        
        verify(unitRepository).findByCode("ml");
    }

    @Test
    @DisplayName("获取所有单位")
    void getAllUnits() {
        // Given
        Unit unit2 = Unit.builder()
                .id(UUID.randomUUID())
                .code("L")
                .name("升")
                .category(UnitCategory.VOLUME)
                .decimalPlaces(2)
                .isBaseUnit(false)
                .build();
        
        List<Unit> units = Arrays.asList(testUnit, unit2);
        when(unitRepository.findAll()).thenReturn(units);

        // When
        List<UnitResponse> responses = unitService.getAllUnits();

        // Then
        assertThat(responses).hasSize(2);
        assertThat(responses).extracting(UnitResponse::getCode)
                .containsExactlyInAnyOrder("ml", "L");
        
        verify(unitRepository).findAll();
    }

    @Test
    @DisplayName("根据分类获取单位")
    void getUnitsByCategory() {
        // Given
        List<Unit> units = Arrays.asList(testUnit);
        when(unitRepository.findByCategory(UnitCategory.VOLUME)).thenReturn(units);

        // When
        List<UnitResponse> responses = unitService.getUnitsByCategory(UnitCategory.VOLUME);

        // Then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getCategory()).isEqualTo(UnitCategory.VOLUME);
        
        verify(unitRepository).findByCategory(UnitCategory.VOLUME);
    }

    @Test
    @DisplayName("获取基础单位")
    void getBaseUnits() {
        // Given
        List<Unit> units = Arrays.asList(testUnit);
        when(unitRepository.findByIsBaseUnit(true)).thenReturn(units);

        // When
        List<UnitResponse> responses = unitService.getBaseUnits();

        // Then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getIsBaseUnit()).isTrue();
        
        verify(unitRepository).findByIsBaseUnit(true);
    }
}
