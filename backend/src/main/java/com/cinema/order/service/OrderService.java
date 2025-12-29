/**
 * @spec O001-product-order-list
 * @spec O003-beverage-order
 * 订单服务层
 */
package com.cinema.order.service;

import com.cinema.order.domain.*;
import com.cinema.order.dto.*;
import com.cinema.order.exception.*;
import com.cinema.order.mapper.OrderMapper;
import com.cinema.order.repository.JdbcProductOrderRepository;
import com.cinema.order.repository.UnifiedOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 订单服务层
 *
 * 处理订单相关的业务逻辑
 */
@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final JdbcProductOrderRepository repository;
    private final UnifiedOrderRepository unifiedOrderRepository;
    private final OrderMapper mapper;

    public OrderService(
        JdbcProductOrderRepository repository,
        UnifiedOrderRepository unifiedOrderRepository,
        OrderMapper mapper
    ) {
        this.repository = repository;
        this.unifiedOrderRepository = unifiedOrderRepository;
        this.mapper = mapper;
    }

    /**
     * 查询订单列表（支持筛选和分页）
     *
     * 注意：此方法仅查询商品订单，不包含饮品订单
     * 如需查询所有订单类型，请使用 findUnifiedOrders 方法
     *
     * @param params 查询参数
     * @return 订单列表响应
     */
    public OrderListResponse findOrders(OrderQueryParams params) {
        logger.info("Querying product orders with params: status={}, page={}, pageSize={}",
            params.getStatus(), params.getPage(), params.getPageSize());

        JdbcProductOrderRepository.PageResult<ProductOrder> pageResult =
            repository.findByConditions(params);

        List<ProductOrderDTO> orderDTOs = mapper.toDTOList(pageResult.getData());

        return OrderListResponse.success(
            orderDTOs,
            pageResult.getTotal(),
            params.getPage(),
            params.getPageSize(),
            "查询成功"
        );
    }

    /**
     * 查询统一订单列表（包含商品订单和饮品订单）
     *
     * @param params 查询参数
     * @return 统一订单列表响应
     */
    public UnifiedOrderListResponse findUnifiedOrders(OrderQueryParams params) {
        logger.info("Querying unified orders with params: status={}, page={}, pageSize={}",
            params.getStatus(), params.getPage(), params.getPageSize());

        UnifiedOrderRepository.PageResult<UnifiedOrderDTO> pageResult =
            unifiedOrderRepository.findUnifiedOrders(params);

        return UnifiedOrderListResponse.success(
            pageResult.getData(),
            pageResult.getTotal(),
            params.getPage(),
            params.getPageSize(),
            "查询成功"
        );
    }

    /**
     * 根据ID查询订单详情
     *
     * @param orderId 订单ID
     * @return 订单详情
     */
    public ProductOrderDTO findOrderById(String orderId) {
        logger.info("Querying order detail: orderId={}", orderId);

        UUID uuid;
        try {
            uuid = UUID.fromString(orderId);
        } catch (IllegalArgumentException e) {
            throw new OrderNotFoundException(orderId);
        }

        ProductOrder order = repository.findById(uuid);

        if (order == null) {
            throw new OrderNotFoundException(orderId);
        }

        return mapper.toDTO(order);
    }

    /**
     * 更新订单状态
     *
     * @param orderId 订单ID
     * @param request 更新请求
     * @return 更新后的订单
     */
    @Transactional
    public ProductOrderDTO updateOrderStatus(String orderId, UpdateStatusRequest request) {
        logger.info("Updating order status: orderId={}, newStatus={}, version={}",
            orderId, request.getStatus(), request.getVersion());

        // 1. 查询订单
        UUID uuid;
        try {
            uuid = UUID.fromString(orderId);
        } catch (IllegalArgumentException e) {
            throw new OrderNotFoundException(orderId);
        }

        ProductOrder order = repository.findById(uuid);

        if (order == null) {
            throw new OrderNotFoundException(orderId);
        }

        // 2. 乐观锁版本检查
        if (!order.getVersion().equals(request.getVersion())) {
            throw new OrderOptimisticLockException(
                orderId,
                request.getVersion(),
                order.getVersion()
            );
        }

        // 3. 状态转换验证
        OrderStatus currentStatus = order.getStatus();
        OrderStatus targetStatus = request.getStatus();

        if (!currentStatus.canTransitionTo(targetStatus)) {
            throw new InvalidOrderStatusTransitionException(orderId, currentStatus, targetStatus);
        }

        // 4. 取消订单时必须提供原因
        if (targetStatus == OrderStatus.CANCELLED &&
            (request.getCancelReason() == null || request.getCancelReason().trim().isEmpty())) {
            throw new CancelReasonRequiredException(orderId);
        }

        // 5. 更新订单状态
        LocalDateTime now = LocalDateTime.now();
        order.setStatus(targetStatus);

        switch (targetStatus) {
            case SHIPPED:
                order.setShippedTime(now);
                break;
            case COMPLETED:
                order.setCompletedTime(now);
                break;
            case CANCELLED:
                order.setCancelledTime(now);
                order.setCancelReason(request.getCancelReason());
                break;
        }

        // 6. 执行更新
        int updatedRows = repository.updateOrderStatus(order);

        if (updatedRows == 0) {
            // 乐观锁冲突或订单不存在
            throw new OrderOptimisticLockException(
                orderId,
                request.getVersion(),
                order.getVersion()
            );
        }

        // 7. 记录操作日志
        OrderLog log = new OrderLog();
        log.setId(UUID.randomUUID());
        log.setOrderId(uuid);
        log.setAction(getLogAction(targetStatus));
        log.setStatusBefore(currentStatus);
        log.setStatusAfter(targetStatus);
        log.setOperatorId(UUID.fromString("950e8400-e29b-41d4-a716-446655440001")); // TODO: 从当前用户上下文获取
        log.setOperatorName("运营管理员"); // TODO: 从当前用户上下文获取
        log.setComments(request.getCancelReason() != null ?
            request.getCancelReason() :
            String.format("订单状态更新: %s → %s", currentStatus, targetStatus));
        log.setCreatedAt(now);

        repository.insertOrderLog(log);

        // 8. 返回更新后的订单
        ProductOrder updatedOrder = repository.findById(uuid);
        return mapper.toDTO(updatedOrder);
    }

    /**
     * 根据新状态获取日志动作
     *
     * @param status 订单状态
     * @return 日志动作
     */
    private OrderLog.LogAction getLogAction(OrderStatus status) {
        return switch (status) {
            case PENDING_PAYMENT -> OrderLog.LogAction.CREATE_ORDER;
            case PAID -> OrderLog.LogAction.PAYMENT;
            case SHIPPED -> OrderLog.LogAction.SHIP;
            case COMPLETED -> OrderLog.LogAction.COMPLETE;
            case CANCELLED -> OrderLog.LogAction.CANCEL;
        };
    }
}
