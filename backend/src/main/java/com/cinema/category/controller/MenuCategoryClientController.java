package com.cinema.category.controller;

import com.cinema.category.dto.ClientMenuCategoryDTO;
import com.cinema.category.service.MenuCategoryService;
import com.cinema.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @spec O002-miniapp-menu-config
 * 菜单分类客户端控制器（C端小程序）
 */
@Slf4j
@RestController
@RequestMapping("/api/client/menu-categories")
@RequiredArgsConstructor
@Tag(name = "MenuCategory Client", description = "菜单分类接口（C端小程序）")
public class MenuCategoryClientController {

    private final MenuCategoryService menuCategoryService;

    /**
     * T048: GET /api/client/menu-categories - 获取可见分类列表
     * 返回按 sortOrder 排序的可见分类，包含商品数量
     */
    @GetMapping
    @Operation(summary = "获取分类列表", description = "获取所有可见分类，按排序顺序返回，包含各分类商品数量")
    @Cacheable(value = "clientMenuCategories", key = "'all'", unless = "#result == null")
    public ResponseEntity<ApiResponse<List<ClientMenuCategoryDTO>>> getCategories() {
        log.info("Client requesting menu categories");

        List<ClientMenuCategoryDTO> categories = menuCategoryService.getClientCategories();

        log.debug("Returning {} visible categories", categories.size());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}
