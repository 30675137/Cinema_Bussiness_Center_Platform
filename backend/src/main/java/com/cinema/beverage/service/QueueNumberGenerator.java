/**
 * @spec O003-beverage-order
 * 取餐号生成器（使用PostgreSQL Advisory Lock保证并发安全）
 */
package com.cinema.beverage.service;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.beverage.entity.QueueNumber;
import com.cinema.beverage.exception.BeverageErrorCode;
import com.cinema.beverage.exception.BeverageException;

import lombok.RequiredArgsConstructor;

/**
 * 取餐号生成器
 *
 * 对应 spec: O003-beverage-order
 *
 * 取餐号格式: D001-D999
 * 每日重置: 每天从 D001 开始
 * 并发安全: 使用 PostgreSQL Advisory Lock (pg_advisory_xact_lock)
 *
 * 并发控制说明:
 * - pg_advisory_xact_lock(key): 事务级别advisory lock，事务结束自动释放
 * - key = hash(storeId + date): 每个门店每日独立锁
 * - 防止并发生成相同序号
 */
@Service
@RequiredArgsConstructor
public class QueueNumberGenerator {

    private static final Logger logger = LoggerFactory.getLogger(QueueNumberGenerator.class);

    /**
     * 取餐号前缀
     */
    private static final String QUEUE_NUMBER_PREFIX = "D";

    /**
     * 最大序号
     */
    private static final int MAX_SEQUENCE = 999;

    @PersistenceContext
    private final EntityManager entityManager;

    /**
     * 生成取餐号（并发安全）
     *
     * @param storeId 门店ID
     * @param orderId 订单ID
     * @return 取餐号实体
     * @throws BeverageException 当取餐号已用尽时抛出
     */
    @Transactional
    public QueueNumber generate(UUID storeId, UUID orderId) {
        LocalDate today = LocalDate.now();

        // 获取 PostgreSQL Advisory Lock
        // key = hash(storeId.toString() + today.toString())
        long lockKey = generateLockKey(storeId, today);
        acquireAdvisoryLock(lockKey);

        try {
            // 查询当日最大序号
            Integer maxSequence = queryMaxSequenceForToday(storeId, today);

            // 计算新序号
            int nextSequence = (maxSequence == null) ? 1 : maxSequence + 1;

            // 检查是否超过上限
            if (nextSequence > MAX_SEQUENCE) {
                logger.error("取餐号已用尽: storeId={}, date={}, maxSequence={}", storeId, today, maxSequence);
                throw new BeverageException(
                    BeverageErrorCode.ORD_BIZ_004,
                    String.format("当日取餐号已用尽（超过%d）", MAX_SEQUENCE),
                    java.util.Map.of(
                        "storeId", storeId.toString(),
                        "date", today.toString(),
                        "maxSequence", MAX_SEQUENCE
                    )
                );
            }

            // 格式化取餐号
            String queueNumberStr = QueueNumber.formatQueueNumber(nextSequence);

            // 创建取餐号实体
            QueueNumber queueNumber = QueueNumber.builder()
                    .storeId(storeId)
                    .orderId(orderId)
                    .queueNumber(queueNumberStr)
                    .date(today)
                    .sequence(nextSequence)
                    .status(QueueNumber.QueueStatus.ACTIVE)
                    .build();

            // 持久化
            entityManager.persist(queueNumber);
            entityManager.flush();

            logger.info("生成取餐号成功: storeId={}, orderId={}, queueNumber={}, sequence={}",
                    storeId, orderId, queueNumberStr, nextSequence);

            return queueNumber;

        } finally {
            // Advisory Lock 在事务结束时自动释放，无需手动释放
            logger.debug("释放 Advisory Lock: lockKey={}", lockKey);
        }
    }

    /**
     * 获取 PostgreSQL Advisory Lock
     *
     * @param lockKey 锁key
     */
    private void acquireAdvisoryLock(long lockKey) {
        logger.debug("尝试获取 Advisory Lock: lockKey={}", lockKey);

        Query query = entityManager.createNativeQuery("SELECT pg_advisory_xact_lock(:lockKey)");
        query.setParameter("lockKey", lockKey);
        query.getSingleResult();

        logger.debug("成功获取 Advisory Lock: lockKey={}", lockKey);
    }

    /**
     * 查询当日最大序号
     *
     * @param storeId 门店ID
     * @param date 日期
     * @return 最大序号（如果没有记录则返回null）
     */
    private Integer queryMaxSequenceForToday(UUID storeId, LocalDate date) {
        Query query = entityManager.createQuery(
            "SELECT MAX(q.sequence) FROM QueueNumber q " +
            "WHERE q.storeId = :storeId AND q.date = :date",
            Integer.class
        );
        query.setParameter("storeId", storeId);
        query.setParameter("date", date);

        return (Integer) query.getSingleResult();
    }

    /**
     * 生成锁key
     *
     * key = hash(storeId.toString() + date.toString())
     * 使用 Java hashCode 转换为 long
     *
     * @param storeId 门店ID
     * @param date 日期
     * @return 锁key
     */
    private long generateLockKey(UUID storeId, LocalDate date) {
        String lockString = storeId.toString() + date.toString();
        return (long) lockString.hashCode();
    }

    /**
     * 重置当日取餐号（仅用于测试或管理）
     *
     * @param storeId 门店ID
     * @param date 日期
     */
    @Transactional
    public void resetQueueNumbers(UUID storeId, LocalDate date) {
        logger.warn("重置取餐号: storeId={}, date={}", storeId, date);

        Query query = entityManager.createQuery(
            "DELETE FROM QueueNumber q WHERE q.storeId = :storeId AND q.date = :date"
        );
        query.setParameter("storeId", storeId);
        query.setParameter("date", date);

        int deleted = query.executeUpdate();
        logger.info("重置取餐号完成: storeId={}, date={}, 删除数量={}", storeId, date, deleted);
    }
}
