/**
 * 类目管理功能工具函数
 * 提供类目操作相关的通用工具方法和业务逻辑函数
 * 包含数据转换、验证、格式化、树结构操作等功能
 */

// 移除导入以避免模块导入问题
// import {
//   CategoryTreeNode,
//   CategoryStatus,
//   ValidationRule
// } from '../pages/mdm-pim/category/types/category.types';

// 临时定义以避免模块导入问题
type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select';
type CategoryLevel = 1 | 2 | 3;
type CategoryStatus = 'enabled' | 'disabled';
type Category = {
  id: string;
  name: string;
  code?: string;
  level: CategoryLevel;
  parentId?: string;
  sortOrder?: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};
type CategoryTreeNode = Category & {
  children?: CategoryTreeNode[];
  path: string;
  isLeaf: boolean;
};
type ValidationRule = {
  type: 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  value: string | number;
  message: string;
};
type CategoryAttribute = {
  id: string;
  name: string;
  type: AttributeType;
  required: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder: number;
  validation?: any[];
  createdAt: string;
  updatedAt: string;
};

/**
 * 类目树结构相关工具函数
 */
export class CategoryTreeUtils {
  /**
   * 将扁平的类目列表转换为树结构
   * @param categories 扁平的类目列表
   * @param parentId 父类目ID，默认为根节点
   * @returns 树结构的类目节点列表
   */
  static buildTree(categories: Category[], parentId?: string): CategoryTreeNode[] {
    const children = categories
      .filter(category => category.parentId === parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return children.map(category => ({
      ...category,
      path: this.buildPath(category, categories),
      isLeaf: !categories.some(cat => cat.parentId === category.id),
      children: this.buildTree(categories, category.id)
    }));
  }

  /**
   * 构建类目的完整路径
   * @param category 当前类目
   * @param allCategories 所有类目列表
   * @returns 类目路径字符串
   */
  static buildPath(category: Category, allCategories: Category[]): string {
    if (!category.parentId) return category.name;

    const parent = allCategories.find(cat => cat.id === category.parentId);
    if (!parent) return category.name;

    const parentPath = this.buildPath(parent, allCategories);
    return `${parentPath} > ${category.name}`;
  }

  /**
   * 在树中查找指定ID的节点
   * @param tree 树结构
   * @param id 节点ID
   * @returns 找到的节点或null
   */
  static findNodeById(tree: CategoryTreeNode[], id: string): CategoryTreeNode | null {
    for (const node of tree) {
      if (node.id === id) return node;

      if (node.children) {
        const found = this.findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * 获取节点的所有父节点ID路径
   * @param tree 树结构
   * @param nodeId 节点ID
   * @returns 父节点ID数组
   */
  static getParentPath(tree: CategoryTreeNode[], nodeId: string): string[] {
    const node = this.findNodeById(tree, nodeId);
    if (!node) return [];

    const path: string[] = [];
    const findParent = (nodes: CategoryTreeNode[], targetId: string, currentPath: string[] = []): string[] | null => {
      for (const n of nodes) {
        if (n.id === targetId) return currentPath;

        if (n.children) {
          const result = findParent(n.children, targetId, [...currentPath, n.id]);
          if (result) return result;
        }
      }
      return null;
    };

    const parentPath = findParent(tree, nodeId);
    return parentPath || [];
  }

  /**
   * 根据关键词过滤树结构
   * @param tree 树结构
   * @param keyword 搜索关键词
   * @returns 过滤后的树结构
   */
  static filterTreeByKeyword(tree: CategoryTreeNode[], keyword: string): CategoryTreeNode[] {
    if (!keyword.trim()) return tree;

    const lowerKeyword = keyword.toLowerCase();

    const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null => {
      const nameMatches = node.name.toLowerCase().includes(lowerKeyword);
      const filteredChildren = node.children
        ? node.children.map(filterNode).filter(Boolean) as CategoryTreeNode[]
        : [];

      if (nameMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren
        };
      }

      return null;
    };

    return tree.map(filterNode).filter(Boolean) as CategoryTreeNode[];
  }

  /**
   * 获取树中所有节点的展开键（用于Ant Design Tree组件）
   * @param tree 树结构
   * @returns 需要展开的节点键数组
   */
  static getExpandedKeys(tree: CategoryTreeNode[], keyword?: string): string[] {
    const keys: string[] = [];

    const collectKeys = (nodes: CategoryTreeNode[], hasSearchMatch = false) => {
      nodes.forEach(node => {
        const isSearchMatch = keyword && node.name.toLowerCase().includes(keyword.toLowerCase());
        const shouldExpand = hasSearchMatch || isSearchMatch || (node.children && node.children.length > 0);

        if (shouldExpand) {
          keys.push(node.id);
        }

        if (node.children) {
          collectKeys(node.children, hasSearchMatch || isSearchMatch);
        }
      });
    };

    collectKeys(tree, false);
    return keys;
  }

  /**
   * 计算树节点总数
   * @param tree 树结构
   * @returns 节点总数
   */
  static countNodes(tree: CategoryTreeNode[]): number {
    return tree.reduce((total, node) => {
      return total + 1 + (node.children ? this.countNodes(node.children) : 0);
    }, 0);
  }
}

/**
 * 类目验证工具函数
 */
export class CategoryValidationUtils {
  /**
   * 验证类目名称是否有效
   * @param name 类目名称
   * @returns 验证结果
   */
  static validateCategoryName(name: string): { isValid: boolean; message?: string } {
    if (!name || name.trim() === '') {
      return { isValid: false, message: '类目名称不能为空' };
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return { isValid: false, message: '类目名称至少需要2个字符' };
    }

    if (trimmedName.length > 50) {
      return { isValid: false, message: '类目名称不能超过50个字符' };
    }

    // 只允许中文、英文、数字、连字符、下划线、斜杠
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9\-_\/\s]+$/;
    if (!nameRegex.test(trimmedName)) {
      return { isValid: false, message: '类目名称只能包含中文、英文、数字、连字符、下划线和斜杠' };
    }

    return { isValid: true };
  }

  /**
   * 验证排序序号是否有效
   * @param sortOrder 排序序号
   * @returns 验证结果
   */
  static validateSortOrder(sortOrder?: number): { isValid: boolean; message?: string } {
    if (sortOrder !== undefined && sortOrder !== null) {
      if (!Number.isInteger(sortOrder)) {
        return { isValid: false, message: '排序序号必须为整数' };
      }

      if (sortOrder < 0) {
        return { isValid: false, message: '排序序号不能为负数' };
      }

      if (sortOrder > 999999) {
        return { isValid: false, message: '排序序号不能大于999999' };
      }
    }

    return { isValid: true };
  }

  /**
   * 检查同级类目中是否存在重复名称
   * @param name 要检查的名称
   * @param parentId 父类目ID
   * @param categories 所有类目列表
   * @param excludeId 排除的类目ID（用于编辑时检查）
   * @returns 是否存在重复
   */
  static isNameDuplicate(
    name: string,
    parentId: string | undefined,
    categories: Category[],
    excludeId?: string
  ): boolean {
    const siblings = categories.filter(cat =>
      cat.parentId === parentId && cat.id !== excludeId
    );

    return siblings.some(cat => cat.name.trim() === name.trim());
  }

  /**
   * 验证类目层级是否有效
   * @param level 类目层级
   * @param parentId 父类目ID
   * @param categories 所有类目列表
   * @returns 验证结果
   */
  static validateCategoryLevel(
    level: CategoryLevel,
    parentId: string | undefined,
    categories: Category[]
  ): { isValid: boolean; message?: string } {
    if (level < 1 || level > 3) {
      return { isValid: false, message: '类目层级只能为1、2或3' };
    }

    if (level === 1 && parentId) {
      return { isValid: false, message: '一级类目不能有父类目' };
    }

    if (level > 1 && !parentId) {
      return { isValid: false, message: '二级和三级类目必须有父类目' };
    }

    if (parentId && level > 1) {
      const parent = categories.find(cat => cat.id === parentId);
      if (!parent) {
        return { isValid: false, message: '父类目不存在' };
      }

      const expectedLevel = (parent.level + 1) as CategoryLevel;
      if (level !== expectedLevel) {
        return { isValid: false, message: `父类目为${parent.level}级，子类目必须为${expectedLevel}级` };
      }
    }

    return { isValid: true };
  }
}

/**
 * 属性模板工具函数
 */
export class AttributeUtils {
  /**
   * 验证属性名称是否有效
   * @param name 属性名称
   * @returns 验证结果
   */
  static validateAttributeName(name: string): { isValid: boolean; message?: string } {
    if (!name || name.trim() === '') {
      return { isValid: false, message: '属性名称不能为空' };
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return { isValid: false, message: '属性名称至少需要2个字符' };
    }

    if (trimmedName.length > 30) {
      return { isValid: false, message: '属性名称不能超过30个字符' };
    }

    // 只允许中文、英文、数字、连字符、下划线
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9\-_\s]+$/;
    if (!nameRegex.test(trimmedName)) {
      return { isValid: false, message: '属性名称只能包含中文、英文、数字、连字符和下划线' };
    }

    return { isValid: true };
  }

  /**
   * 验证属性类型是否需要可选值
   * @param type 属性类型
   * @param optionalValues 可选值列表
   * @returns 验证结果
   */
  static validateOptionalValues(
    type: AttributeType,
    optionalValues?: string[]
  ): { isValid: boolean; message?: string } {
    const isSelectType = type === 'single-select' || type === 'multi-select';

    if (isSelectType && (!optionalValues || optionalValues.length === 0)) {
      return { isValid: false, message: '选择类型属性必须提供可选值' };
    }

    if (optionalValues) {
      if (optionalValues.length > 100) {
        return { isValid: false, message: '可选值数量不能超过100个' };
      }

      for (const value of optionalValues) {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
          return { isValid: false, message: '可选值不能为空' };
        }

        if (trimmedValue.length > 50) {
          return { isValid: false, message: '可选值长度不能超过50个字符' };
        }
      }

      // 检查重复值
      const uniqueValues = [...new Set(optionalValues.map(v => v.trim()))];
      if (uniqueValues.length !== optionalValues.length) {
        return { isValid: false, message: '可选值不能重复' };
      }
    }

    return { isValid: true };
  }

  /**
   * 获取属性类型的显示文本
   * @param type 属性类型
   * @returns 显示文本
   */
  static getAttributeTypeLabel(type: AttributeType): string {
    const typeLabels: Record<AttributeType, string> = {
      'text': '文本',
      'number': '数字',
      'single-select': '单选',
      'multi-select': '多选'
    };

    return typeLabels[type] || type;
  }

  /**
   * 检查属性模板中是否存在重复名称
   * @param name 要检查的名称
   * @param attributes 属性列表
   * @param excludeIndex 排除的属性索引（用于编辑时检查）
   * @returns 是否存在重复
   */
  static isAttributeNameDuplicate(
    name: string,
    attributes: CategoryAttribute[],
    excludeIndex?: number
  ): boolean {
    return attributes.some((attr, index) =>
      attr.name.trim() === name.trim() && index !== excludeIndex
    );
  }

  /**
   * 对属性列表按排序序号进行排序
   * @param attributes 属性列表
   * @returns 排序后的属性列表
   */
  static sortAttributes(attributes: CategoryAttribute[]): CategoryAttribute[] {
    return [...attributes].sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

/**
 * 数据格式化工具函数
 */
export class CategoryFormatUtils {
  /**
   * 格式化类目层级显示文本
   * @param level 类目层级
   * @returns 格式化文本
   */
  static formatLevel(level: CategoryLevel): string {
    const levelLabels: Record<CategoryLevel, string> = {
      1: '一级类目',
      2: '二级类目',
      3: '三级类目'
    };

    return levelLabels[level] || `第${level}级类目`;
  }

  /**
   * 格式化类目状态显示文本
   * @param status 类目状态
   * @returns 格式化文本
   */
  static formatStatus(status: CategoryStatus): string {
    const statusLabels: Record<CategoryStatus, string> = {
      'enabled': '启用',
      'disabled': '停用'
    };

    return statusLabels[status] || status;
  }

  /**
   * 格式化日期时间
   * @param dateString 日期字符串
   * @returns 格式化后的日期时间
   */
  static formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * 格式化日期（不包含时间）
   * @param dateString 日期字符串
   * @returns 格式化后的日期
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * 截断文本并添加省略号
   * @param text 原始文本
   * @param maxLength 最大长度
   * @returns 截断后的文本
   */
  static truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}

/**
 * 类目删除验证工具函数
 */
export class CategoryDeletionUtils {
  /**
   * 检查类目是否可以删除
   * @param category 要删除的类目
   * @param allCategories 所有类目列表
   * @returns 验证结果
   */
  static async canDeleteCategory(
    category: Category,
    allCategories: Category[]
  ): Promise<{
    canDelete: boolean;
    reasons: string[];
    warnings: string[];
  }> {
    const reasons: string[] = [];
    const warnings: string[] = [];

    // 1. 检查是否有子类目
    const childIds = CategoryTransformUtils.getAllChildIds(category.id, allCategories);
    if (childIds.length > 0) {
      reasons.push(`该类目下还有 ${childIds.length} 个子类目，请先删除所有子类目`);
    }

    // 2. 检查是否被SPU使用（模拟API调用）
    try {
      const spuUsage = await this.checkSpuUsage(category.id);
      if (spuUsage.isUsed) {
        reasons.push(`该类目已被 ${spuUsage.count} 个商品SPU使用，无法删除`);
      }
    } catch (error) {
      console.error('检查SPU使用情况失败:', error);
      reasons.push('无法检查商品使用情况，请稍后重试');
    }

    // 3. 检查是否为系统类目（模拟检查）
    if (category.code?.startsWith('SYSTEM_')) {
      reasons.push('系统类目不能删除');
    }

    // 4. 添加警告信息
    if (category.status === 'enabled') {
      warnings.push('删除后，新建SPU时将无法选择该类目');
    }

    return {
      canDelete: reasons.length === 0,
      reasons,
      warnings
    };
  }

  /**
   * 检查类目是否被SPU使用（模拟API调用）
   * @param categoryId 类目ID
   * @returns 使用情况
   */
  private static async checkSpuUsage(categoryId: string): Promise<{
    isUsed: boolean;
    count: number;
  }> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 200));

    // 这里应该调用实际的API来检查SPU使用情况
    // 暂时返回未使用的状态
    return {
      isUsed: false,
      count: 0
    };
  }

  /**
   * 获取删除确认信息
   * @param category 要删除的类目
   * @param allCategories 所有类目列表
   * @returns 确认信息
   */
  static getDeleteConfirmationInfo(category: Category): {
    title: string;
    description: string;
    warningText: string;
    impactText: string;
  } {
    const levelText = CategoryFormatUtils.formatLevel(category.level);

    return {
      title: `删除${levelText}`,
      description: `确定要删除"${category.name}"吗？`,
      warningText: '⚠️ 删除后将无法恢复，请谨慎操作！',
      impactText: '删除后，该类目及其所有关联数据将被永久删除。'
    };
  }

  /**
   * 获取删除影响的统计信息
   * @param category 要删除的类目
   * @param allCategories 所有类目列表
   * @returns 影响统计
   */
  static getDeletionImpact(category: Category, allCategories: Category[]): {
    childCount: number;
    descendantCount: number;
    levelText: string;
  } {
    const directChildren = allCategories.filter(cat => cat.parentId === category.id);
    const allDescendants = CategoryTransformUtils.getAllChildIds(category.id, allCategories);

    return {
      childCount: directChildren.length,
      descendantCount: allDescendants.length,
      levelText: CategoryFormatUtils.formatLevel(category.level)
    };
  }
}

/**
 * 数据转换工具函数
 */
export class CategoryTransformUtils {
  /**
   * 将树结构转换为扁平列表
   * @param tree 树结构
   * @param level 当前层级，默认为1
   * @returns 扁平的类目列表
   */
  static flattenTree(tree: CategoryTreeNode[], level: number = 1): Category[] {
    const result: Category[] = [];

    const flatten = (nodes: CategoryTreeNode[], currentLevel: number) => {
      nodes.forEach(node => {
        result.push({
          id: node.id,
          name: node.name,
          code: node.code,
          level: currentLevel as CategoryLevel,
          parentId: node.parentId,
          sortOrder: node.sortOrder,
          status: node.status,
          createdAt: node.createdAt,
          updatedAt: node.updatedAt,
          createdBy: node.createdBy,
          updatedBy: node.updatedBy
        });

        if (node.children && node.children.length > 0) {
          flatten(node.children, currentLevel + 1);
        }
      });
    };

    flatten(tree, level);
    return result;
  }

  /**
   * 获取类目的所有子类目ID
   * @param categoryId 类目ID
   * @param categories 所有类目列表
   * @returns 子类目ID数组（包含所有层级）
   */
  static getAllChildIds(categoryId: string, categories: Category[]): string[] {
    const childIds: string[] = [];

    const findChildren = (parentId: string) => {
      const directChildren = categories.filter(cat => cat.parentId === parentId);
      directChildren.forEach(child => {
        childIds.push(child.id);
        findChildren(child.id); // 递归查找子类目的子类目
      });
    };

    findChildren(categoryId);
    return childIds;
  }

  /**
   * 获取类目的完整路径ID数组
   * @param categoryId 类目ID
   * @param categories 所有类目列表
   * @returns 路径ID数组，从根到目标
   */
  static getCategoryPathIds(categoryId: string, categories: Category[]): string[] {
    const path: string[] = [];
    let currentId: string | undefined = categoryId;

    while (currentId) {
      path.unshift(currentId);
      const current = categories.find(cat => cat.id === currentId);
      currentId = current?.parentId;
    }

    return path;
  }

  /**
   * 生成类目编码
   * @param parentId 父类目ID
   * @param siblingCount 同级兄弟数量
   * @returns 生成的编码
   */
  static generateCategoryCode(parentId?: string, siblingCount = 0): string {
    if (!parentId) {
      // 一级类目编码：C001, C002, ...
      return `C${String(siblingCount + 1).padStart(3, '0')}`;
    }

    // 子类目编码：父编码 + 001, 002, ...
    // 这里简化处理，实际应该查询父类目编码
    return `${parentId}-${String(siblingCount + 1).padStart(3, '0')}`;
  }
}

// 导出默认工具类实例（便于使用）
export default {
  CategoryTreeUtils,
  CategoryValidationUtils,
  AttributeUtils,
  CategoryFormatUtils,
  CategoryDeletionUtils,
  CategoryTransformUtils
};