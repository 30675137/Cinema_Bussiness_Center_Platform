/** @spec M001-material-unit-system */
package com.cinema.material.service;

import com.cinema.material.entity.Material;
import com.cinema.material.repository.MaterialRepository;
import com.cinema.unit.entity.Unit;
import com.cinema.unit.repository.UnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MaterialService Tests")
class MaterialServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private UnitRepository unitRepository;

    @InjectMocks
    private MaterialService materialService;

    private Unit mlUnit;
    private Unit lUnit;
    private Material rawMaterial;
    private UUID materialId;
    private UUID unitId;

    @BeforeEach
    void setUp() {
        materialId = UUID.randomUUID();
        unitId = UUID.randomUUID();

        mlUnit = Unit.builder()
                .id(unitId)
                .code("ml")
                .name("毫升")
                .category(Unit.UnitCategory.VOLUME)
                .decimalPlaces(2)
                .isBaseUnit(true)
                .build();

        lUnit = Unit.builder()
                .id(UUID.randomUUID())
                .code("L")
                .name("升")
                .category(Unit.UnitCategory.VOLUME)
                .decimalPlaces(2)
                .isBaseUnit(false)
                .build();

        rawMaterial = Material.builder()
                .id(materialId)
                .code("MAT-RAW-001")
                .name("糖浆")
                .category(Material.MaterialCategory.RAW_MATERIAL)
                .inventoryUnit(mlUnit)
                .purchaseUnit(lUnit)
                .conversionRate(new BigDecimal("1000.00"))
                .useGlobalConversion(false)
                .build();
    }

    @Test
    @DisplayName("创建物料 - 正常情况")
    void testCreateMaterial_Success() {
        when(unitRepository.findById(mlUnit.getId())).thenReturn(Optional.of(mlUnit));
        when(unitRepository.findById(lUnit.getId())).thenReturn(Optional.of(lUnit));
        when(materialRepository.getNextCodeSequence()).thenReturn(1L);
        when(materialRepository.existsByCode("MAT-RAW-001")).thenReturn(false);
        when(materialRepository.save(any(Material.class))).thenReturn(rawMaterial);

        Material created = materialService.createMaterial(rawMaterial);

        assertThat(created).isNotNull();
        assertThat(created.getCode()).isEqualTo("MAT-RAW-001");
        assertThat(created.getCategory()).isEqualTo(Material.MaterialCategory.RAW_MATERIAL);
        verify(materialRepository).save(rawMaterial);
    }

    @Test
    @DisplayName("创建物料 - 自动生成编码")
    void testCreateMaterial_AutoGenerateCode() {
        rawMaterial.setCode(null);
        when(unitRepository.findById(any(UUID.class))).thenReturn(Optional.of(mlUnit));
        when(materialRepository.getNextCodeSequence()).thenReturn(5L);
        when(materialRepository.existsByCode(anyString())).thenReturn(false);
        when(materialRepository.save(any(Material.class))).thenAnswer(invocation -> {
            Material mat = invocation.getArgument(0);
            mat.setCode("MAT-RAW-005");
            return mat;
        });

        Material created = materialService.createMaterial(rawMaterial);

        assertThat(created.getCode()).isEqualTo("MAT-RAW-005");
        verify(materialRepository).getNextCodeSequence();
    }

    @Test
    @DisplayName("创建物料 - 库存单位不存在时抛出异常")
    void testCreateMaterial_InventoryUnitNotFound_ThrowsException() {
        when(unitRepository.findById(mlUnit.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> materialService.createMaterial(rawMaterial))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Inventory unit not found");

        verify(materialRepository, never()).save(any());
    }

    @Test
    @DisplayName("创建物料 - 采购单位不存在时抛出异常")
    void testCreateMaterial_PurchaseUnitNotFound_ThrowsException() {
        when(unitRepository.findById(mlUnit.getId())).thenReturn(Optional.of(mlUnit));
        when(unitRepository.findById(lUnit.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> materialService.createMaterial(rawMaterial))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Purchase unit not found");

        verify(materialRepository, never()).save(any());
    }

    @Test
    @DisplayName("创建物料 - 物料编码已存在时抛出异常")
    void testCreateMaterial_CodeExists_ThrowsException() {
        when(unitRepository.findById(any(UUID.class))).thenReturn(Optional.of(mlUnit));
        when(materialRepository.existsByCode("MAT-RAW-001")).thenReturn(true);

        assertThatThrownBy(() -> materialService.createMaterial(rawMaterial))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Material code already exists");

        verify(materialRepository, never()).save(any());
    }

    @Test
    @DisplayName("按ID查询物料 - 正常情况")
    void testFindById_Success() {
        when(materialRepository.findById(materialId)).thenReturn(Optional.of(rawMaterial));

        Material found = materialService.findById(materialId);

        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(materialId);
        assertThat(found.getCode()).isEqualTo("MAT-RAW-001");
    }

    @Test
    @DisplayName("按ID查询物料 - 物料不存在时抛出异常")
    void testFindById_NotFound_ThrowsException() {
        when(materialRepository.findById(materialId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> materialService.findById(materialId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Material not found");
    }

    @Test
    @DisplayName("按编码查询物料 - 正常情况")
    void testFindByCode_Success() {
        when(materialRepository.findByCode("MAT-RAW-001")).thenReturn(Optional.of(rawMaterial));

        Material found = materialService.findByCode("MAT-RAW-001");

        assertThat(found).isNotNull();
        assertThat(found.getCode()).isEqualTo("MAT-RAW-001");
    }

    @Test
    @DisplayName("按分类查询物料列表")
    void testFindByCategory() {
        Material packagingMaterial = Material.builder()
                .code("MAT-PKG-001")
                .category(Material.MaterialCategory.PACKAGING)
                .build();

        when(materialRepository.findByCategory(Material.MaterialCategory.RAW_MATERIAL))
                .thenReturn(Arrays.asList(rawMaterial));
        when(materialRepository.findByCategory(Material.MaterialCategory.PACKAGING))
                .thenReturn(Arrays.asList(packagingMaterial));

        List<Material> rawMaterials = materialService.findByCategory(Material.MaterialCategory.RAW_MATERIAL);
        List<Material> packagingMaterials = materialService.findByCategory(Material.MaterialCategory.PACKAGING);

        assertThat(rawMaterials).hasSize(1);
        assertThat(rawMaterials.get(0).getCategory()).isEqualTo(Material.MaterialCategory.RAW_MATERIAL);

        assertThat(packagingMaterials).hasSize(1);
        assertThat(packagingMaterials.get(0).getCategory()).isEqualTo(Material.MaterialCategory.PACKAGING);
    }

    @Test
    @DisplayName("查询所有物料")
    void testFindAll() {
        when(materialRepository.findAll()).thenReturn(Arrays.asList(rawMaterial));

        List<Material> materials = materialService.findAll();

        assertThat(materials).hasSize(1);
        assertThat(materials.get(0).getCode()).isEqualTo("MAT-RAW-001");
    }

    @Test
    @DisplayName("更新物料 - 正常情况")
    void testUpdateMaterial_Success() {
        Material updatedMaterial = Material.builder()
                .id(materialId)
                .code("MAT-RAW-001")
                .name("糖浆（更新）")
                .category(Material.MaterialCategory.RAW_MATERIAL)
                .inventoryUnit(mlUnit)
                .purchaseUnit(lUnit)
                .conversionRate(new BigDecimal("1200.00"))
                .useGlobalConversion(true)
                .build();

        when(materialRepository.findById(materialId)).thenReturn(Optional.of(rawMaterial));
        when(unitRepository.findById(mlUnit.getId())).thenReturn(Optional.of(mlUnit));
        when(unitRepository.findById(lUnit.getId())).thenReturn(Optional.of(lUnit));
        when(materialRepository.save(any(Material.class))).thenReturn(updatedMaterial);

        Material updated = materialService.updateMaterial(materialId, updatedMaterial);

        assertThat(updated.getName()).isEqualTo("糖浆（更新）");
        assertThat(updated.getConversionRate()).isEqualByComparingTo(new BigDecimal("1200.00"));
        assertThat(updated.getUseGlobalConversion()).isTrue();
        verify(materialRepository).save(any(Material.class));
    }

    @Test
    @DisplayName("更新物料 - 物料不存在时抛出异常")
    void testUpdateMaterial_NotFound_ThrowsException() {
        when(materialRepository.findById(materialId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> materialService.updateMaterial(materialId, rawMaterial))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Material not found");

        verify(materialRepository, never()).save(any());
    }

    @Test
    @DisplayName("删除物料 - 正常情况")
    void testDeleteMaterial_Success() {
        when(materialRepository.findById(materialId)).thenReturn(Optional.of(rawMaterial));
        when(materialRepository.isReferencedByBomComponents(materialId)).thenReturn(false);

        materialService.deleteMaterial(materialId);

        verify(materialRepository).delete(rawMaterial);
    }

    @Test
    @DisplayName("删除物料 - 被BOM引用时阻止删除")
    void testDeleteMaterial_ReferencedByBom_ThrowsException() {
        when(materialRepository.findById(materialId)).thenReturn(Optional.of(rawMaterial));
        when(materialRepository.isReferencedByBomComponents(materialId)).thenReturn(true);

        assertThatThrownBy(() -> materialService.deleteMaterial(materialId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Material is referenced by BOM components");

        verify(materialRepository, never()).delete((Material) any());
    }

    @Test
    @DisplayName("删除物料 - 物料不存在时抛出异常")
    void testDeleteMaterial_NotFound_ThrowsException() {
        when(materialRepository.findById(materialId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> materialService.deleteMaterial(materialId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Material not found");

        verify(materialRepository, never()).delete((Material) any());
    }
}
