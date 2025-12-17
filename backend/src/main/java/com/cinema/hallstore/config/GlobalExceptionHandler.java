package com.cinema.hallstore.config;

import com.cinema.hallstore.exception.BusinessException;
import com.cinema.hallstore.exception.ResourceConflictException;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * 全局异常处理器：
 * - 将验证错误与业务异常统一映射为 ErrorResponse 结构，方便前端与日志审计。
 * - 后续可以在此处补充审计日志、traceId 等能力。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ErrorResponse body = new ErrorResponse(
            "VALIDATION_ERROR",
            "请求参数校验失败",
            fieldErrors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(ResourceNotFoundException ex) {
        ErrorResponse body = new ErrorResponse(
            ex.getErrorCode(),
            ex.getMessage(),
            null
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflictException(ResourceConflictException ex) {
        ErrorResponse body = new ErrorResponse(
            ex.getErrorCode(),
            ex.getMessage(),
            null
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        ErrorResponse body = new ErrorResponse(
            ex.getErrorCode(),
            ex.getMessage(),
            null
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        // 这里先返回通用错误，后续可以接入日志与错误追踪系统
        ErrorResponse body = new ErrorResponse(
            "INTERNAL_ERROR",
            "服务器内部错误，请稍后重试",
            null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    /**
     * 与 OpenAPI 中的 ErrorResponse 结构对齐的简单实现。
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorResponse {
        private final String error;
        private final String message;
        private final Object details;
        private final Instant timestamp = Instant.now();

        public ErrorResponse(String error, String message, Object details) {
            this.error = error;
            this.message = message;
            this.details = details;
        }

        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }

        public Object getDetails() {
            return details;
        }

        public Instant getTimestamp() {
            return timestamp;
        }
    }
}


