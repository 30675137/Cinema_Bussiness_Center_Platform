/**
 * @spec O003-beverage-order
 * @spec O013-order-channel-migration
 * C端饮品查询控制器 (T142)
 * 
 * @deprecated 从 O013 开始，该控制器已废弃。
 *             请使用渠道商品 API: /api/client/channel-products
 *             参考: O006-miniapp-channel-order
 */
package com.cinema.beverage.controller;

import com.cinema.beverage.dto.BeverageDTO;
import com.cinema.beverage.dto.BeverageDetailDTO;
import com.cinema.beverage.dto.BeverageSpecDTO;
import com.cinema.beverage.service.BeverageAdminService;
import com.cinema.common.dto.ApiResponse;
import com.cinema.common.dto.ListResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * C端饮品查询 API 控制器
 *
 * 提供以下端点:
 * - GET /api/client/beverages - 获取饮品列表
 * - GET /api/client/beverages/{id} - 获取饮品详情
 * - GET /api/client/beverages/{id}/specs - 获取饮品规格列表
 *
 * 注意:
 * - 此控制器仅提供只读查询接口
 * - 不需要认证即可访问
 * - 仅返回状态为 ACTIVE 的饮品
 * 
 * @deprecated 从 O013-order-channel-migration 开始，该控制器已废弃。
 *             新的商品查询请使用渠道商品 API：
 *             - GET /api/client/channel-products - 获取渠道商品列表
 *             - GET /api/client/channel-products/{id} - 获取渠道商品详情
 *             参考 O006-miniapp-channel-order 规格
 */
@Deprecated(since = "O013", forRemoval = true)
@RestController
@RequestMapping("/api/client/beverages")
@RequiredArgsConstructor
public class BeverageClientController {

    private static final Logger log = LoggerFactory.getLogger(BeverageClientController.class);

    private final BeverageAdminService beverageAdminService;

    /**
     * 获取饮品列表
     *
     * @param category 分类筛选（可选）
     * @param status 状态筛选（可选，默认 ACTIVE）
     * @param page 页码（从0开始，默认0）
     * @param pageSize 每页大小（默认20）
     * @return 饮品列表响应
     */
    @GetMapping
    public ListResponse<BeverageDTO> getBeverages(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "ACTIVE") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        log.info("C端获取饮品列表 - category: {}, status: {}, page: {}, pageSize: {}",
                category, status, page, pageSize);

        try {
            Pageable pageable = PageRequest.of(page, pageSize);

            // 转换 status 字符串为枚举
            com.cinema.beverage.entity.Beverage.BeverageStatus statusEnum = null;
            if (status != null) {
                try {
                    statusEnum = com.cinema.beverage.entity.Beverage.BeverageStatus.valueOf(status);
                } catch (IllegalArgumentException e) {
                    log.warn("无效的状态参数: {}", status);
                }
            }

            Page<BeverageDTO> beveragePage = beverageAdminService.findBeverages(
                    null,  // name filter
                    category,
                    statusEnum,
                    pageable
            );

            return ListResponse.success(
                    beveragePage.getContent(),
                    beveragePage.getTotalElements(),
                    page,
                    pageSize
            );
        } catch (Exception e) {
            log.error("获取饮品列表失败", e);
            return ListResponse.failure("查询失败，请稍后重试");
        }
    }

    /**
     * 获取饮品详情
     *
     * @param id 饮品ID
     * @return 饮品详情响应
     */
    @GetMapping("/{id}")
    public ApiResponse<BeverageDetailDTO> getBeverageById(@PathVariable String id) {
        log.info("C端获取饮品详情 - id: {}", id);

        try {
            BeverageDetailDTO beverage = beverageAdminService.getBeverageDetail(id);
            return ApiResponse.success(beverage, "查询成功");
        } catch (IllegalArgumentException e) {
            log.warn("饮品不存在 - id: {}", id);
            return ApiResponse.failure("饮品不存在");
        } catch (Exception e) {
            log.error("获取饮品详情失败 - id: {}", id, e);
            return ApiResponse.failure("查询失败，请稍后重试");
        }
    }

    /**
     * 获取饮品规格列表
     *
     * @param id 饮品ID
     * @return 规格列表响应
     */
    @GetMapping("/{id}/specs")
    public ApiResponse<List<BeverageSpecDTO>> getBeverageSpecs(@PathVariable String id) {
        log.info("C端获取饮品规格列表 - beverageId: {}", id);

        try {
            List<BeverageSpecDTO> specs = beverageAdminService.getBeverageSpecs(id);
            return ApiResponse.success(specs, "查询成功");
        } catch (IllegalArgumentException e) {
            log.warn("饮品不存在 - id: {}", id);
            return ApiResponse.failure("饮品不存在");
        } catch (Exception e) {
            log.error("获取饮品规格失败 - id: {}", id, e);
            return ApiResponse.failure("查询失败，请稍后重试");
        }
    }
}
