/**
 * @spec N001-purchase-inbound
 * 采购模块全局异常处理器
 */
package com.cinema.procurement.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice(basePackages = "com.cinema.procurement")
public class ProcurementExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ProcurementExceptionHandler.class);

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));

        Map<String, Object> details = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            details.put(error.getField(), error.getDefaultMessage())
        );

        log.warn("参数校验失败: {}", message);

        return buildErrorResponse(HttpStatus.BAD_REQUEST, "PO_VAL_001", message, details);
    }

    /**
     * 处理非法参数异常
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("非法参数: {}", ex.getMessage());

        return buildErrorResponse(HttpStatus.NOT_FOUND, "PO_NTF_001", ex.getMessage(), null);
    }

    /**
     * 处理非法状态异常
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(IllegalStateException ex) {
        log.warn("非法状态: {}", ex.getMessage());

        return buildErrorResponse(HttpStatus.BAD_REQUEST, "PO_BIZ_001", ex.getMessage(), null);
    }

    /**
     * 处理乐观锁异常
     */
    @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> handleOptimisticLockException(
            org.springframework.orm.ObjectOptimisticLockingFailureException ex) {
        log.warn("并发修改冲突: {}", ex.getMessage());

        return buildErrorResponse(
            HttpStatus.CONFLICT,
            "PO_BIZ_002",
            "数据已被其他用户修改，请刷新后重试",
            null
        );
    }

    /**
     * 处理通用异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("未处理的异常: ", ex);

        return buildErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "PO_SYS_001",
            "服务器内部错误，请稍后重试",
            null
        );
    }

    /**
     * 构建错误响应
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status,
            String errorCode,
            String message,
            Map<String, Object> details) {

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", errorCode);
        response.put("message", message);
        response.put("timestamp", Instant.now().toString());

        if (details != null && !details.isEmpty()) {
            response.put("details", details);
        }

        return ResponseEntity.status(status).body(response);
    }
}
