package com.cinema.common.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", Instant.now().toString());
        response.put("message", "Backend is running");
        return response;
    }

    @GetMapping("/scenario-packages")
    public Map<String, Object> mockScenarioPackages() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", new Object[]{});
        response.put("total", 0);
        response.put("timestamp", Instant.now().toString());
        response.put("message", "数据库未配置，返回Mock数据。请先执行数据库迁移脚本。");
        return response;
    }
}
