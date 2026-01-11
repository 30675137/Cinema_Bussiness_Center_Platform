/** @spec M001-material-unit-system */
package com.cinema.common.conversion;

import java.math.BigDecimal;

/**
 * 全局换算服务接口
 * 负责基于全局单位换算规则进行换算
 */
public interface GlobalConversionService {

    /**
     * 执行全局换算
     *
     * @param fromUnitCode 源单位代码
     * @param toUnitCode   目标单位代码
     * @param quantity     数量
     * @return 换算后的数量
     * @throws IllegalArgumentException 如果换算规则不存在
     */
    BigDecimal convert(String fromUnitCode, String toUnitCode, BigDecimal quantity);

    /**
     * 检查是否可以进行全局换算
     *
     * @param fromUnitCode 源单位代码
     * @param toUnitCode   目标单位代码
     * @return true 如果可以换算，否则 false
     */
    boolean canConvert(String fromUnitCode, String toUnitCode);
}
