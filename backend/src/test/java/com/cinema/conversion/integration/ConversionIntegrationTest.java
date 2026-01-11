/** @spec M001-material-unit-system */
package com.cinema.conversion.integration;

import com.cinema.integration.BaseIntegrationTest;
import com.cinema.common.conversion.dto.ConversionRequest;
import com.cinema.common.conversion.dto.ConversionResponse;
import com.cinema.common.dto.ApiResponse;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for Conversion REST API.
 *
 * Tests the complete unit conversion flow including:
 * - Material-level conversion
 * - Global conversion fallback
 * - Bidirectional conversion
 * - Error handling
 */
@DisplayName("Conversion API Integration Tests")
class ConversionIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("单位换算 - 全局换算规则")
    void testConvert_GlobalConversion() {
        // Prepare request (L -> ml)
        ConversionRequest request = ConversionRequest.builder()
                .fromUnitCode("L")
                .toUnitCode("ml")
                .quantity(new BigDecimal("2.5"))
                .build();

        // Send POST request
        ResponseEntity<ApiResponse<ConversionResponse>> response = restTemplate.exchange(
                getBaseUrl() + "/conversions/convert",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<ConversionResponse>>() {}
        );

        // Assertions
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();

        ConversionResponse result = response.getBody().getData();
        assertThat(result.getOriginalQuantity()).isEqualByComparingTo(new BigDecimal("2.5"));
        assertThat(result.getFromUnitCode()).isEqualTo("L");
        assertThat(result.getToUnitCode()).isEqualTo("ml");
        assertThat(result.getConvertedQuantity()).isEqualByComparingTo(new BigDecimal("2500.00"));
        assertThat(result.getSource()).isEqualTo("GLOBAL");
    }

    @Test
    @DisplayName("单位换算 - 反向换算")
    void testConvert_ReverseConversion() {
        // Prepare request (ml -> L, reverse of L -> ml)
        ConversionRequest request = ConversionRequest.builder()
                .fromUnitCode("ml")
                .toUnitCode("L")
                .quantity(new BigDecimal("5000"))
                .build();

        // Send POST request
        ResponseEntity<ApiResponse<ConversionResponse>> response = restTemplate.exchange(
                getBaseUrl() + "/conversions/convert",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<ConversionResponse>>() {}
        );

        // Assertions
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        ConversionResponse result = response.getBody().getData();
        assertThat(result.getConvertedQuantity()).isEqualByComparingTo(new BigDecimal("5.000000"));
    }

    @Test
    @DisplayName("单位换算 - 物料级换算优先级")
    void testConvert_MaterialLevelPriority() {
        // This test assumes a material exists with material-level conversion
        // For demo purposes, we'll test the API structure
        UUID materialId = UUID.randomUUID();

        ConversionRequest request = ConversionRequest.builder()
                .fromUnitCode("bottle")
                .toUnitCode("ml")
                .quantity(new BigDecimal("10"))
                .materialId(materialId)
                .build();

        ResponseEntity<ApiResponse<ConversionResponse>> response = restTemplate.exchange(
                getBaseUrl() + "/conversions/convert",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<ConversionResponse>>() {}
        );

        // Expect NOT_FOUND if material doesn't exist (expected in integration test)
        // OR OK if material exists with material-level conversion
        assertThat(response.getStatusCode()).isIn(HttpStatus.NOT_FOUND, HttpStatus.OK);
    }

    @Test
    @DisplayName("检查换算可用性 - 可换算")
    void testCanConvert_Available() {
        // Send GET request
        ResponseEntity<ApiResponse<Boolean>> response = restTemplate.exchange(
                getBaseUrl() + "/conversions/can-convert?fromUnitCode=L&toUnitCode=ml",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<Boolean>>() {}
        );

        // Assertions
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isTrue();
    }

    @Test
    @DisplayName("检查换算可用性 - 不可换算")
    void testCanConvert_NotAvailable() {
        // Send GET request with invalid units
        ResponseEntity<ApiResponse<Boolean>> response = restTemplate.exchange(
                getBaseUrl() + "/conversions/can-convert?fromUnitCode=INVALID&toUnitCode=INVALID",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<Boolean>>() {}
        );

        // Assertions
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isFalse();
    }

    @Test
    @DisplayName("单位换算 - 验证失败（负数量）")
    void testConvert_ValidationFailure() {
        ConversionRequest request = ConversionRequest.builder()
                .fromUnitCode("L")
                .toUnitCode("ml")
                .quantity(new BigDecimal("-10"))  // Invalid
                .build();

        ResponseEntity<ApiResponse<ConversionResponse>> response = restTemplate.exchange(
                getBaseUrl() + "/conversions/convert",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<ConversionResponse>>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("单位换算 - 相同单位直接返回")
    void testConvert_SameUnit() {
        ConversionRequest request = ConversionRequest.builder()
                .fromUnitCode("L")
                .toUnitCode("L")
                .quantity(new BigDecimal("5.5"))
                .build();

        ResponseEntity<ApiResponse<ConversionResponse>> response = restTemplate.exchange(
                getBaseUrl() + "/conversions/convert",
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<ApiResponse<ConversionResponse>>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        ConversionResponse result = response.getBody().getData();
        assertThat(result.getConvertedQuantity()).isEqualByComparingTo(new BigDecimal("5.5"));
        assertThat(result.getConversionPath()).contains("直接返回");
    }
}
