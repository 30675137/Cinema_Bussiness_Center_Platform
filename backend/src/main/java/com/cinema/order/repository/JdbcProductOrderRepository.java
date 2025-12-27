/**
 * @spec O001-product-order-list
 * 商品订单数据访问层实现（使用 JdbcTemplate）
 */
package com.cinema.order.repository;

import com.cinema.order.domain.*;
import com.cinema.order.dto.OrderQueryParams;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 使用 JdbcTemplate 实现的商品订单数据访问层
 *
 * 直接访问 Supabase PostgreSQL 数据库
 */
@Repository
public class JdbcProductOrderRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public JdbcProductOrderRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * 根据ID查询订单（包含用户信息、商品项、日志）
     *
     * @param orderId 订单ID
     * @return 订单对象
     */
    public ProductOrder findById(UUID orderId) {
        String sql = """
            SELECT o.*, u.username, u.phone, u.province, u.city, u.district, u.address
            FROM product_orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        """;

        List<ProductOrder> orders = jdbcTemplate.query(sql, new ProductOrderRowMapper(), orderId);

        if (orders.isEmpty()) {
            return null;
        }

        ProductOrder order = orders.get(0);

        // Load order items
        order.setItems(findItemsByOrderId(orderId));

        // Load order logs
        order.setLogs(findLogsByOrderId(orderId));

        return order;
    }

    /**
     * 查询订单列表（支持筛选和分页）
     *
     * @param params 查询参数
     * @return 订单列表和总数
     */
    public PageResult<ProductOrder> findByConditions(OrderQueryParams params) {
        List<Object> sqlParams = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
            SELECT o.*, u.username, u.phone, u.province, u.city, u.district, u.address
            FROM product_orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE 1=1
        """);

        // Status filter
        if (params.getStatus() != null) {
            sql.append(" AND o.status = ?");
            sqlParams.add(params.getStatus().name());
        }

        // Date range filter
        if (params.getStartDate() != null && !params.getStartDate().isEmpty()) {
            sql.append(" AND DATE(o.created_at) >= ?");
            sqlParams.add(LocalDate.parse(params.getStartDate()));
        }

        if (params.getEndDate() != null && !params.getEndDate().isEmpty()) {
            sql.append(" AND DATE(o.created_at) <= ?");
            sqlParams.add(LocalDate.parse(params.getEndDate()));
        }

        // Search filter (order number, username, phone)
        if (params.getSearch() != null && !params.getSearch().isEmpty()) {
            sql.append(" AND (o.order_number LIKE ? OR u.username LIKE ? OR u.phone LIKE ?)");
            String searchPattern = "%" + params.getSearch() + "%";
            sqlParams.add(searchPattern);
            sqlParams.add(searchPattern);
            sqlParams.add(searchPattern);
        }

        // Count total records
        String countSql = "SELECT COUNT(*) FROM (" + sql.toString() + ") AS count_query";
        Long total = jdbcTemplate.queryForObject(countSql, Long.class, sqlParams.toArray());

        // Add ordering
        sql.append(" ORDER BY o.created_at DESC");

        // Add pagination
        int offset = (params.getPage() - 1) * params.getPageSize();
        sql.append(" LIMIT ? OFFSET ?");
        sqlParams.add(params.getPageSize());
        sqlParams.add(offset);

        // Execute query
        List<ProductOrder> orders = jdbcTemplate.query(sql.toString(), new ProductOrderRowMapper(), sqlParams.toArray());

        // Load items for each order (productSummary)
        for (ProductOrder order : orders) {
            List<OrderItem> items = findItemsByOrderId(order.getId());
            order.setItems(items);
            // Generate product summary
            if (!items.isEmpty()) {
                StringBuilder summary = new StringBuilder();
                for (int i = 0; i < Math.min(items.size(), 2); i++) {
                    if (i > 0) summary.append(", ");
                    summary.append(items.get(i).getProductName());
                }
                if (items.size() > 2) {
                    summary.append(" 等").append(items.size()).append("件商品");
                }
                // Store in a custom field or handle differently
            }
        }

        return new PageResult<>(orders, total != null ? total : 0);
    }

    /**
     * 根据订单ID查询订单商品项
     *
     * @param orderId 订单ID
     * @return 商品项列表
     */
    private List<OrderItem> findItemsByOrderId(UUID orderId) {
        String sql = """
            SELECT * FROM order_items
            WHERE order_id = ?
            ORDER BY created_at
        """;

        return jdbcTemplate.query(sql, new OrderItemRowMapper(), orderId);
    }

    /**
     * 根据订单ID查询订单日志
     *
     * @param orderId 订单ID
     * @return 日志列表
     */
    private List<OrderLog> findLogsByOrderId(UUID orderId) {
        String sql = """
            SELECT * FROM order_logs
            WHERE order_id = ?
            ORDER BY created_at DESC
        """;

        return jdbcTemplate.query(sql, new OrderLogRowMapper(), orderId);
    }

    /**
     * 更新订单状态
     *
     * @param order 订单对象
     * @return 更新的行数
     */
    public int updateOrderStatus(ProductOrder order) {
        String sql = """
            UPDATE product_orders
            SET status = ?,
                shipped_time = ?,
                completed_time = ?,
                cancelled_time = ?,
                cancel_reason = ?,
                updated_at = NOW(),
                version = version + 1
            WHERE id = ? AND version = ?
        """;

        return jdbcTemplate.update(sql,
            order.getStatus().name(),
            order.getShippedTime(),
            order.getCompletedTime(),
            order.getCancelledTime(),
            order.getCancelReason(),
            order.getId(),
            order.getVersion()
        );
    }

    /**
     * 插入订单日志
     *
     * @param log 日志对象
     */
    public void insertOrderLog(OrderLog log) {
        String sql = """
            INSERT INTO order_logs (id, order_id, action, status_before, status_after,
                                   operator_id, operator_name, comments, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        jdbcTemplate.update(sql,
            log.getId() != null ? log.getId() : UUID.randomUUID(),
            log.getOrderId(),
            log.getAction().name(),
            log.getStatusBefore() != null ? log.getStatusBefore().name() : null,
            log.getStatusAfter() != null ? log.getStatusAfter().name() : null,
            log.getOperatorId(),
            log.getOperatorName(),
            log.getComments(),
            log.getCreatedAt() != null ? log.getCreatedAt() : LocalDateTime.now()
        );
    }

    /**
     * ProductOrder RowMapper
     */
    private class ProductOrderRowMapper implements RowMapper<ProductOrder> {
        @Override
        public ProductOrder mapRow(ResultSet rs, int rowNum) throws SQLException {
            ProductOrder order = new ProductOrder();
            order.setId((UUID) rs.getObject("id"));
            order.setOrderNumber(rs.getString("order_number"));
            order.setUserId((UUID) rs.getObject("user_id"));
            order.setStatus(OrderStatus.valueOf(rs.getString("status")));
            order.setProductTotal(rs.getBigDecimal("product_total"));
            order.setShippingFee(rs.getBigDecimal("shipping_fee"));
            order.setDiscountAmount(rs.getBigDecimal("discount_amount"));
            order.setTotalAmount(rs.getBigDecimal("total_amount"));

            // Parse JSONB shipping_address
            String shippingAddressJson = rs.getString("shipping_address");
            if (shippingAddressJson != null) {
                try {
                    order.setShippingAddress(objectMapper.readValue(shippingAddressJson, ProductOrder.ShippingAddress.class));
                } catch (JsonProcessingException e) {
                    // Handle error
                }
            }

            order.setPaymentMethod(rs.getString("payment_method"));
            order.setPaymentTime(getLocalDateTime(rs, "payment_time"));
            order.setShippedTime(getLocalDateTime(rs, "shipped_time"));
            order.setCompletedTime(getLocalDateTime(rs, "completed_time"));
            order.setCancelledTime(getLocalDateTime(rs, "cancelled_time"));
            order.setCancelReason(rs.getString("cancel_reason"));
            order.setCreatedAt(getLocalDateTime(rs, "created_at"));
            order.setUpdatedAt(getLocalDateTime(rs, "updated_at"));
            order.setVersion(rs.getInt("version"));

            // User info
            String username = rs.getString("username");
            if (username != null) {
                ProductOrder.User user = new ProductOrder.User();
                user.setId(order.getUserId());
                user.setUsername(username);
                user.setPhone(rs.getString("phone"));
                user.setProvince(rs.getString("province"));
                user.setCity(rs.getString("city"));
                user.setDistrict(rs.getString("district"));
                user.setAddress(rs.getString("address"));
                order.setUser(user);
            }

            return order;
        }

        private LocalDateTime getLocalDateTime(ResultSet rs, String columnName) throws SQLException {
            Timestamp timestamp = rs.getTimestamp(columnName);
            return timestamp != null ? timestamp.toLocalDateTime() : null;
        }
    }

    /**
     * OrderItem RowMapper
     */
    private class OrderItemRowMapper implements RowMapper<OrderItem> {
        @Override
        public OrderItem mapRow(ResultSet rs, int rowNum) throws SQLException {
            OrderItem item = new OrderItem();
            item.setId((UUID) rs.getObject("id"));
            item.setOrderId((UUID) rs.getObject("order_id"));
            item.setProductId((UUID) rs.getObject("product_id"));
            item.setProductName(rs.getString("product_name"));
            item.setProductSpec(rs.getString("product_spec"));
            item.setProductImage(rs.getString("product_image"));
            item.setQuantity(rs.getInt("quantity"));
            item.setUnitPrice(rs.getBigDecimal("unit_price"));
            item.setSubtotal(rs.getBigDecimal("subtotal"));
            Timestamp timestamp = rs.getTimestamp("created_at");
            item.setCreatedAt(timestamp != null ? timestamp.toLocalDateTime() : null);
            return item;
        }
    }

    /**
     * OrderLog RowMapper
     */
    private class OrderLogRowMapper implements RowMapper<OrderLog> {
        @Override
        public OrderLog mapRow(ResultSet rs, int rowNum) throws SQLException {
            OrderLog log = new OrderLog();
            log.setId((UUID) rs.getObject("id"));
            log.setOrderId((UUID) rs.getObject("order_id"));
            log.setAction(OrderLog.LogAction.valueOf(rs.getString("action")));

            String statusBefore = rs.getString("status_before");
            if (statusBefore != null) {
                log.setStatusBefore(OrderStatus.valueOf(statusBefore));
            }

            String statusAfter = rs.getString("status_after");
            if (statusAfter != null) {
                log.setStatusAfter(OrderStatus.valueOf(statusAfter));
            }

            log.setOperatorId((UUID) rs.getObject("operator_id"));
            log.setOperatorName(rs.getString("operator_name"));
            log.setComments(rs.getString("comments"));
            Timestamp timestamp = rs.getTimestamp("created_at");
            log.setCreatedAt(timestamp != null ? timestamp.toLocalDateTime() : null);
            return log;
        }
    }

    /**
     * 分页结果包装类
     */
    public static class PageResult<T> {
        private final List<T> data;
        private final long total;

        public PageResult(List<T> data, long total) {
            this.data = data;
            this.total = total;
        }

        public List<T> getData() {
            return data;
        }

        public long getTotal() {
            return total;
        }
    }
}
