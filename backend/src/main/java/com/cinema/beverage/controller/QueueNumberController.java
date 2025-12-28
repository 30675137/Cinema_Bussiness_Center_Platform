/**
 * @spec O003-beverage-order
 * 取餐号控制器
 */
package com.cinema.beverage.controller;

import java.util.UUID;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cinema.beverage.entity.QueueNumber;
import com.cinema.common.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 取餐号控制器 - C端API
 *
 * 对应 spec: O003-beverage-order
 * 提供取餐号查询接口
 */
@RestController
@RequestMapping("/api/client/queue-numbers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QueueNumberController {

    private static final Logger logger = LoggerFactory.getLogger(QueueNumberController.class);

    @PersistenceContext
    private final EntityManager entityManager;

    /**
     * 根据订单ID获取取餐号
     *
     * GET /api/client/queue-numbers/{orderId}
     *
     * @param orderId 订单ID
     * @return 取餐号信息
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<QueueNumber>> getQueueNumberByOrderId(@PathVariable String orderId) {
        logger.info("查询取餐号: orderId={}", orderId);

        UUID orderIdParsed = UUID.fromString(orderId);

        // 查询取餐号
        Query query = entityManager.createQuery(
            "SELECT q FROM QueueNumber q WHERE q.orderId = :orderId",
            QueueNumber.class
        );
        query.setParameter("orderId", orderIdParsed);

        QueueNumber queueNumber = (QueueNumber) query.getSingleResult();

        return ResponseEntity.ok(ApiResponse.success(queueNumber));
    }
}
