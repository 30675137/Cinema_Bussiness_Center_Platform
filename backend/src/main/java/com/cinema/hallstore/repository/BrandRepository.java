package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.Brand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Optional;

/**
 * 品牌数据访问层 - 使用Supabase REST API
 */
@Repository
public class BrandRepository {

    private static final Logger logger = LoggerFactory.getLogger(BrandRepository.class);
    private final WebClient webClient;

    public BrandRepository(SupabaseConfig supabaseConfig) {
        this.webClient = supabaseConfig.supabaseWebClient();
    }

    /**
     * 查询所有品牌
     */
    public List<Brand> findAll() {
        return webClient.get()
                .uri("/brands?order=created_at.desc")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Brand>>() {})
                .block();
    }

    /**
     * 根据状态查询品牌
     */
    public List<Brand> findByStatus(String status) {
        return webClient.get()
                .uri("/brands?status=eq.{status}&order=created_at.desc", status)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Brand>>() {})
                .block();
    }

    /**
     * 根据ID查询品牌
     */
    public Optional<Brand> findById(String id) {
        List<Brand> brands = webClient.get()
                .uri("/brands?id=eq.{id}", id)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Brand>>() {})
                .block();
        return brands != null && !brands.isEmpty() ? Optional.of(brands.get(0)) : Optional.empty();
    }

    /**
     * 根据品牌编码查询
     */
    public Optional<Brand> findByBrandCode(String brandCode) {
        List<Brand> brands = webClient.get()
                .uri("/brands?brand_code=eq.{brandCode}", brandCode)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Brand>>() {})
                .block();
        return brands != null && !brands.isEmpty() ? Optional.of(brands.get(0)) : Optional.empty();
    }

    /**
     * 关键字搜索品牌
     */
    public List<Brand> search(String keyword) {
        // 搜索品牌名称或英文名
        return webClient.get()
                .uri("/brands?or=(name.ilike.*{keyword}*,english_name.ilike.*{keyword}*,brand_code.ilike.*{keyword}*)&order=created_at.desc", 
                     keyword, keyword, keyword)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Brand>>() {})
                .block();
    }

    /**
     * 保存品牌
     */
    public Brand save(Brand brand) {
        if (brand.getId() == null) {
            // 新增
            List<Brand> result = webClient.post()
                    .uri("/brands")
                    .header("Prefer", "return=representation")
                    .bodyValue(brand)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Brand>>() {})
                    .block();
            return result != null && !result.isEmpty() ? result.get(0) : null;
        } else {
            // 更新
            List<Brand> result = webClient.patch()
                    .uri("/brands?id=eq.{id}", brand.getId())
                    .header("Prefer", "return=representation")
                    .bodyValue(brand)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Brand>>() {})
                    .block();
            return result != null && !result.isEmpty() ? result.get(0) : null;
        }
    }

    /**
     * 删除品牌
     */
    public void deleteById(String id) {
        webClient.delete()
                .uri("/brands?id=eq.{id}", id)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    /**
     * 统计品牌数量
     */
    public long count() {
        // 使用Supabase的count功能
        List<Brand> brands = findAll();
        return brands != null ? brands.size() : 0;
    }

    /**
     * 根据品牌类型查询
     */
    public List<Brand> findByBrandType(String brandType) {
        return webClient.get()
                .uri("/brands?brand_type=eq.{brandType}&order=created_at.desc", brandType)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Brand>>() {})
                .block();
    }
}
