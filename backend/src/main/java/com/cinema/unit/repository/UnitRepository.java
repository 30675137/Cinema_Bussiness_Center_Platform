/**
 * @spec M001-material-unit-system
 */
package com.cinema.unit.repository;

import com.cinema.unit.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Unit repository interface
 *
 * <p>User Story: US1 - 单位主数据管理
 *
 * <p>Provides data access methods for unit master data.
 */
@Repository
public interface UnitRepository extends JpaRepository<Unit, UUID> {

    /**
     * Find unit by code (unique identifier)
     *
     * @param code unit code (e.g., "ml", "L", "kg")
     * @return optional unit
     */
    Optional<Unit> findByCode(String code);

    /**
     * Find all units by category
     *
     * @param category unit category (VOLUME, WEIGHT, COUNT)
     * @return list of units in the category
     */
    List<Unit> findByCategory(Unit.UnitCategory category);

    /**
     * Find all base units
     *
     * @return list of base units
     */
    List<Unit> findByIsBaseUnitTrue();

    /**
     * Check if a unit code exists
     *
     * @param code unit code
     * @return true if exists, false otherwise
     */
    boolean existsByCode(String code);

    /**
     * Check if a unit is referenced by any material
     *
     * <p>This query checks if the unit is used as inventory_unit or purchase_unit in the materials
     * table.
     *
     * @param unitId unit ID
     * @return true if referenced, false otherwise
     */
    @Query(
            "SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END "
                    + "FROM Material m "
                    + "WHERE m.inventoryUnit.id = :unitId OR m.purchaseUnit.id = :unitId")
    boolean isReferencedByMaterials(UUID unitId);

    /**
     * Check if a unit is referenced by any unit conversion rule
     *
     * @param unitId unit ID
     * @return true if referenced, false otherwise
     */
    @Query(
            "SELECT CASE WHEN COUNT(uc) > 0 THEN true ELSE false END "
                    + "FROM UnitConversion uc "
                    + "WHERE uc.fromUnit = :unitId OR uc.toUnit = :unitId")
    boolean isReferencedByConversions(UUID unitId);
}
