/**
 * @spec N001-purchase-inbound
 * @spec N004-procurement-material-selector
 * 收货入库服务层
 */
package com.cinema.procurement.service;

import com.cinema.inventory.entity.Inventory;
import com.cinema.inventory.entity.StoreEntity;
import com.cinema.inventory.repository.InventoryRepository;
import com.cinema.inventory.repository.StoreJpaRepository;
import com.cinema.material.entity.Material;
import com.cinema.material.repository.MaterialRepository;
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
    private final StoreJpaRepository storeRepository;
    private final InventoryRepository inventoryRepository;
    private final MaterialRepository materialRepository;
    private final GoodsReceiptMapper mapper;
    private final PurchaseOrderService purchaseOrderService;
    private final ProcurementConversionService procurementConversionService;

    public GoodsReceiptService(
            GoodsReceiptRepository goodsReceiptRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            PurchaseOrderItemRepository purchaseOrderItemRepository,
            SkuJpaRepository skuRepository,
            StoreJpaRepository storeRepository,
            InventoryRepository inventoryRepository,
            MaterialRepository materialRepository,
            GoodsReceiptMapper mapper,
            PurchaseOrderService purchaseOrderService,
            ProcurementConversionService procurementConversionService) {
        this.goodsReceiptRepository = goodsReceiptRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseOrderItemRepository = purchaseOrderItemRepository;
        this.skuRepository = skuRepository;
        this.storeRepository = storeRepository;
        this.inventoryRepository = inventoryRepository;
        this.materialRepository = materialRepository;
        this.mapper = mapper;
        this.purchaseOrderService = purchaseOrderService;
        this.procurementConversionService = procurementConversionService;
    }

    /**
     * 创建收货入库单
     * N004: 支持 Material 和 SKU 两种类型
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

        // 2. N004: 构建采购订单明细的映射 (SKU ID 或 Material ID -> PO Item)
        Map<UUID, PurchaseOrderItemEntity> poItemBySkuId = purchaseOrder.getItems().stream()
            .filter(item -> item.getItemType() == ItemType.SKU && item.getSkuId() != null)
            .collect(Collectors.toMap(PurchaseOrderItemEntity::getSkuId, item -> item));
        Map<UUID, PurchaseOrderItemEntity> poItemByMaterialId = purchaseOrder.getItems().stream()
            .filter(item -> item.getItemType() == ItemType.MATERIAL && item.getMaterialId() != null)
            .collect(Collectors.toMap(PurchaseOrderItemEntity::getMaterialId, item -> item));

        // 3. 创建收货单实体
        GoodsReceiptEntity receipt = new GoodsReceiptEntity();
        receipt.setReceiptNumber(goodsReceiptRepository.generateReceiptNumber());
        receipt.setPurchaseOrder(purchaseOrder);
        receipt.setStore(purchaseOrder.getStore());
        receipt.setStatus(GoodsReceiptStatus.PENDING);
        receipt.setRemarks(request.getRemarks());

        // 4. N004: 添加收货明细（支持 Material 和 SKU）
        for (CreateGoodsReceiptRequest.ItemRequest itemRequest : request.getItems()) {
            ItemType itemType = itemRequest.getItemType();
            PurchaseOrderItemEntity poItem;
            
            GoodsReceiptItemEntity item = new GoodsReceiptItemEntity();
            item.setItemType(itemType);

            if (itemType == ItemType.MATERIAL) {
                // N004: Material 类型
                poItem = poItemByMaterialId.get(itemRequest.getMaterialId());
                if (poItem == null) {
                    throw new IllegalArgumentException("物料不在采购订单中: " + itemRequest.getMaterialId());
                }
                Material material = materialRepository.findById(itemRequest.getMaterialId())
                    .orElseThrow(() -> new IllegalArgumentException("物料不存在: " + itemRequest.getMaterialId()));
                item.setMaterial(material);
            } else {
                // SKU 类型
                poItem = poItemBySkuId.get(itemRequest.getSkuId());
                if (poItem == null) {
                    throw new IllegalArgumentException("SKU不在采购订单中: " + itemRequest.getSkuId());
                }
                Sku sku = skuRepository.findById(itemRequest.getSkuId())
                    .orElseThrow(() -> new IllegalArgumentException("SKU不存在: " + itemRequest.getSkuId()));
                item.setSku(sku);
            }

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
     * N004: 支持 Material 和 SKU 两种类型的入库
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public GoodsReceiptDTO confirm(UUID receiptId) {
        GoodsReceiptEntity receipt = goodsReceiptRepository.findByIdWithItems(receiptId)
            .orElseThrow(() -> new IllegalArgumentException("收货入库单不存在: " + receiptId));

        // 1. 校验状态
        if (receipt.getStatus() != GoodsReceiptStatus.PENDING) {
            throw new IllegalStateException("收货单状态不允许确认");
        }

        // 2. N004: 构建采购订单明细的映射 (SKU ID 或 Material ID -> PO Item)
        PurchaseOrderEntity purchaseOrder = receipt.getPurchaseOrder();
        Map<UUID, PurchaseOrderItemEntity> poItemBySkuId = purchaseOrder.getItems().stream()
            .filter(item -> item.getItemType() == ItemType.SKU && item.getSkuId() != null)
            .collect(Collectors.toMap(PurchaseOrderItemEntity::getSkuId, item -> item));
        Map<UUID, PurchaseOrderItemEntity> poItemByMaterialId = purchaseOrder.getItems().stream()
            .filter(item -> item.getItemType() == ItemType.MATERIAL && item.getMaterialId() != null)
            .collect(Collectors.toMap(PurchaseOrderItemEntity::getMaterialId, item -> item));

        // 3. N004: 更新库存（仅合格商品）根据 grItem.itemType 区分类型
        for (GoodsReceiptItemEntity grItem : receipt.getItems()) {
            if (grItem.getQualityStatus() != QualityStatus.QUALIFIED) {
                continue;
            }

            if (grItem.getItemType() == ItemType.MATERIAL) {
                // N004: 物料入库 - 需要进行单位换算
                PurchaseOrderItemEntity poItem = poItemByMaterialId.get(grItem.getMaterialId());
                if (poItem != null) {
                    updateMaterialInventory(receipt.getStoreId(), poItem, grItem.getReceivedQty());
                } else {
                    // 备用方案：直接使用 grItem 的 Material 信息
                    updateMaterialInventoryDirect(receipt.getStoreId(), grItem.getMaterial(), grItem.getReceivedQty());
                }
            } else {
                // SKU入库 - 原有逻辑
                if (grItem.getSkuId() != null) {
                    updateInventory(receipt.getStoreId(), grItem.getSkuId(), grItem.getReceivedQty());
                }
            }
        }

        // 4. 更新收货单状态
        receipt.setStatus(GoodsReceiptStatus.CONFIRMED);
        receipt.setReceivedAt(Instant.now());

        // 5. 更新采购订单明细的收货数量
        updatePurchaseOrderReceivedQty(receipt);

        GoodsReceiptEntity saved = goodsReceiptRepository.save(receipt);
        return mapper.toDTOWithItems(saved);
    }

    /**
     * N004: 直接使用 Material 实体更新库存（不依赖 PO Item）
     */
    private void updateMaterialInventoryDirect(UUID storeId, Material material, BigDecimal receivedQty) {
        if (material == null) {
            throw new IllegalArgumentException("物料不能为空");
        }

        // 获取采购单位和库存单位
        String purchaseUnitCode = material.getPurchaseUnit().getCode();
        String inventoryUnitCode = material.getInventoryUnit().getCode();

        // 单位换算: 采购单位 -> 库存单位
        BigDecimal inventoryQty;
        if (purchaseUnitCode.equals(inventoryUnitCode)) {
            inventoryQty = receivedQty;
        } else {
            inventoryQty = procurementConversionService.convertPurchaseToInventory(
                material.getId(), receivedQty, purchaseUnitCode, inventoryUnitCode);
        }

        // 更新物料库存
        Optional<Inventory> existingOpt = inventoryRepository.findByMaterialIdAndStoreId(material.getId(), storeId);

        if (existingOpt.isPresent()) {
            Inventory inv = existingOpt.get();
            inv.setOnHandQty(inv.getOnHandQty().add(inventoryQty));
            inv.setAvailableQty(inv.getAvailableQty().add(inventoryQty));
            inventoryRepository.save(inv);
        } else {
            StoreEntity store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("门店不存在: " + storeId));

            Inventory inv = new Inventory();
            inv.setMaterial(material);
            inv.setStore(store);
            inv.setOnHandQty(inventoryQty);
            inv.setAvailableQty(inventoryQty);
            inv.setReservedQty(BigDecimal.ZERO);
            inventoryRepository.save(inv);
        }
    }

    /**
     * N004: 根据收货明细查找对应的采购订单明细
     */
    private PurchaseOrderItemEntity findPurchaseOrderItemByGoodsReceiptItem(
            PurchaseOrderEntity purchaseOrder, GoodsReceiptItemEntity grItem) {
        // 先通过 SKU ID 查找
        for (PurchaseOrderItemEntity poItem : purchaseOrder.getItems()) {
            if (grItem.getSkuId() != null && grItem.getSkuId().equals(poItem.getSkuId())) {
                return poItem;
            }
        }
        return null;
    }

    /**
     * N004: 更新物料库存（包含单位换算）
     * 将采购单位的数量换算为库存单位后入库
     */
    private void updateMaterialInventory(UUID storeId, PurchaseOrderItemEntity poItem, BigDecimal receivedQty) {
        Material material = poItem.getMaterial();
        if (material == null) {
            material = materialRepository.findById(poItem.getMaterialId())
                .orElseThrow(() -> new IllegalArgumentException("物料不存在: " + poItem.getMaterialId()));
        }

        // 获取采购单位和库存单位
        String purchaseUnitCode = material.getPurchaseUnit().getCode();
        String inventoryUnitCode = material.getInventoryUnit().getCode();

        // 单位换算: 采购单位 -> 库存单位
        BigDecimal inventoryQty;
        if (purchaseUnitCode.equals(inventoryUnitCode)) {
            // 单位相同，无需换算
            inventoryQty = receivedQty;
        } else {
            // 调用换算服务
            inventoryQty = procurementConversionService.convertPurchaseToInventory(
                material.getId(),
                receivedQty,
                purchaseUnitCode,
                inventoryUnitCode
            );
        }

        // 更新物料库存
        Optional<Inventory> existingOpt = inventoryRepository.findByMaterialIdAndStoreId(material.getId(), storeId);

        if (existingOpt.isPresent()) {
            Inventory inv = existingOpt.get();
            inv.setOnHandQty(inv.getOnHandQty().add(inventoryQty));
            inv.setAvailableQty(inv.getAvailableQty().add(inventoryQty));
            inventoryRepository.save(inv);
        } else {
            // 创建新的物料库存记录
            StoreEntity store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("门店不存在: " + storeId));

            Inventory inv = new Inventory();
            inv.setMaterial(material);  // 设置物料关系
            inv.setStore(store);
            inv.setOnHandQty(inventoryQty);
            inv.setAvailableQty(inventoryQty);
            inv.setReservedQty(BigDecimal.ZERO);
            inventoryRepository.save(inv);
        }
    }

    /**
     * 更新库存
     * Note: Must use entity relationships (setSku/setStore) instead of setSkuId/setStoreId
     * because Inventory entity has storeId/skuId columns marked as insertable=false, updatable=false
     */
    private void updateInventory(UUID storeId, UUID skuId, BigDecimal qty) {
        Optional<Inventory> existingOpt = inventoryRepository.findBySkuIdAndStoreId(skuId, storeId);

        if (existingOpt.isPresent()) {
            Inventory inv = existingOpt.get();
            inv.setOnHandQty(inv.getOnHandQty().add(qty));
            inv.setAvailableQty(inv.getAvailableQty().add(qty));
            inventoryRepository.save(inv);
        } else {
            // 创建新库存记录 - 必须使用实体关系而非直接设置ID
            Sku sku = skuRepository.findById(skuId)
                .orElseThrow(() -> new IllegalArgumentException("SKU不存在: " + skuId));
            StoreEntity store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("门店不存在: " + storeId));

            Inventory inv = new Inventory();
            inv.setSku(sku);      // Use entity relationship
            inv.setStore(store);  // Use entity relationship
            inv.setOnHandQty(qty);
            inv.setAvailableQty(qty);
            inv.setReservedQty(BigDecimal.ZERO);
            inventoryRepository.save(inv);
        }
    }

    /**
     * 更新采购订单的收货数量
     * N004: 支持 Material 和 SKU 两种类型
     */
    private void updatePurchaseOrderReceivedQty(GoodsReceiptEntity receipt) {
        PurchaseOrderEntity purchaseOrder = receipt.getPurchaseOrder();

        for (GoodsReceiptItemEntity grItem : receipt.getItems()) {
            // 只更新合格商品的收货数量
            if (grItem.getQualityStatus() != QualityStatus.QUALIFIED) {
                continue;
            }

            for (PurchaseOrderItemEntity poItem : purchaseOrder.getItems()) {
                boolean matches = false;
                
                // N004: 根据 itemType 匹配
                if (grItem.getItemType() == ItemType.MATERIAL) {
                    // Material 类型 - 通过 materialId 匹配
                    matches = grItem.getMaterialId() != null && 
                              grItem.getMaterialId().equals(poItem.getMaterialId());
                } else {
                    // SKU 类型 - 通过 skuId 匹配
                    matches = grItem.getSkuId() != null && 
                              grItem.getSkuId().equals(poItem.getSkuId());
                }

                if (matches) {
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
