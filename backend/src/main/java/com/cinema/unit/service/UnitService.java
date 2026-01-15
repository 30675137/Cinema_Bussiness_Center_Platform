/**
 * @spec M001-material-unit-system
 */
package com.cinema.unit.service;

import com.cinema.unit.entity.Unit;
import com.cinema.unit.repository.UnitRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Unit service implementation
 *
 * <p>User Story: US1 - 单位主数据管理
 *
 * <p>Provides business logic for unit master data management.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;

    /**
     * Create a new unit
     *
     * @param unit unit to create
     * @return created unit
     * @throws IllegalArgumentException if unit code already exists
     */
    @Transactional
    public Unit createUnit(Unit unit) {
        log.info("Creating unit with code: {}", unit.getCode());

        if (unitRepository.existsByCode(unit.getCode())) {
            throw new IllegalArgumentException(
                    "Unit code already exists: " + unit.getCode());
        }

        Unit saved = unitRepository.save(unit);
        log.info("Unit created successfully: id={}, code={}", saved.getId(), saved.getCode());
        return saved;
    }

    /**
     * Find unit by code
     *
     * @param code unit code
     * @return optional unit
     */
    @Transactional(readOnly = true)
    public Optional<Unit> findByCode(String code) {
        log.debug("Finding unit by code: {}", code);
        return unitRepository.findByCode(code);
    }

    /**
     * Find unit by ID
     *
     * @param id unit ID
     * @return optional unit
     */
    @Transactional(readOnly = true)
    public Optional<Unit> findById(UUID id) {
        log.debug("Finding unit by id: {}", id);
        return unitRepository.findById(id);
    }

    /**
     * Find all units by category
     *
     * @param category unit category
     * @return list of units
     */
    @Transactional(readOnly = true)
    public List<Unit> findByCategory(Unit.UnitCategory category) {
        log.debug("Finding units by category: {}", category);
        return unitRepository.findByCategory(category);
    }

    /**
     * Find all units
     *
     * @return list of all units
     */
    @Transactional(readOnly = true)
    public List<Unit> findAll() {
        log.debug("Finding all units");
        return unitRepository.findAll();
    }

    /**
     * Find all base units
     *
     * @return list of base units
     */
    @Transactional(readOnly = true)
    public List<Unit> findBaseUnits() {
        log.debug("Finding all base units");
        return unitRepository.findByIsBaseUnitTrue();
    }

    /**
     * Update an existing unit
     *
     * @param id unit ID
     * @param unit updated unit data
     * @return updated unit
     * @throws IllegalArgumentException if unit not found
     */
    @Transactional
    public Unit updateUnit(UUID id, Unit unit) {
        log.info("Updating unit: id={}", id);

        Unit existing =
                unitRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Unit not found: " + id));

        // Update mutable fields (code and category are immutable)
        if (unit.getName() != null) {
            existing.setName(unit.getName());
        }
        if (unit.getDecimalPlaces() != null) {
            existing.setDecimalPlaces(unit.getDecimalPlaces());
        }
        if (unit.getIsBaseUnit() != null) {
            existing.setIsBaseUnit(unit.getIsBaseUnit());
        }
        if (unit.getDescription() != null) {
            existing.setDescription(unit.getDescription());
        }

        Unit saved = unitRepository.save(existing);
        log.info("Unit updated successfully: id={}, code={}", saved.getId(), saved.getCode());
        return saved;
    }

    /**
     * Delete a unit by ID
     *
     * <p>Validates that the unit is not referenced by materials or conversion rules before
     * deletion.
     *
     * @param id unit ID
     * @throws IllegalArgumentException if unit not found
     * @throws IllegalStateException if unit is referenced by materials or conversion rules
     */
    @Transactional
    public void deleteUnit(UUID id) {
        log.info("Deleting unit: id={}", id);

        Unit unit =
                unitRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Unit not found: " + id));

        // Check if unit is referenced
        if (unitRepository.isReferencedByMaterials(id)) {
            throw new IllegalStateException(
                    "Unit is referenced by materials and cannot be deleted: " + unit.getCode());
        }

        if (unitRepository.isReferencedByConversions(id)) {
            throw new IllegalStateException(
                    "Unit is referenced by conversion rules and cannot be deleted: "
                            + unit.getCode());
        }

        unitRepository.delete(unit);
        log.info("Unit deleted successfully: id={}, code={}", id, unit.getCode());
    }
}
