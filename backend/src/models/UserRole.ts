export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  storeId?: string;
  conditions?: UserRoleConditions;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleConditions {
  scope?: string[];
  limits?: Record<string, any>;
}

export interface CreateUserRoleData {
  userId: string;
  roleId: string;
  storeId?: string;
  conditions?: UserRoleConditions;
}

export interface UpdateUserRoleData {
  storeId?: string;
  conditions?: UserRoleConditions;
  updatedAt?: Date;
}