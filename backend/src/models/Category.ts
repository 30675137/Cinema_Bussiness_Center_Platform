import { MaterialType } from './Product';

export interface Category {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  level: number;
  allowedMaterialTypes: MaterialType[];
  sortOrder: number;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
  children?: Category[];
}

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface CreateCategoryData {
  name: string;
  code: string;
  parentId?: string;
  allowedMaterialTypes: MaterialType[];
  sortOrder?: number;
  status?: CategoryStatus;
}

export interface UpdateCategoryData {
  name?: string;
  allowedMaterialTypes?: MaterialType[];
  sortOrder?: number;
  status?: CategoryStatus;
  updatedAt?: Date;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}