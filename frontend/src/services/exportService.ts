import {
  ExportConfig,
  ExportTask,
  ExportFormat,
  ExportDataType,
  ExportResponse
} from '@/types/spu'
import { FileProcessor } from '@/utils/fileProcessing'
import { spuService } from './spuService'
import { categoryService } from './categoryService'
import { brandService } from './brandService'
import { attributeService } from './attributeService'

// 模拟导出任务存储
const mockExportTasks: ExportTask[] = []

/**
 * 导出服务类
 */
class ExportService {
  /**
   * 创建导出任务
   */
  async createExportTask(config: ExportConfig): Promise<ExportResponse> {
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500))

      // 获取数据
      let data: any[] = []
      switch (config.dataType) {
        case 'spu':
          data = await this.getSPUData(config.filters)
          break
        case 'category':
          data = await this.getCategoryData(config.filters)
          break
        case 'brand':
          data = await this.getBrandData(config.filters)
          break
        case 'attribute_template':
          data = await this.getAttributeTemplateData(config.filters)
          break
      }

      // 应用字段筛选
      if (config.fields && config.fields.length > 0) {
        data = data.map(item => {
          const filtered: any = {}
          config.fields!.forEach(field => {
            filtered[field] = this.getNestedValue(item, field)
          })
          return filtered
        })
      }

      // 创建导出任务
      const taskId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const fileName = `${config.dataType}_export_${Date.now()}.${config.format}`

      const task: ExportTask = {
        id: taskId,
        dataType: config.dataType,
        format: config.format,
        status: 'processing',
        totalRecords: data.length,
        processedRecords: 0,
        fileName,
        createdAt: new Date().toISOString()
      }

      mockExportTasks.push(task)

      // 模拟异步处理
      this.processExportTask(taskId, data, config)

      return {
        success: true,
        data: {
          taskId,
          fileName
        },
        message: '导出任务创建成功'
      }
    } catch (error) {
      console.error('Create export task error:', error)
      return {
        success: false,
        message: '创建导出任务失败'
      }
    }
  }

  /**
   * 获取导出任务
   */
  async getExportTask(taskId: string): Promise<ExportTask> {
    try {
      const task = mockExportTasks.find(t => t.id === taskId)
      if (!task) {
        throw new Error('导出任务不存在')
      }
      return task
    } catch (error) {
      console.error('Get export task error:', error)
      throw new Error('获取导出任务失败')
    }
  }

  /**
   * 获取导出任务列表
   */
  async getExportTasks(): Promise<ExportTask[]> {
    try {
      // 返回最近的任务，按创建时间倒序
      return [...mockExportTasks]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      console.error('Get export tasks error:', error)
      throw new Error('获取导出任务列表失败')
    }
  }

  /**
   * 删除导出任务
   */
  async deleteExportTask(taskId: string): Promise<void> {
    try {
      const index = mockExportTasks.findIndex(t => t.id === taskId)
      if (index === -1) {
        throw new Error('导出任务不存在')
      }
      mockExportTasks.splice(index, 1)
    } catch (error) {
      console.error('Delete export task error:', error)
      throw new Error('删除导出任务失败')
    }
  }

  /**
   * 下载导出文件
   */
  async downloadFile(taskId: string): Promise<string> {
    try {
      const task = await this.getExportTask(taskId)

      if (task.status !== 'completed' || !task.downloadUrl) {
        throw new Error('文件未准备好下载')
      }

      return task.downloadUrl
    } catch (error) {
      console.error('Download file error:', error)
      throw new Error('下载文件失败')
    }
  }

  /**
   * 获取导出统计数据
   */
  async getExportStats(): Promise<{
    totalTasks: number
    completedTasks: number
    failedTasks: number
    totalRecords: number
    byDataType: Record<ExportDataType, number>
    byFormat: Record<ExportFormat, number>
  }> {
    try {
      const stats = mockExportTasks.reduce((acc, task) => {
        acc.totalTasks++

        if (task.status === 'completed') {
          acc.completedTasks++
        } else if (task.status === 'failed') {
          acc.failedTasks++
        }

        acc.totalRecords += task.totalRecords

        // 按数据类型统计
        acc.byDataType[task.dataType] = (acc.byDataType[task.dataType] || 0) + 1

        // 按格式统计
        acc.byFormat[task.format] = (acc.byFormat[task.format] || 0) + 1

        return acc
      }, {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        totalRecords: 0,
        byDataType: {} as Record<ExportDataType, number>,
        byFormat: {} as Record<ExportFormat, number>
      })

      return stats
    } catch (error) {
      console.error('Get export stats error:', error)
      throw new Error('获取导出统计失败')
    }
  }

  /**
   * 处理导出任务（模拟异步处理）
   */
  private async processExportTask(taskId: string, data: any[], config: ExportConfig) {
    const task = mockExportTasks.find(t => t.id === taskId)
    if (!task) return

    try {
      // 模拟处理进度
      const updateProgress = (processed: number) => {
        const taskIndex = mockExportTasks.findIndex(t => t.id === taskId)
        if (taskIndex !== -1) {
          mockExportTasks[taskIndex].processedRecords = processed
        }
      }

      // 模拟分批处理
      const batchSize = config.pageSize || 1000
      const totalBatches = Math.ceil(data.length / batchSize)

      for (let i = 0; i < totalBatches; i++) {
        const startIndex = i * batchSize
        const endIndex = Math.min(startIndex + batchSize, data.length)
        const batchData = data.slice(startIndex, endIndex)

        // 模拟处理时间
        await new Promise(resolve => setTimeout(resolve, 1000))

        updateProgress(endIndex)
      }

      // 生成文件内容
      let fileContent = ''
      let mimeType = 'text/plain'

      if (config.format === 'csv') {
        const headers = Object.keys(data[0] || {})
        fileContent = FileProcessor.exportToCSV(data, headers, task.fileName)
        mimeType = 'text/csv'
      } else if (config.format === 'json') {
        fileContent = FileProcessor.exportToJSON(data, task.fileName)
        mimeType = 'application/json'
      } else if (config.format === 'xlsx') {
        // 模拟Excel文件URL
        const downloadUrl = `/api/download/${task.fileName}`
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileContent = downloadUrl
      }

      // 更新任务状态
      const taskIndex = mockExportTasks.findIndex(t => t.id === taskId)
      if (taskIndex !== -1) {
        mockExportTasks[taskIndex] = {
          ...mockExportTasks[taskIndex],
          status: 'completed',
          processedRecords: data.length,
          downloadUrl: fileContent,
          completedAt: new Date().toISOString()
        }
      }

      // 触发文件下载（仅用于CSV和JSON）
      if (config.format !== 'xlsx') {
        setTimeout(() => {
          FileProcessor.downloadFile(fileContent, task.fileName!, mimeType)
        }, 1000)
      }
    } catch (error) {
      console.error('Process export task error:', error)

      // 更新任务状态为失败
      const taskIndex = mockExportTasks.findIndex(t => t.id === taskId)
      if (taskIndex !== -1) {
        mockExportTasks[taskIndex] = {
          ...mockExportTasks[taskIndex],
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : '处理失败',
          completedAt: new Date().toISOString()
        }
      }
    }
  }

  /**
   * 获取SPU数据
   */
  private async getSPUData(filters?: Record<string, any>): Promise<any[]> {
    try {
      const response = await spuService.getSPUList({
        page: 1,
        pageSize: 10000, // 获取所有数据
        keyword: filters?.keyword,
        status: filters?.status
      })

      if (response.success && response.data?.list) {
        return response.data.list.map(spu => ({
          ...spu,
          categoryName: spu.category?.name || '',
          brandName: spu.brand?.name || '',
          priceMin: spu.priceRange?.min || 0,
          priceMax: spu.priceRange?.max || 0,
          totalStock: spu.inventory?.totalStock || 0
        }))
      }

      return []
    } catch (error) {
      console.error('Get SPU data error:', error)
      return []
    }
  }

  /**
   * 获取分类数据
   */
  private async getCategoryData(filters?: Record<string, any>): Promise<any[]> {
    try {
      const response = await categoryService.getCategoryList({
        page: 1,
        pageSize: 1000
      })

      if (response.success && response.data?.list) {
        return response.data.list.map(category => ({
          ...category,
          parentName: category.parentId ? '父分类' : '根分类',
          levelName: `L${category.level}`,
          pathName: category.path?.join(' > ') || ''
        }))
      }

      return []
    } catch (error) {
      console.error('Get category data error:', error)
      return []
    }
  }

  /**
   * 获取品牌数据
   */
  private async getBrandData(filters?: Record<string, any>): Promise<any[]> {
    try {
      const response = await brandService.getBrandList({
        page: 1,
        pageSize: 1000
      })

      if (response.success && response.data?.list) {
        return response.data.list
      }

      return []
    } catch (error) {
      console.error('Get brand data error:', error)
      return []
    }
  }

  /**
   * 获取属性模板数据
   */
  private async getAttributeTemplateData(filters?: Record<string, any>): Promise<any[]> {
    try {
      const response = await attributeService.getTemplateList({
        page: 1,
        pageSize: 1000
      })

      if (response.success && response.data?.list) {
        return response.data.list.map(template => ({
          ...template,
          attributeCount: template.attributes.length,
          requiredAttributeCount: template.attributes.filter(attr => attr.required).length
        }))
      }

      return []
    } catch (error) {
      console.error('Get attribute template data error:', error)
      return []
    }
  }

  /**
   * 获取嵌套属性值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * 获取默认字段配置
   */
  static getDefaultFields(dataType: ExportDataType): string[] {
    const fieldsMap: Record<ExportDataType, string[]> = {
      spu: [
        'id', 'code', 'name', 'shortName', 'description', 'unit',
        'brandId', 'brandName', 'categoryId', 'categoryName',
        'status', 'skuCount', 'priceMin', 'priceMax', 'totalStock',
        'createdAt', 'updatedAt'
      ],
      category: [
        'id', 'code', 'name', 'description', 'parentId', 'parentName',
        'level', 'levelName', 'path', 'pathName', 'status',
        'sort', 'createdAt', 'updatedAt'
      ],
      brand: [
        'id', 'code', 'name', 'description', 'logo', 'contactPerson',
        'phone', 'email', 'website', 'status', 'createdAt', 'updatedAt'
      ],
      attribute_template: [
        'id', 'code', 'name', 'description', 'categoryId', 'status',
        'isSystem', 'attributeCount', 'requiredAttributeCount',
        'createdAt', 'updatedAt'
      ]
    }

    return fieldsMap[dataType] || []
  }

  /**
   * 获取导出模板配置
   */
  static getExportTemplate(dataType: ExportDataType): {
    name: string
    description: string
    fields: Array<{
      key: string
      title: string
      description: string
      required: boolean
    }>
  } {
    const templates: Record<ExportDataType, any> = {
      spu: {
        name: 'SPU商品数据',
        description: '包含商品基础信息、品牌、分类、库存等完整数据',
        fields: [
          { key: 'code', title: '商品编码', description: '唯一标识码', required: true },
          { key: 'name', title: '商品名称', description: '商品显示名称', required: true },
          { key: 'shortName', title: '商品简称', description: '商品简称', required: false },
          { key: 'brandName', title: '品牌名称', description: '所属品牌', required: false },
          { key: 'categoryName', title: '分类名称', description: '所属分类', required: false },
          { key: 'status', title: '状态', description: '商品状态', required: false },
          { key: 'skuCount', title: 'SKU数量', description: '关联SKU数量', required: false },
          { key: 'priceMin', title: '最低价格', description: '价格区间下限', required: false },
          { key: 'priceMax', title: '最高价格', description: '价格区间上限', required: false }
        ]
      },
      category: {
        name: '商品分类数据',
        description: '包含分类基础信息和层级关系',
        fields: [
          { key: 'code', title: '分类编码', description: '分类唯一编码', required: true },
          { key: 'name', title: '分类名称', description: '分类显示名称', required: true },
          { key: 'level', title: '分类级别', description: '分类层级', required: false },
          { key: 'parentName', title: '父分类', description: '上级分类名称', required: false },
          { key: 'status', title: '状态', description: '分类状态', required: false }
        ]
      },
      brand: {
        name: '商品品牌数据',
        description: '包含品牌基础信息和联系方式',
        fields: [
          { key: 'code', title: '品牌编码', description: '品牌唯一编码', required: true },
          { key: 'name', title: '品牌名称', description: '品牌显示名称', required: true },
          { key: 'contactPerson', title: '联系人', description: '品牌联系人', required: false },
          { key: 'phone', title: '联系电话', description: '联系电话', required: false },
          { key: 'email', title: '邮箱', description: '联系邮箱', required: false },
          { key: 'website', title: '官网', description: '官方网站', required: false },
          { key: 'status', title: '状态', description: '品牌状态', required: false }
        ]
      },
      attribute_template: {
        name: '属性模板数据',
        description: '包含属性模板基础信息和属性数量',
        fields: [
          { key: 'code', title: '模板编码', description: '模板唯一编码', required: true },
          { key: 'name', title: '模板名称', description: '模板显示名称', required: true },
          { key: 'description', title: '描述', description: '模板描述', required: false },
          { key: 'status', title: '状态', description: '模板状态', required: false },
          { key: 'attributeCount', title: '属性数量', description: '包含的属性数量', required: false },
          { key: 'requiredAttributeCount', title: '必填属性数量', description: '必填属性数量', required: false }
        ]
      }
    }

    return templates[dataType] || templates.spu
  }
}

// 创建服务实例
export const exportService = new ExportService()