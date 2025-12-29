package com.cinema.common.exception;

import com.cinema.common.dto.ErrorResponse;
import com.cinema.scenariopackage.exception.ConcurrentModificationException;
import com.cinema.scenariopackage.exception.PackageNotFoundException;
import com.cinema.scenariopackage.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * T035-D: GlobalExceptionHandler 单元测试
 * <p>
 * 测试覆盖：
 * 1. PackageNotFoundException 处理 - 返回 404 和 ErrorResponse 格式
 * 2. ConcurrentModificationException 处理 - 返回 409 冲突响应
 * 3. ValidationException 处理 - 返回 400 和验证错误详情
 * 4. MethodArgumentNotValidException 处理 - Bean Validation 错误
 * 5. IllegalArgumentException 处理 - 非法参数错误
 * 6. Exception 处理 - 通用异常返回 500
 * 7. ErrorResponse 结构验证 - ApiResponse.failure 格式兼容性
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private WebRequest webRequest;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        webRequest = mock(WebRequest.class);
    }

    /**
     * 测试用例 1: 处理 PackageNotFoundException
     * <p>
     * 验证点：
     * 1. HTTP 状态码为 404 NOT_FOUND
     * 2. ErrorResponse 包含 NOT_FOUND 错误码
     * 3. 错误消息与异常消息一致
     * </p>
     */
    @Test
    @DisplayName("T035-D: Should handle PackageNotFoundException with 404 response")
    void testHandlePackageNotFound() {
        // Arrange: 创建 PackageNotFoundException
        String errorMessage = "场景包未找到: ID=00000000-0001-0000-0000-000000000001";
        PackageNotFoundException exception = new PackageNotFoundException(errorMessage);

        // Act: 调用异常处理器
        ResponseEntity<ErrorResponse> response = exceptionHandler.handlePackageNotFound(exception, webRequest);

        // Assert: 验证响应状态码
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        // 验证 ErrorResponse 结构
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getCode()).isEqualTo("NOT_FOUND");
        assertThat(errorResponse.getMessage()).isEqualTo(errorMessage);
    }

    /**
     * 测试用例 2: 处理 ConcurrentModificationException
     * <p>
     * 验证点：
     * 1. HTTP 状态码为 409 CONFLICT
     * 2. ErrorResponse 包含 CONCURRENT_MODIFICATION 错误码
     * 3. 错误消息反映乐观锁冲突
     * </p>
     */
    @Test
    @DisplayName("T035-D: Should handle ConcurrentModificationException with 409 response")
    void testHandleConcurrentModification() {
        // Arrange: 创建 ConcurrentModificationException
        String errorMessage = "场景包已被其他用户修改，请刷新后重试";
        ConcurrentModificationException exception = new ConcurrentModificationException(errorMessage);

        // Act: 调用异常处理器
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleConcurrentModification(exception, webRequest);

        // Assert: 验证响应状态码
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        // 验证 ErrorResponse 结构
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getCode()).isEqualTo("CONCURRENT_MODIFICATION");
        assertThat(errorResponse.getMessage()).isEqualTo(errorMessage);
    }

    /**
     * 测试用例 3: 处理 ValidationException（带详情）
     * <p>
     * 验证点：
     * 1. HTTP 状态码为 400 BAD_REQUEST
     * 2. ErrorResponse 包含 VALIDATION_ERROR 错误码
     * 3. 验证错误详情（details）正确返回
     * </p>
     */
    @Test
    @DisplayName("T035-D: Should handle ValidationException with details")
    void testHandleValidationWithDetails() {
        // Arrange: 创建带详情的 ValidationException
        String errorMessage = "场景包验证失败";
        Map<String, String> details = new HashMap<>();
        details.put("name", "名称不能为空");
        details.put("packagePrice", "价格必须大于0");

        ValidationException exception = new ValidationException(errorMessage, details);

        // Act: 调用异常处理器
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidation(exception, webRequest);

        // Assert: 验证响应状态码
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        // 验证 ErrorResponse 结构
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getCode()).isEqualTo("VALIDATION_ERROR");
        assertThat(errorResponse.getMessage()).isEqualTo(errorMessage);
        assertThat(errorResponse.getDetails()).isNotNull();
        assertThat(errorResponse.getDetails()).containsEntry("name", "名称不能为空");
        assertThat(errorResponse.getDetails()).containsEntry("packagePrice", "价格必须大于0");
    }

    /**
     * 测试用例 4: 处理 ValidationException（无详情）
     */
    @Test
    @DisplayName("T035-D: Should handle ValidationException without details")
    void testHandleValidationWithoutDetails() {
        // Arrange: 创建不带详情的 ValidationException
        String errorMessage = "验证失败";
        ValidationException exception = new ValidationException(errorMessage);

        // Act: 调用异常处理器
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidation(exception, webRequest);

        // Assert: 验证响应
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getMessage()).isEqualTo(errorMessage);
    }

    /**
     * 测试用例 5: 处理 MethodArgumentNotValidException（Bean Validation）
     * <p>
     * 验证点：
     * 1. HTTP 状态码为 400 BAD_REQUEST
     * 2. ErrorResponse 包含字段级验证错误
     * 3. 错误详情包含所有失败的字段
     * </p>
     */
    @Test
    @DisplayName("T035-D: Should handle MethodArgumentNotValidException with field errors")
    void testHandleMethodArgumentNotValid() {
        // Arrange: Mock MethodArgumentNotValidException
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        // Mock 字段错误
        FieldError nameError = new FieldError("createPackageRequest", "name", "名称不能为空");
        FieldError priceError = new FieldError("createPackageRequest", "packagePrice", "价格必须大于0");

        when(exception.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(nameError, priceError));

        // Act: 调用异常处理器
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleMethodArgumentNotValid(exception, webRequest);

        // Assert: 验证响应状态码
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        // 验证 ErrorResponse 结构
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getCode()).isEqualTo("VALIDATION_ERROR");
        assertThat(errorResponse.getMessage()).isEqualTo("请求参数验证失败");

        // 验证字段错误详情
        assertThat(errorResponse.getDetails()).isNotNull();
        assertThat(errorResponse.getDetails()).containsEntry("name", "名称不能为空");
        assertThat(errorResponse.getDetails()).containsEntry("packagePrice", "价格必须大于0");
    }

    /**
     * 测试用例 6: 处理 IllegalArgumentException
     * <p>
     * 验证点：
     * 1. HTTP 状态码为 400 BAD_REQUEST
     * 2. ErrorResponse 包含 INVALID_ARGUMENT 错误码
     * </p>
     */
    @Test
    @DisplayName("T035-D: Should handle IllegalArgumentException with 400 response")
    void testHandleIllegalArgument() {
        // Arrange: 创建 IllegalArgumentException
        String errorMessage = "无效的参数: sortOrder 必须是 asc 或 desc";
        IllegalArgumentException exception = new IllegalArgumentException(errorMessage);

        // Act: 调用异常处理器
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalArgument(exception, webRequest);

        // Assert: 验证响应状态码
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        // 验证 ErrorResponse 结构
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getCode()).isEqualTo("INVALID_ARGUMENT");
        assertThat(errorResponse.getMessage()).isEqualTo(errorMessage);
    }

    /**
     * 测试用例 7: 处理通用 Exception（500 错误）
     * <p>
     * 验证点：
     * 1. HTTP 状态码为 500 INTERNAL_SERVER_ERROR
     * 2. ErrorResponse 包含 INTERNAL_SERVER_ERROR 错误码
     * 3. 错误消息为通用服务器错误提示（不暴露内部细节）
     * </p>
     */
    @Test
    @DisplayName("T035-D: Should handle generic Exception with 500 response")
    void testHandleGlobalException() {
        // Arrange: 创建通用异常
        Exception exception = new RuntimeException("数据库连接失败");

        // Act: 调用异常处理器
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGlobalException(exception, webRequest);

        // Assert: 验证响应状态码
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);

        // 验证 ErrorResponse 结构
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getCode()).isEqualTo("INTERNAL_SERVER_ERROR");

        // 验证错误消息不暴露内部异常详情
        assertThat(errorResponse.getMessage()).isEqualTo("服务器内部错误,请稍后重试");
        assertThat(errorResponse.getMessage()).doesNotContain("数据库连接失败");
    }

    /**
     * 测试用例 8: ErrorResponse 与 ApiResponse.failure 格式兼容性
     * <p>
     * 验证点：
     * 1. ErrorResponse 结构符合前端 ApiResponse 格式
     * 2. 包含必需字段: code, message
     * 3. details 字段为可选
     * </p>
     */
    @Test
    @DisplayName("T035-D: ErrorResponse should be compatible with ApiResponse.failure format")
    void testErrorResponseFormat() {
        // Arrange: 创建多种异常场景
        PackageNotFoundException notFoundEx = new PackageNotFoundException("资源未找到");

        // Act: 获取 ErrorResponse
        ResponseEntity<ErrorResponse> response = exceptionHandler.handlePackageNotFound(notFoundEx, webRequest);
        ErrorResponse errorResponse = response.getBody();

        // Assert: 验证 ErrorResponse 字段结构
        assertThat(errorResponse).isNotNull();

        // 验证必需字段存在
        assertThat(errorResponse.getCode()).isNotNull().isNotEmpty();
        assertThat(errorResponse.getMessage()).isNotNull().isNotEmpty();

        // 验证与前端 ApiResponse 兼容
        // 前端期望: { success: false, message: string, data?: any }
        // 后端返回: { code: string, message: string, details?: Map }
        // 两者通过 message 字段对齐
    }

    /**
     * 测试用例 9: 多个字段验证错误的详细信息
     */
    @Test
    @DisplayName("T035-D: Should handle multiple field validation errors")
    void testHandleMultipleFieldErrors() {
        // Arrange: Mock 多个字段错误
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        FieldError error1 = new FieldError("request", "name", "名称长度必须在1-100之间");
        FieldError error2 = new FieldError("request", "description", "描述不能为空");
        FieldError error3 = new FieldError("request", "packagePrice", "价格必须大于0");
        FieldError error4 = new FieldError("request", "hallTypeIds", "至少选择一个影厅类型");

        when(exception.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(error1, error2, error3, error4));

        // Act: 调用异常处理器
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleMethodArgumentNotValid(exception, webRequest);

        // Assert: 验证所有字段错误都被包含
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getDetails()).hasSize(4);
        assertThat(errorResponse.getDetails()).containsKeys("name", "description", "packagePrice", "hallTypeIds");
    }

    /**
     * 测试用例 10: 空错误消息处理
     */
    @Test
    @DisplayName("T035-D: Should handle exception with null or empty message")
    void testHandleExceptionWithNullMessage() {
        // Arrange: 创建消息为 null 的异常
        IllegalArgumentException exception = new IllegalArgumentException();

        // Act: 调用异常处理器
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalArgument(exception, webRequest);

        // Assert: 验证响应正常（不抛出 NullPointerException）
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
    }

    /**
     * 测试用例 11: 数据库异常（通用异常）处理
     */
    @Test
    @DisplayName("T035-D: Should handle database exception as internal server error")
    void testHandleDatabaseException() {
        // Arrange: 模拟数据库异常
        Exception dbException = new RuntimeException("could not execute statement [ERROR: column 'invalid_column' does not exist]");

        // Act: 调用异常处理器
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGlobalException(dbException, webRequest);

        // Assert: 验证返回 500 且不暴露数据库错误详情
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        ErrorResponse errorResponse = response.getBody();
        assertThat(errorResponse).isNotNull();
        assertThat(errorResponse.getMessage()).isEqualTo("服务器内部错误，请稍后重试");
        assertThat(errorResponse.getMessage()).doesNotContain("column");
        assertThat(errorResponse.getMessage()).doesNotContain("SQL");
    }
}
