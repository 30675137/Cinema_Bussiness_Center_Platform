/**
 * @spec M002-material-filter
 */
package com.cinema.common.util;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Excel utility class - Excel 操作工具类
 *
 * <p>User Story: US2 & US3 - 批量导出和导入物料数据
 */
public class ExcelUtil {
    
    /** 日期时间格式化器 */
    private static final DateTimeFormatter DATE_TIME_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * 创建 Excel Workbook（使用流式写入模式）
     * 
     * @param rowAccessWindowSize 内存中保留的行数，默认 100
     * @return SXSSFWorkbook 实例
     */
    public static SXSSFWorkbook createWorkbook(int rowAccessWindowSize) {
        return new SXSSFWorkbook(rowAccessWindowSize);
    }
    
    /**
     * 创建 Excel Sheet
     * 
     * @param workbook Workbook 实例
     * @param sheetName Sheet 名称
     * @return Sheet 实例
     */
    public static Sheet createSheet(SXSSFWorkbook workbook, String sheetName) {
        return workbook.createSheet(sheetName);
    }
    
    /**
     * 创建表头行
     * 
     * @param sheet Sheet 实例
     * @param headers 表头列名数组
     * @return 表头行对象
     */
    public static Row createHeaderRow(Sheet sheet, String[] headers) {
        Row headerRow = sheet.createRow(0);
        CellStyle headerStyle = createHeaderStyle(sheet.getWorkbook());
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
            sheet.setColumnWidth(i, 15 * 256); // 设置列宽
        }
        
        return headerRow;
    }
    
    /**
     * 创建表头样式
     */
    private static CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    /**
     * 写入数据行
     * 
     * @param sheet Sheet 实例
     * @param rowIndex 行索引（从 1 开始，0 是表头）
     * @param values 单元格值数组
     */
    public static void writeRow(Sheet sheet, int rowIndex, Object[] values) {
        Row row = sheet.createRow(rowIndex);
        for (int i = 0; i < values.length; i++) {
            Cell cell = row.createCell(i);
            setCellValue(cell, values[i]);
        }
    }
    
    /**
     * 设置单元格值（根据类型自动判断）
     */
    private static void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof String) {
            cell.setCellValue((String) value);
        } else if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        } else if (value instanceof Long) {
            cell.setCellValue((Long) value);
        } else if (value instanceof Double) {
            cell.setCellValue((Double) value);
        } else if (value instanceof BigDecimal) {
            cell.setCellValue(((BigDecimal) value).doubleValue());
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else if (value instanceof LocalDateTime) {
            cell.setCellValue(formatDateTime((LocalDateTime) value));
        } else {
            cell.setCellValue(value.toString());
        }
    }
    
    /**
     * 格式化日期时间
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_TIME_FORMATTER) : "";
    }
    
    /**
     * 读取单元格值为字符串
     * 
     * @param cell 单元格
     * @return 单元格值（字符串）
     */
    public static String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().format(DATE_TIME_FORMATTER);
                } else {
                    // 避免科学计数法，直接转为字符串
                    return String.valueOf(cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            case BLANK:
            default:
                return "";
        }
    }
    
    /**
     * 读取单元格值为数字
     * 
     * @param cell 单元格
     * @return 单元格值（BigDecimal）
     */
    public static BigDecimal getCellValueAsNumber(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return null;
        }
        
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String value = cell.getStringCellValue().trim();
                return value.isEmpty() ? null : new BigDecimal(value);
            }
        } catch (Exception e) {
            // 忽略转换失败
        }
        
        return null;
    }
}
