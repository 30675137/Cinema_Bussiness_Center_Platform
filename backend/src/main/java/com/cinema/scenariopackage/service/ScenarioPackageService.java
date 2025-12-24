package com.cinema.scenariopackage.service;

import com.cinema.scenariopackage.dto.*;
import com.cinema.scenariopackage.exception.ConcurrentModificationException;
import com.cinema.scenariopackage.exception.PackageNotFoundException;
import com.cinema.scenariopackage.model.*;
import com.cinema.scenariopackage.repository.*;
import com.cinema.hallstore.service.StoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    // 019-store-association: Store association repository
    private final StoreAssociationRepository storeAssociationRepository;
    // 019-store-association: Store service for validation
    private final StoreService storeService;
    // 001-scenario-package-tabs: New repositories
    private final PackageTierRepository tierRepository;
    private final AddonItemRepository addonItemRepository;
    private final PackageAddonRepository packageAddonRepository;
    private final TimeSlotTemplateRepository timeSlotTemplateRepository;
    // T071: Time slot override repository
    private final TimeSlotOverrideRepository timeSlotOverrideRepository;

    public ScenarioPackageService(
            ScenarioPackageRepository packageRepository,
            PackageRuleRepository ruleRepository,
            PackageHallAssociationRepository hallAssociationRepository,
            PackageBenefitRepository benefitRepository,
            PackageItemRepository itemRepository,
            PackageServiceItemRepository serviceRepository,
            PackagePricingRepository pricingRepository,
            StoreAssociationRepository storeAssociationRepository,
            StoreService storeService,
            PackageTierRepository tierRepository,
            AddonItemRepository addonItemRepository,
            PackageAddonRepository packageAddonRepository,
            TimeSlotTemplateRepository timeSlotTemplateRepository,
            TimeSlotOverrideRepository timeSlotOverrideRepository) {
        this.packageRepository = packageRepository;
        this.ruleRepository = ruleRepository;
        this.hallAssociationRepository = hallAssociationRepository;
        this.benefitRepository = benefitRepository;
        this.itemRepository = itemRepository;
        this.serviceRepository = serviceRepository;
        this.pricingRepository = pricingRepository;
        this.storeAssociationRepository = storeAssociationRepository;
        this.storeService = storeService;
        this.tierRepository = tierRepository;
        this.addonItemRepository = addonItemRepository;
        this.packageAddonRepository = packageAddonRepository;
        this.timeSlotTemplateRepository = timeSlotTemplateRepository;
        this.timeSlotOverrideRepository = timeSlotOverrideRepository;
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

        // 019-store-association: 更新门店关联
        if (request.getStoreIds() != null && !request.getStoreIds().isEmpty()) {
            updateStoreAssociations(id, request.getStoreIds(), null);
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

    // ========== 019-store-association: Store Association Methods ==========

    /**
     * 更新场景包的门店关联
     * <p>
     * 全量更新：删除原有关联，插入新关联
     * </p>
     *
     * @param packageId 场景包ID
     * @param storeIds 门店ID列表
     * @param createdBy 创建人
     */
    @Transactional
    public void updateStoreAssociations(UUID packageId, List<UUID> storeIds, String createdBy) {
        logger.info("Updating store associations for package: {}, stores: {}", packageId, storeIds.size());

        // 验证场景包存在
        packageRepository.findByIdAndNotDeleted(packageId)
                .orElseThrow(() -> new PackageNotFoundException(packageId));

        // 019-store-association T041-T042: 验证所有门店存在且处于激活状态
        List<UUID> inactiveStores = new ArrayList<>();
        for (UUID storeId : storeIds) {
            if (!storeService.isStoreActive(storeId)) {
                inactiveStores.add(storeId);
            }
        }
        if (!inactiveStores.isEmpty()) {
            throw new IllegalArgumentException(
                    String.format("以下门店不存在或已停用: %s", inactiveStores));
        }

        // 删除原有关联
        storeAssociationRepository.deleteByPackageId(packageId);

        // 创建新关联
        for (UUID storeId : storeIds) {
            ScenarioPackageStoreAssociation association = new ScenarioPackageStoreAssociation(packageId, storeId, createdBy);
            storeAssociationRepository.save(association);
        }

        logger.info("Store associations updated successfully for package: {}", packageId);
    }

    /**
     * 获取场景包关联的门店ID列表
     *
     * @param packageId 场景包ID
     * @return 门店ID列表
     */
    @Transactional(readOnly = true)
    public List<UUID> getStoreIdsByPackageId(UUID packageId) {
        return storeAssociationRepository.findStoreIdsByPackageId(packageId);
    }

    /**
     * 检查门店是否被任何场景包关联
     *
     * @param storeId 门店ID
     * @return 是否被关联
     */
    @Transactional(readOnly = true)
    public boolean isStoreAssociated(UUID storeId) {
        return storeAssociationRepository.countByStoreId(storeId) > 0;
    }

    // ========== End 019-store-association ==========

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

        // 019-store-association: 加载门店关联
        List<UUID> storeIds = storeAssociationRepository.findStoreIdsByPackageId(pkg.getId());
        dto.setStoreIds(storeIds);
        // 注意: stores 详细信息需要通过 stores API 单独查询
        // 前端将使用 storeIds 并结合 stores API 获取详细信息

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

        // 填充 location（场馆位置）- 暂用默认值，后续从关联表获取
        dto.setLocation("北京·精选场馆");

        // 从 package_tiers 表获取真实套餐数据
        List<PackageTier> tiers = tierRepository.findByPackageIdOrderBySortOrder(pkg.getId());
        
        if (tiers != null && !tiers.isEmpty()) {
            // 有套餐档位数据，使用真实数据
            List<ScenarioPackageListItemDTO.PackageSummary> packages = tiers.stream()
                .map(tier -> {
                    ScenarioPackageListItemDTO.PackageSummary summary = new ScenarioPackageListItemDTO.PackageSummary();
                    summary.setId(tier.getId().toString());
                    summary.setName(tier.getName());
                    summary.setPrice(tier.getPrice());
                    summary.setOriginalPrice(tier.getOriginalPrice());
                    summary.setDesc(tier.getServiceDescription() != null ? tier.getServiceDescription() : "");
                    summary.setTags(tier.getTags() != null ? tier.getTags() : List.of());
                    return summary;
                })
                .collect(java.util.stream.Collectors.toList());
            dto.setPackages(packages);
            
            // 取最低价作为起价
            BigDecimal minPrice = tiers.stream()
                .map(PackageTier::getPrice)
                .filter(price -> price != null)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
            dto.setPackagePrice(minPrice);
        } else {
            // 没有套餐档位，回退到 package_pricing 表
            BigDecimal packagePrice = getPackagePrice(pkg.getId());
            dto.setPackagePrice(packagePrice);
            
            ScenarioPackageListItemDTO.PackageSummary summary = new ScenarioPackageListItemDTO.PackageSummary();
            summary.setId(pkg.getId().toString());
            summary.setName("基础套餐");
            summary.setPrice(packagePrice);
            summary.setOriginalPrice(packagePrice != null ? packagePrice.multiply(new BigDecimal("1.2")) : null);
            summary.setDesc(pkg.getDescription() != null ? pkg.getDescription() : "");
            summary.setTags(List.of("推荐"));
            dto.setPackages(List.of(summary));
        }

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

    // ==================== 套餐档位、加购项、时段模板相关方法 ====================

    /**
     * 获取场景包的套餐档位列表
     */
    @Transactional(readOnly = true)
    public List<PackageTier> getPackageTiers(UUID packageId) {
        logger.info("Getting package tiers for package: {}", packageId);
        // 验证场景包存在
        findById(packageId);
        return tierRepository.findByPackageIdOrderBySortOrder(packageId);
    }

    /**
     * 创建套餐档位
     */
    @Transactional
    public PackageTier createPackageTier(UUID packageId, CreatePackageTierRequest request) {
        logger.info("Creating package tier for package: {}, name: {}", packageId, request.getName());
        // 验证场景包存在
        findById(packageId);

        PackageTier tier = new PackageTier();
        tier.setPackageId(packageId);
        tier.setName(request.getName());
        tier.setPrice(request.getPrice());
        tier.setOriginalPrice(request.getOriginalPrice());
        tier.setTags(request.getTags());
        tier.setServiceDescription(request.getServiceDescription());
        tier.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        return tierRepository.save(tier);
    }

    /**
     * 更新套餐档位
     */
    @Transactional
    public PackageTier updatePackageTier(UUID packageId, UUID tierId, CreatePackageTierRequest request) {
        logger.info("Updating package tier: {} for package: {}", tierId, packageId);
        // 验证场景包存在
        findById(packageId);

        PackageTier tier = tierRepository.findById(tierId)
                .orElseThrow(() -> new IllegalArgumentException("套餐档位不存在: " + tierId));

        if (!tier.getPackageId().equals(packageId)) {
            throw new IllegalArgumentException("套餐档位不属于此场景包");
        }

        tier.setName(request.getName());
        tier.setPrice(request.getPrice());
        tier.setOriginalPrice(request.getOriginalPrice());
        tier.setTags(request.getTags());
        tier.setServiceDescription(request.getServiceDescription());
        if (request.getSortOrder() != null) {
            tier.setSortOrder(request.getSortOrder());
        }

        return tierRepository.save(tier);
    }

    /**
     * 删除套餐档位
     */
    @Transactional
    public void deletePackageTier(UUID packageId, UUID tierId) {
        logger.info("Deleting package tier: {} for package: {}", tierId, packageId);
        // 验证场景包存在
        findById(packageId);

        PackageTier tier = tierRepository.findById(tierId)
                .orElseThrow(() -> new IllegalArgumentException("套餐档位不存在: " + tierId));

        if (!tier.getPackageId().equals(packageId)) {
            throw new IllegalArgumentException("套餐档位不属于此场景包");
        }

        tierRepository.delete(tier);
    }

    /**
     * 获取所有启用的加购项
     */
    @Transactional(readOnly = true)
    public List<AddonItem> getActiveAddonItems() {
        logger.info("Getting all active addon items");
        return addonItemRepository.findAllActive();
    }

    /**
     * 获取场景包关联的加购项
     */
    @Transactional(readOnly = true)
    public List<PackageAddon> getPackageAddons(UUID packageId) {
        logger.info("Getting package addons for package: {}", packageId);
        // 验证场景包存在
        findById(packageId);
        return packageAddonRepository.findByPackageIdOrderBySortOrder(packageId);
    }

    /**
     * 获取场景包的时段模板
     */
    @Transactional(readOnly = true)
    public List<TimeSlotTemplate> getTimeSlotTemplates(UUID packageId) {
        logger.info("Getting time slot templates for package: {}", packageId);
        // 验证场景包存在
        findById(packageId);
        return timeSlotTemplateRepository.findByPackageIdOrderByDayOfWeekAndStartTime(packageId);
    }

    /**
     * 创建时段模板
     */
    @Transactional
    public TimeSlotTemplate createTimeSlotTemplate(UUID packageId, CreateTimeSlotTemplateRequest request) {
        logger.info("Creating time slot template for package: {}, dayOfWeek: {}", packageId, request.getDayOfWeek());
        // 验证场景包存在
        findById(packageId);

        TimeSlotTemplate template = new TimeSlotTemplate();
        template.setPackageId(packageId);
        template.setDayOfWeek(request.getDayOfWeek());
        template.setStartTime(java.time.LocalTime.parse(request.getStartTime()));
        template.setEndTime(java.time.LocalTime.parse(request.getEndTime()));
        template.setCapacity(request.getCapacity());
        template.setPriceAdjustment(request.getPriceAdjustment());
        template.setIsEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : true);

        return timeSlotTemplateRepository.save(template);
    }

    /**
     * 更新时段模板
     */
    @Transactional
    public TimeSlotTemplate updateTimeSlotTemplate(UUID packageId, UUID templateId, CreateTimeSlotTemplateRequest request) {
        logger.info("Updating time slot template: {} for package: {}", templateId, packageId);
        // 验证场景包存在
        findById(packageId);

        TimeSlotTemplate template = timeSlotTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("时段模板不存在: " + templateId));

        if (!template.getPackageId().equals(packageId)) {
            throw new IllegalArgumentException("时段模板不属于此场景包");
        }

        if (request.getDayOfWeek() != null) {
            template.setDayOfWeek(request.getDayOfWeek());
        }
        if (request.getStartTime() != null) {
            template.setStartTime(java.time.LocalTime.parse(request.getStartTime()));
        }
        if (request.getEndTime() != null) {
            template.setEndTime(java.time.LocalTime.parse(request.getEndTime()));
        }
        if (request.getCapacity() != null) {
            template.setCapacity(request.getCapacity());
        }
        if (request.getPriceAdjustment() != null) {
            template.setPriceAdjustment(request.getPriceAdjustment());
        }
        if (request.getIsEnabled() != null) {
            template.setIsEnabled(request.getIsEnabled());
        }

        return timeSlotTemplateRepository.save(template);
    }

    /**
     * 删除时段模板
     */
    @Transactional
    public void deleteTimeSlotTemplate(UUID packageId, UUID templateId) {
        logger.info("Deleting time slot template: {} for package: {}", templateId, packageId);
        // 验证场景包存在
        findById(packageId);

        TimeSlotTemplate template = timeSlotTemplateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("时段模板不存在: " + templateId));

        if (!template.getPackageId().equals(packageId)) {
            throw new IllegalArgumentException("时段模板不属于此场景包");
        }

        timeSlotTemplateRepository.delete(template);
    }

    // ==================== T071: 时段覆盖相关方法 ====================

    /**
     * 获取场景包的时段覆盖列表
     */
    @Transactional(readOnly = true)
    public List<TimeSlotOverride> getTimeSlotOverrides(UUID packageId) {
        logger.info("Getting time slot overrides for package: {}", packageId);
        // 验证场景包存在
        findById(packageId);
        return timeSlotOverrideRepository.findByPackageIdOrderByDateAscStartTimeAsc(packageId);
    }

    /**
     * 根据日期范围获取时段覆盖
     */
    @Transactional(readOnly = true)
    public List<TimeSlotOverride> getTimeSlotOverridesByDateRange(UUID packageId, LocalDate startDate, LocalDate endDate) {
        logger.info("Getting time slot overrides for package: {} from {} to {}", packageId, startDate, endDate);
        // 验证场景包存在
        findById(packageId);
        return timeSlotOverrideRepository.findByPackageIdAndDateRange(packageId, startDate, endDate);
    }

    /**
     * 创建时段覆盖
     */
    @Transactional
    public TimeSlotOverride createTimeSlotOverride(UUID packageId, CreateTimeSlotOverrideRequest request) {
        logger.info("Creating time slot override for package: {}, date: {}, type: {}", 
                packageId, request.getDate(), request.getOverrideType());
        // 验证场景包存在
        findById(packageId);

        // 业务规则验证：ADD/MODIFY 类型必须有时间
        if (("ADD".equals(request.getOverrideType()) || "MODIFY".equals(request.getOverrideType())) 
                && (request.getStartTime() == null || request.getEndTime() == null)) {
            throw new IllegalArgumentException("新增或修改类型的覆盖规则必须指定开始和结束时间");
        }

        TimeSlotOverride override = new TimeSlotOverride();
        override.setPackageId(packageId);
        override.setDate(LocalDate.parse(request.getDate()));
        override.setOverrideType(request.getOverrideType());
        
        if (request.getStartTime() != null) {
            override.setStartTime(java.time.LocalTime.parse(request.getStartTime()));
        }
        if (request.getEndTime() != null) {
            override.setEndTime(java.time.LocalTime.parse(request.getEndTime()));
        }
        override.setCapacity(request.getCapacity());
        override.setReason(request.getReason());

        return timeSlotOverrideRepository.save(override);
    }

    /**
     * 更新时段覆盖
     */
    @Transactional
    public TimeSlotOverride updateTimeSlotOverride(UUID packageId, UUID overrideId, CreateTimeSlotOverrideRequest request) {
        logger.info("Updating time slot override: {} for package: {}", overrideId, packageId);
        // 验证场景包存在
        findById(packageId);

        TimeSlotOverride override = timeSlotOverrideRepository.findById(overrideId)
                .orElseThrow(() -> new IllegalArgumentException("时段覆盖不存在: " + overrideId));

        if (!override.getPackageId().equals(packageId)) {
            throw new IllegalArgumentException("时段覆盖不属于此场景包");
        }

        // 业务规则验证
        String newType = request.getOverrideType() != null ? request.getOverrideType() : override.getOverrideType();
        if (("ADD".equals(newType) || "MODIFY".equals(newType))) {
            String newStartTime = request.getStartTime() != null ? request.getStartTime() : 
                    (override.getStartTime() != null ? override.getStartTime().toString() : null);
            String newEndTime = request.getEndTime() != null ? request.getEndTime() : 
                    (override.getEndTime() != null ? override.getEndTime().toString() : null);
            if (newStartTime == null || newEndTime == null) {
                throw new IllegalArgumentException("新增或修改类型的覆盖规则必须指定开始和结束时间");
            }
        }

        if (request.getDate() != null) {
            override.setDate(LocalDate.parse(request.getDate()));
        }
        if (request.getOverrideType() != null) {
            override.setOverrideType(request.getOverrideType());
        }
        if (request.getStartTime() != null) {
            override.setStartTime(java.time.LocalTime.parse(request.getStartTime()));
        }
        if (request.getEndTime() != null) {
            override.setEndTime(java.time.LocalTime.parse(request.getEndTime()));
        }
        if (request.getCapacity() != null) {
            override.setCapacity(request.getCapacity());
        }
        if (request.getReason() != null) {
            override.setReason(request.getReason());
        }

        return timeSlotOverrideRepository.save(override);
    }

    /**
     * 删除时段覆盖
     */
    @Transactional
    public void deleteTimeSlotOverride(UUID packageId, UUID overrideId) {
        logger.info("Deleting time slot override: {} for package: {}", overrideId, packageId);
        // 验证场景包存在
        findById(packageId);

        TimeSlotOverride override = timeSlotOverrideRepository.findById(overrideId)
                .orElseThrow(() -> new IllegalArgumentException("时段覆盖不存在: " + overrideId));

        if (!override.getPackageId().equals(packageId)) {
            throw new IllegalArgumentException("时段覆盖不属于此场景包");
        }

        timeSlotOverrideRepository.delete(override);
    }
}
