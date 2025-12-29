package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.Store;
import com.cinema.hallstore.domain.StoreOperationLog;
import com.cinema.hallstore.domain.enums.OperationType;
import com.cinema.hallstore.repository.StoreOperationLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for managing store operation audit logs
 * 
 * @since 022-store-crud
 */
@Service
public class StoreOperationLogService {

    private static final Logger log = LoggerFactory.getLogger(StoreOperationLogService.class);

    private final StoreOperationLogRepository logRepository;
    private final ObjectMapper objectMapper;

    public StoreOperationLogService(StoreOperationLogRepository logRepository,
                                    ObjectMapper objectMapper) {
        this.logRepository = logRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Log store creation
     */
    public void logCreate(Store store, String operatorName, String ipAddress) {
        StoreOperationLog logEntry = new StoreOperationLog();
        logEntry.setStoreId(store.getId());
        logEntry.setOperationType(OperationType.CREATE);
        logEntry.setOperatorName(operatorName);
        logEntry.setBeforeValue(null);
        logEntry.setAfterValue(storeToMap(store));
        logEntry.setOperationTime(Instant.now());
        logEntry.setIpAddress(ipAddress);

        try {
            logRepository.save(logEntry);
            log.info("Logged CREATE operation for store: {}", store.getId());
        } catch (Exception e) {
            log.error("Failed to log CREATE operation for store: {}", store.getId(), e);
        }
    }

    /**
     * Log store update
     */
    public void logUpdate(Store beforeStore, Store afterStore, String operatorName, String ipAddress) {
        StoreOperationLog logEntry = new StoreOperationLog();
        logEntry.setStoreId(afterStore.getId());
        logEntry.setOperationType(OperationType.UPDATE);
        logEntry.setOperatorName(operatorName);
        logEntry.setBeforeValue(storeToMap(beforeStore));
        logEntry.setAfterValue(storeToMap(afterStore));
        logEntry.setOperationTime(Instant.now());
        logEntry.setIpAddress(ipAddress);

        try {
            logRepository.save(logEntry);
            log.info("Logged UPDATE operation for store: {}", afterStore.getId());
        } catch (Exception e) {
            log.error("Failed to log UPDATE operation for store: {}", afterStore.getId(), e);
        }
    }

    /**
     * Log status change (enable/disable)
     */
    public void logStatusChange(Store beforeStore, Store afterStore, String operatorName, String ipAddress) {
        StoreOperationLog logEntry = new StoreOperationLog();
        logEntry.setStoreId(afterStore.getId());
        logEntry.setOperationType(OperationType.STATUS_CHANGE);
        logEntry.setOperatorName(operatorName);
        logEntry.setBeforeValue(Map.of(
            "id", beforeStore.getId().toString(),
            "status", beforeStore.getStatus().getValue()
        ));
        logEntry.setAfterValue(Map.of(
            "id", afterStore.getId().toString(),
            "status", afterStore.getStatus().getValue()
        ));
        logEntry.setOperationTime(Instant.now());
        logEntry.setIpAddress(ipAddress);

        try {
            logRepository.save(logEntry);
            log.info("Logged STATUS_CHANGE operation for store: {} ({} -> {})",
                afterStore.getId(),
                beforeStore.getStatus().getValue(),
                afterStore.getStatus().getValue()
            );
        } catch (Exception e) {
            log.error("Failed to log STATUS_CHANGE operation for store: {}", afterStore.getId(), e);
        }
    }

    /**
     * Log store deletion
     */
    public void logDelete(Store store, String operatorName, String ipAddress, String remark) {
        StoreOperationLog logEntry = new StoreOperationLog();
        logEntry.setStoreId(store.getId());
        logEntry.setOperationType(OperationType.DELETE);
        logEntry.setOperatorName(operatorName);
        logEntry.setBeforeValue(storeToMap(store));
        logEntry.setAfterValue(null);
        logEntry.setOperationTime(Instant.now());
        logEntry.setIpAddress(ipAddress);
        logEntry.setRemark(remark);

        try {
            logRepository.save(logEntry);
            log.info("Logged DELETE operation for store: {}", store.getId());
        } catch (Exception e) {
            log.error("Failed to log DELETE operation for store: {}", store.getId(), e);
        }
    }

    /**
     * Get operation logs by store ID
     */
    public List<StoreOperationLog> getLogsByStoreId(UUID storeId) {
        return logRepository.findByStoreId(storeId);
    }

    /**
     * Convert Store entity to Map for JSON storage
     */
    private Map<String, Object> storeToMap(Store store) {
        if (store == null) {
            return null;
        }
        Map<String, Object> map = new HashMap<>();
        map.put("id", store.getId() != null ? store.getId().toString() : null);
        map.put("code", store.getCode());
        map.put("name", store.getName());
        map.put("region", store.getRegion());
        map.put("status", store.getStatus() != null ? store.getStatus().getValue() : null);
        map.put("version", store.getVersion());
        map.put("province", store.getProvince());
        map.put("city", store.getCity());
        map.put("district", store.getDistrict());
        map.put("address", store.getAddress());
        map.put("phone", store.getPhone());
        return map;
    }
}
