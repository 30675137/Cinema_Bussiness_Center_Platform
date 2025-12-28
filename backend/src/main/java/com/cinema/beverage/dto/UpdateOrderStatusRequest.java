/**
 * @spec O003-beverage-order
 * 更新订单状态请求 DTO
 */
package com.cinema.beverage.dto;

import jakarta.validation.constraints.NotNull;

import com.cinema.beverage.entity.BeverageOrder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 更新订单状态请求
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {

    /**
     * 目标状态
     */
    @NotNull(message = "目标状态不能为空")
    private BeverageOrder.OrderStatus targetStatus;
}
