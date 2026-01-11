/** @spec M001-material-unit-system */
package com.cinema.material.integration;

import com.cinema.integration.BaseIntegrationTest;
import com.cinema.material.dto.MaterialCreateRequest;
import com.cinema.material.dto.MaterialResponse;
import com.cinema.material.dto.MaterialUpdateRequest;
import com.cinema.material.entity.Material;
import com.cinema.common.dto.ApiResponse;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for Material REST API.
 *
 * Tests the complete request-response cycle including:
 * - HTTP endpoints
 * - Request/response serialization
 * - Business logic
 * - Database persistence
 */
@DisplayName("Material API Integration Tests")
class MaterialIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("创建物料 - 完整流程")
    void testCreateMaterial_FullFlow() {
        // Prepare request
        MaterialCreateRequest request = MaterialCreateRequest.builder()
                .name("可乐糖浆")
                .category(Material.MaterialCategory.RAW_MATERIAL)
                .specification("5L装")
                .inventoryUnitId(UUID.randomUUID())
                .purchaseUnitId(UUID.randomUUID())
                .conversionRate(new BigDecimal("1000.00"))
                .useGlobalConversion(false)
                .build();

        // Send POST request
        ResponseEntity<ApiResponse<MaterialResponse>> response = restTemplate.exchange(
                getBaseUrl() + "/materials",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<MaterialResponse>>() {}
        );

        // Assertions
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();

        MaterialResponse material = response.getBody().getData();
        assertThat(material.getId()).isNotNull();
        assertThat(material.getCode()).matches("MAT-RAW-\\d{3}");
        assertThat(material.getName()).isEqualTo("可乐糖浆");
        assertThat(material.getCategory()).isEqualTo(Material.MaterialCategory.RAW_MATERIAL);
        assertThat(material.getConversionRate()).isEqualByComparingTo(new BigDecimal("1000.00"));
    }

    @Test
    @DisplayName("查询物料列表 - 按分类筛选")
    void testListMaterials_FilterByCategory() {
        // Create test materials
        createMaterial("原料A", Material.MaterialCategory.RAW_MATERIAL);
        createMaterial("原料B", Material.MaterialCategory.RAW_MATERIAL);
        createMaterial("包装A", Material.MaterialCategory.PACKAGING);

        // Query by category
        ResponseEntity<ApiResponse<List<MaterialResponse>>> response = restTemplate.exchange(
                getBaseUrl() + "/materials?category=RAW_MATERIAL",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<List<MaterialResponse>>>() {}
        );

        // Assertions
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();

        List<MaterialResponse> materials = response.getBody().getData();
        assertThat(materials).hasSize(2);
        assertThat(materials).allMatch(m -> m.getCategory() == Material.MaterialCategory.RAW_MATERIAL);
    }

    @Test
    @DisplayName("更新物料 - 换算率修改")
    void testUpdateMaterial_ConversionRate() {
        // Create material
        MaterialResponse created = createMaterial("可乐糖浆", Material.MaterialCategory.RAW_MATERIAL);

        // Update request
        MaterialUpdateRequest updateRequest = MaterialUpdateRequest.builder()
                .name("可乐糖浆")
                .specification("5L装（新版）")
                .conversionRate(new BigDecimal("500.00"))  // Change rate
                .useGlobalConversion(false)
                .build();

        // Send PUT request
        ResponseEntity<ApiResponse<MaterialResponse>> response = restTemplate.exchange(
                getBaseUrl() + "/materials/" + created.getId(),
                HttpMethod.PUT,
                new HttpEntity<>(updateRequest),
                new ParameterizedTypeReference<ApiResponse<MaterialResponse>>() {}
        );

        // Assertions
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();

        MaterialResponse updated = response.getBody().getData();
        assertThat(updated.getSpecification()).isEqualTo("5L装（新版）");
        assertThat(updated.getConversionRate()).isEqualByComparingTo(new BigDecimal("500.00"));
    }

    @Test
    @DisplayName("删除物料 - 成功删除")
    void testDeleteMaterial_Success() {
        // Create material
        MaterialResponse created = createMaterial("测试物料", Material.MaterialCategory.RAW_MATERIAL);

        // Send DELETE request
        ResponseEntity<Void> response = restTemplate.exchange(
                getBaseUrl() + "/materials/" + created.getId(),
                HttpMethod.DELETE,
                null,
                Void.class
        );

        // Assertions
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // Verify deleted
        ResponseEntity<ApiResponse<MaterialResponse>> getResponse = restTemplate.exchange(
                getBaseUrl() + "/materials/" + created.getId(),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<MaterialResponse>>() {}
        );
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("创建物料 - 验证失败（空名称）")
    void testCreateMaterial_ValidationFailure() {
        // Invalid request (empty name)
        MaterialCreateRequest request = MaterialCreateRequest.builder()
                .name("")  // Invalid
                .category(Material.MaterialCategory.RAW_MATERIAL)
                .build();

        // Send POST request
        ResponseEntity<ApiResponse<MaterialResponse>> response = restTemplate.exchange(
                getBaseUrl() + "/materials",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<MaterialResponse>>() {}
        );

        // Assertions
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
    }

    @Test
    @DisplayName("查询单个物料 - 不存在")
    void testGetMaterial_NotFound() {
        UUID nonExistentId = UUID.randomUUID();

        ResponseEntity<ApiResponse<MaterialResponse>> response = restTemplate.exchange(
                getBaseUrl() + "/materials/" + nonExistentId,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<MaterialResponse>>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // Helper method
    private MaterialResponse createMaterial(String name, Material.MaterialCategory category) {
        MaterialCreateRequest request = MaterialCreateRequest.builder()
                .name(name)
                .category(category)
                .specification("测试规格")
                .inventoryUnitId(UUID.randomUUID())
                .purchaseUnitId(UUID.randomUUID())
                .conversionRate(new BigDecimal("1.00"))
                .useGlobalConversion(true)
                .build();

        ResponseEntity<ApiResponse<MaterialResponse>> response = restTemplate.exchange(
                getBaseUrl() + "/materials",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<MaterialResponse>>() {}
        );

        return response.getBody().getData();
    }
}
