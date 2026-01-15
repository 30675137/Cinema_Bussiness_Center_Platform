package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.ActivityType;
import com.cinema.hallstore.domain.enums.ActivityTypeStatus;
import com.cinema.hallstore.dto.ActivityTypeDTO;
import com.cinema.hallstore.dto.CreateActivityTypeRequest;
import com.cinema.hallstore.dto.UpdateActivityTypeRequest;
import com.cinema.hallstore.exception.ResourceConflictException;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.mapper.ActivityTypeMapper;
import com.cinema.hallstore.repository.ActivityTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ActivityTypeService:
 * - 活动类型业务逻辑层
 * - 负责活动类型的查询、创建、更新、删除和状态切换逻辑
 */
@Service
public class ActivityTypeService {

    private static final Logger logger = LoggerFactory.getLogger(ActivityTypeService.class);

    private final ActivityTypeRepository repository;

    public ActivityTypeService(ActivityTypeRepository repository) {
        this.repository = repository;
    }

    /**
     * 查询所有活动类型（运营后台使用）
     *
     * @param status 可选的状态过滤（ENABLED/DISABLED），null 表示返回所有非删除状态
     * @return 活动类型DTO列表
     */
    public List<ActivityTypeDTO> findAll(ActivityTypeStatus status) {
        logger.debug("Finding all activity types with status: {}", status);
        try {
            List<ActivityType> activityTypes = repository.findAll(status);
            logger.info("Successfully retrieved {} activity types", activityTypes.size());
            return activityTypes.stream()
                    .map(ActivityTypeMapper::toDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error finding activity types", e);
            throw e;
        }
    }

    /**
     * 查询所有启用状态的活动类型（小程序端使用）
     *
     * @return 启用状态的活动类型DTO列表
     */
    public List<ActivityTypeDTO> findEnabled() {
        logger.debug("Finding enabled activity types");
        try {
            List<ActivityType> activityTypes = repository.findEnabled();
            logger.info("Successfully retrieved {} enabled activity types", activityTypes.size());
            return activityTypes.stream()
                    .map(ActivityTypeMapper::toDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error finding enabled activity types", e);
            throw e;
        }
    }

    /**
     * 根据ID获取活动类型
     *
     * @param id 活动类型ID
     * @return 活动类型DTO
     * @throws ResourceNotFoundException 如果活动类型不存在
     */
    public ActivityTypeDTO findById(UUID id) {
        logger.debug("Finding activity type by id: {}", id);
        try {
            ActivityType activityType = repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("活动类型", id.toString()));
            logger.info("Successfully retrieved activity type: {}", id);
            return ActivityTypeMapper.toDto(activityType);
        } catch (ResourceNotFoundException e) {
            logger.warn("Activity type not found: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error finding activity type by id: {}", id, e);
            throw e;
        }
    }

    /**
     * 创建活动类型
     *
     * @param request 创建请求
     * @return 创建的活动类型DTO
     * @throws ResourceConflictException 如果名称已存在
     */
    public ActivityTypeDTO create(CreateActivityTypeRequest request) {
        logger.info("Creating activity type: name={}, description={}, businessCategory={}, backgroundImageUrl={}, sort={}",
                request.getName(), request.getDescription(), request.getBusinessCategory(), request.getBackgroundImageUrl(), request.getSort());
        try {
            // 验证名称唯一性
            if (repository.existsByName(request.getName(), null)) {
                logger.warn("Activity type name already exists: {}", request.getName());
                throw new ResourceConflictException("活动类型名称已存在: " + request.getName());
            }

            // 创建活动类型实体
            ActivityType activityType = new ActivityType();
            activityType.setName(request.getName());
            activityType.setDescription(request.getDescription());
            activityType.setBusinessCategory(request.getBusinessCategory());
            activityType.setBackgroundImageUrl(request.getBackgroundImageUrl());
            activityType.setStatus(ActivityTypeStatus.ENABLED); // 默认启用
            activityType.setSort(request.getSort());
            activityType.setCreatedAt(Instant.now());
            activityType.setUpdatedAt(Instant.now());
            // Note: createdBy 可以在后续添加用户认证后设置

            // 保存到数据库
            ActivityType saved = repository.save(activityType);
            logger.info("Successfully created activity type: id={}, name={}", saved.getId(), saved.getName());

            return ActivityTypeMapper.toDto(saved);
        } catch (ResourceConflictException e) {
            logger.error("Conflict when creating activity type: {}", request.getName(), e);
            throw e;
        } catch (Exception e) {
            logger.error("Error creating activity type: {}", request.getName(), e);
            throw e;
        }
    }

    /**
     * 更新活动类型
     *
     * @param id 活动类型ID
     * @param request 更新请求
     * @return 更新后的活动类型DTO
     * @throws ResourceNotFoundException 如果活动类型不存在
     * @throws ResourceConflictException 如果名称已存在（排除当前记录）
     */
    public ActivityTypeDTO update(UUID id, UpdateActivityTypeRequest request) {
        logger.info("Updating activity type: id={}, name={}, description={}, businessCategory={}, backgroundImageUrl={}, sort={}",
                id, request.getName(), request.getDescription(), request.getBusinessCategory(), request.getBackgroundImageUrl(), request.getSort());
        try {
            // 检查活动类型是否存在
            ActivityType existing = repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("活动类型", id.toString()));

            // 验证名称唯一性（排除当前记录）
            if (repository.existsByName(request.getName(), id)) {
                logger.warn("Activity type name already exists: {}", request.getName());
                throw new ResourceConflictException("活动类型名称已存在: " + request.getName());
            }

            // 更新字段
            existing.setName(request.getName());
            existing.setDescription(request.getDescription());
            existing.setBusinessCategory(request.getBusinessCategory());
            existing.setBackgroundImageUrl(request.getBackgroundImageUrl());
            existing.setSort(request.getSort());
            existing.setUpdatedAt(Instant.now());
            // Note: updatedBy 可以在后续添加用户认证后设置

            // 保存更新
            ActivityType saved = repository.save(existing);
            logger.info("Successfully updated activity type: id={}, name={}", saved.getId(), saved.getName());

            return ActivityTypeMapper.toDto(saved);
        } catch (ResourceNotFoundException e) {
            logger.warn("Activity type not found: {}", id);
            throw e;
        } catch (ResourceConflictException e) {
            logger.error("Conflict when updating activity type: id={}", id, e);
            throw e;
        } catch (Exception e) {
            logger.error("Error updating activity type: id={}", id, e);
            throw e;
        }
    }

    /**
     * 切换活动类型状态（启用/停用）
     *
     * @param id 活动类型ID
     * @param status 目标状态（ENABLED/DISABLED）
     * @return 更新后的活动类型DTO
     * @throws ResourceNotFoundException 如果活动类型不存在
     */
    public ActivityTypeDTO toggleStatus(UUID id, ActivityTypeStatus status) {
        logger.info("Toggling activity type status: id={}, status={}", id, status);
        try {
            // 检查活动类型是否存在
            repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("活动类型", id.toString()));

            // 验证状态值（只能是 ENABLED 或 DISABLED）
            if (status != ActivityTypeStatus.ENABLED && status != ActivityTypeStatus.DISABLED) {
                throw new IllegalArgumentException("状态只能是 ENABLED 或 DISABLED");
            }

            // 更新状态
            ActivityType updated = repository.updateStatus(id, status, null);
            logger.info("Successfully toggled activity type status: id={}, status={}", id, status);

            return ActivityTypeMapper.toDto(updated);
        } catch (ResourceNotFoundException e) {
            logger.warn("Activity type not found: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error toggling activity type status: id={}, status={}", id, status, e);
            throw e;
        }
    }

    /**
     * 删除活动类型（软删除）
     *
     * @param id 活动类型ID
     * @return 删除后的活动类型DTO
     * @throws ResourceNotFoundException 如果活动类型不存在
     */
    public ActivityTypeDTO delete(UUID id) {
        logger.info("Deleting activity type: id={}", id);
        try {
            // 检查活动类型是否存在
            repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("活动类型", id.toString()));

            // 软删除（将状态设置为 DELETED）
            ActivityType deleted = repository.delete(id);
            logger.info("Successfully deleted activity type: id={}", id);

            return ActivityTypeMapper.toDto(deleted);
        } catch (ResourceNotFoundException e) {
            logger.warn("Activity type not found: {}", id);
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting activity type: id={}", id, e);
            throw e;
        }
    }
}

