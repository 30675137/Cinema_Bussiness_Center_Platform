/**
 * @spec O003-beverage-order
 * 饮品订单统计 API 控制器 (B端)
 */
package com.cinema.beverage.controller;

import com.cinema.beverage.dto.OrderStatisticsDTO;
import com.cinema.beverage.service.OrderStatisticsService;
import com.cinema.hallstore.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;

/**
 * 饮品订单统计 API 控制器
 *
 * US3: 订单历史与统计
 * FR-022: B端管理员查看营业统计
 * FR-023: B端管理员导出报表
 */
@RestController
@RequestMapping("/api/admin/beverage-orders")
@RequiredArgsConstructor
public class BeverageOrderStatisticsController {

    private static final Logger logger = LoggerFactory.getLogger(BeverageOrderStatisticsController.class);

    private final OrderStatisticsService statisticsService;

    /**
     * 获取订单统计数据
     *
     * FR-022: 显示今日/本周/本月的订单数量、销售额、热销饮品排行
     *
     * GET /api/admin/beverage-orders/statistics?rangeType=TODAY&storeId=xxx
     *
     * @param storeId 门店ID（可选）
     * @param rangeType 时间范围类型（TODAY, WEEK, MONTH, CUSTOM）
     * @param startDate 自定义起始日期（rangeType=CUSTOM时必填）
     * @param endDate 自定义截止日期（rangeType=CUSTOM时必填）
     * @return 统计数据
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<OrderStatisticsDTO>> getStatistics(
            @RequestParam(required = false) UUID storeId,
            @RequestParam(defaultValue = "TODAY") String rangeType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        logger.info("GET /api/admin/beverage-orders/statistics - storeId={}, rangeType={}, startDate={}, endDate={}",
                storeId, rangeType, startDate, endDate);

        try {
            OrderStatisticsDTO statistics = statisticsService.calculateStatistics(
                    storeId, rangeType, startDate, endDate);

            return ResponseEntity.ok(ApiResponse.success(statistics));

        } catch (IllegalArgumentException e) {
            logger.warn("无效的统计参数: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("INVALID_PARAMETERS", e.getMessage(), null));

        } catch (Exception e) {
            logger.error("获取订单统计失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("INTERNAL_ERROR", "服务器内部错误", null));
        }
    }

    /**
     * 导出销售报表（Excel格式）
     *
     * FR-023: 导出报表（Excel格式），包含订单明细、销售汇总、原料消耗统计
     *
     * GET /api/admin/beverage-orders/export?storeId=xxx&startDate=2025-12-01&endDate=2025-12-31
     *
     * @param storeId 门店ID（可选）
     * @param startDate 起始日期（必填）
     * @param endDate 截止日期（必填）
     * @return Excel文件
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam(required = false) UUID storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        logger.info("GET /api/admin/beverage-orders/export - storeId={}, startDate={}, endDate={}",
                storeId, startDate, endDate);

        try {
            byte[] excelBytes = statisticsService.exportReport(storeId, startDate, endDate);

            String filename = String.format("销售报表_%s_%s.xlsx", startDate, endDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelBytes.length);

            logger.info("销售报表导出成功 - 文件: {}, 大小: {} bytes", filename, excelBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelBytes);

        } catch (IOException e) {
            logger.error("导出销售报表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("导出失败: " + e.getMessage()).getBytes());

        } catch (Exception e) {
            logger.error("导出销售报表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("服务器内部错误".getBytes());
        }
    }
}
