package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.SkuStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;

/**
 * 更新SKU请求DTO
 *
 * @since P001-sku-master-data
 */
public class SkuUpdateRequest {

    private String name;
    private String mainUnit;
    private String[] storeScope;
    private BigDecimal standardCost;

    @DecimalMin(value = "0.0", message = "损耗率不能小于0")
    @DecimalMax(value = "100.0", message = "损耗率不能大于100")
    private BigDecimal wasteRate;

    private SkuStatus status;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMainUnit() {
        return mainUnit;
    }

    public void setMainUnit(String mainUnit) {
        this.mainUnit = mainUnit;
    }

    public String[] getStoreScope() {
        return storeScope;
    }

    public void setStoreScope(String[] storeScope) {
        this.storeScope = storeScope;
    }

    public BigDecimal getStandardCost() {
        return standardCost;
    }

    public void setStandardCost(BigDecimal standardCost) {
        this.standardCost = standardCost;
    }

    public BigDecimal getWasteRate() {
        return wasteRate;
    }

    public void setWasteRate(BigDecimal wasteRate) {
        this.wasteRate = wasteRate;
    }

    public SkuStatus getStatus() {
        return status;
    }

    public void setStatus(SkuStatus status) {
        this.status = status;
    }
}
