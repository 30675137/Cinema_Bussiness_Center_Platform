package com.cinema.inventory.domain;

/**
 * 库存状态枚举，根据可用库存与安全库存的比例自动计算。
 * 
 * <p>五级状态定义：</p>
 * <ul>
 *   <li>SUFFICIENT(充足): 可用库存 >= 安全库存 × 2</li>
 *   <li>NORMAL(正常): 安全库存 <= 可用库存 < 安全库存 × 2</li>
 *   <li>BELOW_THRESHOLD(偏低): 安全库存 × 0.5 <= 可用库存 < 安全库存</li>
 *   <li>LOW(不足): 0 < 可用库存 < 安全库存 × 0.5</li>
 *   <li>OUT_OF_STOCK(缺货): 可用库存 = 0</li>
 * </ul>
 * 
 * @since P003-inventory-query
 */
public enum InventoryStatus {
    
    /** 充足：可用库存 >= 安全库存 × 2 */
    SUFFICIENT("充足", "green"),
    
    /** 正常：安全库存 <= 可用库存 < 安全库存 × 2 */
    NORMAL("正常", "blue"),
    
    /** 偏低：安全库存 × 0.5 <= 可用库存 < 安全库存 */
    BELOW_THRESHOLD("偏低", "gold"),
    
    /** 不足：0 < 可用库存 < 安全库存 × 0.5 */
    LOW("不足", "orange"),
    
    /** 缺货：可用库存 = 0 */
    OUT_OF_STOCK("缺货", "red");

    private final String label;
    private final String color;

    InventoryStatus(String label, String color) {
        this.label = label;
        this.color = color;
    }

    public String getLabel() {
        return label;
    }

    public String getColor() {
        return color;
    }
}
