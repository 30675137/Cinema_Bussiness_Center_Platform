package com.cinema.common.exception;

import com.cinema.common.dto.ErrorResponse;
import com.cinema.hallstore.exception.BusinessException;
import com.cinema.hallstore.exception.OptimisticLockException;
import com.cinema.hallstore.exception.StoreHasDependenciesException;
import com.cinema.hallstore.exception.StoreNameConflictException;
import com.cinema.hallstore.exception.StoreNotFoundException;
import com.cinema.reservation.exception.InsufficientInventoryException;
import com.cinema.reservation.exception.InvalidStatusTransitionException;
import com.cinema.reservation.exception.ReservationNotFoundException;
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

    // ==================== Reservation Exceptions (U001-reservation-order-management) ====================

    /**
     * 处理预约单未找到异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 404 响应
     */
    @ExceptionHandler(ReservationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleReservationNotFound(
            ReservationNotFoundException ex, WebRequest request) {
        logger.warn("Reservation not found: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of("RESERVATION_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * 处理库存不足异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 409 响应
     */
    @ExceptionHandler(InsufficientInventoryException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientInventory(
            InsufficientInventoryException ex, WebRequest request) {
        logger.warn("Insufficient inventory: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of("INSUFFICIENT_INVENTORY", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * 处理无效状态转换异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 400 响应
     */
    @ExceptionHandler(InvalidStatusTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidStatusTransition(
            InvalidStatusTransitionException ex, WebRequest request) {
        logger.warn("Invalid status transition: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of("INVALID_STATUS_TRANSITION", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * 处理非法状态异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 400 响应
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(
            IllegalStateException ex, WebRequest request) {
        logger.warn("Illegal state: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of("ILLEGAL_STATE", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
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

    // ==================== Order Management Exceptions (O001-product-order-list) ====================

    /**
     * 处理订单未找到异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 404 响应
     */
    @ExceptionHandler(com.cinema.order.exception.OrderNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleOrderNotFound(
            com.cinema.order.exception.OrderNotFoundException ex, WebRequest request) {
        logger.warn("Order not found: {}", ex.getOrderId());
        ErrorResponse error = ErrorResponse.of("ORD_NTF_001", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * 处理无效订单状态转换异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 422 响应
     */
    @ExceptionHandler(com.cinema.order.exception.InvalidOrderStatusTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidOrderStatusTransition(
            com.cinema.order.exception.InvalidOrderStatusTransitionException ex, WebRequest request) {
        logger.warn("Invalid order status transition: {} -> {} for order {}",
                ex.getCurrentStatus(), ex.getTargetStatus(), ex.getOrderId());
        Map<String, Object> details = new HashMap<>();
        details.put("orderId", ex.getOrderId());
        details.put("currentStatus", ex.getCurrentStatus());
        details.put("targetStatus", ex.getTargetStatus());
        ErrorResponse error = ErrorResponse.of("ORD_BIZ_001", ex.getMessage(), details);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }

    /**
     * 处理订单乐观锁冲突异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 409 响应
     */
    @ExceptionHandler(com.cinema.order.exception.OrderOptimisticLockException.class)
    public ResponseEntity<ErrorResponse> handleOrderOptimisticLock(
            com.cinema.order.exception.OrderOptimisticLockException ex, WebRequest request) {
        logger.warn("Order optimistic lock conflict: orderId={}, expectedVersion={}, currentVersion={}",
                ex.getOrderId(), ex.getExpectedVersion(), ex.getCurrentVersion());
        Map<String, Object> details = new HashMap<>();
        details.put("orderId", ex.getOrderId());
        details.put("expectedVersion", ex.getExpectedVersion());
        details.put("currentVersion", ex.getCurrentVersion());
        ErrorResponse error = ErrorResponse.of("ORD_BIZ_002", ex.getMessage(), details);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * 处理取消原因必填异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 400 响应
     */
    @ExceptionHandler(com.cinema.order.exception.CancelReasonRequiredException.class)
    public ResponseEntity<ErrorResponse> handleCancelReasonRequired(
            com.cinema.order.exception.CancelReasonRequiredException ex, WebRequest request) {
        logger.warn("Cancel reason required for order: {}", ex.getOrderId());
        Map<String, Object> details = new HashMap<>();
        details.put("orderId", ex.getOrderId());
        ErrorResponse error = ErrorResponse.of("ORD_VAL_001", ex.getMessage(), details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // ==================== Beverage Order Exceptions (O003-beverage-order) ====================

    /**
     * 处理饮品订单业务异常
     * <p>
     * 统一处理饮品订单模块的所有业务异常，包括：
     * - 饮品不存在 (BEV_NTF_001)
     * - 饮品规格不存在 (BEV_NTF_002)
     * - 饮品配方不存在 (BEV_NTF_003)
     * - 饮品已下架 (BEV_VAL_001)
     * - 饮品已售罄 (BEV_VAL_002)
     * - 饮品规格无效 (BEV_VAL_003)
     * - 原料库存不足 (BEV_BIZ_001)
     * - 订单不存在 (ORD_NTF_001)
     * - 取餐号不存在 (ORD_NTF_002)
     * - 订单状态无效 (ORD_VAL_001)
     * - 订单金额无效 (ORD_VAL_002)
     * - 订单商品项为空 (ORD_VAL_003)
     * - 订单状态流转非法 (ORD_BIZ_001)
     * - 支付失败 (ORD_BIZ_002)
     * - BOM扣料失败 (ORD_BIZ_003)
     * - 取餐号已用尽 (ORD_BIZ_004)
     * - 订单已取消 (ORD_BIZ_005)
     * - 数据库错误 (SYS_001)
     * - 外部服务调用失败 (SYS_002)
     * - 并发冲突 (SYS_003)
     * </p>
     *
     * @param ex      饮品订单业务异常对象
     * @param request Web 请求
     * @return 对应 HTTP 状态码的 ErrorResponse
     * @spec O003-beverage-order
     */
    @ExceptionHandler(com.cinema.beverage.exception.BeverageException.class)
    public ResponseEntity<ErrorResponse> handleBeverageException(
            com.cinema.beverage.exception.BeverageException ex, WebRequest request) {
        logger.warn("Beverage exception: {} - {}", ex.getErrorCode().getCode(), ex.getMessage());
        ErrorResponse error = ErrorResponse.of(
                ex.getErrorCode().getCode(),
                ex.getMessage(),
                ex.getDetails()
        );
        return ResponseEntity
                .status(ex.getErrorCode().getHttpStatus())
                .body(error);
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
     * 处理业务异常
     *
     * @param ex      异常对象
     * @param request Web 请求
     * @return 400 响应
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex, WebRequest request) {
        logger.warn("Business error: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.of("BUSINESS_ERROR", ex.getMessage());
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
