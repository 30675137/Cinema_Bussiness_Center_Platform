/**
 * @spec O003-beverage-order
 * 统一订单列表响应
 */
package com.cinema.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 统一订单列表响应
 *
 * 包含商品订单和饮品订单的统一列表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedOrderListResponse {

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 订单列表
     */
    private List<UnifiedOrderDTO> data;

    /**
     * 总记录数
     */
    private long total;

    /**
     * 当前页码
     */
    private int page;

    /**
     * 每页数量
     */
    private int pageSize;

    /**
     * 消息
     */
    private String message;

    /**
     * 创建成功响应
     *
     * @param data     订单列表
     * @param total    总记录数
     * @param page     当前页码
     * @param pageSize 每页数量
     * @param message  消息
     * @return 响应对象
     */
    public static UnifiedOrderListResponse success(
        List<UnifiedOrderDTO> data,
        long total,
        int page,
        int pageSize,
        String message
    ) {
        return UnifiedOrderListResponse.builder()
            .success(true)
            .data(data)
            .total(total)
            .page(page)
            .pageSize(pageSize)
            .message(message)
            .build();
    }
}
