/**
 * @spec N001-purchase-inbound
 * 收货入库服务层
 */
package com.cinema.procurement.service;

import com.cinema.inventory.entity.Inventory;
import com.cinema.inventory.repository.InventoryRepository;
import com.cinema.procurement.dto.CreateGoodsReceiptRequest;
import com.cinema.procurement.dto.GoodsReceiptDTO;
import com.cinema.procurement.dto.GoodsReceiptMapper;
import com.cinema.procurement.entity.*;
import com.cinema.procurement.repository.GoodsReceiptRepository;
import com.cinema.procurement.repository.PurchaseOrderItemRepository;
import com.cinema.procurement.repository.PurchaseOrderRepository;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.repository.SkuJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class GoodsReceiptService {

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final SkuJpaRepository skuRepository;
    private final InventoryRepository inventoryRepository;
    private final GoodsReceiptMapper mapper;
    private final PurchaseOrderService purchaseOrderService;

    public GoodsReceiptService(
            GoodsReceiptRepository goodsReceiptRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            PurchaseOrderItemRepository purchaseOrderItemRepository,
            SkuJpaRepository skuRepository,
            InventoryRepository inventoryRepository,
            GoodsReceiptMapper mapper,
            PurchaseOrderService purchaseOrderService) {
        this.goodsReceiptRepository = goodsReceiptRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseOrderItemRepository = purchaseOrderItemRepository;
        this.skuRepository = skuRepository;
        this.inventoryRepository = inventoryRepository;
        this.mapper = mapper;
        this.purchaseOrderService = purchaseOrderService;
    }

    /**
     * 创建收货入库单
     */
    @Transactional
    public GoodsReceiptDTO create(CreateGoodsReceiptRequest request) {
        // 1. 验证采购订单存在且状态正确
        PurchaseOrderEntity purchaseOrder = purchaseOrderRepository.findByIdWithItems(request.getPurchaseOrderId())
            .orElseThrow(() -> new IllegalArgumentException("采购订单不存在: " + request.getPurchaseOrderId()));

        if (purchaseOrder.getStatus() != PurchaseOrderStatus.APPROVED &&
            purchaseOrder.getStatus() != PurchaseOrderStatus.PARTIAL_RECEIVED) {
            throw new IllegalStateException("只有已审核或部分收货状态的订单可以创建收货单");
        }

        // 2. 构建采购订单明细的SKU到数量映射
        Map<UUID, PurchaseOrderItemEntity> poItemMap = purchaseOrder.getItems().stream()
            .collect(Collectors.toMap(PurchaseOrderItemEntity::getSkuId, item -> item));

        // 3. 创建收货单实体
        GoodsReceiptEntity receipt = new GoodsReceiptEntity();
        receipt.setReceiptNumber(goodsReceiptRepository.generateReceiptNumber());
        receipt.setPurchaseOrder(purchaseOrder);
        receipt.setStore(purchaseOrder.getStore());
        receipt.setStatus(GoodsReceiptStatus.PENDING);
        receipt.setRemarks(request.getRemarks());

        // 4. 添加收货明细
        for (CreateGoodsReceiptRequest.ItemRequest itemRequest : request.getItems()) {
            // 验证SKU在采购订单中
            PurchaseOrderItemEntity poItem = poItemMap.get(itemRequest.getSkuId());
            if (poItem == null) {
                throw new IllegalArgumentException("SKU不在采购订单中: " + itemRequest.getSkuId());
            }

            Sku sku = skuRepository.findById(itemRequest.getSkuId())
                .orElseThrow(() -> new IllegalArgumentException("SKU不存在: " + itemRequest.getSkuId()));

            GoodsReceiptItemEntity item = new GoodsReceiptItemEntity();
            item.setSku(sku);
            item.setOrderedQty(poItem.getPendingQty()); // 待收数量
            item.setReceivedQty(itemRequest.getReceivedQty());

            if (itemRequest.getQualityStatus() != null) {
                item.setQualityStatus(QualityStatus.valueOf(itemRequest.getQualityStatus()));
            }
            item.setRejectionReason(itemRequest.getRejectionReason());

            receipt.addItem(item);
        }

        // 5. 保存并返回
        GoodsReceiptEntity saved = goodsReceiptRepository.save(receipt);
        return mapper.toDTOWithItems(saved);
    }

    /**
     * 根据ID获取收货入库单详情
     */
    public GoodsReceiptDTO findById(UUID id) {
        return goodsReceiptRepository.findByIdWithItems(id)
            .map(mapper::toDTOWithItems)
            .orElseThrow(() -> new IllegalArgumentException("收货入库单不存在: " + id));
    }

    /**
     * 分页查询收货入库单列表
     */
    public Page<GoodsReceiptDTO> findByFilters(UUID storeId, GoodsReceiptStatus status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        Page<GoodsReceiptEntity> entities = goodsReceiptRepository.findByFilters(storeId, status, pageable);
        return entities.map(mapper::toDTO);
    }

    /**
     * 确认收货（更新库存）
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public GoodsReceiptDTO confirm(UUID receiptId) {
        GoodsReceiptEntity receipt = goodsReceiptRepository.findByIdWithItems(receiptId)
            .orElseThrow(() -> new IllegalArgumentException("收货入库单不存在: " + receiptId));

        // 1. 校验状态
        if (receipt.getStatus() != GoodsReceiptStatus.PENDING) {
            throw new IllegalStateException("收货单状态不允许确认");
        }

        // 2. 更新库存（仅合格商品）
        for (GoodsReceiptItemEntity item : receipt.getItems()) {
            if (item.getQualityStatus() == QualityStatus.QUALIFIED) {
                updateInventory(receipt.getStoreId(), item.getSkuId(), item.getReceivedQty());
            }
        }

        // 3. 更新收货单状态
        receipt.setStatus(GoodsReceiptStatus.CONFIRMED);
        receipt.setReceivedAt(Instant.now());

        // 4. 更新采购订单明细的收货数量
        updatePurchaseOrderReceivedQty(receipt);

        GoodsReceiptEntity saved = goodsReceiptRepository.save(receipt);
        return mapper.toDTOWithItems(saved);
    }

    /**
     * 更新库存
     */
    private void updateInventory(UUID storeId, UUID skuId, BigDecimal qty) {
        Optional<Inventory> existingOpt = inventoryRepository.findBySkuIdAndStoreId(skuId, storeId);

        if (existingOpt.isPresent()) {
            Inventory inv = existingOpt.get();
            inv.setOnHandQty(inv.getOnHandQty().add(qty));
            inv.setAvailableQty(inv.getAvailableQty().add(qty));
            inventoryRepository.save(inv);
        } else {
            // 创建新库存记录
            Inventory inv = new Inventory();
            inv.setStoreId(storeId);
            inv.setSkuId(skuId);
            inv.setOnHandQty(qty);
            inv.setAvailableQty(qty);
            inv.setReservedQty(BigDecimal.ZERO);
            inventoryRepository.save(inv);
        }
    }

    /**
     * 更新采购订单的收货数量
     */
    private void updatePurchaseOrderReceivedQty(GoodsReceiptEntity receipt) {
        PurchaseOrderEntity purchaseOrder = receipt.getPurchaseOrder();

        for (GoodsReceiptItemEntity grItem : receipt.getItems()) {
            // 只更新合格商品的收货数量
            if (grItem.getQualityStatus() != QualityStatus.QUALIFIED) {
                continue;
            }

            for (PurchaseOrderItemEntity poItem : purchaseOrder.getItems()) {
                if (poItem.getSkuId().equals(grItem.getSkuId())) {
                    BigDecimal newReceivedQty = poItem.getReceivedQty().add(grItem.getReceivedQty());
                    poItem.setReceivedQty(newReceivedQty);
                    poItem.setPendingQty(poItem.getQuantity().subtract(newReceivedQty));
                    break;
                }
            }
        }

        // 更新采购订单状态
        purchaseOrderService.updateReceivedStatus(purchaseOrder.getId());
    }

    /**
     * 取消收货单
     */
    @Transactional
    public GoodsReceiptDTO cancel(UUID receiptId) {
        GoodsReceiptEntity receipt = goodsReceiptRepository.findById(receiptId)
            .orElseThrow(() -> new IllegalArgumentException("收货入库单不存在: " + receiptId));

        if (receipt.getStatus() != GoodsReceiptStatus.PENDING) {
            throw new IllegalStateException("只有待收货状态的收货单可以取消");
        }

        receipt.setStatus(GoodsReceiptStatus.CANCELLED);
        GoodsReceiptEntity saved = goodsReceiptRepository.save(receipt);
        return mapper.toDTO(saved);
    }
}
