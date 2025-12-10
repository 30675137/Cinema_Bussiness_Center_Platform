import {
  Product,
  ProductStatus,
  AuditStatus,
  MaterialType,
  CreateProductData,
  UpdateProductData,
  ProductFilter,
  ProductListResponse
} from '../models/Product';
import { ProductAuditRecord, AuditAction } from '../models/ProductAuditRecord';

/**
 * 商品服务类
 */
export class ProductService {
  /**
   * 创建商品
   */
  async createProduct(data: CreateProductData, createdBy: string): Promise<Product> {
    try {
      // 生成SKU（如果没有提供）
      const sku = data.sku || await this.generateSKU(data.categoryId);

      // 创建商品数据
      const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> = {
        sku,
        name: data.name,
        categoryId: data.categoryId,
        brandId: data.brandId,
        unitId: data.unitId,
        materialType: data.materialType,
        status: ProductStatus.DRAFT,
        basePrice: data.basePrice,
        costPrice: data.costPrice,
        currentStock: data.currentStock || 0,
        safetyStock: data.safetyStock,
        barcode: data.barcode,
        description: data.description,
        specifications: data.specifications,
        content: data.content,
        auditStatus: AuditStatus.NONE,
        version: 1,
        metadata: data.metadata
      };

      // TODO: 实现数据库插入逻辑
      const newProduct = await this.saveProductToDatabase(product, createdBy);

      // 创建审核记录
      await this.createAuditRecord({
        productId: newProduct.id,
        action: AuditAction.CREATE,
        afterState: this.productToAuditState(newProduct),
        operatorId: createdBy
      });

      return newProduct;
    } catch (error) {
      console.error('创建商品失败:', error);
      throw new Error('创建商品失败');
    }
  }

  /**
   * 获取商品列表
   */
  async getProductList(filter: ProductFilter): Promise<ProductListResponse> {
    try {
      // TODO: 实现数据库查询逻辑
      const { page = 1, limit = 20, search, categoryId, status, materialType } = filter;

      // 构建查询条件
      const whereConditions = this.buildWhereConditions(filter);

      // 查询总数
      const total = await this.countProducts(whereConditions);

      // 查询数据
      const products = await this.findProducts(whereConditions, {
        page,
        limit,
        sortBy: filter.sortBy || 'updatedAt',
        sortOrder: filter.sortOrder || 'desc'
      });

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('获取商品列表失败:', error);
      throw new Error('获取商品列表失败');
    }
  }

  /**
   * 根据ID获取商品详情
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      // TODO: 实现数据库查询
      throw new Error('方法未实现');
    } catch (error) {
      console.error('获取商品详情失败:', error);
      throw new Error('获取商品详情失败');
    }
  }

  /**
   * 根据SKU获取商品
   */
  async getProductBySKU(sku: string): Promise<Product | null> {
    try {
      // TODO: 实现数据库查询
      throw new Error('方法未实现');
    } catch (error) {
      console.error('获取商品失败:', error);
      throw new Error('获取商品失败');
    }
  }

  /**
   * 更新商品
   */
  async updateProduct(id: string, data: UpdateProductData, updatedBy: string): Promise<Product> {
    try {
      // 获取原商品信息
      const originalProduct = await this.getProductById(id);
      if (!originalProduct) {
        throw new Error('商品不存在');
      }

      // 检查商品状态是否允许编辑
      if (!this.canEditProduct(originalProduct.status)) {
        throw new Error('当前状态不允许编辑商品');
      }

      // 更新商品信息
      const updatedProduct = await this.updateProductInDatabase(id, data, updatedBy);

      // 创建审核记录
      await this.createAuditRecord({
        productId: id,
        action: AuditAction.UPDATE,
        beforeState: this.productToAuditState(originalProduct),
        afterState: this.productToAuditState(updatedProduct),
        operatorId: updatedBy
      });

      return updatedProduct;
    } catch (error) {
      console.error('更新商品失败:', error);
      throw new Error('更新商品失败');
    }
  }

  /**
   * 提交审核
   */
  async submitForReview(productId: string, submittedBy: string): Promise<Product> {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      if (product.status !== ProductStatus.DRAFT && product.status !== ProductStatus.REJECTED) {
        throw new Error('只有草稿或被驳回的商品才能提交审核');
      }

      // 检查商品信息完整性
      await this.validateProductCompleteness(product);

      // 更新状态为待审核
      const updatedProduct = await this.updateProductStatus(productId, ProductStatus.PENDING_REVIEW, submittedBy);

      // 创建审核记录
      await this.createAuditRecord({
        productId,
        action: AuditAction.STATUS_CHANGE,
        beforeState: this.productToAuditState(product),
        afterState: this.productToAuditState(updatedProduct),
        reason: '提交审核',
        operatorId: submittedBy
      });

      return updatedProduct;
    } catch (error) {
      console.error('提交审核失败:', error);
      throw new Error('提交审核失败');
    }
  }

  /**
   * 审核商品
   */
  async reviewProduct(
    productId: string,
    approved: boolean,
    reason?: string,
    reviewedBy: string
  ): Promise<Product> {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      if (product.status !== ProductStatus.PENDING_REVIEW) {
        throw new Error('只有待审核的商品才能进行审核操作');
      }

      const newStatus = approved ? ProductStatus.PUBLISHED : ProductStatus.REJECTED;
      const updatedProduct = await this.updateProductStatus(productId, newStatus, reviewedBy);

      // 创建审核记录
      await this.createAuditRecord({
        productId,
        action: approved ? AuditAction.APPROVE : AuditAction.REJECT,
        beforeState: this.productToAuditState(product),
        afterState: this.productToAuditState(updatedProduct),
        reason,
        operatorId: reviewedBy
      });

      return updatedProduct;
    } catch (error) {
      console.error('审核商品失败:', error);
      throw new Error('审核商品失败');
    }
  }

  /**
   * 删除商品
   */
  async deleteProduct(id: string, deletedBy: string): Promise<void> {
    try {
      const product = await this.getProductById(id);
      if (!product) {
        throw new Error('商品不存在');
      }

      if (product.status === ProductStatus.PUBLISHED) {
        throw new Error('已发布的商品不能删除，请先下架');
      }

      // 软删除
      await this.softDeleteProduct(id, deletedBy);

      // 创建审核记录
      await this.createAuditRecord({
        productId: id,
        action: AuditAction.DELETE,
        beforeState: this.productToAuditState(product),
        operatorId: deletedBy
      });
    } catch (error) {
      console.error('删除商品失败:', error);
      throw new Error('删除商品失败');
    }
  }

  /**
   * 生成SKU
   */
  private async generateSKU(categoryId: string): Promise<string> {
    // TODO: 实现SKU生成逻辑
    // 例如：CAT + 时间戳 + 序列号
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SKU${timestamp}${random}`;
  }

  /**
   * 检查商品是否可以编辑
   */
  private canEditProduct(status: ProductStatus): boolean {
    return status === ProductStatus.DRAFT || status === ProductStatus.REJECTED;
  }

  /**
   * 验证商品信息完整性
   */
  private async validateProductCompleteness(product: Product): Promise<void> {
    const requiredFields = ['name', 'categoryId', 'unitId', 'basePrice'];
    for (const field of requiredFields) {
      if (!product[field as keyof Product]) {
        throw new Error(`${field}不能为空`);
      }
    }
  }

  /**
   * 将Product转换为ProductState
   */
  private productToAuditState(product: Product): any {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      status: product.status,
      auditStatus: product.auditStatus,
      basePrice: product.basePrice,
      costPrice: product.costPrice,
      currentStock: product.currentStock,
      categoryId: product.categoryId,
      brandId: product.brandId,
      unitId: product.unitId,
      materialType: product.materialType,
      barcode: product.barcode,
      description: product.description,
      version: product.version,
      publishedAt: product.publishedAt
    };
  }

  /**
   * 构建查询条件
   */
  private buildWhereConditions(filter: ProductFilter): any {
    // TODO: 实现查询条件构建逻辑
    return {};
  }

  // 以下为数据库操作方法，需要根据实际数据库实现
  private async saveProductToDatabase(product: any, createdBy: string): Promise<Product> {
    // TODO: 实现数据库插入
    throw new Error('方法未实现');
  }

  private async findProducts(conditions: any, options: any): Promise<Product[]> {
    // TODO: 实现数据库查询
    throw new Error('方法未实现');
  }

  private async countProducts(conditions: any): Promise<number> {
    // TODO: 实现数据库计数
    throw new Error('方法未实现');
  }

  private async updateProductInDatabase(id: string, data: any, updatedBy: string): Promise<Product> {
    // TODO: 实现数据库更新
    throw new Error('方法未实现');
  }

  private async updateProductStatus(id: string, status: ProductStatus, updatedBy: string): Promise<Product> {
    // TODO: 实现状态更新
    throw new Error('方法未实现');
  }

  private async softDeleteProduct(id: string, deletedBy: string): Promise<void> {
    // TODO: 实现软删除
    throw new Error('方法未实现');
  }

  private async createAuditRecord(data: any): Promise<void> {
    // TODO: 实现审核记录创建
    throw new Error('方法未实现');
  }
}

// 导出服务实例
export const productService = new ProductService();