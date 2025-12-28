/**
 * @spec O003-beverage-order
 * API响应格式验证工具 - 确保所有端点使用ApiResponse<T>包装
 */
package com.cinema.common.util;

import com.cinema.common.dto.ApiResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.test.web.servlet.MvcResult;

import java.io.IOException;

/**
 * API响应格式验证工具类
 *
 * 用于验证所有API端点的响应格式是否符合统一的ApiResponse<T>标准
 *
 * 验证规则:
 * 1. 成功响应必须包含: success=true, data字段, timestamp字段
 * 2. 失败响应必须包含: success=false, error字段, message字段, timestamp字段
 * 3. 列表响应必须包含: data数组, total字段(可选)
 * 4. HTTP状态码必须与success字段一致(2xx成功, 4xx/5xx失败)
 */
@Component
public class ApiResponseFormatValidator {

    private final ObjectMapper objectMapper;

    public ApiResponseFormatValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * 验证成功响应格式
     *
     * @param mvcResult MVC测试结果
     * @throws AssertionError 如果格式不符合标准
     */
    public void validateSuccessResponse(MvcResult mvcResult) throws IOException {
        String content = mvcResult.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(content);

        // 验证必须包含的字段
        assertFieldExists(root, "success", "成功响应缺少success字段");
        assertFieldExists(root, "data", "成功响应缺少data字段");
        assertFieldExists(root, "timestamp", "成功响应缺少timestamp字段");

        // 验证success值
        boolean success = root.get("success").asBoolean();
        if (!success) {
            throw new AssertionError("成功响应的success字段应为true，实际为: " + success);
        }

        // 验证HTTP状态码
        int status = mvcResult.getResponse().getStatus();
        if (status < 200 || status >= 300) {
            throw new AssertionError("成功响应的HTTP状态码应为2xx，实际为: " + status);
        }
    }

    /**
     * 验证失败响应格式
     *
     * @param mvcResult MVC测试结果
     * @throws AssertionError 如果格式不符合标准
     */
    public void validateErrorResponse(MvcResult mvcResult) throws IOException {
        String content = mvcResult.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(content);

        // 验证必须包含的字段
        assertFieldExists(root, "success", "错误响应缺少success字段");
        assertFieldExists(root, "error", "错误响应缺少error字段");
        assertFieldExists(root, "message", "错误响应缺少message字段");
        assertFieldExists(root, "timestamp", "错误响应缺少timestamp字段");

        // 验证success值
        boolean success = root.get("success").asBoolean();
        if (success) {
            throw new AssertionError("错误响应的success字段应为false，实际为: " + success);
        }

        // 验证HTTP状态码
        int status = mvcResult.getResponse().getStatus();
        if (status >= 200 && status < 300) {
            throw new AssertionError("错误响应的HTTP状态码应为4xx或5xx，实际为: " + status);
        }

        // 验证错误码格式 (模块前缀_类别_序号, 如 BEV_NTF_001)
        String errorCode = root.get("error").asText();
        if (!errorCode.matches("^[A-Z]{3}_[A-Z]{3}_\\d{3}$")) {
            throw new AssertionError("错误码格式不符合标准(XXX_XXX_NNN): " + errorCode);
        }
    }

    /**
     * 验证列表响应格式
     *
     * @param mvcResult MVC测试结果
     * @param expectTotal 是否期望包含total字段
     * @throws AssertionError 如果格式不符合标准
     */
    public void validateListResponse(MvcResult mvcResult, boolean expectTotal) throws IOException {
        String content = mvcResult.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(content);

        // 验证基本成功响应格式
        validateSuccessResponse(mvcResult);

        // 验证data字段为数组
        JsonNode dataNode = root.get("data");
        if (!dataNode.isArray()) {
            throw new AssertionError("列表响应的data字段应为数组类型");
        }

        // 如果期望包含total字段，验证其存在性和类型
        if (expectTotal) {
            assertFieldExists(root, "total", "列表响应缺少total字段");
            JsonNode totalNode = root.get("total");
            if (!totalNode.isNumber()) {
                throw new AssertionError("列表响应的total字段应为数字类型");
            }
        }
    }

    /**
     * 验证分页列表响应格式
     *
     * @param mvcResult MVC测试结果
     * @throws AssertionError 如果格式不符合标准
     */
    public void validatePagedListResponse(MvcResult mvcResult) throws IOException {
        validateListResponse(mvcResult, true);

        String content = mvcResult.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(content);

        // 验证分页字段
        assertFieldExists(root, "page", "分页列表响应缺少page字段");
        assertFieldExists(root, "pageSize", "分页列表响应缺少pageSize字段");

        // 验证分页字段类型
        JsonNode pageNode = root.get("page");
        JsonNode pageSizeNode = root.get("pageSize");

        if (!pageNode.isNumber()) {
            throw new AssertionError("分页列表响应的page字段应为数字类型");
        }
        if (!pageSizeNode.isNumber()) {
            throw new AssertionError("分页列表响应的pageSize字段应为数字类型");
        }
    }

    /**
     * 验证ResponseEntity<ApiResponse<T>>包装
     *
     * @param responseEntity 响应实体
     * @param expectSuccess 期望的成功状态
     * @throws AssertionError 如果格式不符合标准
     */
    public <T> void validateResponseEntity(ResponseEntity<ApiResponse<T>> responseEntity, boolean expectSuccess) {
        if (responseEntity == null) {
            throw new AssertionError("ResponseEntity不能为null");
        }

        ApiResponse<T> body = responseEntity.getBody();
        if (body == null) {
            throw new AssertionError("ApiResponse body不能为null");
        }

        // 验证success字段
        if (body.isSuccess() != expectSuccess) {
            throw new AssertionError(
                String.format("期望success=%b，实际为: %b", expectSuccess, body.isSuccess())
            );
        }

        // 验证时间戳
        if (body.getTimestamp() == null) {
            throw new AssertionError("ApiResponse缺少timestamp字段");
        }

        // 成功响应应包含data，失败响应应包含error和message
        if (expectSuccess) {
            // 注意: data可以为null(如删除操作返回空响应)
            // 只验证响应结构，不强制要求data非空
        } else {
            if (body.getError() == null || body.getError().isEmpty()) {
                throw new AssertionError("错误响应缺少error字段");
            }
            if (body.getMessage() == null || body.getMessage().isEmpty()) {
                throw new AssertionError("错误响应缺少message字段");
            }
        }

        // 验证HTTP状态码
        int statusCode = responseEntity.getStatusCode().value();
        if (expectSuccess && (statusCode < 200 || statusCode >= 300)) {
            throw new AssertionError("成功响应的HTTP状态码应为2xx，实际为: " + statusCode);
        }
        if (!expectSuccess && (statusCode >= 200 && statusCode < 300)) {
            throw new AssertionError("错误响应的HTTP状态码应为4xx或5xx，实际为: " + statusCode);
        }
    }

    /**
     * 验证字段存在性
     */
    private void assertFieldExists(JsonNode node, String fieldName, String errorMessage) {
        if (!node.has(fieldName)) {
            throw new AssertionError(errorMessage);
        }
    }

    /**
     * 从MvcResult提取JsonNode
     */
    public JsonNode extractJsonNode(MvcResult mvcResult) throws IOException {
        String content = mvcResult.getResponse().getContentAsString();
        return objectMapper.readTree(content);
    }

    /**
     * 验证字段值
     */
    public void assertFieldValue(JsonNode node, String fieldName, Object expectedValue) {
        if (!node.has(fieldName)) {
            throw new AssertionError("缺少字段: " + fieldName);
        }

        JsonNode fieldNode = node.get(fieldName);
        String actualValue = fieldNode.asText();

        if (!expectedValue.toString().equals(actualValue)) {
            throw new AssertionError(
                String.format("字段%s期望值为%s，实际为: %s", fieldName, expectedValue, actualValue)
            );
        }
    }
}
