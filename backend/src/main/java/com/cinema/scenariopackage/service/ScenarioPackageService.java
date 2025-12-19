package com.cinema.scenariopackage.service;

import com.cinema.scenariopackage.dto.*;
import com.cinema.scenariopackage.exception.ConcurrentModificationException;
import com.cinema.scenariopackage.exception.PackageNotFoundException;
import com.cinema.scenariopackage.model.PackageHallAssociation;
import com.cinema.scenariopackage.model.PackageRule;
import com.cinema.scenariopackage.model.ScenarioPackage;
import com.cinema.scenariopackage.repository.PackageHallAssociationRepository;
import com.cinema.scenariopackage.repository.PackageRuleRepository;
import com.cinema.scenariopackage.repository.ScenarioPackageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 场景包服务（MVP版本）
 * <p>
 * 提供场景包的核心业务逻辑
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@Service
public class ScenarioPackageService {

    private static final Logger logger = LoggerFactory.getLogger(ScenarioPackageService.class);

    private final ScenarioPackageRepository packageRepository;
    private final PackageRuleRepository ruleRepository;
    private final PackageHallAssociationRepository hallAssociationRepository;

    public ScenarioPackageService(
            ScenarioPackageRepository packageRepository,
            PackageRuleRepository ruleRepository,
            PackageHallAssociationRepository hallAssociationRepository) {
        this.packageRepository = packageRepository;
        this.ruleRepository = ruleRepository;
        this.hallAssociationRepository = hallAssociationRepository;
    }

    /**
     * 创建场景包
     */
    @Transactional
    public ScenarioPackageDTO create(CreatePackageRequest request) {
        logger.info("Creating scenario package: {}", request.getName());

        // 1. 创建主实体
        ScenarioPackage pkg = new ScenarioPackage();
        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setBackgroundImageUrl(request.getBackgroundImageUrl());
        pkg.setStatus(ScenarioPackage.PackageStatus.DRAFT);
        pkg = packageRepository.save(pkg);

        // 2. 创建规则
        if (request.getRule() != null) {
            PackageRule rule = new PackageRule();
            rule.setPackageId(pkg.getId());
            rule.setDurationHours(request.getRule().getDurationHours());
            rule.setMinPeople(request.getRule().getMinPeople());
            rule.setMaxPeople(request.getRule().getMaxPeople());
            ruleRepository.save(rule);
        }

        // 3. 创建影厅关联
        if (request.getHallTypeIds() != null) {
            for (UUID hallTypeId : request.getHallTypeIds()) {
                PackageHallAssociation association = new PackageHallAssociation();
                association.setPackageId(pkg.getId());
                association.setHallTypeId(hallTypeId);
                hallAssociationRepository.save(association);
            }
        }

        logger.info("Scenario package created successfully: {}", pkg.getId());
        return toDTO(pkg);
    }

    /**
     * 查询场景包列表（分页）
     */
    @Transactional(readOnly = true)
    public Page<ScenarioPackageSummary> findAll(int page, int size, String sortBy, String sortOrder) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder.toUpperCase()), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ScenarioPackage> packages = packageRepository.findLatestPackages(pageable);

        return packages.map(this::toSummary);
    }

    /**
     * 根据 ID 查询场景包详情
     */
    @Transactional(readOnly = true)
    public ScenarioPackageDTO findById(UUID id) {
        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new PackageNotFoundException(id));
        return toDTO(pkg);
    }

    /**
     * 更新场景包
     */
    @Transactional
    public ScenarioPackageDTO update(UUID id, UpdatePackageRequest request) {
        logger.info("Updating scenario package: {}", id);

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new PackageNotFoundException(id));

        // 乐观锁检查
        if (!pkg.getVersionLock().equals(request.getVersionLock())) {
            throw new ConcurrentModificationException();
        }

        // 更新基本信息
        if (request.getName() != null) {
            pkg.setName(request.getName());
        }
        if (request.getDescription() != null) {
            pkg.setDescription(request.getDescription());
        }
        if (request.getBackgroundImageUrl() != null) {
            pkg.setBackgroundImageUrl(request.getBackgroundImageUrl());
        }

        pkg = packageRepository.save(pkg);

        // 更新规则
        if (request.getRule() != null) {
            PackageRule rule = ruleRepository.findByPackageId(id).orElse(new PackageRule());
            rule.setPackageId(id);
            rule.setDurationHours(request.getRule().getDurationHours());
            rule.setMinPeople(request.getRule().getMinPeople());
            rule.setMaxPeople(request.getRule().getMaxPeople());
            ruleRepository.save(rule);
        }

        // 更新影厅关联
        if (request.getHallTypeIds() != null) {
            hallAssociationRepository.deleteByPackageId(id);
            for (UUID hallTypeId : request.getHallTypeIds()) {
                PackageHallAssociation association = new PackageHallAssociation();
                association.setPackageId(id);
                association.setHallTypeId(hallTypeId);
                hallAssociationRepository.save(association);
            }
        }

        logger.info("Scenario package updated successfully: {}", id);
        return toDTO(pkg);
    }

    /**
     * 删除场景包（软删除）
     */
    @Transactional
    public void delete(UUID id) {
        logger.info("Deleting scenario package: {}", id);

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new PackageNotFoundException(id));

        pkg.setDeletedAt(java.time.Instant.now());
        packageRepository.save(pkg);

        logger.info("Scenario package deleted successfully: {}", id);
    }

    // ========== DTO 转换方法 ==========

    private ScenarioPackageDTO toDTO(ScenarioPackage pkg) {
        ScenarioPackageDTO dto = new ScenarioPackageDTO();
        dto.setId(pkg.getId());
        dto.setBasePackageId(pkg.getBasePackageId());
        dto.setVersion(pkg.getVersion());
        dto.setVersionLock(pkg.getVersionLock());
        dto.setName(pkg.getName());
        dto.setDescription(pkg.getDescription());
        dto.setBackgroundImageUrl(pkg.getBackgroundImageUrl());
        dto.setStatus(pkg.getStatus());
        dto.setIsLatest(pkg.getIsLatest());
        dto.setCreatedAt(pkg.getCreatedAt());
        dto.setUpdatedAt(pkg.getUpdatedAt());
        dto.setCreatedBy(pkg.getCreatedBy());

        // 加载规则
        ruleRepository.findByPackageId(pkg.getId()).ifPresent(rule -> {
            ScenarioPackageDTO.PackageRuleDTO ruleDTO = new ScenarioPackageDTO.PackageRuleDTO();
            ruleDTO.setDurationHours(rule.getDurationHours());
            ruleDTO.setMinPeople(rule.getMinPeople());
            ruleDTO.setMaxPeople(rule.getMaxPeople());
            dto.setRule(ruleDTO);
        });

        // 加载影厅关联（简化版 - 仅返回ID）
        List<PackageHallAssociation> associations = hallAssociationRepository.findByPackageId(pkg.getId());
        List<ScenarioPackageDTO.HallTypeDTO> hallTypes = associations.stream()
                .map(assoc -> {
                    ScenarioPackageDTO.HallTypeDTO hallDTO = new ScenarioPackageDTO.HallTypeDTO();
                    hallDTO.setId(assoc.getHallTypeId());
                    // MVP: 暂不查询影厅名称，仅返回ID
                    return hallDTO;
                })
                .collect(Collectors.toList());
        dto.setHallTypes(hallTypes);

        return dto;
    }

    private ScenarioPackageSummary toSummary(ScenarioPackage pkg) {
        ScenarioPackageSummary summary = new ScenarioPackageSummary();
        summary.setId(pkg.getId());
        summary.setName(pkg.getName());
        summary.setDescription(pkg.getDescription());
        summary.setBackgroundImageUrl(pkg.getBackgroundImageUrl());
        summary.setStatus(pkg.getStatus());
        summary.setVersion(pkg.getVersion());
        summary.setIsLatest(pkg.getIsLatest());
        summary.setCreatedAt(pkg.getCreatedAt());
        summary.setUpdatedAt(pkg.getUpdatedAt());

        // 加载规则（时长、人数范围）
        ruleRepository.findByPackageId(pkg.getId()).ifPresent(rule -> {
            summary.setDurationHours(rule.getDurationHours());
            String peopleRange = "";
            if (rule.getMinPeople() != null && rule.getMaxPeople() != null) {
                peopleRange = rule.getMinPeople() + "-" + rule.getMaxPeople() + "人";
            } else if (rule.getMinPeople() != null) {
                peopleRange = rule.getMinPeople() + "人起";
            } else if (rule.getMaxPeople() != null) {
                peopleRange = "最多" + rule.getMaxPeople() + "人";
            }
            summary.setPeopleRange(peopleRange);
        });

        // 影厅数量
        int hallCount = hallAssociationRepository.findByPackageId(pkg.getId()).size();
        summary.setHallCount(hallCount);

        return summary;
    }
}
