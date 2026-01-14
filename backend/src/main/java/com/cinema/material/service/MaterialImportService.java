/**
 * @spec M002-material-filter
 * Material Import Service - 物料导入服务
 * User Story: US3 - 批量导入物料数据
 */
package com.cinema.material.service;

import com.cinema.common.util.ExcelUtil;
import com.cinema.material.dto.MaterialImportDataDTO;
import com.cinema.material.dto.MaterialImportRecordDTO;
import com.cinema.material.dto.MaterialImportResultDTO;
import com.cinema.material.entity.Material;
import com.cinema.material.repository.MaterialRepository;
import com.cinema.unit.entity.Unit;
import com.cinema.unit.repository.UnitRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

/**
 * 物料导入服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialImportService {

    private final MaterialRepository materialRepository;
    private final UnitRepository unitRepository;
    private final Validator validator;
    
    private static final int MAX_IMPORT_SIZE = 1000;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * 预览导入数据（不保存）
     * 
     * @param file Excel 文件
     * @return 导入结果（包含校验信息）
     */
    @Transactional(readOnly = true)
    public MaterialImportResultDTO previewImport(MultipartFile file) throws IOException {
        log.info("Previewing import file: {}, size: {} bytes", file.getOriginalFilename(), file.getSize());
        
        // 1. 验证文件
        validateFile(file);
        
        // 2. 解析 Excel
        List<MaterialImportRecordDTO> records = parseExcel(file);
        
        // 3. 校验数据
        for (MaterialImportRecordDTO record : records) {
            validateImportData(record);
        }
        
        // 4. 统计结果
        long successCount = records.stream().filter(MaterialImportRecordDTO::getValid).count();
        long failureCount = records.size() - successCount;
        
        log.info("Preview completed: total={}, success={}, failure={}", 
            records.size(), successCount, failureCount);
        
        return MaterialImportResultDTO.builder()
            .totalCount(records.size())
            .successCount((int) successCount)
            .failureCount((int) failureCount)
            .records(records)
            .build();
    }

    /**
     * 确认导入数据（保存到数据库）
     * 
     * @param file Excel 文件
     * @return 导入结果
     */
    @Transactional
    public MaterialImportResultDTO confirmImport(MultipartFile file) throws IOException {
        log.info("Confirming import file: {}", file.getOriginalFilename());
        
        // 1. 预览数据（包含校验）
        MaterialImportResultDTO previewResult = previewImport(file);
        
        // 2. 只保存有效的记录
        List<MaterialImportRecordDTO> validRecords = previewResult.getRecords().stream()
            .filter(MaterialImportRecordDTO::getValid)
            .toList();
        
        if (validRecords.isEmpty()) {
            log.warn("No valid records to import");
            return previewResult;
        }
        
        // 3. 批量创建物料
        int successCount = 0;
        for (MaterialImportRecordDTO record : validRecords) {
            try {
                createMaterial(record.getData());
                successCount++;
            } catch (Exception e) {
                log.error("Failed to create material at row {}: {}", record.getRowIndex(), e.getMessage());
                record.setValid(false);
                record.setErrors(List.of("创建失败：" + e.getMessage()));
            }
        }
        
        int failureCount = validRecords.size() - successCount;
        
        log.info("Import completed: attempted={}, success={}, failure={}", 
            validRecords.size(), successCount, failureCount);
        
        return MaterialImportResultDTO.builder()
            .totalCount(previewResult.getTotalCount())
            .successCount(successCount)
            .failureCount(previewResult.getFailureCount() + failureCount)
            .records(previewResult.getRecords())
            .build();
    }

    /**
     * 验证上传文件
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                String.format("文件大小不能超过 %dMB", MAX_FILE_SIZE / 1024 / 1024));
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            throw new IllegalArgumentException("只支持 Excel 文件（.xlsx 或 .xls）");
        }
    }

    /**
     * 解析 Excel 文件
     */
    private List<MaterialImportRecordDTO> parseExcel(MultipartFile file) throws IOException {
        List<MaterialImportRecordDTO> records = new ArrayList<>();
        
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // 跳过表头（第0行）
            int lastRowNum = sheet.getLastRowNum();
            if (lastRowNum > MAX_IMPORT_SIZE) {
                throw new IllegalArgumentException(
                    String.format("导入数据不能超过 %d 行", MAX_IMPORT_SIZE));
            }
            
            for (int rowIndex = 1; rowIndex <= lastRowNum; rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isEmptyRow(row)) {
                    continue;
                }
                
                MaterialImportRecordDTO record = parseRow(row, rowIndex + 1);
                records.add(record);
            }
        }
        
        return records;
    }

    /**
     * 解析单行数据
     */
    private MaterialImportRecordDTO parseRow(Row row, int rowIndex) {
        MaterialImportRecordDTO record = new MaterialImportRecordDTO();
        record.setRowIndex(rowIndex);
        record.setValid(true);
        record.setErrors(new ArrayList<>());
        
        MaterialImportDataDTO data = new MaterialImportDataDTO();
        
        try {
            // 列映射（对应导出的列顺序）
            data.setCode(ExcelUtil.getCellValueAsString(row.getCell(0)));
            data.setName(ExcelUtil.getCellValueAsString(row.getCell(1)));
            
            // 分类（中文转枚举）
            String categoryStr = ExcelUtil.getCellValueAsString(row.getCell(2));
            data.setCategory(parseCategoryFromLabel(categoryStr));
            
            // 注意：库存单位和采购单位需要从单位名称转换为ID
            String inventoryUnitName = ExcelUtil.getCellValueAsString(row.getCell(4));
            String purchaseUnitName = ExcelUtil.getCellValueAsString(row.getCell(5));
            
            // 暂时存储单位名称，后续在校验时转换为ID
            data.setInventoryUnitId(inventoryUnitName); // 临时存储
            data.setPurchaseUnitId(purchaseUnitName); // 临时存储
            
            data.setConversionRate(ExcelUtil.getCellValueAsNumber(row.getCell(6)));
            data.setStandardCost(ExcelUtil.getCellValueAsNumber(row.getCell(7)));
            data.setSpecification(ExcelUtil.getCellValueAsString(row.getCell(8)));
            data.setDescription(ExcelUtil.getCellValueAsString(row.getCell(9)));
            
            record.setData(data);
            
        } catch (Exception e) {
            record.setValid(false);
            record.getErrors().add("解析失败：" + e.getMessage());
        }
        
        return record;
    }

    /**
     * 校验导入数据
     */
    private void validateImportData(MaterialImportRecordDTO record) {
        MaterialImportDataDTO data = record.getData();
        List<String> errors = record.getErrors();
        
        // 1. Bean Validation 校验
        Set<ConstraintViolation<MaterialImportDataDTO>> violations = validator.validate(data);
        for (ConstraintViolation<MaterialImportDataDTO> violation : violations) {
            errors.add(violation.getMessage());
        }
        
        // 2. 业务规则校验
        
        // 2.1 物料编码唯一性（如果提供）
        if (data.getCode() != null && !data.getCode().isEmpty()) {
            if (materialRepository.existsByCode(data.getCode())) {
                errors.add("物料编码已存在：" + data.getCode());
            }
        }
        
        // 2.2 单位存在性（从名称查找ID）
        String inventoryUnitName = data.getInventoryUnitId(); // 临时存储的是名称
        Optional<Unit> inventoryUnit = unitRepository.findAll().stream()
            .filter(u -> u.getName().equals(inventoryUnitName))
            .findFirst();
        if (inventoryUnit.isEmpty()) {
            errors.add("库存单位不存在：" + inventoryUnitName);
        } else {
            data.setInventoryUnitId(inventoryUnit.get().getId().toString());
        }
        
        String purchaseUnitName = data.getPurchaseUnitId(); // 临时存储的是名称
        Optional<Unit> purchaseUnit = unitRepository.findAll().stream()
            .filter(u -> u.getName().equals(purchaseUnitName))
            .findFirst();
        if (purchaseUnit.isEmpty()) {
            errors.add("采购单位不存在：" + purchaseUnitName);
        } else {
            data.setPurchaseUnitId(purchaseUnit.get().getId().toString());
        }
        
        // 3. 更新校验状态
        if (!errors.isEmpty()) {
            record.setValid(false);
        }
    }

    /**
     * 创建物料
     */
    private void createMaterial(MaterialImportDataDTO data) {
        Unit inventoryUnit = unitRepository.findById(UUID.fromString(data.getInventoryUnitId()))
            .orElseThrow(() -> new IllegalArgumentException("库存单位不存在"));
        
        Unit purchaseUnit = unitRepository.findById(UUID.fromString(data.getPurchaseUnitId()))
            .orElseThrow(() -> new IllegalArgumentException("采购单位不存在"));
        
        // 自动生成编码（如果未提供）
        String code = data.getCode();
        if (code == null || code.isEmpty()) {
            String prefix = data.getCategory() == Material.MaterialCategory.RAW_MATERIAL
                ? "MAT-RAW-"
                : "MAT-PKG-";
            Long sequence = materialRepository.getNextCodeSequence();
            code = prefix + String.format("%03d", sequence);
        }
        
        Material material = Material.builder()
            .code(code)
            .name(data.getName())
            .category(data.getCategory())
            .inventoryUnit(inventoryUnit)
            .purchaseUnit(purchaseUnit)
            .conversionRate(data.getConversionRate())
            .useGlobalConversion(data.getUseGlobalConversion() != null 
                ? data.getUseGlobalConversion() 
                : true)
            .standardCost(data.getStandardCost())
            .specification(data.getSpecification())
            .description(data.getDescription())
            .status("ACTIVE")
            .build();
        
        materialRepository.save(material);
    }

    /**
     * 判断是否为空行
     */
    private boolean isEmptyRow(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = ExcelUtil.getCellValueAsString(cell);
                if (value != null && !value.trim().isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 从中文标签解析分类
     */
    private Material.MaterialCategory parseCategoryFromLabel(String label) {
        if (label == null || label.isEmpty()) {
            return null;
        }
        return switch (label.trim()) {
            case "原料" -> Material.MaterialCategory.RAW_MATERIAL;
            case "包材" -> Material.MaterialCategory.PACKAGING;
            default -> throw new IllegalArgumentException("无效的分类：" + label);
        };
    }
}
