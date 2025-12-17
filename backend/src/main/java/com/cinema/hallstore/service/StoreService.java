package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.Store;
import com.cinema.hallstore.domain.enums.StoreStatus;
import com.cinema.hallstore.dto.StoreDTO;
import com.cinema.hallstore.exception.ResourceNotFoundException;
import com.cinema.hallstore.mapper.StoreMapper;
import com.cinema.hallstore.repository.StoreRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * StoreService:
 * - 门店主数据业务逻辑层
 * - 负责门店列表与门店详情查询逻辑（含 active/disabled 状态处理）
 */
@Service
public class StoreService {

    private final StoreRepository storeRepository;

    public StoreService(StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
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
}
