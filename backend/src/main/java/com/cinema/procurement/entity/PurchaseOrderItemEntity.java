/**
 * @spec N001-purchase-inbound
 * @spec N004-procurement-material-selector
 * 采购订单明细实体
 *
 * <p>Supports both Material (raw material/packaging) and SKU (finished product) procurement.
 * Item type determines which reference is populated (mutual exclusivity enforced by DB constraint).
 */
package com.cinema.procurement.entity;

import com.cinema.hallstore.domain.Sku;
import com.cinema.material.entity.Material;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "purchase_order_items")
public class PurchaseOrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrderEntity purchaseOrder;

    /**
     * Item type discriminator: MATERIAL or SKU
     * NEW in N004 - determines which entity reference is populated
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private ItemType itemType;

    /**
     * Material reference (nullable, populated when itemType = MATERIAL)
     * NEW in N004 - for raw material/packaging procurement
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(name = "material_id", insertable = false, updatable = false)
    private UUID materialId;

    /**
     * Material name redundancy (for soft-delete scenarios)
     * NEW in N004 - preserves material name even if Material entity is deleted
     */
    @Column(name = "material_name", length = 200)
    private String materialName;

    /**
     * SKU reference (nullable, populated when itemType = SKU)
     * MODIFIED in N004 - changed from NOT NULL to nullable
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sku_id")
    private Sku sku;

    @Column(name = "sku_id", insertable = false, updatable = false)
    private UUID skuId;

    @Column(name = "quantity", precision = 12, scale = 3, nullable = false)
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "line_amount", precision = 12, scale = 2)
    private BigDecimal lineAmount;

    @Column(name = "received_qty", precision = 12, scale = 3)
    private BigDecimal receivedQty = BigDecimal.ZERO;

    @Column(name = "pending_qty", precision = 12, scale = 3)
    private BigDecimal pendingQty;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        calculateLineAmount();
        this.pendingQty = this.quantity;

        // N004: Validate mutual exclusivity
        validateMaterialSkuExclusivity();

        // N004: Auto-populate material_name for Material items
        if (itemType == ItemType.MATERIAL && material != null) {
            materialName = material.getName();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        calculateLineAmount();
        if (this.quantity != null && this.receivedQty != null) {
            this.pendingQty = this.quantity.subtract(this.receivedQty);
        }

        // N004: Validate mutual exclusivity
        validateMaterialSkuExclusivity();

        // N004: Update material_name if Material changed
        if (itemType == ItemType.MATERIAL && material != null) {
            materialName = material.getName();
        }
    }

    /**
     * Validate that item_type matches the populated entity reference.
     * DB CHECK constraint ensures mutual exclusivity; this is defensive validation.
     *
     * @throws IllegalStateException if validation fails
     */
    private void validateMaterialSkuExclusivity() {
        boolean hasMaterial = (material != null || materialId != null);
        boolean hasSku = (sku != null || skuId != null);

        if (!hasMaterial && !hasSku) {
            throw new IllegalStateException(
                    "PurchaseOrderItem must have either material_id or sku_id, both are null");
        }

        if (hasMaterial && hasSku) {
            throw new IllegalStateException(
                    "PurchaseOrderItem cannot have both material_id and sku_id, they are mutually exclusive");
        }

        // Validate item_type matches entity reference
        if (itemType == ItemType.MATERIAL && !hasMaterial) {
            throw new IllegalStateException("item_type is MATERIAL but material_id is null");
        }

        if (itemType == ItemType.SKU && !hasSku) {
            throw new IllegalStateException("item_type is SKU but sku_id is null");
        }
    }

    private void calculateLineAmount() {
        if (quantity != null && unitPrice != null) {
            this.lineAmount = quantity.multiply(unitPrice);
        }
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public PurchaseOrderEntity getPurchaseOrder() {
        return purchaseOrder;
    }

    public void setPurchaseOrder(PurchaseOrderEntity purchaseOrder) {
        this.purchaseOrder = purchaseOrder;
    }

    public Sku getSku() {
        return sku;
    }

    public void setSku(Sku sku) {
        this.sku = sku;
    }

    public UUID getSkuId() {
        return skuId;
    }

    public void setSkuId(UUID skuId) {
        this.skuId = skuId;
    }

    // N004: New getters and setters for itemType, material, materialId, materialName

    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }

    public UUID getMaterialId() {
        return materialId;
    }

    public void setMaterialId(UUID materialId) {
        this.materialId = materialId;
    }

    public String getMaterialName() {
        return materialName;
    }

    public void setMaterialName(String materialName) {
        this.materialName = materialName;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
        calculateLineAmount();
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        calculateLineAmount();
    }

    public BigDecimal getLineAmount() {
        return lineAmount;
    }

    public void setLineAmount(BigDecimal lineAmount) {
        this.lineAmount = lineAmount;
    }

    public BigDecimal getReceivedQty() {
        return receivedQty;
    }

    public void setReceivedQty(BigDecimal receivedQty) {
        this.receivedQty = receivedQty;
    }

    public BigDecimal getPendingQty() {
        return pendingQty;
    }

    public void setPendingQty(BigDecimal pendingQty) {
        this.pendingQty = pendingQty;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
