export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  level: number;
  parentId?: string;
  path: string;
  children?: ProductCategory[];
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNode extends ProductCategory {
  key: string;
  title: string;
  value: string;
  children?: CategoryTreeNode[];
  isLeaf?: boolean;
  checkable?: boolean;
  selectable?: boolean;
}