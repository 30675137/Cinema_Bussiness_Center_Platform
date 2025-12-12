import { ExportFormat, ImportFormat, ExportDataType, ImportDataType } from '@/types/spu'

// 文件处理配置
export interface FileProcessingConfig {
  dateFormat?: string
  encoding?: string
  delimiter?: string
  quote?: string
  escape?: string
  skipEmptyLines?: boolean
  trimWhitespace?: boolean
}

// Excel工作表配置
export interface SheetConfig {
  name: string
  data: any[]
  columns?: ExcelColumnConfig[]
}

// Excel列配置
export interface ExcelColumnConfig {
  key: string
  title: string
  width?: number
  type?: 'text' | 'number' | 'date' | 'boolean'
  format?: string
}

// CSV解析结果
export interface CSVParseResult {
  data: any[]
  headers: string[]
  errors: string[]
  rowCount: number
}

// Excel解析结果
export interface ExcelParseResult {
  data: any[]
  sheets: string[]
  errors: string[]
  selectedSheet?: string
}

// 导入验证结果
export interface ImportValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  summary: {
    totalRows: number
    validRows: number
    invalidRows: number
  }
}

// 验证错误
export interface ValidationError {
  row: number
  field: string
  value: any
  message: string
  type: 'required' | 'format' | 'length' | 'unique' | 'custom'
}

// 验证警告
export interface ValidationWarning {
  row: number
  field: string
  value: any
  message: string
  type: 'format' | 'length' | 'custom'
}

// 字段验证规则
export interface ValidationRule {
  required?: boolean
  type?: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'url'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  unique?: boolean
  enum?: string[]
  custom?: (value: any) => boolean | string
}

/**
 * 文件处理工具类
 */
export class FileProcessor {
  private static defaultConfig: FileProcessingConfig = {
    dateFormat: 'YYYY-MM-DD',
    encoding: 'utf-8',
    delimiter: ',',
    quote: '"',
    escape: '"',
    skipEmptyLines: true,
    trimWhitespace: true
  }

  /**
   * 将数据导出为CSV格式
   */
  static exportToCSV(
    data: any[],
    headers: string[],
    filename?: string,
    config: FileProcessingConfig = {}
  ): string {
    const finalConfig = { ...this.defaultConfig, ...config }

    // 构建CSV内容
    let csvContent = ''

    // 添加表头
    if (headers && headers.length > 0) {
      csvContent += this.escapeCSVFields(headers, finalConfig).join(finalConfig.delimiter) + '\n'
    }

    // 添加数据行
    data.forEach(row => {
      const fields = headers.map(header => {
        const value = this.getNestedValue(row, header)
        return this.formatCSVValue(value, finalConfig)
      })
      csvContent += this.escapeCSVFields(fields, finalConfig).join(finalConfig.delimiter) + '\n'
    })

    return csvContent
  }

  /**
   * 将数据导出为JSON格式
   */
  static exportToJSON(data: any[], filename?: string): string {
    return JSON.stringify(data, null, 2)
  }

  /**
   * 模拟Excel导出（返回下载URL）
   */
  static exportToExcel(
    data: any[],
    sheets: SheetConfig[],
    filename?: string
  ): string {
    // 在实际应用中，这里会调用后端API生成Excel文件
    // 这里返回一个模拟的下载URL
    const fileName = filename || `export_${Date.now()}.xlsx`
    return `/api/download/${fileName}`
  }

  /**
   * 解析CSV文件
   */
  static async parseCSV(
    file: File,
    config: FileProcessingConfig = {}
  ): Promise<CSVParseResult> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const text = await this.readFileAsText(file, finalConfig.encoding!)

    const lines = text.split('\n')
      .filter(line => !finalConfig.skipEmptyLines || line.trim())
      .filter(line => line.trim())

    if (lines.length === 0) {
      return {
        data: [],
        headers: [],
        errors: ['文件为空'],
        rowCount: 0
      }
    }

    const result: CSVParseResult = {
      data: [],
      headers: [],
      errors: [],
      rowCount: lines.length - 1
    }

    try {
      // 解析表头
      const headerLine = lines[0]
      result.headers = this.parseCSVLine(headerLine, finalConfig)

      // 解析数据行
      for (let i = 1; i < lines.length; i++) {
        try {
          const line = lines[i]
          const fields = this.parseCSVLine(line, finalConfig)

          if (fields.length !== result.headers.length) {
            result.errors.push(`第 ${i + 1} 行字段数量不匹配`)
            continue
          }

          const row: any = {}
          result.headers.forEach((header, index) => {
            row[header] = this.parseCSVValue(fields[index], finalConfig)
          })

          result.data.push(row)
        } catch (error) {
          result.errors.push(`第 ${i + 1} 行解析失败: ${error}`)
        }
      }
    } catch (error) {
      result.errors.push(`CSV解析失败: ${error}`)
    }

    return result
  }

  /**
   * 解析Excel文件（模拟）
   */
  static async parseExcel(file: File): Promise<ExcelParseResult> {
    // 在实际应用中，这里会使用xlsx库或调用后端API解析Excel
    // 这里返回模拟数据
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: this.generateMockData(),
          sheets: ['Sheet1', 'Data'],
          errors: [],
          selectedSheet: 'Sheet1'
        })
      }, 1000)
    })
  }

  /**
   * 验证导入数据
   */
  static validateImportData(
    data: any[],
    dataType: ImportDataType,
    rules: Record<string, ValidationRule>
  ): ImportValidationResult {
    const result: ImportValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: {
        totalRows: data.length,
        validRows: 0,
        invalidRows: 0
      }
    }

    const uniqueValues: Record<string, Set<string>> = {}

    data.forEach((row, index) => {
      let rowValid = true
      const rowIndex = index + 1

      Object.entries(rules).forEach(([field, rule]) => {
        const value = row[field]

        // 必填验证
        if (rule.required && (value === null || value === undefined || value === '')) {
          result.errors.push({
            row: rowIndex,
            field,
            value,
            message: `${field} 是必填项`,
            type: 'required'
          })
          rowValid = false
        }

        // 跳过空值的后续验证
        if (value === null || value === undefined || value === '') {
          return
        }

        // 类型验证
        if (rule.type) {
          const typeError = this.validateType(value, rule.type, field, rowIndex)
          if (typeError) {
            if (typeError.type === 'error') {
              result.errors.push(typeError)
              rowValid = false
            } else {
              result.warnings.push(typeError)
            }
          }
        }

        // 长度验证
        if (typeof value === 'string') {
          if (rule.minLength && value.length < rule.minLength) {
            result.errors.push({
              row: rowIndex,
              field,
              value,
              message: `${field} 长度不能少于 ${rule.minLength} 个字符`,
              type: 'length'
            })
            rowValid = false
          }

          if (rule.maxLength && value.length > rule.maxLength) {
            result.errors.push({
              row: rowIndex,
              field,
              value,
              message: `${field} 长度不能超过 ${rule.maxLength} 个字符`,
              type: 'length'
            })
            rowValid = false
          }
        }

        // 数值范围验证
        if (rule.type === 'number' && typeof value === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            result.errors.push({
              row: rowIndex,
              field,
              value,
              message: `${field} 不能小于 ${rule.min}`,
              type: 'format'
            })
            rowValid = false
          }

          if (rule.max !== undefined && value > rule.max) {
            result.errors.push({
              row: rowIndex,
              field,
              value,
              message: `${field} 不能大于 ${rule.max}`,
              type: 'format'
            })
            rowValid = false
          }
        }

        // 枚举值验证
        if (rule.enum && rule.enum.length > 0) {
          if (!rule.enum.includes(String(value))) {
            result.errors.push({
              row: rowIndex,
              field,
              value,
              message: `${field} 必须是以下值之一: ${rule.enum.join(', ')}`,
              type: 'format'
            })
            rowValid = false
          }
        }

        // 唯一性验证
        if (rule.unique) {
          if (!uniqueValues[field]) {
            uniqueValues[field] = new Set()
          }

          if (uniqueValues[field].has(String(value))) {
            result.errors.push({
              row: rowIndex,
              field,
              value,
              message: `${field} 值必须唯一`,
              type: 'unique'
            })
            rowValid = false
          } else {
            uniqueValues[field].add(String(value))
          }
        }

        // 正则表达式验证
        if (rule.pattern) {
          const regex = new RegExp(rule.pattern)
          if (!regex.test(String(value))) {
            result.errors.push({
              row: rowIndex,
              field,
              value,
              message: `${field} 格式不正确`,
              type: 'format'
            })
            rowValid = false
          }
        }

        // 自定义验证
        if (rule.custom) {
          const customResult = rule.custom(value)
          if (customResult !== true) {
            const message = typeof customResult === 'string' ? customResult : `${field} 验证失败`
            if (message.includes('警告') || message.includes('warning')) {
              result.warnings.push({
                row: rowIndex,
                field,
                value,
                message,
                type: 'custom'
              })
            } else {
              result.errors.push({
                row: rowIndex,
                field,
                value,
                message,
                type: 'custom'
              })
              rowValid = false
            }
          }
        }
      })

      if (rowValid) {
        result.summary.validRows++
      } else {
        result.summary.invalidRows++
        result.isValid = false
      }
    })

    return result
  }

  /**
   * 下载文件
   */
  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 获取数据类型的默认验证规则
   */
  static getDefaultValidationRules(dataType: ImportDataType): Record<string, ValidationRule> {
    const rulesMap: Record<ImportDataType, Record<string, ValidationRule>> = {
      spu: {
        code: { required: true, type: 'string', pattern: '^[A-Z0-9_]+$', unique: true },
        name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
        shortName: { type: 'string', maxLength: 50 },
        description: { type: 'string', maxLength: 500 },
        status: { type: 'string', enum: ['draft', 'active', 'inactive'] }
      },
      category: {
        code: { required: true, type: 'string', pattern: '^[A-Z0-9_]+$', unique: true },
        name: { required: true, type: 'string', minLength: 1, maxLength: 50 },
        level: { type: 'number', min: 1, max: 3 },
        status: { type: 'string', enum: ['active', 'inactive'] }
      },
      brand: {
        code: { required: true, type: 'string', pattern: '^[A-Z0-9_]+$', unique: true },
        name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'email' },
        phone: { type: 'string', pattern: '^1[3-9]\\d{9}$' },
        status: { type: 'string', enum: ['active', 'inactive'] }
      },
      attribute_template: {
        code: { required: true, type: 'string', pattern: '^[a-z][a-zA-Z0-9_]*$', unique: true },
        name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
        status: { type: 'string', enum: ['active', 'inactive'] }
      }
    }

    return rulesMap[dataType] || {}
  }

  // 私有方法

  private static readFileAsText(file: File, encoding: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file, encoding)
    })
  }

  private static parseCSVLine(line: string, config: FileProcessingConfig): string[] {
    const fields: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === config.quote) {
        if (inQuotes && nextChar === config.quote) {
          current += config.quote
          i += 2
          continue
        } else {
          inQuotes = !inQuotes
          i++
          continue
        }
      } else if (char === config.delimiter && !inQuotes) {
        fields.push(config.trimWhitespace ? current.trim() : current)
        current = ''
      } else {
        current += char
      }

      i++
    }

    fields.push(config.trimWhitespace ? current.trim() : current)
    return fields
  }

  private static escapeCSVFields(fields: string[], config: FileProcessingConfig): string[] {
    return fields.map(field => {
      if (field.includes(config.delimiter!) || field.includes(config.quote!) || field.includes('\n')) {
        return config.quote + field.replace(config.quote!, config.quote! + config.quote!) + config.quote
      }
      return field
    })
  }

  private static formatCSVValue(value: any, config: FileProcessingConfig): string {
    if (value === null || value === undefined) {
      return ''
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  private static parseCSVValue(value: string, config: FileProcessingConfig): any {
    const trimmed = config.trimWhitespace ? value.trim() : value

    // 尝试解析为数字
    if (/^-?\d+\.?\d*$/.test(trimmed)) {
      return Number(trimmed)
    }

    // 尝试解析为布尔值
    if (trimmed.toLowerCase() === 'true') return true
    if (trimmed.toLowerCase() === 'false') return false

    return trimmed
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private static validateType(value: any, type: string, field: string, row: number): ValidationError | ValidationWarning | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            row,
            field,
            value,
            message: `${field} 必须是文本`,
            type: 'format'
          }
        }
        break

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return {
            row,
            field,
            value,
            message: `${field} 必须是数字`,
            type: 'format'
          }
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            row,
            field,
            value,
            message: `${field} 必须是布尔值`,
            type: 'format'
          }
        }
        break

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          return {
            row,
            field,
            value,
            message: `${field} 必须是有效的邮箱地址`,
            type: 'format'
          }
        }
        break

      case 'url':
        try {
          new URL(String(value))
        } catch {
          return {
            row,
            field,
            value,
            message: `${field} 必须是有效的URL`,
            type: 'format'
          }
        }
        break

      case 'date':
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          return {
            row,
            field,
            value,
            message: `${field} 必须是有效的日期`,
            type: 'format'
          }
        }
        break
    }

    return null
  }

  private static generateMockData(): any[] {
    return [
      {
        code: 'SPU001',
        name: '测试商品1',
        status: 'active',
        price: 99.99
      },
      {
        code: 'SPU002',
        name: '测试商品2',
        status: 'inactive',
        price: 199.99
      }
    ]
  }
}