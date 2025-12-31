/**
 * 供应商管理相关类型定义
 */

/**
 * 供应商状态枚举
 */
export enum SupplierStatus {
  ACTIVE = 'active', // 正常合作
  SUSPENDED = 'suspended', // 暂停合作
  TERMINATED = 'terminated', // 终止合作
  PENDING_APPROVAL = 'pending_approval', // 待审批
  UNDER_REVIEW = 'under_review', // 复核中
}

/**
 * 供应商等级枚举
 */
export enum SupplierLevel {
  STRATEGIC = 'strategic', // 战略供应商
  PREFERRED = 'preferred', // 优选供应商
  STANDARD = 'standard', // 标准供应商
  TRIAL = 'trial', // 试用供应商
}

/**
 * 供应商类型枚举
 */
export enum SupplierType {
  MANUFACTURER = 'manufacturer', // 生产商
  WHOLESALER = 'wholesaler', // 批发商
  DISTRIBUTOR = 'distributor', // 经销商
  SERVICE_PROVIDER = 'service_provider', // 服务提供商
  OTHER = 'other', // 其他
}

/**
 * 联系人信息接口
 */
export interface ContactInfo {
  /** 联系人ID */
  id: string;
  /** 姓名 */
  name: string;
  /** 职位 */
  position?: string;
  /** 手机号码 */
  phone: string;
  /** 邮箱 */
  email?: string;
  /** 主要联系人标识 */
  isPrimary?: boolean;
}

/**
/** 银行账户信息接口
 */
export interface BankAccount {
  /** 账户ID */
  id: string;
  /** 开户行 */
  bankName: string;
  /** 银行代码 */
  bankCode?: string;
  /** 账户名称 */
  accountName: string;
  /** 账户号码 */
  accountNumber: string;
  /** 是否默认账户 */
  isDefault?: boolean;
}

/**
 * 供应商资质信息接口
 */
export interface SupplierQualification {
  /** 资质ID */
  id: string;
  /** 资质类型 */
  qualificationType: string;
  /** 资质名称 */
  qualificationName: string;
  /** 证书编号 */
  certificateNumber?: string;
  /** 发证机关 */
  issuingAuthority?: string;
  /** 发证日期 */
  issueDate?: string;
  /** 有效期至 */
  expireDate?: string;
  /** 证书文件URL */
  certificateFile?: string;
  /** 状态 */
  status: 'valid' | 'expired' | 'pending';
}

/**
 * 供应商评价接口
 */
export interface SupplierEvaluation {
  /** 评价ID */
  id: string;
  /** 评价类型 */
  evaluationType: 'quality' | 'delivery' | 'service' | 'price' | 'comprehensive';
  /** 评价分数 */
  score: number;
  /** 评价等级 */
  grade: 'A' | 'B' | 'C' | 'D';
  /** 评价说明 */
  comments?: string;
  /** 评价人 */
  evaluatorId: string;
  /** 评价时间 */
  evaluationDate: string;
}

/**
 * 采购统计接口
 */
export interface PurchaseStatistics {
  /** 总采购次数 */
  totalOrders: number;
  /** 总采购金额 */
  totalAmount: number;
  /** 平均交付准时率 */
  onTimeDeliveryRate: number;
  /** 质量合格率 */
  qualityPassRate: number;
  /** 最近采购日期 */
  lastOrderDate?: string;
}

/**
 * 供应商信息接口
 */
export interface Supplier {
  /** 供应商ID */
  id: string;
  /** 供应商编码 */
  code: string;
  /** 供应商名称 */
  name: string;
  /** 供应商简称 */
  shortName?: string;
  /** 供应商类型 */
  type: SupplierType;
  /** 供应商等级 */
  level: SupplierLevel;
  /** 状态 */
  status: SupplierStatus;
  /** 统一社会信用代码 */
  creditCode?: string;
  /** 法定代表人 */
  legalRepresentative?: string;
  /** 公司地址 */
  address: string;
  /** 邮政编码 */
  postalCode?: string;
  /** 公司电话 */
  phone: string;
  /** 公司传真 */
  fax?: string;
  /** 公司邮箱 */
  email?: string;
  /** 公司网站 */
  website?: string;
  /** 联系人列表 */
  contacts: ContactInfo[];
  /** 银行账户列表 */
  bankAccounts: BankAccount[];
  /** 资质证书列表 */
  qualifications: SupplierQualification[];
  /** 供应商评价列表 */
  evaluations: SupplierEvaluation[];
  /** 采购统计 */
  purchaseStats: PurchaseStatistics;
  /** 供应品类 */
  productCategories: string[];
  /** 主营产品 */
  mainProducts?: string[];
  /** 合作开始日期 */
  cooperationStartDate?: string;
  /** 合作结束日期 */
  cooperationEndDate?: string;
  /** 信用额度 */
  creditLimit?: number;
  /** 付款条件 */
  paymentTerms?: string;
  /** 备注 */
  remarks?: string;
  /** 创建人ID */
  createdById: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新人ID */
  updatedById?: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 供应商查询参数接口
 */
export interface SupplierQueryParams {
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
  /** 搜索关键词 */
  search?: string;
  /** 供应商类型过滤 */
  type?: SupplierType;
  /** 供应商等级过滤 */
  level?: SupplierLevel;
  /** 状态过滤 */
  status?: SupplierStatus;
  /** 供应品类过滤 */
  productCategory?: string;
  /** 排序字段 */
  sortBy?: 'name' | 'code' | 'createdAt' | 'level' | 'status';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 供应商创建参数接口
 */
export interface CreateSupplierParams {
  /** 供应商名称 */
  name: string;
  /** 供应商简称 */
  shortName?: string;
  /** 供应商类型 */
  type: SupplierType;
  /** 供应商等级 */
  level: SupplierLevel;
  /** 统一社会信用代码 */
  creditCode?: string;
  /** 法定代表人 */
  legalRepresentative?: string;
  /** 公司地址 */
  address: string;
  /** 邮政编码 */
  postalCode?: string;
  /** 公司电话 */
  phone: string;
  /** 公司传真 */
  fax?: string;
  /** 公司邮箱 */
  email?: string;
  /** 公司网站 */
  website?: string;
  /** 供应品类 */
  productCategories: string[];
  /** 主营产品 */
  mainProducts?: string[];
  /** 合作开始日期 */
  cooperationStartDate?: string;
  /** 合作结束日期 */
  cooperationEndDate?: string;
  /** 信用额度 */
  creditLimit?: number;
  /** 付款条件 */
  paymentTerms?: string;
  /** 备注 */
  remarks?: string;
  /** 联系人信息 */
  contacts?: Omit<ContactInfo, 'id'>[];
  /** 银行账户信息 */
  bankAccounts?: Omit<BankAccount, 'id'>[];
  /** 资质证书信息 */
  qualifications?: Omit<SupplierQualification, 'id'>[];
}

/**
 * 供应商更新参数接口
 */
export interface UpdateSupplierParams extends Partial<CreateSupplierParams> {
  /** 状态 */
  status?: SupplierStatus;
}

/**
 * 供应商统计信息接口
 */
export interface SupplierStatistics {
  /** 总供应商数量 */
  totalSuppliers: number;
  /** 各状态供应商数量 */
  statusDistribution: Record<SupplierStatus, number>;
  /** 各等级供应商数量 */
  levelDistribution: Record<SupplierLevel, number>;
  /** 各类型供应商数量 */
  typeDistribution: Record<SupplierType, number>;
  /** 近期新增供应商数量 */
  newSuppliersThisMonth: number;
  /** 近期活跃供应商数量 */
  activeSuppliersThisMonth: number;
  /** 供应商平均评分 */
  averageRating: number;
  /** 即将到期资质数量 */
  expiringQualifications: number;
}

/**
 * 供应商批量操作参数接口
 */
export interface SupplierBatchOperationParams {
  /** 供应商ID列表 */
  supplierIds: string[];
  /** 操作类型 */
  operation: 'activate' | 'suspend' | 'terminate' | 'update_level' | 'export';
  /** 操作参数 */
  params?: {
    level?: SupplierLevel;
    remarks?: string;
  };
}

/**
 * 供应商导入参数接口
 */
export interface SupplierImportParams {
  /** 文件URL */
  fileUrl: string;
  /** 是否覆盖已存在的供应商 */
  overwrite?: boolean;
  /** 默认供应商状态 */
  defaultStatus?: SupplierStatus;
  /** 默认供应商等级 */
  defaultLevel?: SupplierLevel;
}

/**
 * 供应商导出参数接口
 */
export interface SupplierExportParams {
  /** 导出字段列表 */
  fields?: string[];
  /** 过滤条件 */
  filters?: SupplierQueryParams;
  /** 导出格式 */
  format?: 'excel' | 'csv' | 'pdf';
  /** 是否包含详细信息 */
  includeDetails?: boolean;
}

/**
 * 供应商搜索结果接口
 */
export interface SupplierSearchResult {
  /** 供应商信息 */
  supplier: Supplier;
  /** 匹配分数 */
  score: number;
  /** 匹配的高亮字段 */
  highlightedFields: Record<string, string>;
}
