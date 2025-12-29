/**
 * @spec O003-beverage-order
 * 统一订单 Repository - 查询商品订单和饮品订单
 */
package com.cinema.order.repository;

import com.cinema.order.dto.OrderQueryParams;
import com.cinema.order.dto.UnifiedOrderDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * 统一订单 Repository
 *
 * 使用 UNION 查询合并商品订单和饮品订单
 */
@Repository
public class UnifiedOrderRepository {

    private static final Logger logger = LoggerFactory.getLogger(UnifiedOrderRepository.class);

    private final JdbcTemplate jdbcTemplate;

    public UnifiedOrderRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * 查询统一订单列表（支持筛选和分页）
     *
     * @param params 查询参数
     * @return 分页结果
     */
    public PageResult<UnifiedOrderDTO> findUnifiedOrders(OrderQueryParams params) {
        StringBuilder sql = new StringBuilder();
        List<Object> sqlParams = new ArrayList<>();

        // 构建 UNION 查询
        sql.append("SELECT * FROM (");

        // 商品订单查询
        sql.append("  SELECT ");
        sql.append("    id, ");
        sql.append("    order_number, ");
        sql.append("    user_id, ");
        sql.append("    'PRODUCT' AS order_type, ");
        sql.append("    status, ");
        sql.append("    total_amount AS total_price, ");
        sql.append("    payment_method, ");
        sql.append("    payment_time AS paid_at, ");
        sql.append("    created_at, ");
        sql.append("    updated_at ");
        sql.append("  FROM product_orders ");
        sql.append("  WHERE 1=1 ");

        // 饮品订单查询
        sql.append("  UNION ALL ");
        sql.append("  SELECT ");
        sql.append("    id, ");
        sql.append("    order_number, ");
        sql.append("    user_id, ");
        sql.append("    'BEVERAGE' AS order_type, ");
        sql.append("    status, ");
        sql.append("    total_price, ");
        sql.append("    payment_method, ");
        sql.append("    paid_at, ");
        sql.append("    created_at, ");
        sql.append("    updated_at ");
        sql.append("  FROM beverage_orders ");
        sql.append("  WHERE 1=1 ");

        sql.append(") AS unified ");
        sql.append("WHERE 1=1 ");

        // 添加筛选条件
        if (params.getStatus() != null) {
            sql.append("AND status = ? ");
            sqlParams.add(params.getStatus().name());
        }

        if (params.getStartDate() != null) {
            sql.append("AND created_at >= CAST(? AS DATE) ");
            sqlParams.add(params.getStartDate());
        }

        if (params.getEndDate() != null) {
            sql.append("AND created_at < CAST(? AS DATE) + INTERVAL '1 day' ");
            sqlParams.add(params.getEndDate());
        }

        if (params.getSearch() != null && !params.getSearch().trim().isEmpty()) {
            sql.append("AND order_number LIKE ? ");
            sqlParams.add("%" + params.getSearch() + "%");
        }

        // 排序 - 使用下划线命名
        String sortBy = params.getSortBy() != null ? params.getSortBy() : "created_at";
        // 将驼峰命名转换为下划线命名
        sortBy = sortBy.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
        String sortOrder = "desc".equalsIgnoreCase(params.getSortOrder()) ? "DESC" : "ASC";
        sql.append("ORDER BY ").append(sortBy).append(" ").append(sortOrder).append(" ");

        // 统计总数
        String countSql = "SELECT COUNT(*) FROM (" + sql + ") AS count_query";
        Long total = jdbcTemplate.queryForObject(countSql, Long.class, sqlParams.toArray());

        // 分页
        int offset = (params.getPage() - 1) * params.getPageSize();
        sql.append("LIMIT ? OFFSET ? ");
        sqlParams.add(params.getPageSize());
        sqlParams.add(offset);

        // 执行查询
        List<UnifiedOrderDTO> orders = jdbcTemplate.query(
            sql.toString(),
            sqlParams.toArray(),
            new UnifiedOrderRowMapper()
        );

        logger.info("Found {} unified orders (total: {})", orders.size(), total);

        return new PageResult<>(orders, total != null ? total : 0);
    }

    /**
     * RowMapper for UnifiedOrderDTO
     */
    private static class UnifiedOrderRowMapper implements RowMapper<UnifiedOrderDTO> {
        @Override
        public UnifiedOrderDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            return UnifiedOrderDTO.builder()
                .id(java.util.UUID.fromString(rs.getString("id")))
                .orderNumber(rs.getString("order_number"))
                .userId(java.util.UUID.fromString(rs.getString("user_id")))
                .orderType(UnifiedOrderDTO.OrderType.valueOf(rs.getString("order_type")))
                .status(rs.getString("status"))
                .totalPrice(rs.getBigDecimal("total_price"))
                .paymentMethod(rs.getString("payment_method"))
                .paidAt(rs.getTimestamp("paid_at") != null ?
                    rs.getTimestamp("paid_at").toLocalDateTime() : null)
                .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
                .build();
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
