package com.cinema.category.repository;

import com.cinema.category.entity.CategoryAuditLog;
import com.cinema.category.entity.CategoryAuditLog.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 分类审计日志 Repository
 */
@Repository
public interface CategoryAuditLogRepository extends JpaRepository<CategoryAuditLog, UUID> {

    /**
     * 根据分类 ID 查询审计日志
     */
    List<CategoryAuditLog> findByCategoryIdOrderByCreatedAtDesc(UUID categoryId);

    /**
     * 根据分类 ID 分页查询审计日志
     */
    Page<CategoryAuditLog> findByCategoryId(UUID categoryId, Pageable pageable);

    /**
     * 根据操作类型查询审计日志
     */
    List<CategoryAuditLog> findByActionOrderByCreatedAtDesc(AuditAction action);

    /**
     * 根据操作类型分页查询审计日志
     */
    Page<CategoryAuditLog> findByAction(AuditAction action, Pageable pageable);

    /**
     * 根据操作人 ID 查询审计日志
     */
    List<CategoryAuditLog> findByOperatorIdOrderByCreatedAtDesc(UUID operatorId);

    /**
     * 查询指定时间范围内的审计日志
     */
    @Query("SELECT l FROM CategoryAuditLog l WHERE l.createdAt BETWEEN :startTime AND :endTime ORDER BY l.createdAt DESC")
    List<CategoryAuditLog> findByCreatedAtBetween(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * 查询指定时间范围内的审计日志（分页）
     */
    @Query("SELECT l FROM CategoryAuditLog l WHERE l.createdAt BETWEEN :startTime AND :endTime")
    Page<CategoryAuditLog> findByCreatedAtBetween(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    /**
     * 统计指定分类的操作次数
     */
    @Query("SELECT COUNT(l) FROM CategoryAuditLog l WHERE l.categoryId = :categoryId")
    long countByCategoryId(@Param("categoryId") UUID categoryId);

    /**
     * 统计指定操作类型的次数
     */
    @Query("SELECT COUNT(l) FROM CategoryAuditLog l WHERE l.action = :action")
    long countByAction(@Param("action") AuditAction action);

    /**
     * 获取最近的审计日志
     */
    @Query("SELECT l FROM CategoryAuditLog l ORDER BY l.createdAt DESC")
    List<CategoryAuditLog> findRecent(Pageable pageable);

    /**
     * 获取指定分类最近的审计日志
     */
    @Query("SELECT l FROM CategoryAuditLog l WHERE l.categoryId = :categoryId ORDER BY l.createdAt DESC")
    List<CategoryAuditLog> findRecentByCategoryId(@Param("categoryId") UUID categoryId, Pageable pageable);
}
