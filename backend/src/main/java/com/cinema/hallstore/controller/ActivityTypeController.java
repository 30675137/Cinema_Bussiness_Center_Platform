package com.cinema.hallstore.controller;

import com.cinema.hallstore.domain.enums.ActivityTypeStatus;
import com.cinema.hallstore.dto.ActivityTypeDTO;
import com.cinema.hallstore.dto.ActivityTypeListResponse;
import com.cinema.hallstore.dto.ApiResponse;
import com.cinema.hallstore.dto.CreateActivityTypeRequest;
import com.cinema.hallstore.dto.UpdateActivityTypeRequest;
import com.cinema.hallstore.dto.UpdateActivityTypeStatusRequest;
import com.cinema.hallstore.service.ActivityTypeService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * ActivityTypeController:
 * - 提供活动类型管理接口
 * - 供运营后台和小程序端调用
 */
@RestController
@RequestMapping("/api/activity-types")
public class ActivityTypeController {

    private static final Logger logger = LoggerFactory.getLogger(ActivityTypeController.class);

    private final ActivityTypeService service;

    public ActivityTypeController(ActivityTypeService service) {
        this.service = service;
    }

    /**
     * 获取活动类型列表（运营后台）
     * GET /api/activity-types
     *
     * @param status 可选筛选：活动类型状态（ENABLED, DISABLED），不传则返回所有非删除状态
     * @return 活动类型列表响应
     */
    @GetMapping
    public ResponseEntity<ActivityTypeListResponse> getActivityTypes(
            @RequestParam(required = false) ActivityTypeStatus status) {
        logger.debug("Getting activity types with status filter: {}", status);
        try {
            List<ActivityTypeDTO> activityTypes = service.findAll(status);
            ActivityTypeListResponse response = new ActivityTypeListResponse(activityTypes, activityTypes.size());
            logger.info("Successfully retrieved {} activity types", activityTypes.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting activity types", e);
            throw e;
        }
    }

    /**
     * 获取启用状态的活动类型列表（小程序端）
     * GET /api/activity-types/enabled
     *
     * @return 启用状态的活动类型列表响应
     */
    @GetMapping("/enabled")
    public ResponseEntity<ActivityTypeListResponse> getEnabledActivityTypes() {
        logger.debug("Getting enabled activity types");
        try {
            List<ActivityTypeDTO> activityTypes = service.findEnabled();
            ActivityTypeListResponse response = new ActivityTypeListResponse(activityTypes, activityTypes.size());
            logger.info("Successfully retrieved {} enabled activity types", activityTypes.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting enabled activity types", e);
            throw e;
        }
    }

    /**
     * 获取单个活动类型
     * GET /api/activity-types/{id}
     *
     * @param id 活动类型ID
     * @return 活动类型响应
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityTypeDTO>> getActivityType(@PathVariable UUID id) {
        logger.debug("Getting activity type by id: {}", id);
        try {
            ActivityTypeDTO activityType = service.findById(id);
            logger.info("Successfully retrieved activity type: {}", id);
            return ResponseEntity.ok(ApiResponse.success(activityType));
        } catch (Exception e) {
            logger.error("Error getting activity type: {}", id, e);
            throw e;
        }
    }

    /**
     * 创建活动类型
     * POST /api/activity-types
     *
     * @param request 创建请求
     * @return 创建的活动类型响应
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ActivityTypeDTO>> createActivityType(
            @RequestBody @Valid CreateActivityTypeRequest request) {
        logger.info("Creating activity type: name={}, description={}, sort={}",
                request.getName(), request.getDescription(), request.getSort());
        try {
            ActivityTypeDTO activityType = service.create(request);
            logger.info("Successfully created activity type: id={}, name={}", activityType.getId(), activityType.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(activityType));
        } catch (Exception e) {
            logger.error("Error creating activity type: {}", request.getName(), e);
            throw e;
        }
    }

    /**
     * 更新活动类型
     * PUT /api/activity-types/{id}
     *
     * @param id 活动类型ID
     * @param request 更新请求
     * @return 更新后的活动类型响应
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityTypeDTO>> updateActivityType(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateActivityTypeRequest request) {
        logger.info("Updating activity type: id={}, name={}, description={}, sort={}",
                id, request.getName(), request.getDescription(), request.getSort());
        try {
            ActivityTypeDTO activityType = service.update(id, request);
            logger.info("Successfully updated activity type: id={}, name={}", id, activityType.getName());
            return ResponseEntity.ok(ApiResponse.success(activityType));
        } catch (Exception e) {
            logger.error("Error updating activity type: id={}", id, e);
            throw e;
        }
    }

    /**
     * 切换活动类型状态（启用/停用）
     * PATCH /api/activity-types/{id}/status
     *
     * @param id 活动类型ID
     * @param request 状态更新请求
     * @return 更新后的活动类型响应
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ActivityTypeDTO>> toggleActivityTypeStatus(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateActivityTypeStatusRequest request) {
        logger.info("Toggling activity type status: id={}, status={}", id, request.getStatus());
        try {
            ActivityTypeDTO activityType = service.toggleStatus(id, request.getStatus());
            logger.info("Successfully toggled activity type status: id={}, status={}", id, request.getStatus());
            return ResponseEntity.ok(ApiResponse.success(activityType));
        } catch (Exception e) {
            logger.error("Error toggling activity type status: id={}, status={}", id, request.getStatus(), e);
            throw e;
        }
    }

    /**
     * 删除活动类型（软删除）
     * DELETE /api/activity-types/{id}
     *
     * @param id 活动类型ID
     * @return 删除后的活动类型响应
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityTypeDTO>> deleteActivityType(@PathVariable UUID id) {
        logger.info("Deleting activity type: id={}", id);
        try {
            ActivityTypeDTO activityType = service.delete(id);
            logger.info("Successfully deleted activity type: id={}", id);
            return ResponseEntity.ok(ApiResponse.success(activityType));
        } catch (Exception e) {
            logger.error("Error deleting activity type: id={}", id, e);
            throw e;
        }
    }
}

