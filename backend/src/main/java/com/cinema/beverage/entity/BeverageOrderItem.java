/**
 * @spec O003-beverage-order
 * @spec O013-order-channel-migration
 * 消费订单项实体类
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
 * 消费订单项实体
 *
 * 映射数据库表: beverage_order_items
 * 对应 spec: O003-beverage-order, O013-order-channel-migration
 *
 * 说明: 订单项保存商品快照，避免商品信息变更后影响历史订单
 * 
 * @spec O013-order-channel-migration 迁移说明:
 * - 新增 channelProductId 字段，关联 channel_product_config 表
 * - 新增 skuId 字段，用于库存扣减
 * - 新增 productSnapshot 字段，存储完整商品快照
 * - beverageName 重命名为 productName
 * - beverageImageUrl 重命名为 productImageUrl
 * - beverageId 字段已废弃，保留用于过渡期兼容
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
     * @spec O013-order-channel-migration 渠道商品配置 ID
     * 关联 channel_product_config 表，用于获取商品展示信息
     */
    @Column(name = "channel_product_id", columnDefinition = "uuid")
    private UUID channelProductId;

    /**
     * @spec O013-order-channel-migration SKU ID
     * 用于库存扣减，从 channel_product_config.sku_id 获取
     */
    @Column(name = "sku_id", columnDefinition = "uuid")
    private UUID skuId;

    /**
     * @deprecated @spec O013-order-channel-migration
     * 已废弃字段，保留用于过渡期兼容
     * 新订单请使用 channelProductId
     */
    @Deprecated
    @Column(name = "beverage_id", columnDefinition = "uuid")
    private UUID beverageId;

    /**
     * @spec O013-order-channel-migration 商品名称快照
     * 数据库列名: product_name (原 beverage_name)
     */
    @NotBlank(message = "商品名称不能为空")
    @Size(max = 100, message = "商品名称长度不能超过100")
    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;

    /**
     * @spec O013-order-channel-migration 商品图片URL快照
     * 数据库列名: product_image_url (原 beverage_image_url)
     */
    @Column(name = "product_image_url", columnDefinition = "TEXT")
    private String productImageUrl;

    /**
     * @spec O013-order-channel-migration 商品快照
     * JSONB 格式，包含下单时的完整商品信息
     * @see com.cinema.beverage.util.ProductSnapshotBuilder
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "product_snapshot", columnDefinition = "jsonb")
    private String productSnapshot;

    /**
     * @spec O013-order-channel-migration 选中的规格 (JSON对象)
     * 新格式: {"SIZE": {"optionId": "xxx", "optionName": "大杯", "priceAdjust": 300}}
     * 旧格式 (兼容): {"size": "大杯", "temperature": "热"}
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
