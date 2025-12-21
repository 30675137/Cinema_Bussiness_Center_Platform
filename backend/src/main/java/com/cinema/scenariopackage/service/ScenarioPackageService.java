package com.cinema.scenariopackage.service;

import com.cinema.scenariopackage.dto.*;
import com.cinema.scenariopackage.exception.ConcurrentModificationException;
import com.cinema.scenariopackage.exception.PackageNotFoundException;
import com.cinema.scenariopackage.model.*;
import com.cinema.scenariopackage.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    private final PackageBenefitRepository benefitRepository;
    private final PackageItemRepository itemRepository;
    private final PackageServiceItemRepository serviceRepository;
    private final PackagePricingRepository pricingRepository;

    public ScenarioPackageService(
            ScenarioPackageRepository packageRepository,
            PackageRuleRepository ruleRepository,
            PackageHallAssociationRepository hallAssociationRepository,
            PackageBenefitRepository benefitRepository,
            PackageItemRepository itemRepository,
            PackageServiceItemRepository serviceRepository,
            PackagePricingRepository pricingRepository) {
        this.packageRepository = packageRepository;
        this.ruleRepository = ruleRepository;
        this.hallAssociationRepository = hallAssociationRepository;
        this.benefitRepository = benefitRepository;
        this.itemRepository = itemRepository;
        this.serviceRepository = serviceRepository;
        this.pricingRepository = pricingRepository;
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
        pkg.setImage(request.getImage());
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
        // 开发阶段暂时跳过，因为前端发送的是字符串 ID，后续有真实影厅数据后恢复
        // if (request.getHallTypeIds() != null) {
        //     for (UUID hallTypeId : request.getHallTypeIds()) {
        //         PackageHallAssociation association = new PackageHallAssociation();
        //         association.setPackageId(pkg.getId());
        //         association.setHallTypeId(hallTypeId);
        //         hallAssociationRepository.save(association);
        //     }
        // }

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
        if (request.getImage() != null) {
            pkg.setImage(request.getImage());
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
        // 开发阶段暂时跳过，因为前端发送的是字符串 ID，后续有真实影厅数据后恢复
        // if (request.getHallTypeIds() != null) {
        //     hallAssociationRepository.deleteByPackageId(id);
        //     for (UUID hallTypeId : request.getHallTypeIds()) {
        //         PackageHallAssociation association = new PackageHallAssociation();
        //         association.setPackageId(id);
        //         association.setHallTypeId(hallTypeId);
        //         hallAssociationRepository.save(association);
        //     }
        // }

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

    /**
     * 更新场景包背景图片
     * <p>
     * 用于图片上传成功后更新数据库中的 background_image_url 字段
     * </p>
     *
     * @param id       场景包 ID
     * @param imageUrl 图片公开访问 URL
     * @return 更新后的场景包详情
     */
    @Transactional
    public ScenarioPackageDTO updateBackgroundImage(UUID id, String imageUrl) {
        logger.info("Updating background image for package: {}", id);

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new PackageNotFoundException(id));

        pkg.setImage(imageUrl);
        pkg = packageRepository.save(pkg);

        logger.info("Background image updated successfully for package: {}", id);
        return toDTO(pkg);
    }

    // ========== US2: 规则配置与内容管理 ==========

    /**
     * 配置场景包规则
     * <p>
     * 验证：时长 >= 0.5，minPeople >= 1，maxPeople >= minPeople
     * </p>
     */
    @Transactional
    public ScenarioPackageDTO configureRules(UUID id, ConfigureRulesRequest request) {
        logger.info("Configuring rules for package: {}", id);

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new PackageNotFoundException(id));

        // 乐观锁检查
        if (!pkg.getVersionLock().equals(request.getVersionLock())) {
            throw new ConcurrentModificationException();
        }

        // 业务规则验证
        if (request.getMinPeople() > request.getMaxPeople()) {
            throw new IllegalArgumentException("最小人数不能大于最大人数");
        }

        // 更新或创建规则
        PackageRule rule = ruleRepository.findByPackageId(id).orElse(new PackageRule());
        rule.setPackageId(id);
        rule.setDurationHours(request.getDurationHours());
        rule.setMinPeople(request.getMinPeople());
        rule.setMaxPeople(request.getMaxPeople());
        ruleRepository.save(rule);

        // 更新主实体以触发版本变更
        pkg = packageRepository.save(pkg);

        logger.info("Rules configured successfully for package: {}", id);
        return toDTO(pkg);
    }

    /**
     * 添加硬权益
     */
    @Transactional
    public ScenarioPackageDTO addBenefit(UUID id, AddBenefitRequest request) {
        logger.info("Adding benefit to package: {}, type: {}", id, request.getBenefitType());

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new PackageNotFoundException(id));

        // 创建权益
        PackageBenefit benefit = new PackageBenefit();
        benefit.setPackageId(id);
        benefit.setBenefitType(request.getBenefitType());
        benefit.setDiscountRate(request.getDiscountRate());
        benefit.setFreeCount(request.getFreeCount());
        benefit.setDescription(request.getDescription());
        benefit.setSortOrder(
                request.getSortOrder() != null ? request.getSortOrder() : benefitRepository.countByPackageId(id));
        benefitRepository.save(benefit);

        logger.info("Benefit added successfully to package: {}", id);
        return toDTO(pkg);
    }

    /**
     * 删除硬权益
     */
    @Transactional
    public ScenarioPackageDTO removeBenefit(UUID packageId, UUID benefitId) {
        logger.info("Removing benefit {} from package: {}", benefitId, packageId);

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(packageId)
                .orElseThrow(() -> new PackageNotFoundException(packageId));

        benefitRepository.deleteById(benefitId);

        logger.info("Benefit removed successfully from package: {}", packageId);
        return toDTO(pkg);
    }

    /**
     * 添加单品（软权益）
     * <p>
     * 使用快照记录添加时的名称和价格
     * </p>
     */
    @Transactional
    public ScenarioPackageDTO addItem(UUID id, AddItemRequest request) {
        logger.info("Adding item to package: {}, itemId: {}", id, request.getItemId());

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new PackageNotFoundException(id));

        // 检查是否已添加该单品
        if (itemRepository.existsByPackageIdAndItemId(id, request.getItemId())) {
            throw new IllegalArgumentException("该单品已添加到场景包");
        }

        // 创建单品项（使用快照）
        PackageItem item = new PackageItem();
        item.setPackageId(id);
        item.setItemId(request.getItemId());
        item.setQuantity(request.getQuantity());
        item.setItemNameSnapshot(request.getItemName());
        item.setItemPriceSnapshot(request.getItemPrice());
        item.setSortOrder(
                request.getSortOrder() != null ? request.getSortOrder() : itemRepository.countByPackageId(id));
        itemRepository.save(item);

        logger.info("Item added successfully to package: {}", id);
        return toDTO(pkg);
    }

    /**
     * 更新单品数量
     */
    @Transactional
    public ScenarioPackageDTO updateItemQuantity(UUID packageId, UUID itemRecordId, Integer quantity) {
        logger.info("Updating item quantity in package: {}, item: {}, quantity: {}", packageId, itemRecordId, quantity);

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(packageId)
                .orElseThrow(() -> new PackageNotFoundException(packageId));

        PackageItem item = itemRepository.findById(itemRecordId)
                .orElseThrow(() -> new IllegalArgumentException("单品记录不存在"));

        if (!item.getPackageId().equals(packageId)) {
            throw new IllegalArgumentException("单品不属于该场景包");
        }

        if (quantity < 1) {
            throw new IllegalArgumentException("数量至少为1");
        }

        item.setQuantity(quantity);
        itemRepository.save(item);

        logger.info("Item quantity updated successfully in package: {}", packageId);
        return toDTO(pkg);
    }

    /**
     * 删除单品
     */
    @Transactional
    public ScenarioPackageDTO removeItem(UUID packageId, UUID itemRecordId) {
        logger.info("Removing item {} from package: {}", itemRecordId, packageId);

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(packageId)
                .orElseThrow(() -> new PackageNotFoundException(packageId));

        itemRepository.deleteById(itemRecordId);

        logger.info("Item removed successfully from package: {}", packageId);
        return toDTO(pkg);
    }

    /**
     * 添加服务
     * <p>
     * 使用快照记录添加时的名称和价格
     * </p>
     */
    @Transactional
    public ScenarioPackageDTO addService(UUID id, AddServiceRequest request) {
        logger.info("Adding service to package: {}, serviceId: {}", id, request.getServiceId());

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new PackageNotFoundException(id));

        // 检查是否已添加该服务
        if (serviceRepository.existsByPackageIdAndServiceId(id, request.getServiceId())) {
            throw new IllegalArgumentException("该服务已添加到场景包");
        }

        // 创建服务项（使用快照）
        PackageServiceItem service = new PackageServiceItem();
        service.setPackageId(id);
        service.setServiceId(request.getServiceId());
        service.setServiceNameSnapshot(request.getServiceName());
        service.setServicePriceSnapshot(request.getServicePrice());
        service.setSortOrder(
                request.getSortOrder() != null ? request.getSortOrder() : serviceRepository.countByPackageId(id));
        serviceRepository.save(service);

        logger.info("Service added successfully to package: {}", id);
        return toDTO(pkg);
    }

    /**
     * 删除服务
     */
    @Transactional
    public ScenarioPackageDTO removeService(UUID packageId, UUID serviceRecordId) {
        logger.info("Removing service {} from package: {}", serviceRecordId, packageId);

        ScenarioPackage pkg = packageRepository.findByIdAndNotDeleted(packageId)
                .orElseThrow(() -> new PackageNotFoundException(packageId));

        serviceRepository.deleteById(serviceRecordId);

        logger.info("Service removed successfully from package: {}", packageId);
        return toDTO(pkg);
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
        dto.setImage(pkg.getImage());
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

        // 加载硬权益
        List<PackageBenefit> benefits = benefitRepository.findByPackageId(pkg.getId());
        List<ScenarioPackageDTO.PackageBenefitDTO> benefitDTOs = benefits.stream()
                .map(benefit -> {
                    ScenarioPackageDTO.PackageBenefitDTO benefitDTO = new ScenarioPackageDTO.PackageBenefitDTO();
                    benefitDTO.setId(benefit.getId());
                    benefitDTO.setBenefitType(benefit.getBenefitType().name());
                    benefitDTO.setDiscountRate(benefit.getDiscountRate());
                    benefitDTO.setFreeCount(benefit.getFreeCount());
                    benefitDTO.setDescription(benefit.getDescription());
                    benefitDTO.setSortOrder(benefit.getSortOrder());
                    return benefitDTO;
                })
                .collect(Collectors.toList());
        dto.setBenefits(benefitDTOs);

        // 加载单品（软权益）
        List<PackageItem> items = itemRepository.findByPackageId(pkg.getId());
        List<ScenarioPackageDTO.PackageItemDTO> itemDTOs = items.stream()
                .map(item -> {
                    ScenarioPackageDTO.PackageItemDTO itemDTO = new ScenarioPackageDTO.PackageItemDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setItemId(item.getItemId());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setItemName(item.getItemNameSnapshot());
                    itemDTO.setItemPrice(item.getItemPriceSnapshot());
                    itemDTO.setSortOrder(item.getSortOrder());
                    return itemDTO;
                })
                .collect(Collectors.toList());
        dto.setItems(itemDTOs);

        // 加载服务
        List<PackageServiceItem> services = serviceRepository.findByPackageId(pkg.getId());
        List<ScenarioPackageDTO.PackageServiceDTO> serviceDTOs = services.stream()
                .map(service -> {
                    ScenarioPackageDTO.PackageServiceDTO serviceDTO = new ScenarioPackageDTO.PackageServiceDTO();
                    serviceDTO.setId(service.getId());
                    serviceDTO.setServiceId(service.getServiceId());
                    serviceDTO.setServiceName(service.getServiceNameSnapshot());
                    serviceDTO.setServicePrice(service.getServicePriceSnapshot());
                    serviceDTO.setSortOrder(service.getSortOrder());
                    return serviceDTO;
                })
                .collect(Collectors.toList());
        dto.setServices(serviceDTOs);

        return dto;
    }

    private ScenarioPackageSummary toSummary(ScenarioPackage pkg) {
        ScenarioPackageSummary summary = new ScenarioPackageSummary();
        summary.setId(pkg.getId());
        summary.setName(pkg.getName());
        summary.setDescription(pkg.getDescription());
        summary.setImage(pkg.getImage());
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

    /**
     * 查询已发布的场景包列表（用于C端小程序首页）
     * <p>
     * 符合 018-hall-reserve-homepage API 契约
     * </p>
     *
     * @return 已发布场景包列表（简化 DTO）
     */
    @Transactional(readOnly = true)
    public List<ScenarioPackageListItemDTO> findPublishedPackagesForTaro() {
        logger.info("Fetching published scenario packages for Taro frontend");

        List<ScenarioPackage> packages = packageRepository.findPublishedPackages();

        return packages.stream()
                .map(this::toListItemDTO)
                .collect(Collectors.toList());
    }

    /**
     * 将 ScenarioPackage 实体转换为 ScenarioPackageListItemDTO
     *
     * @param pkg 场景包实体
     * @return 列表项 DTO
     */
    private ScenarioPackageListItemDTO toListItemDTO(ScenarioPackage pkg) {
        ScenarioPackageListItemDTO dto = new ScenarioPackageListItemDTO();
        dto.setId(pkg.getId());
        dto.setTitle(pkg.getName()); // 前端字段为 title，后端字段为 name
        dto.setCategory(pkg.getCategory());
        dto.setImage(pkg.getImage());
        dto.setRating(pkg.getRating());
        dto.setTags(pkg.getTags() != null ? pkg.getTags() : List.of());

        // 获取定价信息（从 package_pricing 表）
        BigDecimal packagePrice = getPackagePrice(pkg.getId());
        dto.setPackagePrice(packagePrice);

        // 填充 location（场馆位置）- 暂用默认值，后续从关联表获取
        dto.setLocation("北京·精选场馆");

        // 填充 packages（套餐列表）
        ScenarioPackageListItemDTO.PackageSummary summary = new ScenarioPackageListItemDTO.PackageSummary();
        summary.setId(pkg.getId().toString());
        summary.setName("基础套餐");
        summary.setPrice(packagePrice);
        summary.setOriginalPrice(packagePrice != null ? packagePrice.multiply(new BigDecimal("1.2")) : null); // 原价暂用 1.2 倍
        summary.setDesc(pkg.getDescription() != null ? pkg.getDescription() : "");
        summary.setTags(List.of("推荐"));
        dto.setPackages(List.of(summary));

        return dto;
    }

    /**
     * 获取场景包定价
     * <p>
     * 从 package_pricing 表查询定价信息
     * </p>
     *
     * @param packageId 场景包 ID
     * @return 打包一口价（如果没有定价信息则返回 0.00）
     */
    private BigDecimal getPackagePrice(UUID packageId) {
        return pricingRepository.findByPackageId(packageId)
                .map(PackagePricing::getPackagePrice)
                .orElse(BigDecimal.ZERO);
    }
}
