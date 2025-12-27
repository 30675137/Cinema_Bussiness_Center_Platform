package com.cinema.reservation.service;

import com.cinema.reservation.domain.ReservationItem;
import com.cinema.reservation.domain.ReservationOperationLog;
import com.cinema.reservation.domain.ReservationOrder;
import com.cinema.reservation.domain.SlotInventorySnapshot;
import com.cinema.reservation.domain.enums.OperationType;
import com.cinema.reservation.domain.enums.ReservationStatus;
import com.cinema.reservation.dto.*;
import com.cinema.reservation.exception.InsufficientInventoryException;
import com.cinema.reservation.exception.InvalidStatusTransitionException;
import com.cinema.reservation.exception.ReservationNotFoundException;
import com.cinema.reservation.repository.ReservationItemRepository;
import com.cinema.reservation.repository.ReservationOperationLogRepository;
import com.cinema.reservation.repository.ReservationOrderRepository;
import com.cinema.reservation.repository.SlotInventorySnapshotRepository;
import com.cinema.scenariopackage.model.AddonItem;
import com.cinema.scenariopackage.model.PackageTier;
import com.cinema.scenariopackage.model.ScenarioPackage;
import com.cinema.scenariopackage.model.TimeSlotTemplate;
import com.cinema.scenariopackage.repository.AddonItemRepository;
import com.cinema.scenariopackage.repository.PackageTierRepository;
import com.cinema.scenariopackage.repository.ScenarioPackageRepository;
import com.cinema.scenariopackage.repository.TimeSlotTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 预约单服务
 * <p>
 * 提供预约单的核心业务逻辑，包括创建预约、确认预约、取消预约、修改预约等。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@Service
public class ReservationOrderService {

    private static final Logger logger = LoggerFactory.getLogger(ReservationOrderService.class);

    private final ReservationOrderRepository reservationOrderRepository;
    private final ReservationItemRepository reservationItemRepository;
    private final ReservationOperationLogRepository operationLogRepository;
    private final SlotInventorySnapshotRepository inventorySnapshotRepository;
    private final ReservationNumberGenerator numberGenerator;

    // 依赖的场景包相关仓库
    private final ScenarioPackageRepository scenarioPackageRepository;
    private final PackageTierRepository packageTierRepository;
    private final TimeSlotTemplateRepository timeSlotTemplateRepository;
    private final AddonItemRepository addonItemRepository;

    public ReservationOrderService(
            ReservationOrderRepository reservationOrderRepository,
            ReservationItemRepository reservationItemRepository,
            ReservationOperationLogRepository operationLogRepository,
            SlotInventorySnapshotRepository inventorySnapshotRepository,
            ReservationNumberGenerator numberGenerator,
            ScenarioPackageRepository scenarioPackageRepository,
            PackageTierRepository packageTierRepository,
            TimeSlotTemplateRepository timeSlotTemplateRepository,
            AddonItemRepository addonItemRepository) {
        this.reservationOrderRepository = reservationOrderRepository;
        this.reservationItemRepository = reservationItemRepository;
        this.operationLogRepository = operationLogRepository;
        this.inventorySnapshotRepository = inventorySnapshotRepository;
        this.numberGenerator = numberGenerator;
        this.scenarioPackageRepository = scenarioPackageRepository;
        this.packageTierRepository = packageTierRepository;
        this.timeSlotTemplateRepository = timeSlotTemplateRepository;
        this.addonItemRepository = addonItemRepository;
    }

    // ==================== C端接口 ====================

    /**
     * 创建预约单 (C端)
     *
     * @param userId  用户ID
     * @param request 创建请求
     * @return 预约单详情
     */
    @Transactional
    public ReservationOrderDTO createReservation(UUID userId, CreateReservationRequest request) {
        logger.info("Creating reservation for user: {}, packageId: {}", userId, request.getScenarioPackageId());

        // 1. 验证场景包存在
        ScenarioPackage scenarioPackage = scenarioPackageRepository.findById(request.getScenarioPackageId())
                .orElseThrow(() -> new IllegalArgumentException("场景包不存在: " + request.getScenarioPackageId()));

        // 2. 验证套餐存在
        PackageTier packageTier = packageTierRepository.findById(request.getPackageTierId())
                .orElseThrow(() -> new IllegalArgumentException("套餐不存在: " + request.getPackageTierId()));

        // 3. 验证时段模板存在
        TimeSlotTemplate timeSlotTemplate = timeSlotTemplateRepository.findById(request.getTimeSlotTemplateId())
                .orElseThrow(() -> new IllegalArgumentException("时段模板不存在: " + request.getTimeSlotTemplateId()));

        // 4. 解析预订日期
        LocalDate reservationDate = LocalDate.parse(request.getReservationDate());

        // 5. 检查库存
        checkInventory(reservationDate, request.getTimeSlotTemplateId(), timeSlotTemplate.getCapacity());

        // 6. 计算总金额
        BigDecimal totalAmount = calculateTotalAmount(packageTier, request.getAddonItems());

        // 7. 生成预约单号
        String orderNumber = numberGenerator.generate();

        // 8. 创建预约单
        ReservationOrder order = new ReservationOrder();
        order.setOrderNumber(orderNumber);
        order.setUserId(userId);
        order.setScenarioPackageId(request.getScenarioPackageId());
        order.setPackageTierId(request.getPackageTierId());
        order.setTimeSlotTemplateId(request.getTimeSlotTemplateId());
        order.setReservationDate(reservationDate);
        order.setReservationTime(timeSlotTemplate.getStartTime());
        order.setContactName(request.getContactName());
        order.setContactPhone(request.getContactPhone());
        order.setRemark(request.getRemark());
        order.setTotalAmount(totalAmount);
        order.setStatus(ReservationStatus.PENDING);

        order = reservationOrderRepository.save(order);

        // 9. 创建加购项明细
        if (request.getAddonItems() != null && !request.getAddonItems().isEmpty()) {
            for (CreateReservationRequest.AddonItemRequest addonRequest : request.getAddonItems()) {
                AddonItem addonItem = addonItemRepository.findById(addonRequest.getAddonItemId())
                        .orElseThrow(() -> new IllegalArgumentException("加购项不存在: " + addonRequest.getAddonItemId()));

                ReservationItem item = new ReservationItem();
                item.setAddonItemId(addonItem.getId());
                item.setAddonNameSnapshot(addonItem.getName());
                item.setAddonPriceSnapshot(addonItem.getPrice());
                item.setQuantity(addonRequest.getQuantity());
                item.setSubtotal(addonItem.getPrice().multiply(BigDecimal.valueOf(addonRequest.getQuantity())));
                order.addItem(item);
            }
        }

        // 10. 创建操作日志
        ReservationOperationLog log = new ReservationOperationLog();
        log.setOperationType(OperationType.CREATE);
        log.setOperatorId(userId);
        log.setAfterValue(Map.of("status", ReservationStatus.PENDING.name()));
        log.setRemark("用户创建预约单");
        order.addOperationLog(log);

        order = reservationOrderRepository.save(order);

        // 11. 创建库存快照
        createInventorySnapshot(order, timeSlotTemplate.getCapacity());

        logger.info("Reservation created successfully: {}", orderNumber);
        return toDTO(order, scenarioPackage.getName(), packageTier.getName(), timeSlotTemplate);
    }

    /**
     * 查询用户的预约单列表 (C端)
     *
     * @param userId   用户ID
     * @param pageable 分页参数
     * @return 分页结果
     */
    @Transactional(readOnly = true)
    public Page<ReservationListItemDTO> findByUser(UUID userId, Pageable pageable) {
        logger.debug("Finding reservations for user: {}", userId);
        Page<ReservationOrder> orders = reservationOrderRepository.findByUserId(userId, pageable);
        return orders.map(this::toListItemDTO);
    }

    /**
     * 查询预约单详情 (C端/B端共用)
     *
     * @param orderNumber 预约单号
     * @return 预约单详情
     */
    @Transactional(readOnly = true)
    public ReservationOrderDTO findByOrderNumber(String orderNumber) {
        logger.debug("Finding reservation by orderNumber: {}", orderNumber);
        ReservationOrder order = reservationOrderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> ReservationNotFoundException.byOrderNumber(orderNumber));
        return toFullDTO(order);
    }

    /**
     * 查询预约单详情 (通过ID)
     *
     * @param id 预约单ID
     * @return 预约单详情
     */
    @Transactional(readOnly = true)
    public ReservationOrderDTO findById(UUID id) {
        logger.debug("Finding reservation by id: {}", id);
        ReservationOrder order = reservationOrderRepository.findById(id)
                .orElseThrow(() -> ReservationNotFoundException.byId(id.toString()));
        return toFullDTO(order);
    }

    // ==================== B端接口 ====================

    /**
     * 查询预约单列表 (B端)
     *
     * @param query 查询条件
     * @return 分页结果
     */
    @Transactional(readOnly = true)
    public Page<ReservationListItemDTO> findByConditions(ReservationListQueryRequest query) {
        logger.debug("Finding reservations with conditions: {}", query);

        Sort sort = Sort.by(
                "desc".equalsIgnoreCase(query.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC,
                query.getSortBy()
        );
        Pageable pageable = PageRequest.of(query.getPage(), query.getSize(), sort);

        // 简化实现：使用单一状态查询
        ReservationStatus status = null;
        if (query.getStatuses() != null && !query.getStatuses().isEmpty()) {
            status = query.getStatuses().get(0);
        }

        LocalDate reservationDate = null;
        if (query.getReservationDateStart() != null) {
            reservationDate = LocalDate.parse(query.getReservationDateStart());
        }

        Page<ReservationOrder> orders = reservationOrderRepository.findByConditions(
                query.getOrderNumber(),
                query.getContactPhone(),
                status,
                reservationDate,
                pageable
        );

        return orders.map(this::toListItemDTO);
    }

    /**
     * 确认预约单 (B端)
     *
     * @param id         预约单ID
     * @param request    确认请求
     * @param operatorId 操作人ID
     * @return 预约单详情
     */
    @Transactional
    public ReservationOrderDTO confirmReservation(UUID id, ConfirmReservationRequest request, UUID operatorId) {
        logger.info("Confirming reservation: {}, requiresPayment: {}", id, request.getRequiresPayment());

        ReservationOrder order = reservationOrderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> ReservationNotFoundException.byId(id.toString()));

        // 验证状态转换
        ReservationStatus targetStatus = request.getRequiresPayment() ? 
                ReservationStatus.CONFIRMED : ReservationStatus.COMPLETED;
        
        if (!order.getStatus().canTransitionTo(targetStatus)) {
            throw new InvalidStatusTransitionException(order.getStatus(), targetStatus);
        }

        // 记录原状态
        ReservationStatus previousStatus = order.getStatus();

        // 执行确认
        order.confirm(request.getRequiresPayment());

        // 创建操作日志
        ReservationOperationLog log = new ReservationOperationLog();
        log.setOperationType(OperationType.CONFIRM);
        log.setOperatorId(operatorId);
        log.setBeforeValue(Map.of("status", previousStatus.name()));
        log.setAfterValue(Map.of("status", order.getStatus().name(), "requiresPayment", request.getRequiresPayment()));
        log.setRemark(request.getRemark());
        order.addOperationLog(log);

        order = reservationOrderRepository.save(order);

        logger.info("Reservation confirmed: {}, newStatus: {}", order.getOrderNumber(), order.getStatus());
        return toFullDTO(order);
    }

    /**
     * 取消预约单 (B端)
     *
     * @param id         预约单ID
     * @param request    取消请求
     * @param operatorId 操作人ID
     * @return 预约单详情
     */
    @Transactional
    public ReservationOrderDTO cancelReservation(UUID id, CancelReservationRequest request, UUID operatorId) {
        logger.info("Cancelling reservation: {}, reason: {}", id, request.getCancelReason());

        ReservationOrder order = reservationOrderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> ReservationNotFoundException.byId(id.toString()));

        // 验证状态转换
        if (!order.getStatus().canTransitionTo(ReservationStatus.CANCELLED)) {
            throw new InvalidStatusTransitionException(order.getStatus(), ReservationStatus.CANCELLED);
        }

        // 记录原状态
        ReservationStatus previousStatus = order.getStatus();

        // 执行取消
        order.cancel(request.getCancelReason());

        // 释放库存
        releaseInventory(order.getScenarioPackageId(), order.getReservationDate(), order.getTimeSlotTemplateId());

        // 创建操作日志
        ReservationOperationLog log = new ReservationOperationLog();
        log.setOperationType(OperationType.CANCEL);
        log.setOperatorId(operatorId);
        log.setBeforeValue(Map.of("status", previousStatus.name()));
        log.setAfterValue(Map.of("status", order.getStatus().name(), 
                "cancelReasonType", request.getCancelReasonType() != null ? request.getCancelReasonType() : ""));
        log.setRemark(request.getCancelReason());
        order.addOperationLog(log);

        order = reservationOrderRepository.save(order);

        logger.info("Reservation cancelled: {}", order.getOrderNumber());
        return toFullDTO(order);
    }

    /**
     * 修改预约单 (B端)
     *
     * @param id         预约单ID
     * @param request    修改请求
     * @param operatorId 操作人ID
     * @return 预约单详情
     */
    @Transactional
    public ReservationOrderDTO updateReservation(UUID id, UpdateReservationRequest request, UUID operatorId) {
        logger.info("Updating reservation: {}", id);

        ReservationOrder order = reservationOrderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> ReservationNotFoundException.byId(id.toString()));

        // 已完成的预约单不可修改
        if (order.getStatus().isTerminal()) {
            throw new IllegalStateException("已完成或已取消的预约单无法修改");
        }

        // 记录修改前的值
        String previousContactName = order.getContactName();
        String previousContactPhone = order.getContactPhone();
        String previousRemark = order.getRemark();

        // 执行修改
        if (request.getContactName() != null) {
            order.setContactName(request.getContactName());
        }
        if (request.getContactPhone() != null) {
            order.setContactPhone(request.getContactPhone());
        }
        if (request.getRemark() != null) {
            order.setRemark(request.getRemark());
        }

        // 创建操作日志
        ReservationOperationLog log = new ReservationOperationLog();
        log.setOperationType(OperationType.UPDATE);
        log.setOperatorId(operatorId);
        log.setBeforeValue(Map.of(
                "contactName", previousContactName != null ? previousContactName : "",
                "contactPhone", previousContactPhone != null ? previousContactPhone : "",
                "remark", previousRemark != null ? previousRemark : ""
        ));
        log.setAfterValue(Map.of(
                "contactName", order.getContactName() != null ? order.getContactName() : "",
                "contactPhone", order.getContactPhone() != null ? order.getContactPhone() : "",
                "remark", order.getRemark() != null ? order.getRemark() : ""
        ));
        log.setRemark("修改联系人信息");
        order.addOperationLog(log);

        order = reservationOrderRepository.save(order);

        logger.info("Reservation updated: {}", order.getOrderNumber());
        return toFullDTO(order);
    }

    /**
     * 完成支付 (支付回调)
     *
     * @param orderNumber 预约单号
     * @param paymentId   支付流水号
     * @return 预约单详情
     */
    @Transactional
    public ReservationOrderDTO completePayment(String orderNumber, String paymentId) {
        logger.info("Completing payment for reservation: {}, paymentId: {}", orderNumber, paymentId);

        ReservationOrder order = reservationOrderRepository.findByOrderNumberForUpdate(orderNumber)
                .orElseThrow(() -> ReservationNotFoundException.byOrderNumber(orderNumber));

        // 验证状态
        if (order.getStatus() != ReservationStatus.CONFIRMED) {
            throw new InvalidStatusTransitionException(order.getStatus(), ReservationStatus.COMPLETED,
                    "只有已确认的预约单才能完成支付");
        }

        // 记录原状态
        ReservationStatus previousStatus = order.getStatus();

        // 执行支付完成
        order.completePayment(paymentId);

        // 创建操作日志
        ReservationOperationLog log = new ReservationOperationLog();
        log.setOperationType(OperationType.PAYMENT);
        log.setOperatorId(order.getUserId());
        log.setBeforeValue(Map.of("status", previousStatus.name()));
        log.setAfterValue(Map.of("status", order.getStatus().name(), "paymentId", paymentId));
        log.setRemark("支付完成");
        order.addOperationLog(log);

        order = reservationOrderRepository.save(order);

        logger.info("Payment completed for reservation: {}", orderNumber);
        return toFullDTO(order);
    }

    // ==================== 私有辅助方法 ====================

    /**
     * 检查库存是否充足
     * 简化实现：通过计数查询当前占用的预约数量
     */
    private void checkInventory(LocalDate date, UUID timeSlotTemplateId, int maxCapacity) {
        int occupiedCount = reservationOrderRepository.countOccupiedByDateAndTimeSlot(date, timeSlotTemplateId);
        if (occupiedCount >= maxCapacity) {
            throw new InsufficientInventoryException("该时段预约已满，请选择其他时段");
        }
        logger.debug("Inventory check passed: date={}, slot={}, occupied={}, max={}",
                date, timeSlotTemplateId, occupiedCount, maxCapacity);
    }

    /**
     * 创建库存快照（用于审计）
     */
    private void createInventorySnapshot(ReservationOrder order, int totalCapacity) {
        int bookedCount = reservationOrderRepository.countOccupiedByDateAndTimeSlot(
                order.getReservationDate(), order.getTimeSlotTemplateId());
        
        SlotInventorySnapshot snapshot = SlotInventorySnapshot.create(
                order.getTimeSlotTemplateId(),
                order.getReservationDate(),
                totalCapacity,
                bookedCount
        );
        snapshot.setReservationOrder(order);
        inventorySnapshotRepository.save(snapshot);
    }

    /**
     * 释放库存（当前简化实现无需额外操作，因为库存计算基于状态计数）
     */
    private void releaseInventory(UUID scenarioPackageId, LocalDate date, UUID timeSlotTemplateId) {
        // 简化实现：取消预约后状态变为 CANCELLED，计数查询自然排除
        logger.debug("Inventory released (via status change) for package: {}, date: {}, slot: {}",
                scenarioPackageId, date, timeSlotTemplateId);
    }

    /**
     * 计算总金额
     */
    private BigDecimal calculateTotalAmount(PackageTier tier, List<CreateReservationRequest.AddonItemRequest> addonItems) {
        BigDecimal total = tier.getPrice();

        if (addonItems != null && !addonItems.isEmpty()) {
            for (CreateReservationRequest.AddonItemRequest addonRequest : addonItems) {
                AddonItem addonItem = addonItemRepository.findById(addonRequest.getAddonItemId())
                        .orElseThrow(() -> new IllegalArgumentException("加购项不存在: " + addonRequest.getAddonItemId()));
                total = total.add(addonItem.getPrice().multiply(BigDecimal.valueOf(addonRequest.getQuantity())));
            }
        }

        return total;
    }

    // ==================== DTO 转换方法 ====================

    private ReservationOrderDTO toDTO(ReservationOrder order, String packageName, String tierName, TimeSlotTemplate slot) {
        ReservationOrderDTO dto = new ReservationOrderDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId());
        dto.setScenarioPackageId(order.getScenarioPackageId());
        dto.setScenarioPackageName(packageName);
        dto.setPackageTierId(order.getPackageTierId());
        dto.setPackageTierName(tierName);
        dto.setTimeSlotTemplateId(order.getTimeSlotTemplateId());
        dto.setReservationDate(order.getReservationDate());
        dto.setReservationTime(order.getReservationTime());
        dto.setReservationEndTime(slot.getEndTime());
        dto.setContactName(order.getContactName());
        dto.setContactPhone(order.getContactPhone());
        dto.setRemark(order.getRemark());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setStatusDisplayName(order.getStatus().getDisplayName());
        dto.setRequiresPayment(order.getRequiresPayment());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        // 转换加购项
        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(this::toItemDTO).collect(Collectors.toList()));
        }

        return dto;
    }

    private ReservationOrderDTO toFullDTO(ReservationOrder order) {
        // 查询关联的场景包、套餐、时段信息
        String packageName = scenarioPackageRepository.findById(order.getScenarioPackageId())
                .map(ScenarioPackage::getName).orElse("未知场景包");
        String tierName = packageTierRepository.findById(order.getPackageTierId())
                .map(PackageTier::getName).orElse("未知套餐");
        TimeSlotTemplate slot = timeSlotTemplateRepository.findById(order.getTimeSlotTemplateId())
                .orElse(null);

        ReservationOrderDTO dto = new ReservationOrderDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId());
        dto.setScenarioPackageId(order.getScenarioPackageId());
        dto.setScenarioPackageName(packageName);
        dto.setPackageTierId(order.getPackageTierId());
        dto.setPackageTierName(tierName);
        dto.setTimeSlotTemplateId(order.getTimeSlotTemplateId());
        dto.setReservationDate(order.getReservationDate());
        dto.setReservationTime(order.getReservationTime());
        dto.setReservationEndTime(slot != null ? slot.getEndTime() : null);
        dto.setContactName(order.getContactName());
        dto.setContactPhone(order.getContactPhone());
        dto.setRemark(order.getRemark());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setStatusDisplayName(order.getStatus().getDisplayName());
        dto.setRequiresPayment(order.getRequiresPayment());
        dto.setPaymentId(order.getPaymentId());
        dto.setPaymentTime(order.getPaymentTime());
        dto.setCancelReason(order.getCancelReason());
        dto.setCancelledAt(order.getCancelledAt());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        // 转换加购项
        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(this::toItemDTO).collect(Collectors.toList()));
        }

        // 转换操作日志
        if (order.getOperationLogs() != null) {
            dto.setOperationLogs(order.getOperationLogs().stream().map(this::toLogDTO).collect(Collectors.toList()));
        }

        return dto;
    }

    private ReservationListItemDTO toListItemDTO(ReservationOrder order) {
        String packageName = scenarioPackageRepository.findById(order.getScenarioPackageId())
                .map(ScenarioPackage::getName).orElse("未知场景包");
        String tierName = packageTierRepository.findById(order.getPackageTierId())
                .map(PackageTier::getName).orElse("未知套餐");

        ReservationListItemDTO dto = new ReservationListItemDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setContactName(order.getContactName());
        dto.setContactPhone(order.getContactPhone());
        dto.setScenarioPackageName(packageName);
        dto.setPackageTierName(tierName);
        dto.setReservationDate(order.getReservationDate());
        dto.setReservationTime(order.getReservationTime());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setStatusDisplayName(order.getStatus().getDisplayName());
        dto.setRequiresPayment(order.getRequiresPayment());
        dto.setCreatedAt(order.getCreatedAt());

        return dto;
    }

    private ReservationItemDTO toItemDTO(ReservationItem item) {
        ReservationItemDTO dto = new ReservationItemDTO();
        dto.setId(item.getId());
        dto.setAddonItemId(item.getAddonItemId());
        dto.setAddonItemName(item.getAddonNameSnapshot());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getAddonPriceSnapshot());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }

    private OperationLogDTO toLogDTO(ReservationOperationLog log) {
        OperationLogDTO dto = new OperationLogDTO();
        dto.setId(log.getId());
        dto.setOperationType(log.getOperationType());
        dto.setOperationTypeDisplayName(log.getOperationType().getDisplayName());
        dto.setOperatorId(log.getOperatorId());
        dto.setOperatorName(log.getOperatorName());
        dto.setOperatedAt(log.getOperationTime());
        dto.setReason(log.getRemark());
        
        // 从 beforeValue/afterValue 中提取状态信息
        if (log.getBeforeValue() != null && log.getBeforeValue().containsKey("status")) {
            dto.setPreviousStatus(String.valueOf(log.getBeforeValue().get("status")));
        }
        if (log.getAfterValue() != null && log.getAfterValue().containsKey("status")) {
            dto.setNewStatus(String.valueOf(log.getAfterValue().get("status")));
        }
        dto.setExtraData(log.getAfterValue());
        
        return dto;
    }
}
