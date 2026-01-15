/**
 * @spec M001-material-unit-system
 */
package com.cinema.unit.controller;

import com.cinema.common.dto.ApiResponse;
import com.cinema.unit.dto.UnitCreateRequest;
import com.cinema.unit.dto.UnitResponse;
import com.cinema.unit.dto.UnitUpdateRequest;
import com.cinema.unit.entity.Unit;
import com.cinema.unit.service.UnitService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Unit REST controller
 *
 * <p>User Story: US1 - 单位主数据管理
 *
 * <p>Provides REST API endpoints for unit master data management.
 */
@Slf4j
@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    /**
     * Create a new unit
     *
     * <p>POST /api/units
     *
     * @param request unit creation request
     * @return created unit response
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UnitResponse>> createUnit(
            @Valid @RequestBody UnitCreateRequest request) {
        log.info("Received request to create unit: code={}", request.getCode());

        Unit unit =
                Unit.builder()
                        .code(request.getCode())
                        .name(request.getName())
                        .category(request.getCategory())
                        .decimalPlaces(request.getDecimalPlaces())
                        .isBaseUnit(request.getIsBaseUnit())
                        .description(request.getDescription())
                        .build();

        Unit created = unitService.createUnit(unit);
        UnitResponse response = UnitResponse.fromEntity(created);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    /**
     * Get all units
     *
     * <p>GET /api/units
     *
     * @param category optional category filter
     * @return list of units
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UnitResponse>>> getAllUnits(
            @RequestParam(required = false) Unit.UnitCategory category) {
        log.info("Received request to get all units, category={}", category);

        List<Unit> units =
                category != null
                        ? unitService.findByCategory(category)
                        : unitService.findAll();

        List<UnitResponse> responses =
                units.stream().map(UnitResponse::fromEntity).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * Get unit by ID
     *
     * <p>GET /api/units/{id}
     *
     * @param id unit ID
     * @return unit response
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitResponse>> getUnitById(@PathVariable UUID id) {
        log.info("Received request to get unit by id: {}", id);

        Unit unit =
                unitService
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Unit not found: " + id));

        return ResponseEntity.ok(ApiResponse.success(UnitResponse.fromEntity(unit)));
    }

    /**
     * Get unit by code
     *
     * <p>GET /api/units/code/{code}
     *
     * @param code unit code
     * @return unit response
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<UnitResponse>> getUnitByCode(@PathVariable String code) {
        log.info("Received request to get unit by code: {}", code);

        Unit unit =
                unitService
                        .findByCode(code)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Unit not found: " + code));

        return ResponseEntity.ok(ApiResponse.success(UnitResponse.fromEntity(unit)));
    }

    /**
     * Update a unit
     *
     * <p>PUT /api/units/{id}
     *
     * @param id unit ID
     * @param request unit update request
     * @return updated unit response
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitResponse>> updateUnit(
            @PathVariable UUID id, @Valid @RequestBody UnitUpdateRequest request) {
        log.info("Received request to update unit: id={}", id);

        Unit unit =
                Unit.builder()
                        .name(request.getName())
                        .decimalPlaces(request.getDecimalPlaces())
                        .isBaseUnit(request.getIsBaseUnit())
                        .description(request.getDescription())
                        .build();

        Unit updated = unitService.updateUnit(id, unit);
        UnitResponse response = UnitResponse.fromEntity(updated);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Delete a unit
     *
     * <p>DELETE /api/units/{id}
     *
     * @param id unit ID
     * @return no content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUnit(@PathVariable UUID id) {
        log.info("Received request to delete unit: id={}", id);

        unitService.deleteUnit(id);

        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
