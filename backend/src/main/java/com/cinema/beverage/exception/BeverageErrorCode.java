/**
 * @spec O003-beverage-order
 * 饮品订单错误代码枚举
 *
 * 符合 constitution.md API Error Code Standards (08-api-standards.md R8.8)
 * 错误编号格式: <模块前缀>_<类别>_<序号>
 */
package com.cinema.beverage.exception;

import org.springframework.http.HttpStatus;

/**
 * 饮品订单错误代码枚举
 *
 * 模块前缀: BEV (饮品), ORD (订单)
 * 类别: NTF (未找到), VAL (验证错误), BIZ (业务规则), SYS (系统错误)
 */
public enum BeverageErrorCode {

    // ==================== 饮品相关错误 (BEV_*) ====================

    /**
     * BEV_NTF_001: 饮品不存在
     */
    BEV_NTF_001("BEV_NTF_001", "饮品不存在", HttpStatus.NOT_FOUND),

    /**
     * BEV_NTF_002: 饮品规格不存在
     */
    BEV_NTF_002("BEV_NTF_002", "饮品规格不存在", HttpStatus.NOT_FOUND),

    /**
     * BEV_NTF_003: 饮品配方不存在
     */
    BEV_NTF_003("BEV_NTF_003", "饮品配方不存在", HttpStatus.NOT_FOUND),

    /**
     * BEV_VAL_001: 饮品已下架
     */
    BEV_VAL_001("BEV_VAL_001", "饮品已下架", HttpStatus.BAD_REQUEST),

    /**
     * BEV_VAL_002: 饮品已售罄
     */
    BEV_VAL_002("BEV_VAL_002", "饮品已售罄", HttpStatus.BAD_REQUEST),

    /**
     * BEV_VAL_003: 饮品规格无效
     */
    BEV_VAL_003("BEV_VAL_003", "饮品规格无效", HttpStatus.BAD_REQUEST),

    /**
     * BEV_BIZ_001: 原料库存不足
     */
    BEV_BIZ_001("BEV_BIZ_001", "原料库存不足，无法制作", HttpStatus.UNPROCESSABLE_ENTITY),

    // ==================== 订单相关错误 (ORD_*) ====================

    /**
     * ORD_NTF_001: 订单不存在
     */
    ORD_NTF_001("ORD_NTF_001", "订单不存在", HttpStatus.NOT_FOUND),

    /**
     * ORD_NTF_002: 取餐号不存在
     */
    ORD_NTF_002("ORD_NTF_002", "取餐号不存在", HttpStatus.NOT_FOUND),

    /**
     * ORD_VAL_001: 订单状态无效
     */
    ORD_VAL_001("ORD_VAL_001", "订单状态无效", HttpStatus.BAD_REQUEST),

    /**
     * ORD_VAL_002: 订单金额无效
     */
    ORD_VAL_002("ORD_VAL_002", "订单金额无效", HttpStatus.BAD_REQUEST),

    /**
     * ORD_VAL_003: 订单商品项为空
     */
    ORD_VAL_003("ORD_VAL_003", "订单商品项不能为空", HttpStatus.BAD_REQUEST),

    /**
     * ORD_BIZ_001: 订单状态流转非法
     */
    ORD_BIZ_001("ORD_BIZ_001", "订单状态流转非法", HttpStatus.UNPROCESSABLE_ENTITY),

    /**
     * ORD_BIZ_002: 支付失败
     */
    ORD_BIZ_002("ORD_BIZ_002", "支付失败", HttpStatus.UNPROCESSABLE_ENTITY),

    /**
     * ORD_BIZ_003: BOM 扣料失败
     */
    ORD_BIZ_003("ORD_BIZ_003", "BOM 扣料失败", HttpStatus.UNPROCESSABLE_ENTITY),

    /**
     * ORD_BIZ_004: 取餐号已用尽
     */
    ORD_BIZ_004("ORD_BIZ_004", "当日取餐号已用尽（超过999）", HttpStatus.UNPROCESSABLE_ENTITY),

    /**
     * ORD_BIZ_005: 订单已取消，无法操作
     */
    ORD_BIZ_005("ORD_BIZ_005", "订单已取消，无法操作", HttpStatus.UNPROCESSABLE_ENTITY),

    // ==================== 系统错误 (SYS_*) ====================

    /**
     * SYS_001: 数据库错误
     */
    SYS_001("SYS_001", "数据库错误", HttpStatus.INTERNAL_SERVER_ERROR),

    /**
     * SYS_002: 外部服务调用失败
     */
    SYS_002("SYS_002", "外部服务调用失败", HttpStatus.INTERNAL_SERVER_ERROR),

    /**
     * SYS_003: 并发冲突
     */
    SYS_003("SYS_003", "并发冲突，请重试", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    BeverageErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
