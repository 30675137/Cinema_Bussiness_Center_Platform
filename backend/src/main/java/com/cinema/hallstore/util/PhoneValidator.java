package com.cinema.hallstore.util;

import java.util.regex.Pattern;

/**
 * 电话号码格式验证工具
 *
 * 支持格式：
 * - 手机号：11位，以1开头，第二位3-9
 * - 座机：区号(2-4位) + 号码(7-8位)，区号可带或不带连字符
 * - 400热线：400 + 3位 + 4位，可带连字符
 *
 * @since 020-store-address
 */
public final class PhoneValidator {

    /**
     * 电话号码格式正则表达式
     * 支持：手机号、座机、400热线
     */
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^(1[3-9]\\d{9})|(0\\d{2,3}-?\\d{7,8})|(400-?\\d{3}-?\\d{4})$"
    );

    /**
     * 手机号格式正则表达式
     */
    private static final Pattern MOBILE_PATTERN = Pattern.compile(
        "^1[3-9]\\d{9}$"
    );

    /**
     * 座机格式正则表达式
     */
    private static final Pattern LANDLINE_PATTERN = Pattern.compile(
        "^0\\d{2,3}-?\\d{7,8}$"
    );

    /**
     * 400热线格式正则表达式
     */
    private static final Pattern HOTLINE_PATTERN = Pattern.compile(
        "^400-?\\d{3}-?\\d{4}$"
    );

    private PhoneValidator() {
        // 工具类不允许实例化
    }

    /**
     * 验证电话号码格式是否正确
     *
     * @param phone 电话号码
     * @return 如果为null或空字符串返回true（选填字段），否则验证格式
     */
    public static boolean isValid(String phone) {
        if (phone == null || phone.isEmpty()) {
            return true; // 电话为选填，空值有效
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }

    /**
     * 验证是否为有效手机号
     *
     * @param phone 电话号码
     * @return 是否为手机号
     */
    public static boolean isMobile(String phone) {
        if (phone == null || phone.isEmpty()) {
            return false;
        }
        return MOBILE_PATTERN.matcher(phone).matches();
    }

    /**
     * 验证是否为有效座机号
     *
     * @param phone 电话号码
     * @return 是否为座机号
     */
    public static boolean isLandline(String phone) {
        if (phone == null || phone.isEmpty()) {
            return false;
        }
        return LANDLINE_PATTERN.matcher(phone).matches();
    }

    /**
     * 验证是否为400热线
     *
     * @param phone 电话号码
     * @return 是否为400热线
     */
    public static boolean isHotline(String phone) {
        if (phone == null || phone.isEmpty()) {
            return false;
        }
        return HOTLINE_PATTERN.matcher(phone).matches();
    }

    /**
     * 获取电话类型描述
     *
     * @param phone 电话号码
     * @return 类型描述：手机、座机、400热线、未知
     */
    public static String getPhoneType(String phone) {
        if (phone == null || phone.isEmpty()) {
            return "未知";
        }
        if (isMobile(phone)) {
            return "手机";
        }
        if (isLandline(phone)) {
            return "座机";
        }
        if (isHotline(phone)) {
            return "400热线";
        }
        return "未知";
    }
}
