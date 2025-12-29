/**
 * @spec O003-beverage-order
 * 饮品业务逻辑层
 */
package com.cinema.beverage.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.beverage.dto.BeverageDTO;
import com.cinema.beverage.dto.BeverageDetailDTO;
import com.cinema.beverage.entity.Beverage;
import com.cinema.beverage.entity.Beverage.BeverageStatus;
import com.cinema.beverage.entity.BeverageSpec;
import com.cinema.beverage.exception.BeverageNotFoundException;
import com.cinema.beverage.repository.BeverageRepository;
import com.cinema.beverage.repository.BeverageSpecRepository;

import lombok.RequiredArgsConstructor;

/**
 * 饮品服务类
 *
 * 对应 spec: O003-beverage-order
 * 提供饮品管理的业务逻辑
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BeverageService {

    private static final Logger logger = LoggerFactory.getLogger(BeverageService.class);

    private final BeverageRepository beverageRepository;
    private final BeverageSpecRepository beverageSpecRepository;

    /**
     * 查询所有启用的饮品，按分类分组
     *
     * @return 按分类分组的饮品Map，key为分类名称，value为该分类下的饮品列表
     */
    public Map<String, List<BeverageDTO>> findAllActiveGroupedByCategory() {
        logger.debug("查询所有启用的饮品，按分类分组");

        List<Beverage> beverages = beverageRepository.findAllActiveGroupedByCategory(BeverageStatus.ACTIVE);

        // 按分类分组并转换为DTO
        return beverages.stream()
                .collect(Collectors.groupingBy(
                        beverage -> beverage.getCategory().name(),
                        LinkedHashMap::new, // 保持插入顺序
                        Collectors.mapping(BeverageDTO::fromEntity, Collectors.toList())
                ));
    }

    /**
     * 根据ID查询饮品详情（包含规格列表）
     *
     * @param id 饮品ID
     * @return 饮品详情DTO
     * @throws BeverageNotFoundException 饮品不存在时抛出
     */
    public BeverageDetailDTO findDetailById(UUID id) {
        logger.debug("查询饮品详情: id={}", id);

        // 查询饮品（仅查询启用状态）
        Beverage beverage = beverageRepository.findByIdAndStatus(id, BeverageStatus.ACTIVE)
                .orElseThrow(() -> new BeverageNotFoundException(id.toString()));

        // 查询该饮品的所有规格
        List<BeverageSpec> specs = beverageSpecRepository.findByBeverageIdOrderBySpecTypeAscSortOrderAsc(id);

        logger.debug("查询到饮品详情: id={}, name={}, 规格数量={}", id, beverage.getName(), specs.size());

        return BeverageDetailDTO.fromEntity(beverage, specs);
    }

    /**
     * 根据分类查询启用的饮品
     *
     * @param category 分类
     * @return 饮品列表
     */
    public List<BeverageDTO> findByCategory(String category) {
        logger.debug("根据分类查询饮品: category={}", category);

        Beverage.BeverageCategory beverageCategory = Beverage.BeverageCategory.valueOf(category);
        List<Beverage> beverages = beverageRepository.findByCategoryAndStatusOrderBySortOrderDescCreatedAtDesc(
                beverageCategory,
                BeverageStatus.ACTIVE
        );

        return beverages.stream()
                .map(BeverageDTO::fromEntity)
                .toList();
    }

    /**
     * 查询推荐饮品
     *
     * @return 推荐饮品列表
     */
    public List<BeverageDTO> findRecommended() {
        logger.debug("查询推荐饮品");

        List<Beverage> beverages = beverageRepository.findByIsRecommendedAndStatusOrderBySortOrderDescCreatedAtDesc(
                true,
                BeverageStatus.ACTIVE
        );

        return beverages.stream()
                .map(BeverageDTO::fromEntity)
                .toList();
    }

    /**
     * 检查饮品是否存在且启用
     *
     * @param id 饮品ID
     * @return 是否存在且启用
     */
    public boolean isActiveById(UUID id) {
        return beverageRepository.existsByIdAndStatus(id, BeverageStatus.ACTIVE);
    }
}
