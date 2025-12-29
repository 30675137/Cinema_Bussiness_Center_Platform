package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.TimeSlotOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 时段覆盖 Repository
 */
@Repository
public interface TimeSlotOverrideRepository extends JpaRepository<TimeSlotOverride, UUID> {

    /**
     * 根据场景包ID查询所有覆盖规则
     */
    List<TimeSlotOverride> findByPackageIdOrderByDateAscStartTimeAsc(UUID packageId);

    /**
     * 根据场景包ID和日期查询覆盖规则
     */
    List<TimeSlotOverride> findByPackageIdAndDate(UUID packageId, LocalDate date);

    /**
     * 根据场景包ID和日期范围查询覆盖规则
     */
    @Query("SELECT o FROM TimeSlotOverride o WHERE o.packageId = :packageId AND o.date BETWEEN :startDate AND :endDate ORDER BY o.date ASC, o.startTime ASC")
    List<TimeSlotOverride> findByPackageIdAndDateRange(
            @Param("packageId") UUID packageId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * 删除场景包的所有覆盖规则
     */
    void deleteByPackageId(UUID packageId);

    /**
     * 统计场景包的覆盖规则数量
     */
    long countByPackageId(UUID packageId);

    /**
     * 根据场景包ID和覆盖类型查询
     */
    List<TimeSlotOverride> findByPackageIdAndOverrideType(UUID packageId, String overrideType);
}
