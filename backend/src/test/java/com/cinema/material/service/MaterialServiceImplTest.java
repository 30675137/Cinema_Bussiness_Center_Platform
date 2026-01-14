package com.cinema.material.service;

import com.cinema.material.domain.MaterialCategory;
import com.cinema.material.dto.MaterialRequest;
import com.cinema.material.dto.MaterialResponse;
import com.cinema.material.entity.Material;
import com.cinema.material.exception.MaterialInUseException;
import com.cinema.material.exception.MaterialNotFoundException;
import com.cinema.material.repository.MaterialRepository;
import com.cinema.material.service.impl.MaterialServiceImpl;
import com.cinema.unit.domain.Unit;
import com.cinema.unit.domain.UnitCategory;
import com.cinema.unit.exception.UnitNotFoundException;
import com.cinema.unit.repository.UnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * M001: 物料服务测试类
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("物料服务测试")
class MaterialServiceImplTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private UnitRepository unitRepository;

    @InjectMocks
    private MaterialServiceImpl materialService;

    private Material testMaterial;
    private MaterialRequest testRequest;
    private Unit inventoryUnit;
    private Unit purchaseUnit;
    private UUID testId;
    private UUID inventoryUnitId;
    private UUID purchaseUnitId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        inventoryUnitId = UUID.randomUUID();
        purchaseUnitId = UUID.randomUUID();

        // 准备测试单位
        inventoryUnit = Unit.builder()
                .id(inventoryUnitId)
                .code("ml")
                .name("毫升")
                .category(UnitCategory.VOLUME)
                .decimalPlaces(1)
                .isBaseUnit(true)
                .build();

        purchaseUnit = Unit.builder()
                .id(purchaseUnitId)
                .code("bottle")
                .name("瓶")
                .category(UnitCategory.VOLUME)
                .decimalPlaces(2)
                .isBaseUnit(false)
                .build();

        // 准备测试物料
        testMaterial = Material.builder()
                .id(testId)
                .code("MAT-RAW-001")
                .name("朗姆酒")
                .category(MaterialCategory.RAW_MATERIAL)
                .inventoryUnit(inventoryUnit)
                .purchaseUnit(purchaseUnit)
                .conversionRate(new BigDecimal("500.000000"))
                .useGlobalConversion(false)
                .specification("750ml/瓶")
                .description("进口朗姆酒")
                .standardCost(new BigDecimal("50.00"))
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // 准备测试请求
        testRequest = MaterialRequest.builder()
                .name("朗姆酒")
                .category(MaterialCategory.RAW_MATERIAL)
                .inventoryUnitId(inventoryUnitId)
                .purchaseUnitId(purchaseUnitId)
                .conversionRate(new BigDecimal("500.000000"))
                .useGlobalConversion(false)
                .specification("750ml/瓶")
                .description("进口朗姆酒")
                .standardCost(new BigDecimal("50.00"))
                .status("ACTIVE")
                .build();
    }

    @Test
    @DisplayName("创建物料 - 成功 (自动生成编码)")
    void createMaterial_Success_AutoGenerateCode() {
        // Given
        testRequest.setCode(null); // 不提供编码
        when(unitRepository.findById(inventoryUnitId)).thenReturn(Optional.of(inventoryUnit));
        when(unitRepository.findById(purchaseUnitId)).thenReturn(Optional.of(purchaseUnit));
        when(materialRepository.getNextCodeSequence()).thenReturn(1L);
        when(materialRepository.existsByCode("MAT-RAW-001")).thenReturn(false);
        when(materialRepository.save(any(Material.class))).thenReturn(testMaterial);

        // When
        MaterialResponse response = materialService.createMaterial(testRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("MAT-RAW-001");
        assertThat(response.getName()).isEqualTo(testRequest.getName());
        assertThat(response.getCategory()).isEqualTo(testRequest.getCategory());

        verify(unitRepository).findById(inventoryUnitId);
        verify(unitRepository).findById(purchaseUnitId);
        verify(materialRepository).getNextCodeSequence();
        verify(materialRepository).existsByCode("MAT-RAW-001");
        verify(materialRepository).save(any(Material.class));
    }

    @Test
    @DisplayName("创建物料 - 成功 (包材类别)")
    void createMaterial_Success_PackagingCategory() {
        // Given
        testRequest.setCode(null);
        testRequest.setCategory(MaterialCategory.PACKAGING);
        when(unitRepository.findById(inventoryUnitId)).thenReturn(Optional.of(inventoryUnit));
        when(unitRepository.findById(purchaseUnitId)).thenReturn(Optional.of(purchaseUnit));
        when(materialRepository.getNextCodeSequence()).thenReturn(5L);
        when(materialRepository.existsByCode("MAT-PKG-005")).thenReturn(false);
        
        Material packagingMaterial = Material.builder()
                .id(testId)
                .code("MAT-PKG-005")
                .name("玻璃杯")
                .category(MaterialCategory.PACKAGING)
                .inventoryUnit(inventoryUnit)
                .purchaseUnit(purchaseUnit)
                .build();
        when(materialRepository.save(any(Material.class))).thenReturn(packagingMaterial);

        // When
        MaterialResponse response = materialService.createMaterial(testRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("MAT-PKG-005");
        
        verify(materialRepository).getNextCodeSequence();
        verify(materialRepository).existsByCode("MAT-PKG-005");
    }

    @Test
    @DisplayName("创建物料 - 成功 (手动指定编码)")
    void createMaterial_Success_WithProvidedCode() {
        // Given
        testRequest.setCode("MAT-RAW-999");
        when(unitRepository.findById(inventoryUnitId)).thenReturn(Optional.of(inventoryUnit));
        when(unitRepository.findById(purchaseUnitId)).thenReturn(Optional.of(purchaseUnit));
        when(materialRepository.existsByCode("MAT-RAW-999")).thenReturn(false);
        
        testMaterial.setCode("MAT-RAW-999");
        when(materialRepository.save(any(Material.class))).thenReturn(testMaterial);

        // When
        MaterialResponse response = materialService.createMaterial(testRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("MAT-RAW-999");
        
        verify(materialRepository, never()).getNextCodeSequence();
        verify(materialRepository).existsByCode("MAT-RAW-999");
    }

    @Test
    @DisplayName("创建物料 - 失败 (库存单位不存在)")
    void createMaterial_Fail_InventoryUnitNotFound() {
        // Given
        when(unitRepository.findById(inventoryUnitId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> materialService.createMaterial(testRequest))
                .isInstanceOf(UnitNotFoundException.class)
                .hasMessageContaining("Inventory unit not found");

        verify(unitRepository).findById(inventoryUnitId);
        verify(materialRepository, never()).save(any(Material.class));
    }

    @Test
    @DisplayName("创建物料 - 失败 (采购单位不存在)")
    void createMaterial_Fail_PurchaseUnitNotFound() {
        // Given
        when(unitRepository.findById(inventoryUnitId)).thenReturn(Optional.of(inventoryUnit));
        when(unitRepository.findById(purchaseUnitId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> materialService.createMaterial(testRequest))
                .isInstanceOf(UnitNotFoundException.class)
                .hasMessageContaining("Purchase unit not found");

        verify(unitRepository).findById(purchaseUnitId);
        verify(materialRepository, never()).save(any(Material.class));
    }

    @Test
    @DisplayName("创建物料 - 失败 (编码已存在)")
    void createMaterial_Fail_CodeExists() {
        // Given
        testRequest.setCode("MAT-RAW-001");
        when(unitRepository.findById(inventoryUnitId)).thenReturn(Optional.of(inventoryUnit));
        when(unitRepository.findById(purchaseUnitId)).thenReturn(Optional.of(purchaseUnit));
        when(materialRepository.existsByCode("MAT-RAW-001")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> materialService.createMaterial(testRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Material code already exists");

        verify(materialRepository).existsByCode("MAT-RAW-001");
        verify(materialRepository, never()).save(any(Material.class));
    }

    @Test
    @DisplayName("更新物料 - 成功")
    void updateMaterial_Success() {
        // Given
        MaterialRequest updateRequest = MaterialRequest.builder()
                .name("朗姆酒(更新)")
                .standardCost(new BigDecimal("55.00"))
                .description("更新后的描述")
                .build();
        
        when(materialRepository.findById(testId)).thenReturn(Optional.of(testMaterial));
        when(materialRepository.save(any(Material.class))).thenReturn(testMaterial);

        // When
        MaterialResponse response = materialService.updateMaterial(testId, updateRequest);

        // Then
        assertThat(response).isNotNull();
        verify(materialRepository).findById(testId);
        verify(materialRepository).save(any(Material.class));
    }

    @Test
    @DisplayName("更新物料 - 失败 (物料不存在)")
    void updateMaterial_Fail_MaterialNotFound() {
        // Given
        when(materialRepository.findById(testId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> materialService.updateMaterial(testId, testRequest))
                .isInstanceOf(MaterialNotFoundException.class)
                .hasMessageContaining("Material not found");

        verify(materialRepository).findById(testId);
        verify(materialRepository, never()).save(any(Material.class));
    }

    @Test
    @DisplayName("删除物料 - 成功")
    void deleteMaterial_Success() {
        // Given
        when(materialRepository.findById(testId)).thenReturn(Optional.of(testMaterial));
        when(materialRepository.isReferencedByBomComponents(testId)).thenReturn(false);
        when(materialRepository.isReferencedByInventory(testId)).thenReturn(false);

        // When
        materialService.deleteMaterial(testId);

        // Then
        verify(materialRepository).findById(testId);
        verify(materialRepository).isReferencedByBomComponents(testId);
        verify(materialRepository).isReferencedByInventory(testId);
        verify(materialRepository).delete(testMaterial);
    }

    @Test
    @DisplayName("删除物料 - 失败 (物料不存在)")
    void deleteMaterial_Fail_MaterialNotFound() {
        // Given
        when(materialRepository.findById(testId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> materialService.deleteMaterial(testId))
                .isInstanceOf(MaterialNotFoundException.class)
                .hasMessageContaining("Material not found");

        verify(materialRepository).findById(testId);
        verify(materialRepository, never()).delete(any(Material.class));
    }

    @Test
    @DisplayName("删除物料 - 失败 (被BOM引用)")
    void deleteMaterial_Fail_ReferencedByBom() {
        // Given
        when(materialRepository.findById(testId)).thenReturn(Optional.of(testMaterial));
        when(materialRepository.isReferencedByBomComponents(testId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> materialService.deleteMaterial(testId))
                .isInstanceOf(MaterialInUseException.class)
                .hasMessageContaining("referenced by BOM components");

        verify(materialRepository).findById(testId);
        verify(materialRepository).isReferencedByBomComponents(testId);
        verify(materialRepository, never()).delete(any(Material.class));
    }

    @Test
    @DisplayName("删除物料 - 失败 (被库存引用)")
    void deleteMaterial_Fail_ReferencedByInventory() {
        // Given
        when(materialRepository.findById(testId)).thenReturn(Optional.of(testMaterial));
        when(materialRepository.isReferencedByBomComponents(testId)).thenReturn(false);
        when(materialRepository.isReferencedByInventory(testId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> materialService.deleteMaterial(testId))
                .isInstanceOf(MaterialInUseException.class)
                .hasMessageContaining("referenced by inventory");

        verify(materialRepository).isReferencedByInventory(testId);
        verify(materialRepository, never()).delete(any(Material.class));
    }

    @Test
    @DisplayName("根据ID获取物料 - 成功")
    void getMaterialById_Success() {
        // Given
        when(materialRepository.findById(testId)).thenReturn(Optional.of(testMaterial));

        // When
        MaterialResponse response = materialService.getMaterialById(testId);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(testId);
        assertThat(response.getCode()).isEqualTo(testMaterial.getCode());

        verify(materialRepository).findById(testId);
    }

    @Test
    @DisplayName("根据ID获取物料 - 失败 (不存在)")
    void getMaterialById_Fail_NotFound() {
        // Given
        when(materialRepository.findById(testId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> materialService.getMaterialById(testId))
                .isInstanceOf(MaterialNotFoundException.class)
                .hasMessageContaining("Material not found");

        verify(materialRepository).findById(testId);
    }

    @Test
    @DisplayName("根据编码获取物料 - 成功")
    void getMaterialByCode_Success() {
        // Given
        when(materialRepository.findByCode("MAT-RAW-001")).thenReturn(Optional.of(testMaterial));

        // When
        MaterialResponse response = materialService.getMaterialByCode("MAT-RAW-001");

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getCode()).isEqualTo("MAT-RAW-001");

        verify(materialRepository).findByCode("MAT-RAW-001");
    }

    @Test
    @DisplayName("获取所有物料")
    void getAllMaterials() {
        // Given
        Material material2 = Material.builder()
                .id(UUID.randomUUID())
                .code("MAT-PKG-001")
                .name("玻璃杯")
                .category(MaterialCategory.PACKAGING)
                .inventoryUnit(inventoryUnit)
                .purchaseUnit(purchaseUnit)
                .status("ACTIVE")
                .build();

        List<Material> materials = Arrays.asList(testMaterial, material2);
        when(materialRepository.findAll()).thenReturn(materials);

        // When
        List<MaterialResponse> responses = materialService.getAllMaterials();

        // Then
        assertThat(responses).hasSize(2);
        assertThat(responses).extracting(MaterialResponse::getCode)
                .containsExactlyInAnyOrder("MAT-RAW-001", "MAT-PKG-001");

        verify(materialRepository).findAll();
    }

    @Test
    @DisplayName("根据分类获取物料")
    void getMaterialsByCategory() {
        // Given
        List<Material> materials = Arrays.asList(testMaterial);
        when(materialRepository.findByCategory(MaterialCategory.RAW_MATERIAL)).thenReturn(materials);

        // When
        List<MaterialResponse> responses = materialService.getMaterialsByCategory(MaterialCategory.RAW_MATERIAL);

        // Then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getCategory()).isEqualTo(MaterialCategory.RAW_MATERIAL);

        verify(materialRepository).findByCategory(MaterialCategory.RAW_MATERIAL);
    }

    @Test
    @DisplayName("根据分类和状态获取物料")
    void getMaterialsByCategoryAndStatus() {
        // Given
        List<Material> materials = Arrays.asList(testMaterial);
        when(materialRepository.findByCategoryAndStatus(MaterialCategory.RAW_MATERIAL, "ACTIVE"))
                .thenReturn(materials);

        // When
        List<MaterialResponse> responses = materialService.getMaterialsByCategoryAndStatus(
                MaterialCategory.RAW_MATERIAL, "ACTIVE");

        // Then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getCategory()).isEqualTo(MaterialCategory.RAW_MATERIAL);
        assertThat(responses.get(0).getStatus()).isEqualTo("ACTIVE");

        verify(materialRepository).findByCategoryAndStatus(MaterialCategory.RAW_MATERIAL, "ACTIVE");
    }
}
