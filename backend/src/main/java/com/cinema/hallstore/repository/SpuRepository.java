package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.Spu;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * SPU Repository
 * 通过 Supabase REST API 实现SPU数据的查询和CRUD操作
 */
@Repository
public class SpuRepository {

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public SpuRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 查询所有SPU列表
     */
    public List<Spu> findAll() {
        String uri = UriComponentsBuilder
                .fromUriString("/spus")
                .queryParam("order", "created_at.desc")
                .build()
                .toUriString();

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Spu>>() {})
                .block();
    }

    /**
     * 查询SPU列表,支持按状态、类目、品牌筛选
     */
    public List<Spu> findAll(String status, String categoryId, String brandId, String keyword) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString("/spus")
                .queryParam("order", "created_at.desc");

        // 按状态筛选
        if (status != null && !status.trim().isEmpty()) {
            builder.queryParam("status", "eq." + status);
        }

        // 按类目筛选
        if (categoryId != null && !categoryId.trim().isEmpty()) {
            builder.queryParam("category_id", "eq." + categoryId);
        }

        // 按品牌筛选
        if (brandId != null && !brandId.trim().isEmpty()) {
            builder.queryParam("brand_id", "eq." + brandId);
        }

        // 按关键词搜索(名称或编码)
        if (keyword != null && !keyword.trim().isEmpty()) {
            builder.queryParam("or", "(name.ilike.*" + keyword + "*,code.ilike.*" + keyword + "*)");
        }

        String uri = builder.build().toUriString();

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Spu>>() {})
                .block();
    }

    /**
     * 按ID查询SPU
     */
    public Optional<Spu> findById(UUID id) {
        String uri = UriComponentsBuilder
                .fromUriString("/spus")
                .queryParam("id", "eq." + id)
                .queryParam("limit", "1")
                .build()
                .toUriString();

        List<Spu> result = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Spu>>() {})
                .block();

        return result != null && !result.isEmpty()
                ? Optional.of(result.get(0))
                : Optional.empty();
    }

    /**
     * 按编码查询SPU
     */
    public Optional<Spu> findByCode(String code) {
        String uri = UriComponentsBuilder
                .fromUriString("/spus")
                .queryParam("code", "eq." + code)
                .queryParam("limit", "1")
                .build()
                .toUriString();

        List<Spu> result = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Spu>>() {})
                .block();

        return result != null && !result.isEmpty()
                ? Optional.of(result.get(0))
                : Optional.empty();
    }

    /**
     * 按状态查询SPU列表
     */
    public List<Spu> findByStatus(String status) {
        return findAll(status, null, null, null);
    }

    /**
     * 创建或更新SPU
     */
    public Spu save(Spu spu) {
        if (spu.getId() == null) {
            // 创建新SPU
            return webClient.post()
                    .uri("/spus")
                    .bodyValue(spu)
                    .retrieve()
                    .bodyToMono(Spu.class)
                    .block();
        } else {
            // 更新SPU
            return update(spu);
        }
    }

    /**
     * 更新SPU
     */
    public Spu update(Spu spu) {
        String uri = UriComponentsBuilder
                .fromUriString("/spus")
                .queryParam("id", "eq." + spu.getId())
                .build()
                .toUriString();

        List<Spu> result = webClient.patch()
                .uri(uri)
                .bodyValue(spu)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Spu>>() {})
                .block();

        return result != null && !result.isEmpty() ? result.get(0) : null;
    }

    /**
     * 删除SPU
     */
    public void deleteById(UUID id) {
        String uri = UriComponentsBuilder
                .fromUriString("/spus")
                .queryParam("id", "eq." + id)
                .build()
                .toUriString();

        webClient.delete()
                .uri(uri)
                .retrieve()
                .toBodilessEntity()
                .block();
    }

    /**
     * 检查编码是否存在
     */
    public boolean existsByCode(String code) {
        return findByCode(code).isPresent();
    }

    /**
     * 统计SPU数量
     */
    public long count() {
        List<Spu> allSpus = findAll();
        return allSpus != null ? allSpus.size() : 0;
    }
}
