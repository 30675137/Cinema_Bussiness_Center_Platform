/**
 * @spec O003-beverage-order
 * 饮品订单项实体类
 */
package com.cinema.beverage.entity;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * 饮品订单项实体
 *
 * 映射数据库表: beverage_order_items
 * 对应 spec: O003-beverage-order
 *
 * 说明: 订单项保存饮品快照，避免饮品信息变更后影响历史订单
 */
@Entity
@Table(name = "beverage_order_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeverageOrderItem {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid")
    private UUID id;

    /**
     * 所属订单 (多对一关系)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, columnDefinition = "uuid")
    private BeverageOrder order;

    /**
     * 饮品ID (引用，非外键)
     */
    @NotNull(message = "饮品ID不能为空")
    @Column(name = "beverage_id", nullable = false, columnDefinition = "uuid")
    private UUID beverageId;

    /**
     * 饮品名称快照
     */
    @NotBlank(message = "饮品名称不能为空")
    @Size(max = 100, message = "饮品名称长度不能超过100")
    @Column(name = "beverage_name", nullable = false, length = 100)
    private String beverageName;

    /**
     * 饮品图片URL快照
     */
    @Column(name = "beverage_image_url", columnDefinition = "TEXT")
    private String beverageImageUrl;

    /**
     * 选中的规格 (JSON对象)
     * 格式: {"size": "大杯", "temperature": "热", "sweetness": "五分糖", "topping": "珍珠"}
     */
    @NotNull(message = "选中规格不能为空")
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_specs", nullable = false, columnDefinition = "jsonb")
    private String selectedSpecs;

    /**
     * 数量
     */
    @NotNull(message = "数量不能为空")
    @Min(value = 1, message = "数量至少为1")
    @Column(nullable = false)
    private Integer quantity;

    /**
     * 单价 (单位: 元)
     * 包含基础价格和规格调整价格
     */
    @NotNull(message = "单价不能为空")
    @Min(value = 0, message = "单价不能为负数")
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    /**
     * 小计 (单位: 元)
     * 计算公式: unit_price * quantity
     */
    @NotNull(message = "小计不能为空")
    @Min(value = 0, message = "小计不能为负数")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    /**
     * 顾客备注
     */
    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    /**
     * 计算小计
     */
    public void calculateSubtotal() {
        if (unitPrice != null && quantity != null) {
            this.subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }

    /**
     * 设置订单（用于双向关系维护）
     */
    public void setOrder(BeverageOrder order) {
        this.order = order;
    }
}
