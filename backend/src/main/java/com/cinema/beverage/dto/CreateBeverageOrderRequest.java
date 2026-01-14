/**
 * @spec O003-beverage-order
 * 创建饮品订单请求DTO
 */
package com.cinema.beverage.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 创建饮品订单请求
 *
 * 对应 spec: O003-beverage-order
 * 使用场景: C端创建订单
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBeverageOrderRequest {

    /**
     * 门店ID
     */
    @NotNull(message = "门店ID不能为空")
    private UUID storeId;

    /**
     * 订单项列表
     */
    @NotEmpty(message = "订单商品项不能为空")
    @Valid
    private List<OrderItemRequest> items;

    /**
     * 顾客备注
     */
    @Size(max = 500, message = "备注长度不能超过500")
    private String customerNote;

    /**
     * 订单项请求
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {

        /**
         * SKU ID (商品规格ID)
         * @clarification 2026-01-14: 使用SKU ID而非Beverage ID作为订单项商品标识
         */
        @NotNull(message = "SKU ID不能为空")
        private UUID skuId;

        /**
         * 选中的规格
         * 格式: {"size": "大杯", "temperature": "热", "sweetness": "五分糖", "topping": "珍珠"}
         */
        @NotNull(message = "饮品规格不能为空")
        private Map<String, String> selectedSpecs;

        /**
         * 数量
         */
        @NotNull(message = "数量不能为空")
        @Min(value = 1, message = "数量至少为1")
        private Integer quantity;

        /**
         * 顾客备注
         */
        @Size(max = 200, message = "备注长度不能超过200")
        private String customerNote;
    }
}
