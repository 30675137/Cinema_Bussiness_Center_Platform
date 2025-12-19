package com.cinema.common.exception;

import com.cinema.common.dto.ErrorResponse;
import com.cinema.scenariopackage.exception.ConcurrentModificationException;
import com.cinema.scenariopackage.exception.PackageNotFoundException;
import com.cinema.scenariopackage.exception.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * 全局异常处理器
 * <p>
 * 统一处理所有控制器抛出的异常，返回标准化的错误响应
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 处理资源未找到异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 404 响应
     */
    @ExceptionHandler(PackageNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePackageNotFound(
            PackageNotFoundException ex, WebRequest request) {
        logger.warn("Resource not found: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of("NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * 处理并发修改异常（乐观锁冲突）
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 409 响应
     */
    @ExceptionHandler(ConcurrentModificationException.class)
    public ResponseEntity<ErrorResponse> handleConcurrentModification(
            ConcurrentModificationException ex, WebRequest request) {
        logger.warn("Concurrent modification detected: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of("CONCURRENT_MODIFICATION", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * 处理验证异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 400 响应
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            ValidationException ex, WebRequest request) {
        logger.warn("Validation error: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of("VALIDATION_ERROR", ex.getMessage(), ex.getDetails());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * 处理 Bean Validation 异常（@Valid 注解触发）
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 400 响应
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, WebRequest request) {
        logger.warn("Bean validation failed: {}", ex.getMessage());

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        ErrorResponse error = ErrorResponse.of(
                "VALIDATION_ERROR",
                "请求参数验证失败",
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * 处理非法参数异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 400 响应
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        logger.warn("Illegal argument: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of("INVALID_ARGUMENT", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * 处理所有未捕获的异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 500 响应
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
        logger.error("Unexpected error occurred", ex);
        ErrorResponse error = ErrorResponse.of(
                "INTERNAL_SERVER_ERROR",
                "服务器内部错误，请稍后重试"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
