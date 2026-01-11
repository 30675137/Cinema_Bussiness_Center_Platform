/**
 * @spec M001-material-unit-system
 * @spec N004-procurement-material-selector
 */
package com.cinema.material.repository;

import com.cinema.material.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Material repository interface
 *
 * <p>User Story: US2 - 物料主数据管理
 *
 * <p>Provides data access methods for material master data.
 */
@Repository
public interface MaterialRepository extends JpaRepository<Material, UUID> {

    /**
     * Find material by code (unique identifier)
     *
     * @param code material code (e.g., "MAT-RAW-001", "MAT-PKG-001")
     * @return optional material
     */
    Optional<Material> findByCode(String code);

    /**
     * Find all materials by category
     *
     * @param category material category (RAW_MATERIAL, PACKAGING)
     * @return list of materials in the category
     */
    List<Material> findByCategory(Material.MaterialCategory category);

    /**
     * Find all materials by status
     *
     * @param status material status (ACTIVE, INACTIVE)
     * @return list of materials with the status
     */
    List<Material> findByStatus(String status);

    /**
     * Find all active materials by category
     *
     * @param category material category
     * @param status material status
     * @return list of active materials in the category
     */
    List<Material> findByCategoryAndStatus(Material.MaterialCategory category, String status);

    // ========== N004: Search and pagination methods for Material selector ==========

    /**
     * Find materials by fuzzy search (name, code, or specification)
     * N004: Used by MaterialSkuSelector component
     *
     * @param searchTerm search term (case-insensitive)
     * @param pageable pagination parameters
     * @return paginated materials matching the search term
     */
    @Query("SELECT m FROM Material m " +
           "WHERE m.status = 'ACTIVE' " +
           "AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(m.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(m.specification) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Material> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find materials by category with pagination
     * N004: Used by MaterialSkuSelector component
     *
     * @param category material category
     * @param pageable pagination parameters
     * @return paginated materials in the category
     */
    @Query("SELECT m FROM Material m WHERE m.category = :category AND m.status = 'ACTIVE'")
    Page<Material> findByCategoryPaged(@Param("category") Material.MaterialCategory category, Pageable pageable);

    /**
     * Find materials by category and search term with pagination
     * N004: Used by MaterialSkuSelector component
     *
     * @param category material category
     * @param searchTerm search term (case-insensitive)
     * @param pageable pagination parameters
     * @return paginated materials matching category and search term
     */
    @Query("SELECT m FROM Material m " +
           "WHERE m.category = :category " +
           "AND m.status = 'ACTIVE' " +
           "AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(m.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(m.specification) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Material> findByCategoryAndSearchTerm(
            @Param("category") Material.MaterialCategory category,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    /**
     * Find all active materials with pagination
     * N004: Used by MaterialSkuSelector component
     *
     * @param pageable pagination parameters
     * @return paginated active materials
     */
    @Query("SELECT m FROM Material m WHERE m.status = 'ACTIVE'")
    Page<Material> findAllActivePaged(Pageable pageable);

    /**
     * Check if a material code exists
     *
     * @param code material code
     * @return true if exists, false otherwise
     */
    boolean existsByCode(String code);

    /**
     * Check if a material is referenced by any BOM component
     *
     * @param materialId material ID
     * @return true if referenced, false otherwise
     */
    @Query(
            value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END "
                    + "FROM bom_components "
                    + "WHERE material_id = :materialId",
            nativeQuery = true)
    boolean isReferencedByBomComponents(UUID materialId);

    /**
     * Check if a material is referenced by any inventory record
     *
     * @param materialId material ID
     * @return true if referenced, false otherwise
     */
    @Query(
            value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END "
                    + "FROM store_inventory "
                    + "WHERE material_id = :materialId",
            nativeQuery = true)
    boolean isReferencedByInventory(UUID materialId);

    /**
     * Find all materials using a specific unit (inventory or purchase)
     *
     * @param unitId unit ID
     * @return list of materials using the unit
     */
    @Query(
            "SELECT m FROM Material m "
                    + "WHERE m.inventoryUnit.id = :unitId OR m.purchaseUnit.id = :unitId")
    List<Material> findByUnitId(UUID unitId);

    /**
     * Find materials with material-level conversion (not using global conversion)
     *
     * @return list of materials with custom conversion rates
     */
    List<Material> findByUseGlobalConversionFalse();

    /**
     * Get the next sequence number for material code generation
     *
     * <p>This query gets the next value from the material_code_seq sequence.
     *
     * @return next sequence number
     */
    @Query(value = "SELECT nextval('material_code_seq')", nativeQuery = true)
    Long getNextCodeSequence();
}
