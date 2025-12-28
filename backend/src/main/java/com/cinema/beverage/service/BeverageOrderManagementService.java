/**
 * @spec O003-beverage-order
 * 饮品订单管理业务逻辑层 (B端)
 */
package com.cinema.beverage.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.beverage.dto.BeverageOrderDTO;
import com.cinema.beverage.entity.BeverageOrder;
import com.cinema.beverage.exception.BeverageErrorCode;
import com.cinema.beverage.exception.BeverageException;
import com.cinema.beverage.exception.OrderNotFoundException;
import com.cinema.beverage.repository.BeverageOrderRepository;

import lombok.RequiredArgsConstructor;

/**
 * 饮品订单管理服务类 (B端)
 *
 * 对应 spec: O003-beverage-order
 * 提供B端订单管理、状态更新等业务逻辑
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BeverageOrderManagementService {

    private static final Logger logger = LoggerFactory.getLogger(BeverageOrderManagementService.class);

    private final BeverageOrderRepository orderRepository;
    private final BomDeductionService bomDeductionService;

    /**
     * 查询订单列表（支持门店和状态筛选）
     *
     * @param storeId 门店ID（可选）
     * @param status 订单状态（可选）
     * @param pageable 分页参数
     * @return 订单列表（分页）
     */
    public Page<BeverageOrderDTO> findOrders(UUID storeId, BeverageOrder.OrderStatus status, Pageable pageable) {
        logger.debug("查询订单列表: storeId={}, status={}", storeId, status);

        Page<BeverageOrder> orders;

        if (storeId != null && status != null) {
            // 按门店和状态筛选
            orders = orderRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(
                    storeId, status, pageable);
        } else if (storeId != null) {
            // 只按门店筛选
            orders = orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId, pageable);
        } else if (status != null) {
            // 只按状态筛选
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            // 不筛选，查询全部
            Pageable sortedPageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
            orders = orderRepository.findAll(sortedPageable);
        }

        return orders.map(BeverageOrderDTO::fromEntity);
    }

    /**
     * 查询待处理订单（待制作 + 制作中）
     *
     * @param storeId 门店ID
     * @return 待处理订单列表
     */
    public List<BeverageOrderDTO> findPendingOrders(UUID storeId) {
        logger.debug("查询待处理订单: storeId={}", storeId);

        List<BeverageOrder.OrderStatus> pendingStatuses = Arrays.asList(
                BeverageOrder.OrderStatus.PENDING_PRODUCTION,
                BeverageOrder.OrderStatus.PRODUCING
        );

        List<BeverageOrder> orders = orderRepository.findByStoreIdAndStatusInOrderByCreatedAtAsc(
                storeId, pendingStatuses);

        return orders.stream()
                .map(BeverageOrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 更新订单状态
     *
     * @param orderId 订单ID
     * @param targetStatus 目标状态
     * @return 更新后的订单DTO
     */
    @Transactional
    public BeverageOrderDTO updateOrderStatus(UUID orderId, BeverageOrder.OrderStatus targetStatus) {
        // Structured logging for status update start (FR-027)
        logger.info("StatusUpdate - START: orderId={}, targetStatus={}, operation=UPDATE_ORDER_STATUS",
                orderId, targetStatus);

        // 1. 查询订单
        BeverageOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId.toString()));

        // 2. 验证状态流转是否合法
        if (!order.canTransitionTo(targetStatus)) {
            // Structured error logging for invalid transition (FR-027)
            logger.error("StatusUpdate - INVALID_TRANSITION: orderId={}, orderNumber={}, currentStatus={}, targetStatus={}, operation=UPDATE_ORDER_STATUS, reason=INVALID_TRANSITION",
                    orderId, order.getOrderNumber(), order.getStatus(), targetStatus);
            throw new BeverageException(
                    BeverageErrorCode.ORD_BIZ_001,
                    String.format("订单状态无法从 %s 流转到 %s", order.getStatus(), targetStatus)
            );
        }

        // 3. 更新状态
        BeverageOrder.OrderStatus oldStatus = order.getStatus();
        order.setStatus(targetStatus);

        // 4. 记录状态变更时间并进行结构化日志记录（FR-027）
        switch (targetStatus) {
            case PRODUCING:
                // Structured logging for production start (FR-027)
                logger.info("StatusUpdate - PRODUCING: orderId={}, orderNumber={}, userId={}, storeId={}, oldStatus={}, newStatus=PRODUCING, operation=UPDATE_ORDER_STATUS",
                        orderId, order.getOrderNumber(), order.getUserId(), order.getStoreId(), oldStatus);
                break;
            case COMPLETED:
                // Structured logging for production completed (FR-027)
                logger.info("StatusUpdate - COMPLETED: orderId={}, orderNumber={}, userId={}, storeId={}, oldStatus={}, newStatus=COMPLETED, operation=UPDATE_ORDER_STATUS",
                        orderId, order.getOrderNumber(), order.getUserId(), order.getStoreId(), oldStatus);
                break;
            case DELIVERED:
                // Structured logging for order delivered (FR-027)
                logger.info("StatusUpdate - DELIVERED: orderId={}, orderNumber={}, userId={}, storeId={}, oldStatus={}, newStatus=DELIVERED, operation=UPDATE_ORDER_STATUS",
                        orderId, order.getOrderNumber(), order.getUserId(), order.getStoreId(), oldStatus);
                break;
            case CANCELLED:
                // Structured logging for order cancelled (FR-027)
                logger.info("StatusUpdate - CANCELLED: orderId={}, orderNumber={}, userId={}, storeId={}, oldStatus={}, newStatus=CANCELLED, operation=UPDATE_ORDER_STATUS",
                        orderId, order.getOrderNumber(), order.getUserId(), order.getStoreId(), oldStatus);
                break;
            default:
                break;
        }

        // 5. 保存订单
        BeverageOrder savedOrder = orderRepository.save(order);

        // 6. 订单完成时执行BOM自动扣料（US2-AC3）
        if (targetStatus == BeverageOrder.OrderStatus.COMPLETED) {
            try {
                BomDeductionService.BomDeductionResult deductionResult =
                    bomDeductionService.deductMaterialsForOrder(savedOrder);

                if (!deductionResult.isSuccess()) {
                    // Structured logging for partial BOM deduction failure (FR-027)
                    logger.warn("StatusUpdate - BOM_PARTIAL_FAILURE: orderId={}, orderNumber={}, successCount={}, totalMaterials={}, failureCount={}, operation=UPDATE_ORDER_STATUS",
                            orderId, savedOrder.getOrderNumber(),
                            deductionResult.getSuccessCount(),
                            deductionResult.getTotalMaterials(),
                            deductionResult.getFailureItems().size());
                    // 注意：扣料失败不影响订单状态，仅记录日志
                    // 实际生产环境可能需要：
                    // 1. 发送告警通知
                    // 2. 记录到审计日志
                    // 3. 创建补偿任务
                } else {
                    // Structured logging for BOM deduction success (FR-027)
                    logger.info("StatusUpdate - BOM_SUCCESS: orderId={}, orderNumber={}, deductedItems={}, operation=UPDATE_ORDER_STATUS",
                            orderId, savedOrder.getOrderNumber(),
                            deductionResult.getSuccessCount());
                }
            } catch (Exception e) {
                // Structured logging for BOM deduction exception (FR-027)
                logger.error("StatusUpdate - BOM_EXCEPTION: orderId={}, orderNumber={}, operation=UPDATE_ORDER_STATUS, error={}",
                        orderId, savedOrder.getOrderNumber(), e.getMessage(), e);
                // 异常不影响订单状态更新
            }
        }

        // Structured logging for status update success (FR-027)
        logger.info("StatusUpdate - SUCCESS: orderId={}, orderNumber={}, oldStatus={}, newStatus={}, operation=UPDATE_ORDER_STATUS",
                orderId, order.getOrderNumber(), oldStatus, targetStatus);

        return BeverageOrderDTO.fromEntity(savedOrder);
    }
}
