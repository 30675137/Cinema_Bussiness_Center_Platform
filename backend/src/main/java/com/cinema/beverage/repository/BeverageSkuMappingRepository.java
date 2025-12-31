package com.cinema.beverage.repository;

import com.cinema.beverage.entity.BeverageSkuMapping;
import com.cinema.hallstore.config.SupabaseConfig;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * 饮品SKU映射 Repository
 * 通过 Supabase REST API 实现映射数据的查询和CRUD操作
 * 用于数据迁移时记录旧饮品ID → 新SKU ID的映射关系
 *
 * @spec O004-beverage-sku-reuse
 */
@Repository
public class BeverageSkuMappingRepository {

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public BeverageSkuMappingRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 按旧饮品ID查询映射
     * 主要用于向下兼容查询：旧系统通过beverage_id查找对应的new_sku_id
     */
    public Optional<BeverageSkuMapping> findByOldBeverageId(UUID oldBeverageId) {
        String uri = UriComponentsBuilder
                .fromUriString("/beverage_sku_mapping")
                .queryParam("old_beverage_id", "eq." + oldBeverageId)
                .queryParam("limit", "1")
                .build()
                .toUriString();

        List<BeverageSkuMapping> result = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<BeverageSkuMapping>>() {})
                .block();

        return result != null && !result.isEmpty()
                ? Optional.of(result.get(0))
                : Optional.empty();
    }

    /**
     * 按新SKU ID查询映射（反向查询）
     * 用于检查某个SKU是由哪个旧饮品迁移而来
     */
    public List<BeverageSkuMapping> findByNewSkuId(UUID newSkuId) {
        String uri = UriComponentsBuilder
                .fromUriString("/beverage_sku_mapping")
                .queryParam("new_sku_id", "eq." + newSkuId)
                .build()
                .toUriString();

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<BeverageSkuMapping>>() {})
                .block();
    }

    /**
     * 查询所有激活的映射
     */
    public List<BeverageSkuMapping> findAllActive() {
        String uri = UriComponentsBuilder
                .fromUriString("/beverage_sku_mapping")
                .queryParam("status", "eq.active")
                .queryParam("order", "migrated_at.desc")
                .build()
                .toUriString();

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<BeverageSkuMapping>>() {})
                .block();
    }

    /**
     * 创建新的映射关系
     */
    public BeverageSkuMapping save(BeverageSkuMapping mapping) {
        Map<String, Object> requestBody = toSupabaseMap(mapping);

        List<BeverageSkuMapping> result = webClient.post()
                .uri("/beverage_sku_mapping")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<BeverageSkuMapping>>() {})
                .block();

        return result != null && !result.isEmpty() ? result.get(0) : null;
    }

    /**
     * 更新映射状态（激活/废弃）
     */
    public boolean updateStatus(UUID oldBeverageId, BeverageSkuMapping.MappingStatus newStatus) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("status", newStatus.getValue());

        String uri = UriComponentsBuilder
                .fromUriString("/beverage_sku_mapping")
                .queryParam("old_beverage_id", "eq." + oldBeverageId)
                .build()
                .toUriString();

        try {
            webClient.patch()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 删除映射（物理删除，谨慎使用）
     */
    public boolean deleteByOldBeverageId(UUID oldBeverageId) {
        String uri = UriComponentsBuilder
                .fromUriString("/beverage_sku_mapping")
                .queryParam("old_beverage_id", "eq." + oldBeverageId)
                .build()
                .toUriString();

        try {
            webClient.delete()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 将 BeverageSkuMapping 转换为 Supabase 可接受的 Map 格式
     */
    private Map<String, Object> toSupabaseMap(BeverageSkuMapping mapping) {
        Map<String, Object> map = new HashMap<>();

        if (mapping.getOldBeverageId() != null) {
            map.put("old_beverage_id", mapping.getOldBeverageId().toString());
        }
        if (mapping.getNewSkuId() != null) {
            map.put("new_sku_id", mapping.getNewSkuId().toString());
        }
        if (mapping.getMigrationScriptVersion() != null) {
            map.put("migration_script_version", mapping.getMigrationScriptVersion());
        }
        if (mapping.getStatus() != null) {
            map.put("status", mapping.getStatus().getValue());
        }
        if (mapping.getMigratedAt() != null) {
            map.put("migrated_at", mapping.getMigratedAt().toString());
        }

        return map;
    }
}
