/**
 * @spec N001-purchase-inbound
 * 采购订单服务层
 */
package com.cinema.procurement.service;

import com.cinema.inventory.entity.StoreEntity;
import com.cinema.inventory.repository.StoreJpaRepository;
import com.cinema.procurement.dto.CreatePurchaseOrderRequest;
import com.cinema.procurement.dto.PurchaseOrderDTO;
import com.cinema.procurement.dto.PurchaseOrderMapper;
import com.cinema.procurement.dto.PurchaseOrderStatusHistoryDTO;
import com.cinema.procurement.entity.PurchaseOrderEntity;
import com.cinema.procurement.entity.PurchaseOrderItemEntity;
import com.cinema.procurement.entity.PurchaseOrderStatus;
import com.cinema.procurement.entity.PurchaseOrderStatusHistory;
import com.cinema.procurement.entity.SupplierEntity;
import com.cinema.procurement.repository.PurchaseOrderRepository;
import com.cinema.procurement.repository.PurchaseOrderStatusHistoryRepository;
import com.cinema.procurement.repository.SupplierRepository;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.repository.SkuJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderStatusHistoryRepository statusHistoryRepository;
    private final SupplierRepository supplierRepository;
    private final StoreJpaRepository storeRepository;
    private final SkuJpaRepository skuRepository;
    private final PurchaseOrderMapper mapper;

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            PurchaseOrderStatusHistoryRepository statusHistoryRepository,
            SupplierRepository supplierRepository,
            StoreJpaRepository storeRepository,
            SkuJpaRepository skuRepository,
            PurchaseOrderMapper mapper) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.supplierRepository = supplierRepository;
        this.storeRepository = storeRepository;
        this.skuRepository = skuRepository;
        this.mapper = mapper;
    }

    /**
     * 创建采购订单
     */
    @Transactional
    public PurchaseOrderDTO create(CreatePurchaseOrderRequest request) {
        // 1. 验证供应商存在
        SupplierEntity supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new IllegalArgumentException("供应商不存在: " + request.getSupplierId()));

        // 2. 验证门店存在
        StoreEntity store = storeRepository.findById(request.getStoreId())
            .orElseThrow(() -> new IllegalArgumentException("门店不存在: " + request.getStoreId()));

        // 3. 创建订单实体
        PurchaseOrderEntity order = new PurchaseOrderEntity();
        order.setOrderNumber(purchaseOrderRepository.generateOrderNumber());
        order.setSupplier(supplier);
        order.setStore(store);
        order.setStatus(PurchaseOrderStatus.DRAFT);
        order.setPlannedArrivalDate(request.getPlannedArrivalDate());
        order.setRemarks(request.getRemarks());

        // 4. 添加订单明细
        for (CreatePurchaseOrderRequest.ItemRequest itemRequest : request.getItems()) {
            Sku sku = skuRepository.findById(itemRequest.getSkuId())
                .orElseThrow(() -> new IllegalArgumentException("SKU不存在: " + itemRequest.getSkuId()));

            PurchaseOrderItemEntity item = new PurchaseOrderItemEntity();
            item.setSku(sku);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(itemRequest.getUnitPrice());
            order.addItem(item);
        }

        // 5. 保存并返回
        PurchaseOrderEntity saved = purchaseOrderRepository.save(order);
        return mapper.toDTOWithItems(saved);
    }

    /**
     * 根据ID获取采购订单详情
     */
    public PurchaseOrderDTO findById(UUID id) {
        return purchaseOrderRepository.findByIdWithItems(id)
            .map(mapper::toDTOWithItems)
            .orElseThrow(() -> new IllegalArgumentException("采购订单不存在: " + id));
    }

    /**
     * 分页查询采购订单列表
     */
    public Page<PurchaseOrderDTO> findByFilters(UUID storeId, UUID supplierId, PurchaseOrderStatus status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        Page<PurchaseOrderEntity> entities = purchaseOrderRepository.findByFilters(storeId, supplierId, status, pageable);
        return entities.map(mapper::toDTO);
    }

    /**
     * 提交审核
     */
    @Transactional
    public PurchaseOrderDTO submit(UUID id) {
        PurchaseOrderEntity order = purchaseOrderRepository.findByIdWithLock(id)
            .orElseThrow(() -> new IllegalArgumentException("采购订单不存在: " + id));

        if (order.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new IllegalStateException("只有草稿状态的订单可以提交审核");
        }

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalStateException("订单明细不能为空");
        }

        PurchaseOrderStatus fromStatus = order.getStatus();
        order.setStatus(PurchaseOrderStatus.PENDING_APPROVAL);
        PurchaseOrderEntity saved = purchaseOrderRepository.save(order);

        // 记录状态变更历史
        recordStatusChange(saved, fromStatus, PurchaseOrderStatus.PENDING_APPROVAL, "提交审核");

        return mapper.toDTO(saved);
    }

    /**
     * 审批通过
     */
    @Transactional
    public PurchaseOrderDTO approve(UUID id, UUID approvedBy) {
        PurchaseOrderEntity order = purchaseOrderRepository.findByIdWithLock(id)
            .orElseThrow(() -> new IllegalArgumentException("采购订单不存在: " + id));

        if (order.getStatus() != PurchaseOrderStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("只有待审核状态的订单可以审批");
        }

        PurchaseOrderStatus fromStatus = order.getStatus();
        order.setStatus(PurchaseOrderStatus.APPROVED);
        order.setApprovedBy(approvedBy);
        order.setApprovedAt(Instant.now());
        PurchaseOrderEntity saved = purchaseOrderRepository.save(order);

        // 记录状态变更历史
        recordStatusChange(saved, fromStatus, PurchaseOrderStatus.APPROVED, "审批通过");

        return mapper.toDTO(saved);
    }

    /**
     * 审批拒绝
     */
    @Transactional
    public PurchaseOrderDTO reject(UUID id, UUID approvedBy, String reason) {
        PurchaseOrderEntity order = purchaseOrderRepository.findByIdWithLock(id)
            .orElseThrow(() -> new IllegalArgumentException("采购订单不存在: " + id));

        if (order.getStatus() != PurchaseOrderStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("只有待审核状态的订单可以拒绝");
        }

        PurchaseOrderStatus fromStatus = order.getStatus();
        order.setStatus(PurchaseOrderStatus.REJECTED);
        order.setApprovedBy(approvedBy);
        order.setApprovedAt(Instant.now());
        order.setRejectionReason(reason);
        PurchaseOrderEntity saved = purchaseOrderRepository.save(order);

        // 记录状态变更历史
        recordStatusChange(saved, fromStatus, PurchaseOrderStatus.REJECTED, "审批拒绝: " + reason);

        return mapper.toDTO(saved);
    }

    /**
     * 删除采购订单（仅草稿状态）
     */
    @Transactional
    public void delete(UUID id) {
        PurchaseOrderEntity order = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("采购订单不存在: " + id));

        if (order.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new IllegalStateException("只有草稿状态的订单可以删除");
        }

        purchaseOrderRepository.delete(order);
    }

    /**
     * 获取待审批订单列表
     */
    public Page<PurchaseOrderDTO> findPendingApproval(int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        Page<PurchaseOrderEntity> entities = purchaseOrderRepository.findByFilters(
            null, null, PurchaseOrderStatus.PENDING_APPROVAL, pageable);
        return entities.map(mapper::toDTO);
    }

    /**
     * 更新采购订单收货状态
     */
    @Transactional
    public void updateReceivedStatus(UUID orderId) {
        PurchaseOrderEntity order = purchaseOrderRepository.findByIdWithItems(orderId)
            .orElseThrow(() -> new IllegalArgumentException("采购订单不存在: " + orderId));

        boolean allReceived = order.getItems().stream()
            .allMatch(item -> item.getReceivedQty().compareTo(item.getQuantity()) >= 0);

        boolean anyReceived = order.getItems().stream()
            .anyMatch(item -> item.getReceivedQty().compareTo(java.math.BigDecimal.ZERO) > 0);

        if (allReceived) {
            order.setStatus(PurchaseOrderStatus.FULLY_RECEIVED);
        } else if (anyReceived) {
            order.setStatus(PurchaseOrderStatus.PARTIAL_RECEIVED);
        }

        purchaseOrderRepository.save(order);
    }

    /**
     * 获取采购订单状态变更历史
     */
    public List<PurchaseOrderStatusHistoryDTO> getStatusHistory(UUID orderId) {
        List<PurchaseOrderStatusHistory> histories = statusHistoryRepository
            .findByPurchaseOrderIdOrderByCreatedAtDesc(orderId);

        return histories.stream()
            .map(this::toStatusHistoryDTO)
            .toList();
    }

    /**
     * 记录状态变更历史
     */
    @Transactional
    public void recordStatusChange(PurchaseOrderEntity order,
                                    PurchaseOrderStatus fromStatus,
                                    PurchaseOrderStatus toStatus,
                                    String remarks) {
        PurchaseOrderStatusHistory history = new PurchaseOrderStatusHistory(
            order, fromStatus, toStatus, remarks);
        statusHistoryRepository.save(history);
    }

    /**
     * 转换状态历史为 DTO
     */
    private PurchaseOrderStatusHistoryDTO toStatusHistoryDTO(PurchaseOrderStatusHistory history) {
        PurchaseOrderStatusHistoryDTO dto = new PurchaseOrderStatusHistoryDTO();
        dto.setId(history.getId());
        dto.setFromStatus(history.getFromStatus() != null ? history.getFromStatus().name() : null);
        dto.setToStatus(history.getToStatus().name());
        dto.setChangedBy(history.getChangedBy());
        dto.setChangedByName(history.getChangedByName());
        dto.setRemarks(history.getRemarks());
        dto.setCreatedAt(history.getCreatedAt());
        return dto;
    }

    /**
     * 获取订单统计摘要
     */
    public OrderSummary getOrderSummary(UUID storeId) {
        long draftCount = purchaseOrderRepository.countByStoreIdAndStatus(storeId, PurchaseOrderStatus.DRAFT);
        long pendingCount = purchaseOrderRepository.countByStoreIdAndStatus(storeId, PurchaseOrderStatus.PENDING_APPROVAL);
        long approvedCount = purchaseOrderRepository.countByStoreIdAndStatus(storeId, PurchaseOrderStatus.APPROVED);
        long partialCount = purchaseOrderRepository.countByStoreIdAndStatus(storeId, PurchaseOrderStatus.PARTIAL_RECEIVED);

        return new OrderSummary(draftCount, pendingCount, approvedCount, partialCount);
    }

    /**
     * 订单统计摘要
     */
    public record OrderSummary(
        long draftCount,
        long pendingApprovalCount,
        long approvedCount,
        long partialReceivedCount
    ) {}
}
