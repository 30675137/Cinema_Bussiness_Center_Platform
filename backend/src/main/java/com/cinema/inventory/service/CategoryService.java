package com.cinema.inventory.service;

import com.cinema.inventory.domain.Category;
import com.cinema.inventory.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 商品分类服务层
 * 提供分类列表查询等业务逻辑。
 * 
 * @since P003-inventory-query
 */
@Service
public class CategoryService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * 获取所有激活状态的分类列表（树形结构）
     * 
     * @return 分类树
     */
    public List<Category> listCategories() {
        logger.debug("Getting all active categories as tree");
        List<Category> categories = categoryRepository.findAllAsTree();
        logger.info("Found {} top-level categories", categories.size());
        return categories;
    }

    /**
     * 按状态获取分类列表（平铺结构）
     * 
     * @param status 分类状态
     * @return 分类列表
     */
    public List<Category> listCategoriesByStatus(String status) {
        logger.debug("Getting categories by status: {}", status);
        return categoryRepository.findByStatus(status);
    }
}
