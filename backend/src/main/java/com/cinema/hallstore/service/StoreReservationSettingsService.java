package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.StoreReservationSettings;
import com.cinema.hallstore.dto.BatchUpdateResult;
import com.cinema.hallstore.dto.BatchUpdateStoreReservationSettingsRequest;
import com.cinema.hallstore.dto.StoreReservationSettingsDTO;
import com.cinema.hallstore.dto.UpdateStoreReservationSettingsRequest;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.mapper.StoreReservationSettingsMapper;
import com.cinema.hallstore.repository.StoreReservationSettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * StoreReservationSettingsService:
 * - 门店预约设置业务逻辑层
 * - 负责预约设置的查询和更新逻辑
 */
@Service
public class StoreReservationSettingsService {

    private static final Logger logger = LoggerFactory.getLogger(StoreReservationSettingsService.class);

    private final StoreReservationSettingsRepository repository;

    public StoreReservationSettingsService(StoreReservationSettingsRepository repository) {
        this.repository = repository;
    }

    /**
     * 根据门店ID获取预约设置
     * 如果设置不存在，返回默认设置
     *
     * @param storeId 门店ID
     * @return 预约设置DTO
     */
    public StoreReservationSettingsDTO getSettings(UUID storeId) {
        logger.debug("Getting reservation settings for store: {}", storeId);
        try {
            Optional<StoreReservationSettings> settingsOpt = repository.findByStoreId(storeId);
            if (settingsOpt.isPresent()) {
                logger.info("Successfully retrieved reservation settings for store: {}", storeId);
                return StoreReservationSettingsMapper.toDto(settingsOpt.get());
            } else {
                // 返回默认设置
                logger.info("Reservation settings not found for store: {}, returning defaults", storeId);
                return createDefaultSettingsDto(storeId);
            }
        } catch (Exception e) {
            logger.error("Error getting reservation settings for store: {}", storeId, e);
            throw e;
        }
    }

    /**
     * 创建默认预约设置 DTO
     */
    private StoreReservationSettingsDTO createDefaultSettingsDto(UUID storeId) {
        StoreReservationSettingsDTO dto = new StoreReservationSettingsDTO();
        dto.setStoreId(storeId.toString());
        dto.setIsReservationEnabled(false);
        dto.setMaxReservationDays(0);
        dto.setMinAdvanceHours(1);
        dto.setDurationUnit(1);
        dto.setDepositRequired(false);
        dto.setIsActive(true);
        dto.setTimeSlots(java.util.Collections.emptyList());
        return dto;
    }

    /**
     * 更新门店预约设置
     *
     * @param storeId 门店ID
     * @param request 更新请求
     * @return 更新后的预约设置DTO
     * @throws ResourceNotFoundException 如果预约设置不存在
     */
    public StoreReservationSettingsDTO updateSettings(UUID storeId, UpdateStoreReservationSettingsRequest request) {
        logger.info("Updating reservation settings for store: {}, enabled: {}, maxDays: {}", 
                storeId, request.getIsReservationEnabled(), request.getMaxReservationDays());
        try {
            // 查找现有设置，如果不存在则创建新设置
            StoreReservationSettings settings = repository.findByStoreId(storeId)
                    .orElseGet(() -> {
                        logger.info("Reservation settings not found for store: {}, creating new settings", storeId);
                        StoreReservationSettings newSettings = new StoreReservationSettings();
                        newSettings.setStoreId(storeId);
                        newSettings.setCreatedAt(Instant.now());
                        return newSettings;
                    });

            // 更新基础字段
            settings.setIsReservationEnabled(request.getIsReservationEnabled());
            settings.setMaxReservationDays(request.getMaxReservationDays());
            settings.setUpdatedAt(Instant.now());

            // 016-store-reservation-settings 更新新增字段
            if (request.getTimeSlots() != null) {
                settings.setTimeSlots(StoreReservationSettingsMapper.toTimeSlotDomains(request.getTimeSlots()));
            }
            if (request.getMinAdvanceHours() != null) {
                settings.setMinAdvanceHours(request.getMinAdvanceHours());
            }
            if (request.getDurationUnit() != null) {
                settings.setDurationUnit(request.getDurationUnit());
            }
            if (request.getDepositRequired() != null) {
                settings.setDepositRequired(request.getDepositRequired());
            }
            if (request.getDepositAmount() != null) {
                settings.setDepositAmount(request.getDepositAmount());
            }
            if (request.getDepositPercentage() != null) {
                settings.setDepositPercentage(request.getDepositPercentage());
            }
            if (request.getIsActive() != null) {
                settings.setIsActive(request.getIsActive());
            }

            // Note: updatedBy 字段可以在后续添加用户认证后设置

            // 保存更新（如果 id 为 null，repository.save 会自动创建新记录）
            StoreReservationSettings savedSettings = repository.save(settings);
            logger.info("Successfully {} reservation settings for store: {}", 
                    settings.getId() == null ? "created" : "updated", storeId);

            // 转换为DTO返回
            return StoreReservationSettingsMapper.toDto(savedSettings);
        } catch (Exception e) {
            logger.error("Error updating reservation settings for store: {}", storeId, e);
            throw e;
        }
    }

    /**
     * 批量更新门店预约设置
     *
     * @param request 批量更新请求
     * @return 批量更新结果（包含成功数量、失败数量和失败详情）
     */
    public BatchUpdateResult batchUpdate(BatchUpdateStoreReservationSettingsRequest request) {
        logger.info("Starting batch update for {} stores, enabled: {}, maxDays: {}", 
                request.getStoreIds().size(), 
                request.getSettings().getIsReservationEnabled(), 
                request.getSettings().getMaxReservationDays());
        
        BatchUpdateResult result = new BatchUpdateResult();
        
        // 如果门店ID列表为空，直接返回空结果
        if (request.getStoreIds() == null || request.getStoreIds().isEmpty()) {
            logger.warn("Batch update requested with empty store IDs list");
            return result;
        }

        // 遍历每个门店ID，尝试更新
        for (UUID storeId : request.getStoreIds()) {
            try {
                // 尝试更新单个门店的设置
                updateSettings(storeId, request.getSettings());
                result.incrementSuccess();
                logger.debug("Successfully updated reservation settings for store: {}", storeId);
            } catch (ResourceNotFoundException e) {
                // 门店预约设置不存在，记录失败
                logger.warn("Reservation settings not found for store: {}", storeId);
                result.addFailure(storeId.toString(), "NOT_FOUND", e.getMessage());
            } catch (Exception e) {
                // 其他异常，记录失败
                logger.error("Error updating reservation settings for store: {}", storeId, e);
                result.addFailure(storeId.toString(), "UPDATE_ERROR", e.getMessage());
            }
        }

        logger.info("Batch update completed: success={}, failure={}", 
                result.getSuccessCount(), result.getFailureCount());
        return result;
    }
}
