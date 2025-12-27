package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.BomComponent;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * BOM组件 Repository
 * 通过 Supabase REST API 实现BOM组件数据的查询和CRUD操作
 *
 * @since P001-sku-master-data
 */
@Repository
public class BomComponentRepository {

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;

    public BomComponentRepository(WebClient supabaseWebClient, SupabaseConfig supabaseConfig) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 按成品ID查询BOM组件列表
     */
    public List<BomComponent> findByFinishedProductId(UUID finishedProductId) {
        String uri = UriComponentsBuilder
                .fromUriString("/bom_components")
                .queryParam("finished_product_id", "eq." + finishedProductId)
                .queryParam("order", "sort_order.asc")
                .build()
                .toUriString();

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<BomComponent>>() {})
                .block();
    }

    /**
     * 按组件ID查询引用该组件的BOM列表(检查依赖)
     */
    public List<BomComponent> findByComponentId(UUID componentId) {
        String uri = UriComponentsBuilder
                .fromUriString("/bom_components")
                .queryParam("component_id", "eq." + componentId)
                .build()
                .toUriString();

        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<BomComponent>>() {})
                .block();
    }

    /**
     * 将 BomComponent 转换为 Supabase 可接受的 Map 格式
     * 避免发送 createdAt、finishedProduct、component 等不需要的字段
     */
    private Map<String, Object> toSupabaseMap(BomComponent component) {
        Map<String, Object> map = new HashMap<>();
        if (component.getId() != null) {
            map.put("id", component.getId().toString());
        }
        if (component.getFinishedProductId() != null) {
            map.put("finished_product_id", component.getFinishedProductId().toString());
        }
        if (component.getComponentId() != null) {
            map.put("component_id", component.getComponentId().toString());
        }
        if (component.getQuantity() != null) {
            map.put("quantity", component.getQuantity());
        }
        if (component.getUnit() != null) {
            map.put("unit", component.getUnit());
        }
        if (component.getUnitCost() != null) {
            map.put("unit_cost", component.getUnitCost());
        }
        if (component.getIsOptional() != null) {
            map.put("is_optional", component.getIsOptional());
        }
        if (component.getSortOrder() != null) {
            map.put("sort_order", component.getSortOrder());
        }
        // 不发送 created_at, updated_at, finishedProduct, component
        return map;
    }

    /**
     * 创建BOM组件
     * 只发送需要的字段，避免发送 createdAt 等自动管理字段
     */
    public BomComponent save(BomComponent component) {
        Map<String, Object> data = toSupabaseMap(component);
        
        System.out.println("Saving BomComponent: " + data);
        
        List<BomComponent> result = webClient.post()
                .uri("/bom_components")
                .header("Prefer", "return=representation")
                .bodyValue(data)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    response -> response.bodyToMono(String.class)
                        .flatMap(body -> {
                            System.err.println("Supabase BomComponent save error: " + body);
                            return reactor.core.publisher.Mono.error(
                                new RuntimeException("Supabase API error: " + body)
                            );
                        })
                )
                .bodyToMono(new ParameterizedTypeReference<List<BomComponent>>() {})
                .block();
        return result != null && !result.isEmpty() ? result.get(0) : null;
    }

    /**
     * 批量创建BOM组件
     */
    public List<BomComponent> saveAll(List<BomComponent> components) {
        List<Map<String, Object>> dataList = components.stream()
                .map(this::toSupabaseMap)
                .collect(Collectors.toList());
        
        System.out.println("Saving BomComponents batch: " + dataList.size() + " items");
        
        return webClient.post()
                .uri("/bom_components")
                .header("Prefer", "return=representation")
                .bodyValue(dataList)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    response -> response.bodyToMono(String.class)
                        .flatMap(body -> {
                            System.err.println("Supabase BomComponent saveAll error: " + body);
                            return reactor.core.publisher.Mono.error(
                                new RuntimeException("Supabase API error: " + body)
                            );
                        })
                )
                .bodyToMono(new ParameterizedTypeReference<List<BomComponent>>() {})
                .block();
    }

    /**
     * 删除成品的所有BOM组件
     */
    public void deleteByFinishedProductId(UUID finishedProductId) {
        String uri = UriComponentsBuilder
                .fromUriString("/bom_components")
                .queryParam("finished_product_id", "eq." + finishedProductId)
                .build()
                .toUriString();

        webClient.delete()
                .uri(uri)
                .retrieve()
                .toBodilessEntity()
                .block();
    }

    /**
     * 删除指定BOM组件
     */
    public void deleteById(UUID id) {
        String uri = UriComponentsBuilder
                .fromUriString("/bom_components")
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
