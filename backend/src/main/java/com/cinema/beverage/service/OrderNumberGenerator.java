/**
 * @spec O003-beverage-order
 * 订单号生成器
 */
package com.cinema.beverage.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.cinema.beverage.repository.BeverageOrderRepository;

import lombok.RequiredArgsConstructor;

/**
 * 订单号生成器
 *
 * 对应 spec: O003-beverage-order
 *
 * 订单号格式: BORDT + yyyyMMddHHmmss + 4位随机数
 * 示例: BORDT202512271200001234
 *
 * 说明:
 * - BORDT: Beverage Order (Date-Time) 前缀
 * - yyyyMMddHHmmss: 14位时间戳
 * - 4位随机数: 避免同一秒内冲突
 */
@Service
@RequiredArgsConstructor
public class OrderNumberGenerator {

    private static final Logger logger = LoggerFactory.getLogger(OrderNumberGenerator.class);

    /**
     * 订单号前缀
     */
    private static final String ORDER_NUMBER_PREFIX = "BORDT";

    /**
     * 时间戳格式
     */
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /**
     * 随机数范围: 0000-9999
     */
    private static final int RANDOM_BOUND = 10000;

    private final BeverageOrderRepository orderRepository;
    private final Random random = new Random();

    /**
     * 生成唯一订单号
     *
     * @return 订单号
     */
    public String generate() {
        int maxAttempts = 10; // 最多重试10次
        int attempts = 0;

        while (attempts < maxAttempts) {
            String orderNumber = generateOrderNumber();

            // 检查订单号是否已存在
            if (!orderRepository.existsByOrderNumber(orderNumber)) {
                logger.debug("生成订单号成功: {}", orderNumber);
                return orderNumber;
            }

            attempts++;
            logger.warn("订单号冲突，重试第 {} 次: {}", attempts, orderNumber);
        }

        // 如果10次都失败，抛出异常
        throw new IllegalStateException("无法生成唯一订单号，已重试 " + maxAttempts + " 次");
    }

    /**
     * 生成订单号
     *
     * 格式: BORDT + yyyyMMddHHmmss + 4位随机数
     */
    private String generateOrderNumber() {
        // 当前时间戳
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);

        // 4位随机数（0000-9999）
        int randomNum = random.nextInt(RANDOM_BOUND);
        String randomSuffix = String.format("%04d", randomNum);

        return ORDER_NUMBER_PREFIX + timestamp + randomSuffix;
    }

    /**
     * 验证订单号格式是否正确
     *
     * @param orderNumber 订单号
     * @return 是否有效
     */
    public static boolean isValid(String orderNumber) {
        if (orderNumber == null) {
            return false;
        }

        // 正则: BORDT + 14位数字 + 4位数字
        return orderNumber.matches("^BORDT\\d{14}\\d{4}$");
    }

    /**
     * 从订单号中提取时间戳
     *
     * @param orderNumber 订单号
     * @return 时间戳
     */
    public static LocalDateTime extractTimestamp(String orderNumber) {
        if (!isValid(orderNumber)) {
            throw new IllegalArgumentException("订单号格式无效: " + orderNumber);
        }

        // 提取时间戳部分（索引 5-18，共14位）
        String timestamp = orderNumber.substring(5, 19);
        return LocalDateTime.parse(timestamp, TIMESTAMP_FORMAT);
    }
}
