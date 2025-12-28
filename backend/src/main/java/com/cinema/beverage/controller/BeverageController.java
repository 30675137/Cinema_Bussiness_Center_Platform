/**
 * @spec O003-beverage-order
 * 饮品管理控制器
 */
package com.cinema.beverage.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cinema.beverage.dto.BeverageDTO;
import com.cinema.beverage.dto.BeverageDetailDTO;
import com.cinema.beverage.service.BeverageService;
import com.cinema.common.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 饮品控制器 - C端API
 *
 * 对应 spec: O003-beverage-order
 * 提供C端饮品菜单查询接口
 */
@RestController
@RequestMapping("/api/client/beverages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BeverageController {

    private static final Logger logger = LoggerFactory.getLogger(BeverageController.class);

    private final BeverageService beverageService;

    /**
     * 获取饮品菜单列表（按分类分组）
     *
     * GET /api/client/beverages
     *
     * @param category 可选，筛选指定分类
     * @return 按分类分组的饮品Map
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, List<BeverageDTO>>>> getBeverages(
            @RequestParam(required = false) String category
    ) {
        logger.info("查询饮品菜单列表: category={}", category);

        if (category != null && !category.isEmpty()) {
            // 按分类筛选
            List<BeverageDTO> beverages = beverageService.findByCategory(category);
            Map<String, List<BeverageDTO>> result = Map.of(category, beverages);
            return ResponseEntity.ok(ApiResponse.success(result));
        } else {
            // 返回所有分类
            Map<String, List<BeverageDTO>> beverages = beverageService.findAllActiveGroupedByCategory();
            return ResponseEntity.ok(ApiResponse.success(beverages));
        }
    }

    /**
     * 获取饮品详情（包含规格列表）
     *
     * GET /api/client/beverages/{id}
     *
     * @param id 饮品ID
     * @return 饮品详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BeverageDetailDTO>> getBeverageDetail(
            @PathVariable String id
    ) {
        logger.info("查询饮品详情: id={}", id);

        UUID beverageId = UUID.fromString(id);
        BeverageDetailDTO beverage = beverageService.findDetailById(beverageId);

        return ResponseEntity.ok(ApiResponse.success(beverage));
    }

    /**
     * 获取推荐饮品列表
     *
     * GET /api/client/beverages/recommended
     *
     * @return 推荐饮品列表
     */
    @GetMapping("/recommended")
    public ResponseEntity<ApiResponse<List<BeverageDTO>>> getRecommendedBeverages() {
        logger.info("查询推荐饮品列表");

        List<BeverageDTO> beverages = beverageService.findRecommended();
        return ResponseEntity.ok(ApiResponse.success(beverages));
    }
}
