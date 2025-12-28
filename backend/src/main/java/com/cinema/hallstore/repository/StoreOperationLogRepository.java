package com.cinema.hallstore.repository;

import com.cinema.hallstore.config.SupabaseConfig;
import com.cinema.hallstore.domain.StoreOperationLog;
import com.cinema.hallstore.domain.enums.OperationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for StoreOperationLog - 门店操作审计日志
 * 通过 Supabase REST API 实现
 * 
 * @since 022-store-crud
 */
@Repository
public class StoreOperationLogRepository {

    private final WebClient webClient;
    private final SupabaseConfig supabaseConfig;
    private final ObjectMapper objectMapper;

    public StoreOperationLogRepository(WebClient supabaseWebClient, 
                                       SupabaseConfig supabaseConfig,
                                       ObjectMapper objectMapper) {
        this.webClient = supabaseWebClient;
        this.supabaseConfig = supabaseConfig;
        this.objectMapper = objectMapper;
    }

    /**
     * 保存操作日志
     */
    public StoreOperationLog save(StoreOperationLog log) {
        Map<String, Object> body = new HashMap<>();
        body.put("store_id", log.getStoreId().toString());
        body.put("operation_type", log.getOperationType().getValue());
        if (log.getOperatorId() != null) {
            body.put("operator_id", log.getOperatorId().toString());
        }
        body.put("operator_name", log.getOperatorName());
        body.put("before_value", log.getBeforeValue());
        body.put("after_value", log.getAfterValue());
        body.put("ip_address", log.getIpAddress());
        body.put("remark", log.getRemark());

        List<SupabaseLogRow> rows = webClient.post()
                .uri("/store_operation_logs")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Prefer", "return=representation")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SupabaseLogRow>>() {})
                .block(supabaseConfig.getTimeoutDuration());

        if (rows == null || rows.isEmpty()) {
            throw new RuntimeException("Failed to save operation log");
        }
        return toDomain(rows.get(0));
    }

    /**
     * 根据门店ID查询操作日志
     */
    public List<StoreOperationLog> findByStoreId(UUID storeId) {
        List<SupabaseLogRow> rows = webClient.get()
                .uri("/store_operation_logs?store_id=eq." + storeId + "&order=operation_time.desc")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SupabaseLogRow>>() {})
                .block(supabaseConfig.getTimeoutDuration());

        return rows == null ? List.of() : rows.stream().map(this::toDomain).toList();
    }

    /**
     * 根据ID查询操作日志
     */
    public Optional<StoreOperationLog> findById(UUID id) {
        List<SupabaseLogRow> rows = webClient.get()
                .uri("/store_operation_logs?id=eq." + id)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<SupabaseLogRow>>() {})
                .block(supabaseConfig.getTimeoutDuration());

        if (rows == null || rows.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(toDomain(rows.get(0)));
    }

    // ========== Internal DTOs ==========

    private static class SupabaseLogRow {
        @JsonProperty("id")
        public UUID id;

        @JsonProperty("store_id")
        public UUID storeId;

        @JsonProperty("operation_type")
        public String operationType;

        @JsonProperty("operator_id")
        public UUID operatorId;

        @JsonProperty("operator_name")
        public String operatorName;

        @JsonProperty("before_value")
        public Map<String, Object> beforeValue;

        @JsonProperty("after_value")
        public Map<String, Object> afterValue;

        @JsonProperty("operation_time")
        public Instant operationTime;

        @JsonProperty("ip_address")
        public String ipAddress;

        @JsonProperty("remark")
        public String remark;
    }

    private StoreOperationLog toDomain(SupabaseLogRow row) {
        StoreOperationLog log = new StoreOperationLog();
        log.setId(row.id);
        log.setStoreId(row.storeId);
        log.setOperationType(OperationType.fromValue(row.operationType));
        log.setOperatorId(row.operatorId);
        log.setOperatorName(row.operatorName);
        log.setBeforeValue(row.beforeValue);
        log.setAfterValue(row.afterValue);
        log.setOperationTime(row.operationTime);
        log.setIpAddress(row.ipAddress);
        log.setRemark(row.remark);
        return log;
    }
}
