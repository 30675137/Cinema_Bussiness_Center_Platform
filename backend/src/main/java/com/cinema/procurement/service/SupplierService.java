/**
 * @spec N001-purchase-inbound
 * @spec N003-supplier-edit
 * 供应商服务层
 */
package com.cinema.procurement.service;

import com.cinema.procurement.dto.SupplierCreateRequest;
import com.cinema.procurement.dto.SupplierDTO;
import com.cinema.procurement.dto.SupplierMapper;
import com.cinema.procurement.dto.SupplierUpdateRequest;
import com.cinema.procurement.entity.SupplierEntity;
import com.cinema.procurement.entity.SupplierStatus;
import com.cinema.procurement.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    public SupplierService(SupplierRepository supplierRepository, SupplierMapper supplierMapper) {
        this.supplierRepository = supplierRepository;
        this.supplierMapper = supplierMapper;
    }

    /**
     * 获取所有活跃供应商
     */
    public List<SupplierDTO> findAllActive() {
        return supplierRepository.findAllActive().stream()
            .map(supplierMapper::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * 根据状态获取供应商列表
     */
    public List<SupplierDTO> findByStatus(SupplierStatus status) {
        List<SupplierEntity> suppliers;
        if (status != null) {
            suppliers = supplierRepository.findByStatusOrderByNameAsc(status);
        } else {
            suppliers = supplierRepository.findAll();
        }
        return suppliers.stream()
            .map(supplierMapper::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * 根据ID获取供应商
     */
    public Optional<SupplierDTO> findById(UUID id) {
        return supplierRepository.findById(id)
            .map(supplierMapper::toDTO);
    }

    /**
     * 根据编码获取供应商
     */
    public Optional<SupplierDTO> findByCode(String code) {
        return supplierRepository.findByCode(code)
            .map(supplierMapper::toDTO);
    }

    /**
     * 创建供应商
     * @param request 创建请求
     * @return 创建的供应商
     * @throws IllegalArgumentException 当编码已存在时
     */
    @Transactional
    public SupplierDTO create(SupplierCreateRequest request) {
        // 检查编码唯一性
        if (supplierRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("供应商编码已存在: " + request.getCode());
        }

        SupplierEntity entity = new SupplierEntity();
        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setContactName(request.getContactName());
        entity.setContactPhone(request.getContactPhone());
        entity.setStatus(request.getStatus());

        SupplierEntity saved = supplierRepository.save(entity);
        return supplierMapper.toDTO(saved);
    }

    /**
     * 更新供应商
     * @param id 供应商ID
     * @param request 更新请求
     * @return 更新后的供应商
     * @throws IllegalArgumentException 当供应商不存在时
     */
    @Transactional
    public SupplierDTO update(UUID id, SupplierUpdateRequest request) {
        SupplierEntity entity = supplierRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("供应商不存在: " + id));

        // 更新字段（code 不可修改）
        entity.setName(request.getName());
        entity.setContactName(request.getContactName());
        entity.setContactPhone(request.getContactPhone());
        entity.setStatus(request.getStatus());

        SupplierEntity saved = supplierRepository.save(entity);
        return supplierMapper.toDTO(saved);
    }
}
