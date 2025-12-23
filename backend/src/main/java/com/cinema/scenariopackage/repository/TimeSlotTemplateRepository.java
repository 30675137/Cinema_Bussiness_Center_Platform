package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.TimeSlotTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 时段模板 Repository
 */
@Repository
public interface TimeSlotTemplateRepository extends JpaRepository<TimeSlotTemplate, UUID> {

    /**
     * 根据场景包ID查询所有时段模板
     */
    @Query("SELECT t FROM TimeSlotTemplate t WHERE t.packageId = :packageId ORDER BY t.dayOfWeek, t.startTime")
    List<TimeSlotTemplate> findByPackageIdOrderByDayOfWeekAndStartTime(UUID packageId);

    /**
     * 根据场景包ID查询启用的时段模板
     */
    @Query("SELECT t FROM TimeSlotTemplate t WHERE t.packageId = :packageId AND t.isEnabled = true ORDER BY t.dayOfWeek, t.startTime")
    List<TimeSlotTemplate> findEnabledByPackageId(UUID packageId);

    /**
     * 根据场景包ID删除所有时段模板
     */
    void deleteByPackageId(UUID packageId);
}
