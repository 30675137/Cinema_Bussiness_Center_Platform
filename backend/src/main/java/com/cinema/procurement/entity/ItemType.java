/**
 * @spec N004-procurement-material-selector
 * 采购订单明细项目类型枚举
 */
package com.cinema.procurement.entity;

/**
 * Item type enumeration for purchase order items.
 *
 * <p>Determines whether the item references a Material (raw material/packaging)
 * or a SKU (finished product).
 */
public enum ItemType {
    /**
     * Material procurement - raw material or packaging
     *
     * <p>When item_type = MATERIAL:
     * <ul>
     *   <li>material_id is populated, sku_id is NULL
     *   <li>Unit comes from Material.purchaseUnit
     *   <li>Inbound operation converts purchaseUnit → inventoryUnit
     * </ul>
     */
    MATERIAL,

    /**
     * SKU procurement - finished product (rare scenario, ~5% of cases)
     *
     * <p>When item_type = SKU:
     * <ul>
     *   <li>sku_id is populated, material_id is NULL
     *   <li>Unit comes from SKU.mainUnit
     *   <li>No unit conversion needed for inbound
     * </ul>
     */
    SKU
}
