/**
 * @spec N001-purchase-inbound
 * 供应商服务层
 */
package com.cinema.procurement.service;

import com.cinema.procurement.dto.SupplierDTO;
import com.cinema.procurement.dto.SupplierMapper;
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
}
