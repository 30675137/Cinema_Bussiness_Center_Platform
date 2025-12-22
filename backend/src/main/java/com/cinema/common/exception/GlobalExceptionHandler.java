package com.cinema.common.exception;

import com.cinema.common.dto.ErrorResponse;
import com.cinema.hallstore.exception.OptimisticLockException;
import com.cinema.hallstore.exception.StoreHasDependenciesException;
import com.cinema.hallstore.exception.StoreNameConflictException;
import com.cinema.hallstore.exception.StoreNotFoundException;
import com.cinema.scenariopackage.exception.ConcurrentModificationException;
import com.cinema.scenariopackage.exception.PackageNotFoundException;
import com.cinema.scenariopackage.exception.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.net.SocketTimeoutException;
import java.sql.SQLException;
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

    // ==================== Store CRUD Exceptions (022-store-crud) ====================

    /**
     * 处理门店未找到异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 404 响应
     */
    @ExceptionHandler(StoreNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleStoreNotFound(
            StoreNotFoundException ex, WebRequest request) {
        logger.warn("Store not found: {}", ex.getStoreId());
        ErrorResponse error = ErrorResponse.of("STORE_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * 处理门店名称冲突异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 409 响应
     */
    @ExceptionHandler(StoreNameConflictException.class)
    public ResponseEntity<ErrorResponse> handleStoreNameConflict(
            StoreNameConflictException ex, WebRequest request) {
        logger.warn("Store name conflict: {}", ex.getStoreName());
        ErrorResponse error = ErrorResponse.of("STORE_NAME_CONFLICT", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * 处理门店存在依赖关系异常（无法删除）
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 409 响应
     */
    @ExceptionHandler(StoreHasDependenciesException.class)
    public ResponseEntity<ErrorResponse> handleStoreHasDependencies(
            StoreHasDependenciesException ex, WebRequest request) {
        logger.warn("Store has dependencies, cannot delete: storeId={}, dependencyType={}",
                ex.getStoreId(), ex.getDependencyType());
        ErrorResponse error = ErrorResponse.of("STORE_HAS_DEPENDENCIES", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * 处理乐观锁冲突异常（门店版本不匹配）
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 409 响应
     */
    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLock(
            OptimisticLockException ex, WebRequest request) {
        logger.warn("Optimistic lock conflict: storeId={}, expectedVersion={}, actualVersion={}",
                ex.getStoreId(), ex.getExpectedVersion(), ex.getActualVersion());
        ErrorResponse error = ErrorResponse.of("OPTIMISTIC_LOCK_CONFLICT", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
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
     * 处理网络超时异常（T034）
     * <p>
     * 统一处理网络请求超时异常，包括 Socket 超时、查询超时等
     * </p>
     *
     * @param ex      超时异常对象
     * @param request Web 请求
     * @return 504 Gateway Timeout 响应
     */
    @ExceptionHandler({SocketTimeoutException.class, QueryTimeoutException.class})
    public ResponseEntity<ErrorResponse> handleTimeout(
            Exception ex, WebRequest request) {
        logger.error("Request timeout: {}", ex.getMessage(), ex);
        ErrorResponse error = ErrorResponse.of(
                "TIMEOUT",
                "请求超时，请稍后重试"
        );
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).body(error);
    }

    /**
     * 处理数据库访问异常（T034）
     * <p>
     * 统一处理数据库连接错误、SQL 执行错误等数据访问异常
     * 不向客户端暴露数据库错误的具体细节，保护系统安全
     * </p>
     *
     * @param ex      数据访问异常对象
     * @param request Web 请求
     * @return 500 Internal Server Error 响应
     */
    @ExceptionHandler({DataAccessException.class, SQLException.class})
    public ResponseEntity<ErrorResponse> handleDatabaseException(
            Exception ex, WebRequest request) {
        logger.error("Database error occurred: {}", ex.getMessage(), ex);

        // 判断是否为超时相关的数据库错误
        if (ex.getCause() instanceof SocketTimeoutException ||
            ex instanceof QueryTimeoutException ||
            (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("timeout"))) {
            ErrorResponse error = ErrorResponse.of(
                    "DATABASE_TIMEOUT",
                    "数据库查询超时，请稍后重试"
            );
            return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).body(error);
        }

        // 其他数据库错误返回通用错误信息
        ErrorResponse error = ErrorResponse.of(
                "DATABASE_ERROR",
                "数据访问失败，请稍后重试"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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
