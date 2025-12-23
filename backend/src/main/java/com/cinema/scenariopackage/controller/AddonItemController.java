package com.cinema.scenariopackage.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.scenariopackage.model.AddonItem;
import com.cinema.scenariopackage.service.ScenarioPackageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 加购项控制器
 */
@RestController
@RequestMapping("/api/addon-items")
public class AddonItemController {

    private static final Logger logger = LoggerFactory.getLogger(AddonItemController.class);

    private final ScenarioPackageService packageService;

    public AddonItemController(ScenarioPackageService packageService) {
        this.packageService = packageService;
    }

    /**
     * 获取所有启用的加购项
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddonItem>>> getAddonItems() {
        logger.info("GET /api/addon-items - Get all active addon items");
        List<AddonItem> items = packageService.getActiveAddonItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }
}
