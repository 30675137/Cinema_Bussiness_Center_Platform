/**
 * @spec M002-material-filter
 * Material Service Filter Test - 物料服务筛选逻辑测试
 * User Story: US1 - 快速筛选物料
 */
package com.cinema.material.service;

import com.cinema.material.dto.MaterialFilterDTO;
import com.cinema.material.entity.Material;
import com.cinema.material.entity.MaterialStatus;
import com.cinema.material.repository.MaterialRepository;
import com.cinema.unit.entity.Unit;
import com.cinema.unit.repository.UnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MaterialService 筛选功能测试
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MaterialServiceFilterTest {

    @Autowired
    private MaterialService materialService;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private UnitRepository unitRepository;

    private Unit testUnit;

    @BeforeEach
    void setUp() {
        // 清理测试数据
        materialRepository.deleteAll();

        // 创建测试单位
        testUnit = Unit.builder()
                .name("测试单位")
                .code("TEST")
                .category(Unit.UnitCategory.COUNT)
                .decimalPlaces(2)
                .isBaseUnit(true)
                .build();
        testUnit = unitRepository.save(testUnit);

        // 创建测试物料
        createTestMaterial("MAT-RAW-001", "原料A", Material.MaterialCategory.RAW_MATERIAL, "ACTIVE", new BigDecimal("10.00"));
        createTestMaterial("MAT-RAW-002", "原料B", Material.MaterialCategory.RAW_MATERIAL, "ACTIVE", new BigDecimal("20.00"));
        createTestMaterial("MAT-PKG-001", "包材A", Material.MaterialCategory.PACKAGING, "ACTIVE", new BigDecimal("15.00"));
        createTestMaterial("MAT-PKG-002", "包材B", Material.MaterialCategory.PACKAGING, "INACTIVE", new BigDecimal("25.00"));
    }

    private void createTestMaterial(String code, String name, Material.MaterialCategory category, String status, BigDecimal cost) {
        Material material = Material.builder()
                .code(code)
                .name(name)
                .category(category)
                .inventoryUnit(testUnit)
                .purchaseUnit(testUnit)
                .useGlobalConversion(true)
                .standardCost(cost)
                .status(status)
                .build();
        materialRepository.save(material);
    }

    @Test
    @DisplayName("测试按分类筛选")
    void testFilterByCategory() {
        MaterialFilterDTO filter = new MaterialFilterDTO();
        filter.setCategory(Material.MaterialCategory.RAW_MATERIAL);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Material> result = materialService.filterMaterials(filter, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).allMatch(m -> m.getCategory() == Material.MaterialCategory.RAW_MATERIAL);
    }

    @Test
    @DisplayName("测试按状态筛选")
    void testFilterByStatus() {
        MaterialFilterDTO filter = new MaterialFilterDTO();
        filter.setStatus(MaterialStatus.ACTIVE);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Material> result = materialService.filterMaterials(filter, pageable);

        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent()).allMatch(m -> "ACTIVE".equals(m.getStatus()));
    }

    @Test
    @DisplayName("测试按成本范围筛选")
    void testFilterByCostRange() {
        MaterialFilterDTO filter = new MaterialFilterDTO();
        filter.setMinCost(new BigDecimal("15.00"));
        filter.setMaxCost(new BigDecimal("20.00"));

        Pageable pageable = PageRequest.of(0, 10);
        Page<Material> result = materialService.filterMaterials(filter, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).allMatch(m ->
                m.getStandardCost().compareTo(new BigDecimal("15.00")) >= 0 &&
                        m.getStandardCost().compareTo(new BigDecimal("20.00")) <= 0
        );
    }

    @Test
    @DisplayName("测试按关键词搜索（物料编码）")
    void testFilterByKeywordCode() {
        MaterialFilterDTO filter = new MaterialFilterDTO();
        filter.setKeyword("MAT-RAW");

        Pageable pageable = PageRequest.of(0, 10);
        Page<Material> result = materialService.filterMaterials(filter, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).allMatch(m -> m.getCode().contains("MAT-RAW"));
    }

    @Test
    @DisplayName("测试按关键词搜索（物料名称）")
    void testFilterByKeywordName() {
        MaterialFilterDTO filter = new MaterialFilterDTO();
        filter.setKeyword("原料");

        Pageable pageable = PageRequest.of(0, 10);
        Page<Material> result = materialService.filterMaterials(filter, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).allMatch(m -> m.getName().contains("原料"));
    }

    @Test
    @DisplayName("测试组合筛选（分类 + 状态）")
    void testFilterByCategoryAndStatus() {
        MaterialFilterDTO filter = new MaterialFilterDTO();
        filter.setCategory(Material.MaterialCategory.PACKAGING);
        filter.setStatus(MaterialStatus.ACTIVE);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Material> result = materialService.filterMaterials(filter, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCode()).isEqualTo("MAT-PKG-001");
    }

    @Test
    @DisplayName("测试空筛选条件（返回所有）")
    void testFilterEmpty() {
        MaterialFilterDTO filter = new MaterialFilterDTO();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Material> result = materialService.filterMaterials(filter, pageable);

        assertThat(result.getContent()).hasSize(4);
    }

    @Test
    @DisplayName("测试分页功能")
    void testPagination() {
        MaterialFilterDTO filter = new MaterialFilterDTO();

        Pageable pageable = PageRequest.of(0, 2);
        Page<Material> result = materialService.filterMaterials(filter, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(4);
        assertThat(result.getTotalPages()).isEqualTo(2);
    }
}
