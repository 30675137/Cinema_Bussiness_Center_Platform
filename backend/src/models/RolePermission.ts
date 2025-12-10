export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  conditions?: RolePermissionConditions;
  createdAt: Date;
}

export interface RolePermissionConditions {
  scope?: string[];
  limits?: Record<string, any>;
}

export interface CreateRolePermissionData {
  roleId: string;
  permissionId: string;
  conditions?: RolePermissionConditions;
}