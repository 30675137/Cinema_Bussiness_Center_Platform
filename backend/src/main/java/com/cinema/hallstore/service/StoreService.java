package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.Store;
import com.cinema.hallstore.domain.enums.StoreStatus;
import com.cinema.hallstore.dto.CreateStoreDTO;
import com.cinema.hallstore.dto.StoreDTO;
import com.cinema.hallstore.dto.UpdateStoreAddressRequest;
import com.cinema.hallstore.dto.UpdateStoreDTO;
import com.cinema.hallstore.exception.OptimisticLockException;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.exception.StoreHasDependenciesException;
import com.cinema.hallstore.exception.StoreNotFoundException;
import com.cinema.hallstore.mapper.StoreMapper;
import com.cinema.hallstore.repository.StoreRepository;
import com.cinema.hallstore.validator.StoreValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * StoreService:
 * - 门店主数据业务逻辑层
 * - 负责门店列表与门店详情查询逻辑（含 active/disabled 状态处理）
 * - 022-store-crud: 添加CRUD操作
 */
@Service
public class StoreService {

    private static final Logger log = LoggerFactory.getLogger(StoreService.class);

    private final StoreRepository storeRepository;
    private final StoreValidator storeValidator;
    private final StoreOperationLogService operationLogService;

    public StoreService(StoreRepository storeRepository,
                        StoreValidator storeValidator,
                        StoreOperationLogService operationLogService) {
        this.storeRepository = storeRepository;
        this.storeValidator = storeValidator;
        this.operationLogService = operationLogService;
    }

    /**
     * 查询门店列表
     *
     * @param status 可选，按状态过滤（ACTIVE/DISABLED）
     * @return 门店列表
     */
    public List<StoreDTO> getAllStores(StoreStatus status) {
        List<Store> stores = storeRepository.findAll(status);
        return stores.stream()
                .map(StoreMapper::toDto)
                .toList();
    }

    /**
     * 查询活动状态的门店列表（用于前端下拉选择等场景）
     *
     * @return 活动状态的门店列表
     */
    public List<StoreDTO> getActiveStores() {
        return getAllStores(StoreStatus.ACTIVE);
    }

    /**
     * 根据门店 ID 获取门店详情
     *
     * @param storeId 门店ID
     * @return 门店详情
     * @throws ResourceNotFoundException 如果门店不存在
     */
    public StoreDTO getStoreById(UUID storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("门店", storeId.toString()));
        return StoreMapper.toDto(store);
    }

    /**
     * 根据门店编码获取门店详情
     *
     * @param code 门店编码
     * @return 门店详情
     * @throws ResourceNotFoundException 如果门店不存在
     */
    public StoreDTO getStoreByCode(String code) {
        Store store = storeRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("门店", code));
        return StoreMapper.toDto(store);
    }

    /**
     * 检查门店是否存在且为活动状态
     *
     * @param storeId 门店ID
     * @return 是否为活动门店
     */
    public boolean isStoreActive(UUID storeId) {
        return storeRepository.findById(storeId)
                .map(store -> store.getStatus() == StoreStatus.ACTIVE)
                .orElse(false);
    }

    /**
     * 更新门店地址信息
     *
     * @param storeId 门店ID
     * @param request 更新请求
     * @return 更新后的门店信息
     * @throws ResourceNotFoundException 如果门店不存在
     * @since 020-store-address
     */
    public StoreDTO updateStoreAddress(UUID storeId, UpdateStoreAddressRequest request) {
        // 1. 验证门店存在
        if (storeRepository.findById(storeId).isEmpty()) {
            throw new ResourceNotFoundException("门店", storeId.toString());
        }

        // 2. 调用 repository 更新地址信息
        Store updatedStore = storeRepository.updateAddress(
                storeId,
                request.getProvince(),
                request.getCity(),
                request.getDistrict(),
                request.getAddress(),
                request.getPhone()
        ).orElseThrow(() -> new ResourceNotFoundException("门店", storeId.toString()));

        // 3. 返回更新后的 DTO
        return StoreMapper.toDto(updatedStore);
    }

    // ========== 022-store-crud: CRUD 操作 ==========

    /**
     * 创建新门店
     *
     * @param dto 创建门店请求
     * @param operatorName 操作人名称
     * @param ipAddress 操作人IP地址
     * @return 创建后的门店信息
     * @since 022-store-crud
     */
    public StoreDTO createStore(CreateStoreDTO dto, String operatorName, String ipAddress) {
        // 1. 验证名称唯一性
        storeValidator.validateNameUniqueness(dto.getName());

        // 2. 验证电话格式
        storeValidator.validatePhoneFormat(dto.getPhone());

        // 3. 构建 Store 实体
        Store store = new Store();
        UUID storeId = UUID.randomUUID();
        store.setId(storeId);
        store.setCode(generateStoreCode(storeId));  // 自动生成门店编码
        store.setName(dto.getName().trim());
        store.setRegion(dto.getRegion());
        store.setCity(dto.getCity());
        store.setProvince(dto.getProvince());
        store.setDistrict(dto.getDistrict());
        store.setAddress(dto.getAddress());
        store.setPhone(dto.getPhone());
        // 023-store-cinema-fields 新字段
        store.setOpeningDate(dto.getOpeningDate());
        store.setArea(dto.getArea());
        store.setHallCount(dto.getHallCount());
        store.setSeatCount(dto.getSeatCount());
        store.setStatus(StoreStatus.ACTIVE);  // 默认状态为启用
        store.setVersion(0L);  // 初始版本号

        // 4. 保存到数据库
        Store savedStore = storeRepository.save(store);
        log.info("Created new store: {} (ID: {})", savedStore.getName(), savedStore.getId());

        // 5. 记录审计日志
        operationLogService.logCreate(savedStore, operatorName, ipAddress);

        // 6. 返回 DTO
        return StoreMapper.toDto(savedStore);
    }

    /**
     * 更新门店信息
     *
     * @param storeId 门店ID
     * @param dto 更新请求
     * @param operatorName 操作人名称
     * @param ipAddress 操作人IP地址
     * @return 更新后的门店信息
     * @since 022-store-crud
     */
    public StoreDTO updateStore(UUID storeId, UpdateStoreDTO dto, String operatorName, String ipAddress) {
        // 1. 查找现有门店
        Store existingStore = storeRepository.findById(storeId)
                .orElseThrow(() -> new StoreNotFoundException(storeId.toString()));

        // 2. 检查乐观锁版本
        if (!existingStore.getVersion().equals(dto.getVersion())) {
            throw new OptimisticLockException(storeId.toString(), dto.getVersion(), existingStore.getVersion());
        }

        // 3. 如果名称已更改，验证唯一性
        if (dto.getName() != null && !dto.getName().equals(existingStore.getName())) {
            storeValidator.validateNameUniquenessForUpdate(dto.getName(), storeId);
        }

        // 4. 保存更新前的快照
        Store beforeSnapshot = cloneStore(existingStore);

        // 5. 更新字段
        if (dto.getName() != null) existingStore.setName(dto.getName().trim());
        if (dto.getRegion() != null) existingStore.setRegion(dto.getRegion());
        if (dto.getCity() != null) existingStore.setCity(dto.getCity());
        if (dto.getProvince() != null) existingStore.setProvince(dto.getProvince());
        if (dto.getDistrict() != null) existingStore.setDistrict(dto.getDistrict());
        if (dto.getAddress() != null) existingStore.setAddress(dto.getAddress());
        if (dto.getPhone() != null) existingStore.setPhone(dto.getPhone());
        // 023-store-cinema-fields 新字段
        if (dto.getOpeningDate() != null) existingStore.setOpeningDate(dto.getOpeningDate());
        if (dto.getArea() != null) existingStore.setArea(dto.getArea());
        if (dto.getHallCount() != null) existingStore.setHallCount(dto.getHallCount());
        if (dto.getSeatCount() != null) existingStore.setSeatCount(dto.getSeatCount());

        // 6. 保存更新
        Store updatedStore = storeRepository.update(existingStore)
                .orElseThrow(() -> new StoreNotFoundException(storeId.toString()));
        log.info("Updated store: {} (ID: {})", updatedStore.getName(), updatedStore.getId());

        // 7. 记录审计日志
        operationLogService.logUpdate(beforeSnapshot, updatedStore, operatorName, ipAddress);

        return StoreMapper.toDto(updatedStore);
    }

    /**
     * 切换门店状态
     *
     * @param storeId 门店ID
     * @param newStatus 新状态
     * @param operatorName 操作人名称
     * @param ipAddress 操作人IP地址
     * @return 更新后的门店信息
     * @since 022-store-crud
     */
    public StoreDTO toggleStatus(UUID storeId, StoreStatus newStatus, String operatorName, String ipAddress) {
        // 1. 查找现有门店
        Store existingStore = storeRepository.findById(storeId)
                .orElseThrow(() -> new StoreNotFoundException(storeId.toString()));

        // 2. 保存更新前的快照
        Store beforeSnapshot = cloneStore(existingStore);

        // 3. 更新状态
        existingStore.setStatus(newStatus);

        // 4. 保存更新
        Store updatedStore = storeRepository.update(existingStore)
                .orElseThrow(() -> new StoreNotFoundException(storeId.toString()));
        log.info("Toggled store status: {} -> {} (ID: {})",
                beforeSnapshot.getStatus(), newStatus, storeId);

        // 5. 记录审计日志
        operationLogService.logStatusChange(beforeSnapshot, updatedStore, operatorName, ipAddress);

        return StoreMapper.toDto(updatedStore);
    }

    /**
     * 删除门店
     *
     * @param storeId 门店ID
     * @param operatorName 操作人名称
     * @param ipAddress 操作人IP地址
     * @since 022-store-crud
     */
    public void deleteStore(UUID storeId, String operatorName, String ipAddress) {
        // 1. 查找现有门店
        Store existingStore = storeRepository.findById(storeId)
                .orElseThrow(() -> new StoreNotFoundException(storeId.toString()));

        // 2. 检查是否有关联影厅
        long hallCount = storeRepository.countHallsByStoreId(storeId);
        if (hallCount > 0) {
            throw new StoreHasDependenciesException(
                storeId.toString(),
                "halls",
                "请先删除该门店下的 " + hallCount + " 个影厅"
            );
        }

        // 3. 记录审计日志（删除前记录）
        operationLogService.logDelete(existingStore, operatorName, ipAddress, null);

        // 4. 执行删除
        boolean deleted = storeRepository.deleteById(storeId);
        if (!deleted) {
            throw new StoreNotFoundException(storeId.toString());
        }
        log.info("Deleted store: {} (ID: {})", existingStore.getName(), storeId);
    }

    /**
     * 克隆 Store 对象（用于审计日志before快照）
     */
    private Store cloneStore(Store source) {
        Store clone = new Store();
        clone.setId(source.getId());
        clone.setCode(source.getCode());
        clone.setName(source.getName());
        clone.setRegion(source.getRegion());
        clone.setStatus(source.getStatus());
        clone.setVersion(source.getVersion());
        clone.setProvince(source.getProvince());
        clone.setCity(source.getCity());
        clone.setDistrict(source.getDistrict());
        clone.setAddress(source.getAddress());
        clone.setPhone(source.getPhone());
        clone.setCreatedAt(source.getCreatedAt());
        clone.setUpdatedAt(source.getUpdatedAt());
        clone.setCreatedBy(source.getCreatedBy());
        clone.setUpdatedBy(source.getUpdatedBy());
        // 023-store-cinema-fields 新字段
        clone.setOpeningDate(source.getOpeningDate());
        clone.setArea(source.getArea());
        clone.setHallCount(source.getHallCount());
        clone.setSeatCount(source.getSeatCount());
        return clone;
    }

    /**
     * 生成门店编码
     * 格式: STORE-时间戳-随机4位
     * 例如: STORE-20241222-8A3F
     * @since 022-store-crud
     */
    private String generateStoreCode(UUID storeId) {
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd");
        String dateStr = java.time.LocalDate.now().format(formatter);
        String shortId = storeId.toString().substring(0, 4).toUpperCase();
        return "STORE-" + dateStr + "-" + shortId;
    }
}
