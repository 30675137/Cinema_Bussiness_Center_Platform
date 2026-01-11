/**
 * @spec M001-material-unit-system
 */
package com.cinema.unit.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.cinema.unit.entity.Unit;
import com.cinema.unit.repository.UnitRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit service test
 *
 * <p>User Story: US1 - 单位主数据管理
 *
 * <p>Tests the core business logic for unit master data management following TDD principles.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UnitService Tests")
class UnitServiceTest {

    @Mock private UnitRepository unitRepository;

    @InjectMocks private UnitService unitService;

    private Unit mlUnit;
    private Unit literUnit;

    @BeforeEach
    void setUp() {
        mlUnit =
                Unit.builder()
                        .id(UUID.randomUUID())
                        .code("ml")
                        .name("毫升")
                        .category(Unit.UnitCategory.VOLUME)
                        .decimalPlaces(2)
                        .isBaseUnit(true)
                        .description("体积基础单位")
                        .build();

        literUnit =
                Unit.builder()
                        .id(UUID.randomUUID())
                        .code("L")
                        .name("升")
                        .category(Unit.UnitCategory.VOLUME)
                        .decimalPlaces(2)
                        .isBaseUnit(false)
                        .description("1L = 1000ml")
                        .build();
    }

    @Test
    @DisplayName("创建单位 - 正常情况")
    void testCreateUnit_Success() {
        // Given
        when(unitRepository.existsByCode("ml")).thenReturn(false);
        when(unitRepository.save(any(Unit.class))).thenReturn(mlUnit);

        // When
        Unit created = unitService.createUnit(mlUnit);

        // Then
        assertThat(created).isNotNull();
        assertThat(created.getCode()).isEqualTo("ml");
        assertThat(created.getName()).isEqualTo("毫升");
        verify(unitRepository).existsByCode("ml");
        verify(unitRepository).save(mlUnit);
    }

    @Test
    @DisplayName("创建单位 - 重复代码抛出异常")
    void testCreateUnit_DuplicateCode_ThrowsException() {
        // Given
        when(unitRepository.existsByCode("ml")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> unitService.createUnit(mlUnit))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unit code already exists");

        verify(unitRepository).existsByCode("ml");
        verify(unitRepository, never()).save(any());
    }

    @Test
    @DisplayName("根据 code 查询单位 - 存在")
    void testFindByCode_Exists() {
        // Given
        when(unitRepository.findByCode("ml")).thenReturn(Optional.of(mlUnit));

        // When
        Optional<Unit> result = unitService.findByCode("ml");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getCode()).isEqualTo("ml");
        verify(unitRepository).findByCode("ml");
    }

    @Test
    @DisplayName("根据 code 查询单位 - 不存在")
    void testFindByCode_NotExists() {
        // Given
        when(unitRepository.findByCode("unknown")).thenReturn(Optional.empty());

        // When
        Optional<Unit> result = unitService.findByCode("unknown");

        // Then
        assertThat(result).isEmpty();
        verify(unitRepository).findByCode("unknown");
    }

    @Test
    @DisplayName("根据分类查询单位")
    void testFindByCategory() {
        // Given
        when(unitRepository.findByCategory(Unit.UnitCategory.VOLUME))
                .thenReturn(List.of(mlUnit, literUnit));

        // When
        List<Unit> results = unitService.findByCategory(Unit.UnitCategory.VOLUME);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Unit::getCode).containsExactly("ml", "L");
        verify(unitRepository).findByCategory(Unit.UnitCategory.VOLUME);
    }

    @Test
    @DisplayName("查询所有单位")
    void testFindAll() {
        // Given
        when(unitRepository.findAll()).thenReturn(List.of(mlUnit, literUnit));

        // When
        List<Unit> results = unitService.findAll();

        // Then
        assertThat(results).hasSize(2);
        verify(unitRepository).findAll();
    }

    @Test
    @DisplayName("更新单位 - 正常情况")
    void testUpdateUnit_Success() {
        // Given
        UUID unitId = mlUnit.getId();
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(mlUnit));
        when(unitRepository.save(any(Unit.class))).thenReturn(mlUnit);

        mlUnit.setDescription("Updated description");

        // When
        Unit updated = unitService.updateUnit(unitId, mlUnit);

        // Then
        assertThat(updated).isNotNull();
        assertThat(updated.getDescription()).isEqualTo("Updated description");
        verify(unitRepository).findById(unitId);
        verify(unitRepository).save(mlUnit);
    }

    @Test
    @DisplayName("更新单位 - 单位不存在")
    void testUpdateUnit_NotFound_ThrowsException() {
        // Given
        UUID unitId = UUID.randomUUID();
        when(unitRepository.findById(unitId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> unitService.updateUnit(unitId, mlUnit))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unit not found");

        verify(unitRepository).findById(unitId);
        verify(unitRepository, never()).save(any());
    }

    @Test
    @DisplayName("删除单位 - 正常情况（无引用）")
    void testDeleteUnit_Success_NoReferences() {
        // Given
        UUID unitId = mlUnit.getId();
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(mlUnit));
        when(unitRepository.isReferencedByMaterials(unitId)).thenReturn(false);
        when(unitRepository.isReferencedByConversions(unitId)).thenReturn(false);

        // When
        unitService.deleteUnit(unitId);

        // Then
        verify(unitRepository).findById(unitId);
        verify(unitRepository).isReferencedByMaterials(unitId);
        verify(unitRepository).isReferencedByConversions(unitId);
        verify(unitRepository).delete(mlUnit);
    }

    @Test
    @DisplayName("删除单位 - 被物料引用时阻止删除")
    void testDeleteUnit_ReferencedByMaterials_ThrowsException() {
        // Given
        UUID unitId = mlUnit.getId();
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(mlUnit));
        when(unitRepository.isReferencedByMaterials(unitId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> unitService.deleteUnit(unitId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Unit is referenced by materials");

        verify(unitRepository).findById(unitId);
        verify(unitRepository).isReferencedByMaterials(unitId);
        verify(unitRepository, never()).delete(any());
    }

    @Test
    @DisplayName("删除单位 - 被换算规则引用时阻止删除")
    void testDeleteUnit_ReferencedByConversions_ThrowsException() {
        // Given
        UUID unitId = mlUnit.getId();
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(mlUnit));
        when(unitRepository.isReferencedByMaterials(unitId)).thenReturn(false);
        when(unitRepository.isReferencedByConversions(unitId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> unitService.deleteUnit(unitId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Unit is referenced by conversion rules");

        verify(unitRepository).findById(unitId);
        verify(unitRepository).isReferencedByMaterials(unitId);
        verify(unitRepository).isReferencedByConversions(unitId);
        verify(unitRepository, never()).delete(any());
    }
}
