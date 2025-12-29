package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.BomComponent;
import com.cinema.hallstore.domain.ComboItem;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * 成本计算服务
 * 负责成品和套餐的标准成本计算
 *
 * @since P001-sku-master-data
 */
@Service
public class CostCalculationService {

    /**
     * 计算成品标准成本
     * 公式: Σ(组件数量 × 组件单位成本) × (1 + 损耗率%)
     *
     * @param components BOM组件列表
     * @param wasteRate 损耗率(0-100)
     * @return 标准成本(保留2位小数)
     */
    public BigDecimal calculateFinishedProductCost(List<BomComponent> components, BigDecimal wasteRate) {
        if (components == null || components.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // 计算组件成本合计
        BigDecimal componentCost = components.stream()
                .map(BomComponent::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 应用损耗率: 成本 × (1 + 损耗率/100)
        BigDecimal wasteRateDecimal = wasteRate != null ? wasteRate : BigDecimal.ZERO;
        BigDecimal wasteFactor = BigDecimal.ONE.add(
                wasteRateDecimal.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
        );

        return componentCost.multiply(wasteFactor)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * 计算套餐标准成本
     * 公式: Σ(子项数量 × 子项单位成本)
     *
     * @param items 套餐子项列表
     * @return 标准成本(保留2位小数)
     */
    public BigDecimal calculateComboCost(List<ComboItem> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return items.stream()
                .map(ComboItem::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * 计算成本明细(用于UI展示)
     *
     * @param components BOM组件列表
     * @param wasteRate 损耗率
     * @return 成本明细对象
     */
    public CostBreakdown calculateCostBreakdown(List<BomComponent> components, BigDecimal wasteRate) {
        BigDecimal componentTotal = components.stream()
                .map(BomComponent::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal wasteRateDecimal = wasteRate != null ? wasteRate : BigDecimal.ZERO;
        BigDecimal wasteCost = componentTotal.multiply(wasteRateDecimal)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        BigDecimal standardCost = componentTotal.add(wasteCost);

        return new CostBreakdown(componentTotal, wasteCost, wasteRateDecimal, standardCost);
    }

    /**
     * 成本明细数据类
     */
    public static class CostBreakdown {
        private final BigDecimal componentCost;
        private final BigDecimal wasteCost;
        private final BigDecimal wasteRate;
        private final BigDecimal standardCost;

        public CostBreakdown(BigDecimal componentCost, BigDecimal wasteCost,
                             BigDecimal wasteRate, BigDecimal standardCost) {
            this.componentCost = componentCost;
            this.wasteCost = wasteCost;
            this.wasteRate = wasteRate;
            this.standardCost = standardCost;
        }

        public BigDecimal getComponentCost() {
            return componentCost;
        }

        public BigDecimal getWasteCost() {
            return wasteCost;
        }

        public BigDecimal getWasteRate() {
            return wasteRate;
        }

        public BigDecimal getStandardCost() {
            return standardCost;
        }
    }
}
