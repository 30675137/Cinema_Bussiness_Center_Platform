/**
 * @spec O003-beverage-order
 * API响应格式验证工具测试
 */
package com.cinema.common.util;

import com.cinema.common.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * ApiResponseFormatValidator 测试类
 *
 * 验证API响应格式验证工具的各种场景
 */
class ApiResponseFormatValidatorTest {

    private ApiResponseFormatValidator validator;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        validator = new ApiResponseFormatValidator(objectMapper);
    }

    @Test
    @DisplayName("应成功验证标准成功响应格式")
    void shouldValidateStandardSuccessResponse() throws Exception {
        // Given: 标准成功响应
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("data", Map.of("id", 1, "name", "拿铁咖啡"));
        responseBody.put("timestamp", LocalDateTime.now().toString());

        MvcResult mvcResult = createMvcResult(responseBody, 200);

        // When & Then: 验证应通过
        assertDoesNotThrow(() -> validator.validateSuccessResponse(mvcResult));
    }

    @Test
    @DisplayName("应检测到缺少success字段的错误")
    void shouldDetectMissingSuccessField() throws Exception {
        // Given: 缺少success字段的响应
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("data", Map.of("id", 1));
        responseBody.put("timestamp", LocalDateTime.now().toString());

        MvcResult mvcResult = createMvcResult(responseBody, 200);

        // When & Then: 应抛出AssertionError
        AssertionError error = assertThrows(
            AssertionError.class,
            () -> validator.validateSuccessResponse(mvcResult)
        );
        assertTrue(error.getMessage().contains("success字段"));
    }

    @Test
    @DisplayName("应检测到缺少data字段的错误")
    void shouldDetectMissingDataField() throws Exception {
        // Given: 缺少data字段的响应
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("timestamp", LocalDateTime.now().toString());

        MvcResult mvcResult = createMvcResult(responseBody, 200);

        // When & Then: 应抛出AssertionError
        AssertionError error = assertThrows(
            AssertionError.class,
            () -> validator.validateSuccessResponse(mvcResult)
        );
        assertTrue(error.getMessage().contains("data字段"));
    }

    @Test
    @DisplayName("应成功验证标准错误响应格式")
    void shouldValidateStandardErrorResponse() throws Exception {
        // Given: 标准错误响应
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", false);
        responseBody.put("error", "BEV_NTF_001");
        responseBody.put("message", "饮品不存在");
        responseBody.put("timestamp", LocalDateTime.now().toString());

        MvcResult mvcResult = createMvcResult(responseBody, 404);

        // When & Then: 验证应通过
        assertDoesNotThrow(() -> validator.validateErrorResponse(mvcResult));
    }

    @Test
    @DisplayName("应检测到错误码格式不正确")
    void shouldDetectInvalidErrorCodeFormat() throws Exception {
        // Given: 错误码格式不正确的响应
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", false);
        responseBody.put("error", "INVALID_ERROR_CODE"); // 格式错误
        responseBody.put("message", "错误消息");
        responseBody.put("timestamp", LocalDateTime.now().toString());

        MvcResult mvcResult = createMvcResult(responseBody, 400);

        // When & Then: 应抛出AssertionError
        AssertionError error = assertThrows(
            AssertionError.class,
            () -> validator.validateErrorResponse(mvcResult)
        );
        assertTrue(error.getMessage().contains("错误码格式"));
    }

    @Test
    @DisplayName("应成功验证列表响应格式")
    void shouldValidateListResponse() throws Exception {
        // Given: 列表响应
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("data", Arrays.asList(
            Map.of("id", 1, "name", "拿铁"),
            Map.of("id", 2, "name", "美式")
        ));
        responseBody.put("total", 2);
        responseBody.put("timestamp", LocalDateTime.now().toString());

        MvcResult mvcResult = createMvcResult(responseBody, 200);

        // When & Then: 验证应通过
        assertDoesNotThrow(() -> validator.validateListResponse(mvcResult, true));
    }

    @Test
    @DisplayName("应检测到data字段不是数组")
    void shouldDetectDataFieldNotArray() throws Exception {
        // Given: data字段不是数组的响应
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("data", Map.of("id", 1)); // 不是数组
        responseBody.put("timestamp", LocalDateTime.now().toString());

        MvcResult mvcResult = createMvcResult(responseBody, 200);

        // When & Then: 应抛出AssertionError
        AssertionError error = assertThrows(
            AssertionError.class,
            () -> validator.validateListResponse(mvcResult, false)
        );
        assertTrue(error.getMessage().contains("数组类型"));
    }

    @Test
    @DisplayName("应成功验证分页列表响应格式")
    void shouldValidatePagedListResponse() throws Exception {
        // Given: 分页列表响应
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("data", Arrays.asList(Map.of("id", 1), Map.of("id", 2)));
        responseBody.put("total", 50);
        responseBody.put("page", 1);
        responseBody.put("pageSize", 20);
        responseBody.put("timestamp", LocalDateTime.now().toString());

        MvcResult mvcResult = createMvcResult(responseBody, 200);

        // When & Then: 验证应通过
        assertDoesNotThrow(() -> validator.validatePagedListResponse(mvcResult));
    }

    @Test
    @DisplayName("应成功验证ResponseEntity包装")
    void shouldValidateResponseEntityWrapper() {
        // Given: 标准ResponseEntity<ApiResponse<T>>
        Map<String, Object> data = Map.of("id", 1, "name", "拿铁");
        ApiResponse<Map<String, Object>> apiResponse = ApiResponse.success(data);
        ResponseEntity<ApiResponse<Map<String, Object>>> responseEntity =
            ResponseEntity.ok(apiResponse);

        // When & Then: 验证应通过
        assertDoesNotThrow(() -> validator.validateResponseEntity(responseEntity, true));
    }

    @Test
    @DisplayName("应检测到ResponseEntity中success字段不匹配")
    void shouldDetectSuccessFieldMismatch() {
        // Given: success字段与期望不符
        ApiResponse<String> apiResponse = ApiResponse.success("data");
        ResponseEntity<ApiResponse<String>> responseEntity = ResponseEntity.ok(apiResponse);

        // When & Then: 验证失败（期望false，实际true）
        AssertionError error = assertThrows(
            AssertionError.class,
            () -> validator.validateResponseEntity(responseEntity, false)
        );
        assertTrue(error.getMessage().contains("期望success=false"));
    }

    @Test
    @DisplayName("应检测到错误响应缺少error字段")
    void shouldDetectMissingErrorField() {
        // Given: 错误响应但缺少error字段
        ApiResponse<Object> apiResponse = new ApiResponse<>();
        apiResponse.setSuccess(false);
        apiResponse.setMessage("错误消息");
        apiResponse.setTimestamp(LocalDateTime.now());
        // error字段为null

        ResponseEntity<ApiResponse<Object>> responseEntity =
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);

        // When & Then: 应抛出AssertionError
        AssertionError error = assertThrows(
            AssertionError.class,
            () -> validator.validateResponseEntity(responseEntity, false)
        );
        assertTrue(error.getMessage().contains("error字段"));
    }

    // ==================== Helper Methods ====================

    /**
     * 创建模拟的MvcResult
     */
    private MvcResult createMvcResult(Map<String, Object> responseBody, int status) throws Exception {
        MvcResult mvcResult = mock(MvcResult.class);
        MockHttpServletResponse response = new MockHttpServletResponse();

        String jsonContent = objectMapper.writeValueAsString(responseBody);
        response.getWriter().write(jsonContent);
        response.setStatus(status);
        response.setContentType("application/json");

        when(mvcResult.getResponse()).thenReturn(response);
        return mvcResult;
    }
}
