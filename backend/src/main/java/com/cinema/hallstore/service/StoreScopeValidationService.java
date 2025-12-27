package com.cinema.hallstore.service;

import com.cinema.hallstore.domain.Sku;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 门店范围验证服务
 * 验证成品/套餐的门店范围与组件/子项的门店范围一致性
 *
 * @since P001-sku-master-data
 */
@Service
public class StoreScopeValidationService {

    /**
     * 验证成品的门店范围(检查所有组件在目标门店可用)
     *
     * @param finishedProduct 成品SKU
     * @param components 组件SKU列表
     * @return 验证结果
     */
    public ValidationResult validateForFinishedProduct(Sku finishedProduct, List<Sku> components) {
        ValidationResult result = new ValidationResult();

        if (components == null || components.isEmpty()) {
            result.addError("成品必须配置BOM组件");
            return result;
        }

        Set<String> productStores = getStoreSet(finishedProduct.getStoreScope());
        boolean productIsAllStores = productStores == null;

        for (Sku component : components) {
            Set<String> componentStores = getStoreSet(component.getStoreScope());
            boolean componentIsAllStores = componentStores == null;

            // 规则1: 全门店成品需要所有组件都是全门店
            if (productIsAllStores && !componentIsAllStores) {
                result.addError(String.format(
                        "组件「%s」仅在部分门店可用,无法用于全门店成品",
                        component.getName()
                ));
                continue;
            }

            // 规则2: 特定门店成品需要检查组件是否在这些门店可用
            if (!productIsAllStores && !componentIsAllStores) {
                // 检查门店交集
                Set<String> intersection = new HashSet<>(productStores);
                intersection.retainAll(componentStores);

                if (intersection.isEmpty()) {
                    result.addError(String.format(
                            "组件「%s」在成品的门店范围内不可用",
                            component.getName()
                    ));
                } else if (intersection.size() < productStores.size()) {
                    // 部分门店有交集,给出警告
                    Set<String> unavailableStores = new HashSet<>(productStores);
                    unavailableStores.removeAll(componentStores);
                    result.addWarning(String.format(
                            "组件「%s」在以下门店不可用: %s",
                            component.getName(),
                            String.join(", ", unavailableStores)
                    ));
                }
            }
        }

        return result;
    }

    /**
     * 验证套餐的门店范围(检查所有子项在目标门店可用)
     *
     * @param combo 套餐SKU
     * @param subItems 子项SKU列表
     * @return 验证结果
     */
    public ValidationResult validateForCombo(Sku combo, List<Sku> subItems) {
        // 套餐验证逻辑与成品类似
        return validateForFinishedProduct(combo, subItems);
    }

    /**
     * 将门店范围数组转换为Set
     * 空数组返回null表示全门店
     */
    private Set<String> getStoreSet(String[] storeScope) {
        if (storeScope == null || storeScope.length == 0) {
            return null; // 表示全门店
        }
        return Arrays.stream(storeScope).collect(Collectors.toSet());
    }

    /**
     * 验证结果类
     */
    public static class ValidationResult {
        private final List<String> errors = new ArrayList<>();
        private final List<String> warnings = new ArrayList<>();

        public void addError(String error) {
            errors.add(error);
        }

        public void addWarning(String warning) {
            warnings.add(warning);
        }

        public boolean isValid() {
            return errors.isEmpty();
        }

        public List<String> getErrors() {
            return errors;
        }

        public List<String> getWarnings() {
            return warnings;
        }

        public boolean hasWarnings() {
            return !warnings.isEmpty();
        }
    }
}
