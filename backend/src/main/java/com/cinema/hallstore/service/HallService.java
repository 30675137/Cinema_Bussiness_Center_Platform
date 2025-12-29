package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.Hall;
import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import com.cinema.hallstore.dto.CreateHallRequest;
import com.cinema.hallstore.dto.HallDTO;
import com.cinema.hallstore.dto.UpdateHallRequest;
import com.cinema.hallstore.exception.BusinessException;
import com.cinema.hallstore.exception.ResourceConflictException;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.mapper.HallMapper;
import com.cinema.hallstore.repository.HallRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * HallService:
 * - 影厅主数据业务逻辑层
 * - 负责创建、编辑、状态变更与基本校验
 */
@Service
public class HallService {

    private final HallRepository hallRepository;
    private final StoreService storeService;

    public HallService(HallRepository hallRepository, StoreService storeService) {
        this.hallRepository = hallRepository;
        this.storeService = storeService;
    }

    /**
     * 获取所有影厅列表（跨门店）
     */
    public List<HallDTO> getAllHalls(HallStatus status, HallType type) {
        List<Hall> halls = hallRepository.findAll(status, type);
        return halls.stream()
                .map(HallMapper::toDto)
                .toList();
    }

    /**
     * 按门店查询影厅列表
     */
    public List<HallDTO> getHallsByStore(UUID storeId, HallStatus status, HallType type) {
        List<Hall> halls = hallRepository.findByStoreId(storeId, status, type);
        return halls.stream()
                .map(HallMapper::toDto)
                .toList();
    }

    /**
     * 获取所有来自启用门店的影厅列表（用于新建排期场景）
     * 过滤掉已停用门店的影厅，确保新排期只使用活跃门店的影厅
     *
     * @param status 影厅状态筛选（可选）
     * @param type 影厅类型筛选（可选）
     * @return 来自启用门店的影厅列表
     */
    public List<HallDTO> getHallsFromActiveStores(HallStatus status, HallType type) {
        // 获取所有影厅
        List<Hall> allHalls = hallRepository.findAll(status, type);

        // 获取所有启用的门店ID列表
        List<UUID> activeStoreIds = storeService.getActiveStores()
                .stream()
                .map(storeDto -> UUID.fromString(storeDto.getId()))
                .toList();

        // 过滤出属于启用门店的影厅
        return allHalls.stream()
                .filter(hall -> activeStoreIds.contains(hall.getStoreId()))
                .map(HallMapper::toDto)
                .toList();
    }

    /**
     * 根据影厅 ID 获取影厅详情
     */
    public HallDTO getHallById(UUID hallId) {
        Hall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("影厅", hallId.toString()));
        return HallMapper.toDto(hall);
    }

    /**
     * 创建影厅
     */
    public HallDTO createHall(CreateHallRequest request) {
        UUID storeId = parseUUID(request.getStoreId(), "门店ID格式无效");

        // 校验容量
        validateCapacity(request.getCapacity());

        // 校验影厅编码唯一性（如果提供了编码）
        if (request.getCode() != null && !request.getCode().isBlank()) {
            if (hallRepository.existsByStoreIdAndCode(storeId, request.getCode(), null)) {
                throw new ResourceConflictException("该门店下影厅编码已存在: " + request.getCode());
            }
        }

        Hall hall = new Hall();
        hall.setStoreId(storeId);
        hall.setCode(request.getCode());
        hall.setName(request.getName());
        hall.setType(request.getType());
        hall.setCapacity(request.getCapacity());
        hall.setTags(request.getTags());
        hall.setStatus(request.getStatus() != null ? request.getStatus() : HallStatus.ACTIVE);

        Hall created = hallRepository.create(hall);
        return HallMapper.toDto(created);
    }

    /**
     * 更新影厅
     */
    public HallDTO updateHall(UUID hallId, UpdateHallRequest request) {
        // 获取现有影厅
        Hall existing = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("影厅", hallId.toString()));

        // 校验容量
        if (request.getCapacity() != null) {
            validateCapacity(request.getCapacity());
        }

        // 校验影厅编码唯一性（如果更新了编码）
        if (request.getCode() != null && !request.getCode().isBlank()) {
            if (hallRepository.existsByStoreIdAndCode(existing.getStoreId(), request.getCode(), hallId)) {
                throw new ResourceConflictException("该门店下影厅编码已存在: " + request.getCode());
            }
        }

        // 更新字段
        Hall updated = new Hall();
        updated.setCode(request.getCode() != null ? request.getCode() : existing.getCode());
        updated.setName(request.getName() != null ? request.getName() : existing.getName());
        updated.setType(request.getType() != null ? request.getType() : existing.getType());
        updated.setCapacity(request.getCapacity() != null ? request.getCapacity() : existing.getCapacity());
        updated.setTags(request.getTags() != null ? request.getTags() : existing.getTags());
        updated.setStatus(request.getStatus() != null ? request.getStatus() : existing.getStatus());

        Hall result = hallRepository.update(hallId, updated);
        return HallMapper.toDto(result);
    }

    /**
     * 停用影厅（状态变更为 INACTIVE）
     */
    public HallDTO deactivateHall(UUID hallId) {
        Hall existing = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("影厅", hallId.toString()));

        if (existing.getStatus() == HallStatus.INACTIVE) {
            throw new BusinessException("INVALID_STATE", "影厅已经处于停用状态");
        }

        Hall updated = new Hall();
        updated.setStatus(HallStatus.INACTIVE);

        Hall result = hallRepository.update(hallId, updated);
        return HallMapper.toDto(result);
    }

    /**
     * 启用影厅（状态变更为 ACTIVE）
     */
    public HallDTO activateHall(UUID hallId) {
        Hall existing = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("影厅", hallId.toString()));

        if (existing.getStatus() == HallStatus.ACTIVE) {
            throw new BusinessException("INVALID_STATE", "影厅已经处于启用状态");
        }

        Hall updated = new Hall();
        updated.setStatus(HallStatus.ACTIVE);

        Hall result = hallRepository.update(hallId, updated);
        return HallMapper.toDto(result);
    }

    // ========== 私有方法 ==========

    private void validateCapacity(Integer capacity) {
        if (capacity == null || capacity <= 0) {
            throw new BusinessException("VALIDATION_ERROR", "容量必须为正整数");
        }
        if (capacity > 1000) {
            throw new BusinessException("VALIDATION_ERROR", "容量不能超过1000");
        }
    }

    private UUID parseUUID(String value, String errorMessage) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("VALIDATION_ERROR", errorMessage);
        }
    }
}
