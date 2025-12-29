/**
 * @spec O003-beverage-order
 * 订单统计服务
 */
package com.cinema.beverage.service;

import com.cinema.beverage.dto.OrderStatisticsDTO;
import com.cinema.beverage.dto.SalesReportDTO;
import com.cinema.beverage.entity.BeverageOrder;
import com.cinema.beverage.entity.BeverageOrderItem;
import com.cinema.beverage.repository.BeverageOrderRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 订单统计服务
 *
 * US3: 订单历史与统计
 * FR-022: B端管理员查看营业统计
 * FR-023: B端管理员导出报表（Excel格式）
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderStatisticsService {

    private static final Logger logger = LoggerFactory.getLogger(OrderStatisticsService.class);

    private final BeverageOrderRepository orderRepository;

    /**
     * 计算统计数据
     *
     * FR-022: 显示今日/本周/本月的订单数量、销售额、热销饮品排行
     *
     * @param storeId 门店ID（可选）
     * @param rangeType 时间范围类型（TODAY, WEEK, MONTH, CUSTOM）
     * @param startDate 自定义起始日期（rangeType=CUSTOM时必填）
     * @param endDate 自定义截止日期（rangeType=CUSTOM时必填）
     * @return 统计数据
     */
    public OrderStatisticsDTO calculateStatistics(
            UUID storeId,
            String rangeType,
            LocalDate startDate,
            LocalDate endDate) {

        logger.info("计算订单统计: storeId={}, rangeType={}, startDate={}, endDate={}",
                storeId, rangeType, startDate, endDate);

        // 1. 确定时间范围
        OrderStatisticsDTO.DateRangeDTO dateRange = determineDateRange(rangeType, startDate, endDate);
        LocalDateTime startDateTime = dateRange.getStartDate().atStartOfDay();
        LocalDateTime endDateTime = dateRange.getEndDate().atTime(LocalTime.MAX);

        // 2. 查询订单数据
        List<BeverageOrder> orders;
        if (storeId != null) {
            orders = orderRepository.findByStoreAndStatusAndTimeRange(
                    storeId, null, startDateTime, endDateTime,
                    org.springframework.data.domain.Pageable.unpaged()
            ).getContent();
        } else {
            orders = orderRepository.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
                    null, startDateTime, endDateTime,
                    org.springframework.data.domain.Pageable.unpaged()
            ).getContent();
        }

        // 3. 计算订单指标
        OrderStatisticsDTO.OrderMetrics orderMetrics = calculateOrderMetrics(orders);

        // 4. 计算销售指标
        OrderStatisticsDTO.SalesMetrics salesMetrics = calculateSalesMetrics(orders);

        // 5. 计算热销商品
        List<OrderStatisticsDTO.BestSellingItem> bestSelling = findBestSelling(orders, 10);

        // 6. 组装结果
        return OrderStatisticsDTO.builder()
                .dateRange(dateRange)
                .orderMetrics(orderMetrics)
                .salesMetrics(salesMetrics)
                .bestSellingBeverages(bestSelling)
                .storeId(storeId)
                .build();
    }

    /**
     * 计算热销商品排行
     *
     * FR-022: 热销饮品排行
     *
     * @param orders 订单列表
     * @param topN 前N名
     * @return 热销商品列表
     */
    public List<OrderStatisticsDTO.BestSellingItem> findBestSelling(List<BeverageOrder> orders, int topN) {
        logger.debug("计算热销商品排行 - Top {}", topN);

        // 聚合商品销量和销售额
        Map<UUID, BeverageItemAggregate> aggregateMap = new HashMap<>();

        for (BeverageOrder order : orders) {
            if (order.getStatus() == BeverageOrder.OrderStatus.CANCELLED) {
                continue; // 跳过已取消订单
            }

            for (BeverageOrderItem item : order.getItems()) {
                aggregateMap.compute(item.getBeverageId(), (id, existing) -> {
                    if (existing == null) {
                        return new BeverageItemAggregate(
                                item.getBeverageId(),
                                item.getBeverageName(),
                                item.getQuantity(),
                                item.getSubtotal()
                        );
                    } else {
                        existing.addQuantity(item.getQuantity());
                        existing.addRevenue(item.getSubtotal());
                        return existing;
                    }
                });
            }
        }

        // 计算总销售额用于百分比
        BigDecimal totalRevenue = aggregateMap.values().stream()
                .map(BeverageItemAggregate::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 排序并取 Top N
        List<OrderStatisticsDTO.BestSellingItem> bestSelling = aggregateMap.values().stream()
                .sorted(Comparator.comparing(BeverageItemAggregate::getQuantity).reversed())
                .limit(topN)
                .map(agg -> {
                    double percentage = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                            ? agg.getRevenue().divide(totalRevenue, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue()
                            : 0.0;

                    return OrderStatisticsDTO.BestSellingItem.builder()
                            .beverageId(agg.getBeverageId())
                            .beverageName(agg.getBeverageName())
                            .quantity(agg.getQuantity())
                            .revenue(agg.getRevenue())
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        // 添加排名
        for (int i = 0; i < bestSelling.size(); i++) {
            bestSelling.get(i).setRank(i + 1);
        }

        logger.info("热销商品排行计算完成 - Top {}: {}", topN, bestSelling.size());
        return bestSelling;
    }

    /**
     * 导出Excel报表
     *
     * FR-023: 导出报表（Excel格式），包含订单明细、销售汇总、原料消耗统计
     *
     * @param storeId 门店ID（可选）
     * @param startDate 起始日期
     * @param endDate 截止日期
     * @return Excel文件字节数组
     */
    public byte[] exportReport(UUID storeId, LocalDate startDate, LocalDate endDate) throws IOException {
        logger.info("导出销售报表: storeId={}, startDate={}, endDate={}", storeId, startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // 查询订单数据
        List<BeverageOrder> orders;
        if (storeId != null) {
            orders = orderRepository.findByStoreAndStatusAndTimeRange(
                    storeId, null, startDateTime, endDateTime,
                    org.springframework.data.domain.Pageable.unpaged()
            ).getContent();
        } else {
            orders = orderRepository.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
                    null, startDateTime, endDateTime,
                    org.springframework.data.domain.Pageable.unpaged()
            ).getContent();
        }

        // 创建Excel工作簿
        try (Workbook workbook = new XSSFWorkbook()) {
            // Sheet 1: 汇总统计
            createSummarySheet(workbook, orders, startDate, endDate);

            // Sheet 2: 订单明细
            createOrderDetailsSheet(workbook, orders);

            // Sheet 3: 热销商品
            createBestSellingSheet(workbook, orders);

            // 写入字节数组
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            byte[] bytes = outputStream.toByteArray();

            logger.info("销售报表导出完成 - 大小: {} bytes", bytes.length);
            return bytes;
        }
    }

    // ========== 私有辅助方法 ==========

    /**
     * 确定时间范围
     */
    private OrderStatisticsDTO.DateRangeDTO determineDateRange(
            String rangeType,
            LocalDate startDate,
            LocalDate endDate) {

        LocalDate start, end;

        switch (rangeType.toUpperCase()) {
            case "TODAY":
                start = end = LocalDate.now();
                break;
            case "WEEK":
                end = LocalDate.now();
                start = end.minusDays(6); // 最近7天
                break;
            case "MONTH":
                end = LocalDate.now();
                start = end.minusDays(29); // 最近30天
                break;
            case "CUSTOM":
                start = startDate;
                end = endDate;
                break;
            default:
                throw new IllegalArgumentException("无效的时间范围类型: " + rangeType);
        }

        return OrderStatisticsDTO.DateRangeDTO.builder()
                .startDate(start)
                .endDate(end)
                .rangeType(rangeType)
                .build();
    }

    /**
     * 计算订单指标
     */
    private OrderStatisticsDTO.OrderMetrics calculateOrderMetrics(List<BeverageOrder> orders) {
        long totalOrders = orders.size();
        long completedOrders = orders.stream()
                .filter(o -> o.getStatus() == BeverageOrder.OrderStatus.DELIVERED)
                .count();
        long cancelledOrders = orders.stream()
                .filter(o -> o.getStatus() == BeverageOrder.OrderStatus.CANCELLED)
                .count();

        double completionRate = totalOrders > 0
                ? (double) completedOrders / totalOrders * 100
                : 0.0;

        // TODO: 计算平均制作时长（需要订单时间戳字段）
        double averagePreparationTime = 0.0;

        return OrderStatisticsDTO.OrderMetrics.builder()
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .completionRate(completionRate)
                .averagePreparationTime(averagePreparationTime)
                .build();
    }

    /**
     * 计算销售指标
     */
    private OrderStatisticsDTO.SalesMetrics calculateSalesMetrics(List<BeverageOrder> orders) {
        List<BeverageOrder> validOrders = orders.stream()
                .filter(o -> o.getStatus() != BeverageOrder.OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = validOrders.stream()
                .map(BeverageOrder::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageOrderValue = validOrders.isEmpty()
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(validOrders.size()), 2, RoundingMode.HALF_UP);

        long totalQuantity = validOrders.stream()
                .flatMap(o -> o.getItems().stream())
                .mapToLong(BeverageOrderItem::getQuantity)
                .sum();

        // 找出最畅销饮品
        Map<String, Long> beverageQuantityMap = new HashMap<>();
        for (BeverageOrder order : validOrders) {
            for (BeverageOrderItem item : order.getItems()) {
                beverageQuantityMap.merge(item.getBeverageName(), (long) item.getQuantity(), Long::sum);
            }
        }

        String topSellingBeverage = null;
        Long topSellingQuantity = 0L;
        for (Map.Entry<String, Long> entry : beverageQuantityMap.entrySet()) {
            if (entry.getValue() > topSellingQuantity) {
                topSellingBeverage = entry.getKey();
                topSellingQuantity = entry.getValue();
            }
        }

        return OrderStatisticsDTO.SalesMetrics.builder()
                .totalRevenue(totalRevenue)
                .averageOrderValue(averageOrderValue)
                .totalQuantity(totalQuantity)
                .topSellingBeverage(topSellingBeverage)
                .topSellingQuantity(topSellingQuantity)
                .build();
    }

    /**
     * 创建汇总统计 Sheet
     */
    private void createSummarySheet(Workbook workbook, List<BeverageOrder> orders,
                                    LocalDate startDate, LocalDate endDate) {
        Sheet sheet = workbook.createSheet("汇总统计");

        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);

        int rowNum = 0;

        // 标题
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("销售报表汇总");
        titleCell.setCellStyle(headerStyle);

        // 时间范围
        Row dateRangeRow = sheet.createRow(rowNum++);
        dateRangeRow.createCell(0).setCellValue("统计时间:");
        dateRangeRow.createCell(1).setCellValue(startDate + " 至 " + endDate);

        rowNum++; // 空行

        // 统计数据
        OrderStatisticsDTO.OrderMetrics orderMetrics = calculateOrderMetrics(orders);
        OrderStatisticsDTO.SalesMetrics salesMetrics = calculateSalesMetrics(orders);

        createDataRow(sheet, rowNum++, "订单总数", String.valueOf(orderMetrics.getTotalOrders()), headerStyle, dataStyle);
        createDataRow(sheet, rowNum++, "已完成订单", String.valueOf(orderMetrics.getCompletedOrders()), headerStyle, dataStyle);
        createDataRow(sheet, rowNum++, "已取消订单", String.valueOf(orderMetrics.getCancelledOrders()), headerStyle, dataStyle);
        createDataRow(sheet, rowNum++, "完成率", String.format("%.2f%%", orderMetrics.getCompletionRate()), headerStyle, dataStyle);
        createDataRow(sheet, rowNum++, "销售总额", salesMetrics.getTotalRevenue() + " 元", headerStyle, dataStyle);
        createDataRow(sheet, rowNum++, "平均客单价", salesMetrics.getAverageOrderValue() + " 元", headerStyle, dataStyle);
        createDataRow(sheet, rowNum++, "总销量", salesMetrics.getTotalQuantity() + " 杯", headerStyle, dataStyle);

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    /**
     * 创建订单明细 Sheet
     */
    private void createOrderDetailsSheet(Workbook workbook, List<BeverageOrder> orders) {
        Sheet sheet = workbook.createSheet("订单明细");

        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);

        int rowNum = 0;

        // 表头
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"订单号", "下单时间", "饮品名称", "规格", "数量", "单价", "小计", "订单总价", "状态"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // 数据行
        for (BeverageOrder order : orders) {
            for (BeverageOrderItem item : order.getItems()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(order.getOrderNumber());
                row.createCell(1).setCellValue(order.getCreatedAt().toString());
                row.createCell(2).setCellValue(item.getBeverageName());
                row.createCell(3).setCellValue(item.getSelectedSpecs() != null ? item.getSelectedSpecs() : "-");
                row.createCell(4).setCellValue(item.getQuantity());
                row.createCell(5).setCellValue(item.getUnitPrice().doubleValue());
                row.createCell(6).setCellValue(item.getSubtotal().doubleValue());
                row.createCell(7).setCellValue(order.getTotalPrice().doubleValue());
                row.createCell(8).setCellValue(order.getStatus().toString());
            }
        }

        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    /**
     * 创建热销商品 Sheet
     */
    private void createBestSellingSheet(Workbook workbook, List<BeverageOrder> orders) {
        Sheet sheet = workbook.createSheet("热销商品");

        CellStyle headerStyle = createHeaderStyle(workbook);

        int rowNum = 0;

        // 表头
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"排名", "饮品名称", "销售数量", "销售额", "占比"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // 数据行
        List<OrderStatisticsDTO.BestSellingItem> bestSelling = findBestSelling(orders, 20);
        for (OrderStatisticsDTO.BestSellingItem item : bestSelling) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(item.getRank());
            row.createCell(1).setCellValue(item.getBeverageName());
            row.createCell(2).setCellValue(item.getQuantity());
            row.createCell(3).setCellValue(item.getRevenue().doubleValue());
            row.createCell(4).setCellValue(String.format("%.2f%%", item.getPercentage()));
        }

        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    /**
     * 创建表头样式
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    /**
     * 创建数据样式
     */
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    /**
     * 创建数据行
     */
    private void createDataRow(Sheet sheet, int rowNum, String label, String value,
                               CellStyle labelStyle, CellStyle valueStyle) {
        Row row = sheet.createRow(rowNum);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);

        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(valueStyle);
    }

    /**
     * 饮品项聚合（用于热销统计）
     */
    private static class BeverageItemAggregate {
        private final UUID beverageId;
        private final String beverageName;
        private Long quantity;
        private BigDecimal revenue;

        public BeverageItemAggregate(UUID beverageId, String beverageName, Integer quantity, BigDecimal revenue) {
            this.beverageId = beverageId;
            this.beverageName = beverageName;
            this.quantity = (long) quantity;
            this.revenue = revenue;
        }

        public void addQuantity(Integer qty) {
            this.quantity += qty;
        }

        public void addRevenue(BigDecimal amount) {
            this.revenue = this.revenue.add(amount);
        }

        public UUID getBeverageId() {
            return beverageId;
        }

        public String getBeverageName() {
            return beverageName;
        }

        public Long getQuantity() {
            return quantity;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }
    }
}
