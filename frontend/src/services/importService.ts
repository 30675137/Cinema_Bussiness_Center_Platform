import {
  ImportConfig,
  ImportTask,
  ImportFormat,
  ImportDataType,
  ImportResponse,
  ImportError,
  ImportWarning,
} from '@/types/spu';
import { FileProcessor } from '@/utils/fileProcessing';
import { spuService } from './spuService';
import { categoryService } from './categoryService';
import { brandService } from './brandService';
import { attributeService } from './attributeService';

// 模拟导入任务存储
const mockImportTasks: ImportTask[] = [];

/**
 * 导入服务类
 */
class ImportService {
  /**
   * 创建导入任务
   */
  async createImportTask(config: ImportConfig): Promise<ImportResponse> {
    try {
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 创建导入任务
      const taskId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const task: ImportTask = {
        id: taskId,
        dataType: config.dataType,
        format: config.format,
        status: 'validating',
        totalRows: 0,
        processedRows: 0,
        successCount: 0,
        errorCount: 0,
        filePath: config.filePath,
        fileName: `import_file_${Date.now()}.${config.format}`,
        createdAt: new Date().toISOString(),
      };

      mockImportTasks.push(task);

      // 模拟验证和导入处理
      this.processImportTask(taskId, config);

      return {
        success: true,
        data: {
          taskId,
        },
        message: '导入任务创建成功',
      };
    } catch (error) {
      console.error('Create import task error:', error);
      return {
        success: false,
        message: '创建导入任务失败',
      };
    }
  }

  /**
   * 验证导入文件
   */
  async validateFile(config: ImportConfig): Promise<ImportResponse> {
    try {
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 模拟文件解析
      let validationResult;
      if (config.format === 'csv') {
        // 模拟CSV解析
        validationResult = {
          isValid: true,
          errors: [],
          warnings: [],
          totalRows: 100,
          validRows: 98,
          invalidRows: 2,
        };
      } else if (config.format === 'xlsx') {
        // 模拟Excel解析
        validationResult = {
          isValid: true,
          errors: [],
          warnings: [],
          totalRows: 150,
          validRows: 148,
          invalidRows: 2,
        };
      } else {
        throw new Error('不支持的文件格式');
      }

      // 添加一些模拟的验证错误（如果需要演示）
      if (Math.random() < 0.2) {
        // 20%概率添加错误
        validationResult.errors.push({
          row: 5,
          column: 'code',
          value: 'INVALID_CODE',
          message: '编码格式不正确，只能包含大写字母、数字和下划线',
          field: 'code',
        });
        validationResult.invalidRows++;
        validationResult.validRows--;
        validationResult.isValid = false;
      }

      return {
        success: true,
        data: {
          taskId: `validate_${Date.now()}`,
          validationResult,
        },
        message: '文件验证完成',
      };
    } catch (error) {
      console.error('Validate file error:', error);
      return {
        success: false,
        message: '文件验证失败',
      };
    }
  }

  /**
   * 获取导入任务
   */
  async getImportTask(taskId: string): Promise<ImportTask> {
    try {
      const task = mockImportTasks.find((t) => t.id === taskId);
      if (!task) {
        throw new Error('导入任务不存在');
      }
      return task;
    } catch (error) {
      console.error('Get import task error:', error);
      throw new Error('获取导入任务失败');
    }
  }

  /**
   * 获取导入任务列表
   */
  async getImportTasks(): Promise<ImportTask[]> {
    try {
      // 返回最近的任务，按创建时间倒序
      return [...mockImportTasks].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Get import tasks error:', error);
      throw new Error('获取导入任务列表失败');
    }
  }

  /**
   * 删除导入任务
   */
  async deleteImportTask(taskId: string): Promise<void> {
    try {
      const index = mockImportTasks.findIndex((t) => t.id === taskId);
      if (index === -1) {
        throw new Error('导入任务不存在');
      }
      mockImportTasks.splice(index, 1);
    } catch (error) {
      console.error('Delete import task error:', error);
      throw new Error('删除导入任务失败');
    }
  }

  /**
   * 获取导入统计数据
   */
  async getImportStats(): Promise<{
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    totalRows: number;
    successCount: number;
    errorCount: number;
    byDataType: Record<ImportDataType, number>;
    byFormat: Record<ImportFormat, number>;
  }> {
    try {
      const stats = mockImportTasks.reduce(
        (acc, task) => {
          acc.totalTasks++;

          if (task.status === 'completed') {
            acc.completedTasks++;
            acc.successCount += task.successCount;
            acc.errorCount += task.errorCount;
          } else if (task.status === 'failed') {
            acc.failedTasks++;
          }

          acc.totalRows += task.totalRows;

          // 按数据类型统计
          acc.byDataType[task.dataType] = (acc.byDataType[task.dataType] || 0) + 1;

          // 按格式统计
          acc.byFormat[task.format] = (acc.byFormat[task.format] || 0) + 1;

          return acc;
        },
        {
          totalTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
          totalRows: 0,
          successCount: 0,
          errorCount: 0,
          byDataType: {} as Record<ImportDataType, number>,
          byFormat: {} as Record<ImportFormat, number>,
        }
      );

      return stats;
    } catch (error) {
      console.error('Get import stats error:', error);
      throw new Error('获取导入统计失败');
    }
  }

  /**
   * 下载导入模板
   */
  async downloadTemplate(dataType: ImportDataType): Promise<void> {
    try {
      const templateData = this.generateTemplateData(dataType);
      const csvContent = FileProcessor.exportToCSV(
        templateData,
        Object.keys(templateData[0] || []),
        `${dataType}_template.csv`
      );

      FileProcessor.downloadFile(csvContent, `${dataType}_template.csv`, 'text/csv');
    } catch (error) {
      console.error('Download template error:', error);
      throw new Error('下载模板失败');
    }
  }

  /**
   * 处理导入任务（模拟异步处理）
   */
  private async processImportTask(taskId: string, config: ImportConfig) {
    const task = mockImportTasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      // 更新任务状态为验证中
      this.updateTaskStatus(taskId, 'validating');

      // 模拟验证阶段
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 解析文件并获取数据
      const fileData = await this.parseFile(config);

      // 验证数据
      const validationRules = FileProcessor.getDefaultValidationRules(config.dataType);
      const validationResult = FileProcessor.validateImportData(
        fileData,
        config.dataType,
        validationRules
      );

      // 更新总行数
      const taskIndex = mockImportTasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        mockImportTasks[taskIndex].totalRows = validationResult.summary.totalRows;
        mockImportTasks[taskIndex].processedRows = 0;
        mockImportTasks[taskIndex].successCount = validationResult.summary.validRows;
        mockImportTasks[taskIndex].errorCount = validationResult.summary.invalidRows;
      }

      if (!validationResult.isValid) {
        // 验证失败，更新任务状态
        this.updateTaskStatus(taskId, 'failed');
        const errorTask = mockImportTasks.find((t) => t.id === taskId);
        if (errorTask) {
          errorTask.errors = validationResult.errors.map((error) => ({
            row: error.row,
            column: error.field || 'unknown',
            value: error.value,
            message: error.message,
            field: error.field,
          }));
          errorTask.completedAt = new Date().toISOString();
        }
        return;
      }

      // 更新任务状态为导入中
      this.updateTaskStatus(taskId, 'importing');

      // 模拟分批导入
      const batchSize = config.options?.batchSize || 100;
      const totalBatches = Math.ceil(fileData.length / batchSize);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < totalBatches; i++) {
        const startIndex = i * batchSize;
        const endIndex = Math.min(startIndex + batchSize, fileData.length);
        const batchData = fileData.slice(startIndex, endIndex);

        // 模拟处理每批数据
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          // 调用相应的服务创建数据
          await this.importData(config.dataType, batchData);
          successCount += batchData.length;

          // 更新进度
          const currentTask = mockImportTasks.find((t) => t.id === taskId);
          if (currentTask) {
            currentTask.processedRows = endIndex;
            currentTask.successCount = successCount;
          }
        } catch (error) {
          console.error('Import batch error:', error);
          errorCount += batchData.length;

          // 更新进度
          const currentTask = mockImportTasks.find((t) => t.id === taskId);
          if (currentTask) {
            currentTask.processedRows = endIndex;
            currentTask.errorCount = errorCount;
          }
        }
      }

      // 更新任务状态为完成
      this.updateTaskStatus(taskId, 'completed');

      const finalTask = mockImportTasks.find((t) => t.id === taskId);
      if (finalTask) {
        finalTask.successCount = successCount;
        finalTask.errorCount = errorCount;
        finalTask.completedAt = new Date().toISOString();
      }
    } catch (error) {
      console.error('Process import task error:', error);

      // 更新任务状态为失败
      this.updateTaskStatus(taskId, 'failed');
      const errorTask = mockImportTasks.find((t) => t.id === taskId);
      if (errorTask) {
        errorTask.errorMessage = error instanceof Error ? error.message : '处理失败';
        errorTask.completedAt = new Date().toISOString();
      }
    }
  }

  /**
   * 更新任务状态
   */
  private updateTaskStatus(taskId: string, status: ImportTask['status']) {
    const taskIndex = mockImportTasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      mockImportTasks[taskIndex].status = status;
    }
  }

  /**
   * 解析文件（模拟）
   */
  private async parseFile(config: ImportConfig): Promise<any[]> {
    // 在实际应用中，这里会使用真实的文件解析
    // 这里返回模拟数据
    return this.generateMockData(config.dataType);
  }

  /**
   * 导入数据
   */
  private async importData(dataType: ImportDataType, data: any[]): Promise<void> {
    switch (dataType) {
      case 'spu':
        // 模拟SPU导入
        for (const item of data) {
          await this.importSPUItem(item);
        }
        break;
      case 'category':
        // 模拟分类导入
        for (const item of data) {
          await this.importCategoryItem(item);
        }
        break;
      case 'brand':
        // 模拟品牌导入
        for (const item of data) {
          await this.importBrandItem(item);
        }
        break;
      case 'attribute_template':
        // 模拟属性模板导入
        for (const item of data) {
          await this.importAttributeTemplateItem(item);
        }
        break;
      default:
        throw new Error(`不支持的数据类型: ${dataType}`);
    }
  }

  /**
   * 导入SPU项
   */
  private async importSPUItem(item: any): Promise<void> {
    // 模拟SPU创建逻辑
    const spuData = {
      name: item.name,
      code: item.code,
      shortName: item.shortName,
      description: item.description,
      unit: item.unit,
      status: item.status || 'draft',
    };

    // 这里会调用实际的API
    console.log('Importing SPU:', spuData);
  }

  /**
   * 导入分类项
   */
  private async importCategoryItem(item: any): Promise<void> {
    // 模拟分类创建逻辑
    const categoryData = {
      name: item.name,
      code: item.code,
      level: item.level || 1,
      status: item.status || 'active',
    };

    console.log('Importing Category:', categoryData);
  }

  /**
   * 导入品牌项
   */
  private async importBrandItem(item: any): Promise<void> {
    // 模拟品牌创建逻辑
    const brandData = {
      name: item.name,
      code: item.code,
      description: item.description,
      contactPerson: item.contactPerson,
      phone: item.phone,
      email: item.email,
      website: item.website,
      status: item.status || 'active',
    };

    console.log('Importing Brand:', brandData);
  }

  /**
   * 导入属性模板项
   */
  private async importAttributeTemplateItem(item: any): Promise<void> {
    // 模拟属性模板创建逻辑
    const templateData = {
      name: item.name,
      code: item.code,
      description: item.description,
      status: item.status || 'active',
    };

    console.log('Importing Attribute Template:', templateData);
  }

  /**
   * 生成模板数据
   */
  private generateTemplateData(dataType: ImportDataType): any[] {
    const templates: Record<ImportDataType, any[]> = {
      spu: [
        {
          code: 'DEMO001',
          name: '示例商品名称',
          shortName: '示例商品',
          brandCode: 'DEMO_BRAND',
          categoryName: '示例分类',
          status: 'active',
        },
      ],
      category: [
        {
          code: 'DEMO_CAT_001',
          name: '示例分类',
          level: 1,
          status: 'active',
        },
      ],
      brand: [
        {
          code: 'DEMO_BRAND_001',
          name: '示例品牌',
          contactPerson: '张三',
          phone: '13800138000',
          email: 'demo@example.com',
          website: 'https://demo.example.com',
          status: 'active',
        },
      ],
      attribute_template: [
        {
          code: 'demo_template_001',
          name: '示例属性模板',
          description: '这是一个示例属性模板',
          status: 'active',
        },
      ],
    };

    return templates[dataType] || [];
  }

  /**
   * 生成模拟数据
   */
  private generateMockData(dataType: ImportDataType): any[] {
    const dataMap: Record<ImportDataType, any[]> = {
      spu: [
        {
          code: 'SPU001',
          name: '示例商品1',
          shortName: '商品1',
          brandCode: 'BRAND001',
          categoryName: '电子产品',
          status: 'active',
        },
        {
          code: 'SPU002',
          name: '示例商品2',
          shortName: '商品2',
          brandCode: 'BRAND002',
          categoryName: '服装',
          status: 'draft',
        },
        {
          code: 'SPU003',
          name: '示例商品3',
          shortName: '商品3',
          brandCode: 'BRAND001',
          categoryName: '家居用品',
          status: 'active',
        },
      ],
      category: [
        {
          code: 'CAT001',
          name: '电子产品',
          level: 1,
          status: 'active',
        },
        {
          code: 'CAT002',
          name: '服装',
          level: 1,
          status: 'active',
        },
        {
          code: 'CAT003',
          name: '家居用品',
          level: 1,
          status: 'active',
        },
      ],
      brand: [
        {
          code: 'BRAND001',
          name: '示例品牌1',
          contactPerson: '张三',
          phone: '13800138000',
          email: 'brand1@example.com',
          website: 'https://brand1.com',
          status: 'active',
        },
        {
          code: 'BRAND002',
          name: '示例品牌2',
          contactPerson: '李四',
          phone: '13800138001',
          email: 'brand2@example.com',
          website: 'https://brand2.com',
          status: 'active',
        },
      ],
      attribute_template: [
        {
          code: 'TEMPLATE_001',
          name: '基础属性模板',
          description: '包含基础属性的模板',
          status: 'active',
        },
        {
          code: 'TEMPLATE_002',
          name: '扩展属性模板',
          description: '包含扩展属性的模板',
          status: 'active',
        },
      ],
    };

    return dataMap[dataType] || [];
  }
}

// 创建服务实例
export const importService = new ImportService();
