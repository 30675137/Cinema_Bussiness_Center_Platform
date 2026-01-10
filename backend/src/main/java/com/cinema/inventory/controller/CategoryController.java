package com.cinema.inventory.controller;

import com.cinema.inventory.domain.Category;
import com.cinema.inventory.service.CategoryService;
import com.cinema.hallstore.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 商品分类 API 控制器
 * 提供分类列表查询接口。
 * 
 * @since P003-inventory-query
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * 获取商品分类列表
     * 
     * GET /api/categories?status=ACTIVE
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listCategories(
            @RequestParam(defaultValue = "ACTIVE") String status) {

        logger.info("GET /api/categories - status={}", status);

        List<Category> categories;
        if ("ACTIVE".equalsIgnoreCase(status)) {
            categories = categoryService.listCategories();
        } else {
            categories = categoryService.listCategoriesByStatus(status);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", categories
        ));
    }

    /**
     * 获取商品分类树形结构
     * 
     * GET /api/categories/tree?lazy=true
     */
    @GetMapping("/tree")
    public ResponseEntity<Map<String, Object>> getCategoryTree(
            @RequestParam(defaultValue = "true") boolean lazy) {

        logger.info("GET /api/categories/tree - lazy={}", lazy);

        // 获取所有分类并过滤掉无效数据
        List<Category> categories = categoryService.listCategories();
        
        // 过滤掉 id 或 name 为空的分类
        List<Category> validCategories = categories.stream()
            .filter(category -> category.getId() != null && category.getName() != null && !category.getName().trim().isEmpty())
            .toList();
        
        logger.info("返回有效分类数量: {} / {}", validCategories.size(), categories.size());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", validCategories,
                "message", "获取成功",
                "code", 200
        ));
    }

    /**
     * 数据健康检查端点
     * 检查数据库中是否存在无效的分类记录
     * 
     * GET /api/categories/health-check
     */
    @GetMapping("/health-check")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        logger.info("GET /api/categories/health-check");

        List<Category> allCategories = categoryService.listCategories();
        
        // 统计无效记录
        long invalidCount = allCategories.stream()
            .filter(category -> category.getId() == null || 
                               category.getName() == null || 
                               category.getName().trim().isEmpty())
            .count();
        
        long validCount = allCategories.size() - invalidCount;
        
        logger.info("数据健康检查: 总数={}, 有效={}, 无效={}", 
                   allCategories.size(), validCount, invalidCount);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "total", allCategories.size(),
                    "valid", validCount,
                    "invalid", invalidCount,
                    "healthy", invalidCount == 0
                ),
                "message", invalidCount == 0 ? "数据健康" : "发现无效数据",
                "code", 200
        ));
    }
}
