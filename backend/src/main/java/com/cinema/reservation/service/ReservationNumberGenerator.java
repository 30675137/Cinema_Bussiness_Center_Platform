package com.cinema.reservation.service;

import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;

/**
 * 预约单号生成器
 * <p>
 * 生成唯一的预约单号，格式：R + yyyyMMddHHmmss + 4位随机数
 * 例如：R202512231530001234
 * </p>
 * <p>
 * 唯一性保障：
 * 1. 时间戳精确到秒，确保大致有序
 * 2. 4位随机数降低同一秒内冲突概率（最多10000笔/秒）
 * 3. 数据库 UNIQUE 约束作为最终保障
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
@Service
public class ReservationNumberGenerator {

    private static final String PREFIX = "R";
    private static final String DATE_FORMAT = "yyyyMMddHHmmss";
    private static final Random RANDOM = new Random();

    /**
     * 生成预约单号
     *
     * @return 格式化的预约单号，如 R202512231530001234
     */
    public String generate() {
        SimpleDateFormat dateFormat = new SimpleDateFormat(DATE_FORMAT);
        String timestamp = dateFormat.format(new Date());
        String randomPart = String.format("%04d", RANDOM.nextInt(10000));
        return PREFIX + timestamp + randomPart;
    }

    /**
     * 验证预约单号格式是否正确
     *
     * @param orderNumber 预约单号
     * @return true 如果格式正确
     */
    public boolean isValid(String orderNumber) {
        if (orderNumber == null || orderNumber.length() != 19) {
            return false;
        }
        if (!orderNumber.startsWith(PREFIX)) {
            return false;
        }
        String timestampPart = orderNumber.substring(1, 15);
        String randomPart = orderNumber.substring(15);

        // 验证时间戳部分是纯数字
        if (!timestampPart.matches("\\d{14}")) {
            return false;
        }
        // 验证随机数部分是纯数字
        return randomPart.matches("\\d{4}");
    }
}
