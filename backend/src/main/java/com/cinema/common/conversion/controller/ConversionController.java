/** @spec M001-material-unit-system */
package com.cinema.common.conversion.controller;

import com.cinema.common.conversion.CommonConversionService;
import com.cinema.common.conversion.CommonConversionService.ConversionResult;
import com.cinema.common.conversion.dto.ConversionRequest;
import com.cinema.common.conversion.dto.ConversionResponse;
import com.cinema.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/conversions")
@RequiredArgsConstructor
public class ConversionController {

    private final CommonConversionService commonConversionService;

    /**
     * 执行单位换算
     * 如果提供 materialId，优先使用物料级换算；否则使用全局换算
     */
    @PostMapping("/convert")
    public ResponseEntity<ApiResponse<ConversionResponse>> convert(
            @Valid @RequestBody ConversionRequest request) {
        log.info("Converting: {} {} -> {} (materialId: {})",
                request.getQuantity(), request.getFromUnitCode(), request.getToUnitCode(), request.getMaterialId());

        ConversionResult result;
        if (request.getMaterialId() != null) {
            result = commonConversionService.convert(
                    request.getFromUnitCode(),
                    request.getToUnitCode(),
                    request.getQuantity(),
                    request.getMaterialId()
            );
        } else {
            result = commonConversionService.convertGlobal(
                    request.getFromUnitCode(),
                    request.getToUnitCode(),
                    request.getQuantity()
            );
        }

        ConversionResponse response = ConversionResponse.from(
                request.getFromUnitCode(),
                request.getToUnitCode(),
                request.getQuantity(),
                result
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 检查是否可以进行单位换算
     */
    @GetMapping("/can-convert")
    public ResponseEntity<ApiResponse<Boolean>> canConvert(
            @RequestParam String fromUnitCode,
            @RequestParam String toUnitCode,
            @RequestParam(required = false) String materialId) {
        log.info("Checking if can convert: {} -> {} (materialId: {})",
                fromUnitCode, toUnitCode, materialId);

        boolean canConvert = materialId != null
                ? commonConversionService.canConvert(fromUnitCode, toUnitCode, java.util.UUID.fromString(materialId))
                : commonConversionService.canConvert(fromUnitCode, toUnitCode, null);

        return ResponseEntity.ok(ApiResponse.success(canConvert));
    }
}
