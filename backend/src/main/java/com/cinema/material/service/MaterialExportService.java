/**
 * @spec M002-material-filter
 * Material Export Service - 物料导出服务
 * User Story: US2 - 批量导出物料数据
 */
package com.cinema.material.service;

import com.cinema.common.util.ExcelUtil;
import com.cinema.material.dto.MaterialExportDTO;
import com.cinema.material.dto.MaterialFilterDTO;
import com.cinema.material.entity.Material;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

/**
 * 物料导出服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialExportService {

    private final MaterialService materialService;
    
    private static final int MAX_EXPORT_SIZE = 10000;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * 导出物料数据为 Excel
     * 
     * @param filter 筛选条件
     * @return Excel 文件字节数组
     * @throws IOException IO 异常
     * @throws IllegalArgumentException 数据量超过限制
     */
    @Transactional(readOnly = true)
    public byte[] exportMaterials(MaterialFilterDTO filter) throws IOException {
        log.info("Starting material export with filter: {}", filter);
        
        // 1. 检查数据量
        Pageable countPageable = PageRequest.of(0, 1);
        Page<Material> countPage = materialService.filterMaterials(filter, countPageable);
        long totalCount = countPage.getTotalElements();
        
        if (totalCount > MAX_EXPORT_SIZE) {
            throw new IllegalArgumentException(
                String.format("导出数据量过大，最多支持导出 %d 条数据，当前查询结果有 %d 条", 
                    MAX_EXPORT_SIZE, totalCount));
        }
        
        log.info("Export material count: {}", totalCount);
        
        // 2. 创建 Excel Workbook（流式写入模式）
        SXSSFWorkbook workbook = ExcelUtil.createWorkbook(100);
        try {
            Sheet sheet = ExcelUtil.createSheet(workbook, "物料数据");
            
            // 3. 写入表头
            String[] headers = {
                "物料编码", "物料名称", "分类", "状态", 
                "库存单位", "采购单位", "换算率", "标准成本", 
                "规格", "描述", "创建时间"
            };
            ExcelUtil.createHeaderRow(sheet, headers);
            
            // 4. 分页查询并写入数据
            int pageSize = 500;
            int totalPages = (int) Math.ceil((double) totalCount / pageSize);
            int rowIndex = 1;
            
            for (int pageNum = 0; pageNum < totalPages; pageNum++) {
                Pageable pageable = PageRequest.of(pageNum, pageSize);
                Page<Material> page = materialService.filterMaterials(filter, pageable);
                
                for (Material material : page.getContent()) {
                    MaterialExportDTO exportData = convertToExportDTO(material);
                    writeDataRow(sheet, rowIndex++, exportData);
                }
                
                log.debug("Exported page {}/{}, total rows: {}", pageNum + 1, totalPages, rowIndex - 1);
            }
            
            // 5. 写入到字节数组
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            
            log.info("Material export completed, total rows: {}", rowIndex - 1);
            return outputStream.toByteArray();
            
        } finally {
            workbook.close();
            workbook.dispose(); // 清理临时文件
        }
    }
    
    /**
     * 转换为导出 DTO
     */
    private MaterialExportDTO convertToExportDTO(Material material) {
        return MaterialExportDTO.builder()
            .code(material.getCode())
            .name(material.getName())
            .category(getCategoryLabel(material.getCategory()))
            .status(getStatusLabel(material.getStatus()))
            .inventoryUnitName(material.getInventoryUnit().getName())
            .purchaseUnitName(material.getPurchaseUnit().getName())
            .conversionRate(material.getConversionRate())
            .standardCost(material.getStandardCost())
            .specification(material.getSpecification())
            .description(material.getDescription())
            .createdAt(material.getCreatedAt() != null 
                ? material.getCreatedAt().format(DATE_TIME_FORMATTER) 
                : "")
            .build();
    }
    
    /**
     * 写入数据行
     */
    private void writeDataRow(Sheet sheet, int rowIndex, MaterialExportDTO data) {
        Object[] values = {
            data.getCode(),
            data.getName(),
            data.getCategory(),
            data.getStatus(),
            data.getInventoryUnitName(),
            data.getPurchaseUnitName(),
            data.getConversionRate(),
            data.getStandardCost(),
            data.getSpecification(),
            data.getDescription(),
            data.getCreatedAt()
        };
        ExcelUtil.writeRow(sheet, rowIndex, values);
    }
    
    /**
     * 获取分类中文标签
     */
    private String getCategoryLabel(Material.MaterialCategory category) {
        if (category == null) return "";
        return switch (category) {
            case RAW_MATERIAL -> "原料";
            case PACKAGING -> "包材";
        };
    }
    
    /**
     * 获取状态中文标签
     */
    private String getStatusLabel(String status) {
        if (status == null) return "";
        return "ACTIVE".equals(status) ? "在用" : "停用";
    }
    
    /**
     * 生成导出文件名
     * 
     * @return 文件名（格式：物料数据_YYYYMMDD_HHmmss.xlsx）
     */
    public String generateFileName() {
        String timestamp = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
            .format(java.time.LocalDateTime.now());
        return String.format("物料数据_%s.xlsx", timestamp);
    }
}
