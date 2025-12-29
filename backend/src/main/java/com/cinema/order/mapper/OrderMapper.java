/**
 * @spec O001-product-order-list
 * 订单对象映射器
 */
package com.cinema.order.mapper;

import com.cinema.order.domain.*;
import com.cinema.order.dto.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 订单对象映射器
 *
 * 用于 Domain Model 和 DTO 之间的转换
 */
@Component
public class OrderMapper {

    /**
     * 将领域模型转换为 DTO
     *
     * @param order 订单领域模型
     * @return 订单 DTO
     */
    public ProductOrderDTO toDTO(ProductOrder order) {
        if (order == null) {
            return null;
        }

        ProductOrderDTO dto = new ProductOrderDTO();
        dto.setId(order.getId() != null ? order.getId().toString() : null);
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId() != null ? order.getUserId().toString() : null);
        dto.setStatus(order.getStatus());
        dto.setProductTotal(order.getProductTotal());
        dto.setShippingFee(order.getShippingFee());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentTime(order.getPaymentTime());
        dto.setShippedTime(order.getShippedTime());
        dto.setCompletedTime(order.getCompletedTime());
        dto.setCancelledTime(order.getCancelledTime());
        dto.setCancelReason(order.getCancelReason());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setVersion(order.getVersion());

        // Shipping address
        if (order.getShippingAddress() != null) {
            dto.setShippingAddress(toShippingAddressDTO(order.getShippingAddress()));
        }

        // User info
        if (order.getUser() != null) {
            dto.setUser(toUserDTO(order.getUser()));
        }

        // Order items
        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream()
                .map(this::toOrderItemDTO)
                .collect(Collectors.toList()));

            // Generate product summary
            if (!order.getItems().isEmpty()) {
                dto.setProductSummary(generateProductSummary(order.getItems()));
            }
        }

        // Order logs
        if (order.getLogs() != null) {
            dto.setLogs(order.getLogs().stream()
                .map(this::toOrderLogDTO)
                .collect(Collectors.toList()));
        }

        return dto;
    }

    /**
     * 批量转换订单列表
     *
     * @param orders 订单列表
     * @return DTO 列表
     */
    public List<ProductOrderDTO> toDTOList(List<ProductOrder> orders) {
        return orders.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * 转换收货地址
     *
     * @param address 收货地址
     * @return 收货地址 DTO
     */
    private ShippingAddressDTO toShippingAddressDTO(ProductOrder.ShippingAddress address) {
        if (address == null) {
            return null;
        }

        return new ShippingAddressDTO(
            address.getProvince(),
            address.getCity(),
            address.getDistrict(),
            address.getDetail()
        );
    }

    /**
     * 转换用户信息
     *
     * @param user 用户信息
     * @return 用户信息 DTO
     */
    private UserDTO toUserDTO(ProductOrder.User user) {
        if (user == null) {
            return null;
        }

        UserDTO dto = new UserDTO();
        dto.setId(user.getId() != null ? user.getId().toString() : null);
        dto.setUsername(user.getUsername());

        // Phone masking: 138****8000
        if (user.getPhone() != null && user.getPhone().length() == 11) {
            dto.setPhone(user.getPhone().substring(0, 3) + "****" + user.getPhone().substring(7));
        } else {
            dto.setPhone(user.getPhone());
        }

        dto.setProvince(user.getProvince());
        dto.setCity(user.getCity());
        dto.setDistrict(user.getDistrict());
        dto.setAddress(user.getAddress());
        return dto;
    }

    /**
     * 转换订单商品项
     *
     * @param item 订单商品项
     * @return 订单商品项 DTO
     */
    private OrderItemDTO toOrderItemDTO(OrderItem item) {
        if (item == null) {
            return null;
        }

        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId() != null ? item.getId().toString() : null);
        dto.setOrderId(item.getOrderId() != null ? item.getOrderId().toString() : null);
        dto.setProductId(item.getProductId() != null ? item.getProductId().toString() : null);
        dto.setProductName(item.getProductName());
        dto.setProductSpec(item.getProductSpec());
        dto.setProductImage(item.getProductImage());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubtotal(item.getSubtotal());
        dto.setCreatedAt(item.getCreatedAt());
        return dto;
    }

    /**
     * 转换订单日志
     *
     * @param log 订单日志
     * @return 订单日志 DTO
     */
    private OrderLogDTO toOrderLogDTO(OrderLog log) {
        if (log == null) {
            return null;
        }

        OrderLogDTO dto = new OrderLogDTO();
        dto.setId(log.getId() != null ? log.getId().toString() : null);
        dto.setOrderId(log.getOrderId() != null ? log.getOrderId().toString() : null);
        dto.setAction(log.getAction());
        dto.setStatusBefore(log.getStatusBefore());
        dto.setStatusAfter(log.getStatusAfter());
        dto.setOperatorId(log.getOperatorId() != null ? log.getOperatorId().toString() : null);
        dto.setOperatorName(log.getOperatorName());
        dto.setComments(log.getComments());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }

    /**
     * 生成商品摘要
     *
     * @param items 商品项列表
     * @return 商品摘要字符串
     */
    private String generateProductSummary(List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            return "";
        }

        StringBuilder summary = new StringBuilder();
        int displayCount = Math.min(items.size(), 2);

        for (int i = 0; i < displayCount; i++) {
            if (i > 0) {
                summary.append(", ");
            }
            summary.append(items.get(i).getProductName());
        }

        if (items.size() > 2) {
            summary.append(" 等").append(items.size()).append("件商品");
        }

        return summary.toString();
    }
}
