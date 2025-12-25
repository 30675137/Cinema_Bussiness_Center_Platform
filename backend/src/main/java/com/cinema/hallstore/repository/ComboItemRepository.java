package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.ComboItem;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.UUID;

/**
 * 套餐子项 Repository
 * 通过 Supabase REST API 实现套餐子项数据的查询和CRUD操作
 *
 * @since P001-sku-master-data
 */
@Repository
public class ComboItemRepository {

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public ComboItemRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 按套餐ID查询子项列表
     */
    public List<ComboItem> findByComboId(UUID comboId) {
        String uri = UriComponentsBuilder
                .fromUriString("/combo_items")
                .queryParam("combo_id", "eq." + comboId)
                .queryParam("order", "sort_order.asc")
                .build()
                .toUriString();

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<ComboItem>>() {})
                .block();
    }

    /**
     * 按子项ID查询引用该子项的套餐列表(检查依赖)
     */
    public List<ComboItem> findBySubItemId(UUID subItemId) {
        String uri = UriComponentsBuilder
                .fromUriString("/combo_items")
                .queryParam("sub_item_id", "eq." + subItemId)
                .build()
                .toUriString();

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<ComboItem>>() {})
                .block();
    }

    /**
     * 创建套餐子项
     */
    public ComboItem save(ComboItem item) {
        return webClient.post()
                .uri("/combo_items")
                .bodyValue(item)
                .retrieve()
                .bodyToMono(ComboItem.class)
                .block();
    }

    /**
     * 批量创建套餐子项
     */
    public List<ComboItem> saveAll(List<ComboItem> items) {
        return webClient.post()
                .uri("/combo_items")
                .bodyValue(items)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<ComboItem>>() {})
                .block();
    }

    /**
     * 删除套餐的所有子项
     */
    public void deleteByComboId(UUID comboId) {
        String uri = UriComponentsBuilder
                .fromUriString("/combo_items")
                .queryParam("combo_id", "eq." + comboId)
                .build()
                .toUriString();

        webClient.delete()
                .uri(uri)
                .retrieve()
                .toBodilessEntity()
                .block();
    }

    /**
     * 删除指定套餐子项
     */
    public void deleteById(UUID id) {
        String uri = UriComponentsBuilder
                .fromUriString("/combo_items")
                .queryParam("id", "eq." + id)
                .build()
                .toUriString();

        webClient.delete()
                .uri(uri)
                .retrieve()
                .toBodilessEntity()
                .block();
    }
}
