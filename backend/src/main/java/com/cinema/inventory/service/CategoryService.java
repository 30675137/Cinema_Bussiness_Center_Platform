package com.cinema.inventory.service;

import com.cinema.inventory.domain.Category;
import com.cinema.inventory.repository.CategoryJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 商品分类服务层
 * 使用 JPA Repository 访问数据库，与项目其他模块保持一致
 * 提供分类列表查询等业务逻辑。
 *
 * @since P003-inventory-query
 * @spec B001-fix-brand-creation
 */
@Service
public class CategoryService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryJpaRepository categoryJpaRepository;

    public CategoryService(CategoryJpaRepository categoryJpaRepository) {
        this.categoryJpaRepository = categoryJpaRepository;
    }

    /**
     * 创建分类
     * @spec B001-fix-brand-creation
     *
     * @param code 分类编码
     * @param name 分类名称
     * @param parentId 父分类ID（null表示顶级分类）
     * @param level 层级（1=一级，2=二级，3=三级）
     * @param sortOrder 排序序号
     * @return 创建的分类
     */
    public Category createCategory(String code, String name, UUID parentId, int level, int sortOrder) {
        logger.info("Creating category: code={}, name={}, parentId={}, level={}", code, name, parentId, level);

        Category category = new Category();
        category.setCode(code);
        category.setName(name);
        category.setParentId(parentId);
        category.setLevel(level);
        category.setSortOrder(sortOrder);
        category.setStatus("ACTIVE");

        Category saved = categoryJpaRepository.save(category);
        logger.info("Category created: id={}, name={}", saved.getId(), saved.getName());
        return saved;
    }

    /**
     * 获取所有激活状态的分类列表（树形结构）
     *
     * @return 分类树
     */
    public List<Category> listCategories() {
        logger.debug("Getting all active categories as tree");
        List<Category> allCategories = categoryJpaRepository.findAllActive();
        List<Category> tree = buildTree(allCategories);
        logger.info("Found {} top-level categories", tree.size());
        return tree;
    }

    /**
     * 按状态获取分类列表（平铺结构）
     * 
     * @param status 分类状态
     * @return 分类列表
     */
    public List<Category> listCategoriesByStatus(String status) {
        logger.debug("Getting categories by status: {}", status);
        return categoryJpaRepository.findValidByStatus(status);
    }
    
    /**
     * 构建分类树
     * 
     * @param allCategories 所有分类列表
     * @return 根节点列表
     */
    private List<Category> buildTree(List<Category> allCategories) {
        Map<UUID, Category> categoryMap = new HashMap<>();
        List<Category> rootCategories = new ArrayList<>();

        // 建立映射
        for (Category category : allCategories) {
            categoryMap.put(category.getId(), category);
            category.setChildren(new ArrayList<>());
        }

        // 构建父子关系
        for (Category category : allCategories) {
            if (category.getParentId() == null) {
                rootCategories.add(category);
            } else {
                Category parent = categoryMap.get(category.getParentId());
                if (parent != null) {
                    parent.getChildren().add(category);
                }
            }
        }

        return rootCategories;
    }
}
