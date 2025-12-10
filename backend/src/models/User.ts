export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

export interface CreateUserData {
  username: string;
  email: string;
  name: string;
  password: string;
  avatar?: string;
  phone?: string;
  status?: UserStatus;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  phone?: string;
  status?: UserStatus;
  lastLoginAt?: Date;
}

export interface UserWithRoles extends User {
  roles: UserRole[];
}