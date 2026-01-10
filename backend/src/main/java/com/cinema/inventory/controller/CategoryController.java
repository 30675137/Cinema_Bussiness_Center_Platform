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

        // 目前返回所有分类，前端自行组织树形结构
        // TODO: 后续可以在Service层实现真正的树形结构返回
        List<Category> categories = categoryService.listCategories();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", categories,
                "message", "获取成功",
                "code", 200
        ));
    }
}
