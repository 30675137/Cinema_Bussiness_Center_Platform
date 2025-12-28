package com.cinema.inventory.repository;

import com.cinema.inventory.domain.Category;
import com.cinema.hallstore.config.SupabaseConfig;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 商品分类数据访问层 - 使用 Supabase REST API
 * 
 * @since P003-inventory-query
 */
@Repository
public class CategoryRepository {

    private static final Logger logger = LoggerFactory.getLogger(CategoryRepository.class);

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public CategoryRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 查询所有激活状态的分类
     */
    public List<Category> findAllActive() {
        return findByStatus("ACTIVE");
    }

    /**
     * 按状态查询分类
     */
    public List<Category> findByStatus(String status) {
        try {
            String uri = "/categories?status=eq." + status + "&order=sort_order.asc,level.asc";
            List<SupabaseRow> rows = webClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            return rows == null ? List.of() : rows.stream().map(this::toDomain).collect(Collectors.toList());
        } catch (WebClientResponseException e) {
            logger.error("Error fetching categories. Status: {}, Body: {}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to fetch categories", e);
        }
    }

    /**
     * 查询所有分类并构建树形结构
     */
    public List<Category> findAllAsTree() {
        List<Category> allCategories = findAllActive();
        return buildTree(allCategories);
    }

    /**
     * 根据ID查询分类
     */
    public Optional<Category> findById(UUID id) {
        try {
            List<SupabaseRow> rows = webClient.get()
                    .uri("/categories?id=eq." + id)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<SupabaseRow>>() {})
                    .block(supabaseConfig.getTimeoutDuration());

            if (rows == null || rows.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(toDomain(rows.get(0)));
        } catch (WebClientResponseException.NotFound e) {
            return Optional.empty();
        }
    }

    /**
     * 构建分类树
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

    // ========== Internal DTOs for Supabase ==========

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private static class SupabaseRow {
        @JsonProperty("id")
        public UUID id;

        @JsonProperty("code")
        public String code;

        @JsonProperty("name")
        public String name;

        @JsonProperty("parent_id")
        public UUID parentId;

        @JsonProperty("level")
        public Integer level;

        @JsonProperty("sort_order")
        public Integer sortOrder;

        @JsonProperty("status")
        public String status;

        @JsonProperty("created_at")
        public Instant createdAt;

        @JsonProperty("updated_at")
        public Instant updatedAt;
    }

    // ========== Mapping Methods ==========

    private Category toDomain(SupabaseRow row) {
        Category category = new Category();
        category.setId(row.id);
        category.setCode(row.code);
        category.setName(row.name);
        category.setParentId(row.parentId);
        category.setLevel(row.level);
        category.setSortOrder(row.sortOrder);
        category.setStatus(row.status);
        category.setCreatedAt(row.createdAt);
        category.setUpdatedAt(row.updatedAt);
        return category;
    }
}
