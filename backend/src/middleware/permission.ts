import { Request, Response, NextFunction } from 'express';
import { newEnforcer, Model, FileAdapter } from 'casbin';
import { AuthenticatedRequest } from './auth';
import { User, Role } from '../models';
import { Permission } from '../models/Permission';
import { UserRole } from '../models/UserRole';
import { RolePermission } from '../models/RolePermission';

/**
 * 权限检查接口
 */
export interface PermissionCheck {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

/**
 * Casbin权限验证中间件
 * 基于RBAC模型进行权限验证
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          code: 'AUTH_REQUIRED',
          message: '需要认证才能访问',
          data: null
        });
        return;
      }

      // 检查权限
      const hasPermission = await checkUserPermission(req.userId, resource, action, req.body, req.params, req.query);

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          code: 'PERMISSION_DENIED',
          message: '权限不足，无法执行此操作',
          data: {
            required: `${resource}:${action}`,
            userId: req.userId
          }
        });
        return;
      }

      next();
    } catch (error) {
      console.error('权限验证错误:', error);
      res.status(500).json({
        success: false,
        code: 'PERMISSION_CHECK_ERROR',
        message: '权限验证服务错误',
        data: null
      });
    }
  };
};

/**
 * 多权限检查中间件（任一权限满足即可）
 */
export const requireAnyPermission = (permissions: Array<{ resource: string; action: string }>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          code: 'AUTH_REQUIRED',
          message: '需要认证才能访问',
          data: null
        });
        return;
      }

      // 检查是否有任一权限满足
      for (const perm of permissions) {
        const hasPermission = await checkUserPermission(req.userId, perm.resource, perm.action, req.body, req.params, req.query);
        if (hasPermission) {
          next();
          return;
        }
      }

      res.status(403).json({
        success: false,
        code: 'PERMISSION_DENIED',
        message: '权限不足，无法执行此操作',
        data: {
          required: permissions.map(p => `${p.resource}:${p.action}`),
          userId: req.userId
        }
      });
    } catch (error) {
      console.error('权限验证错误:', error);
      res.status(500).json({
        success: false,
        code: 'PERMISSION_CHECK_ERROR',
        message: '权限验证服务错误',
        data: null
      });
    }
  };
};

/**
 * 条件权限检查中间件
 * 支持基于数据的动态权限检查
 */
export const requireConditionalPermission = (
  resource: string,
  action: string,
  conditionChecker?: (req: AuthenticatedRequest) => Promise<boolean>
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          code: 'AUTH_REQUIRED',
          message: '需要认证才能访问',
          data: null
        });
        return;
      }

      // 基础权限检查
      const hasBasicPermission = await checkUserPermission(req.userId, resource, action, req.body, req.params, req.query);

      if (!hasBasicPermission) {
        res.status(403).json({
          success: false,
          code: 'PERMISSION_DENIED',
          message: '权限不足，无法执行此操作',
          data: {
            required: `${resource}:${action}`,
            userId: req.userId
          }
        });
        return;
      }

      // 条件权限检查
      if (conditionChecker) {
        const meetsCondition = await conditionChecker(req);
        if (!meetsCondition) {
          res.status(403).json({
            success: false,
            code: 'CONDITION_NOT_MET',
            message: '操作条件不满足',
            data: null
          });
          return;
        }
      }

      next();
    } catch (error) {
      console.error('权限验证错误:', error);
      res.status(500).json({
        success: false,
        code: 'PERMISSION_CHECK_ERROR',
        message: '权限验证服务错误',
        data: null
      });
    }
  };
};

/**
 * 检查用户权限的核心函数
 */
async function checkUserPermission(
  userId: string,
  resource: string,
  action: string,
  body: any = null,
  params: any = null,
  query: any = null
): Promise<boolean> {
  try {
    // 这里应该从数据库获取用户权限信息
    // 由于还没有数据库服务层，这里先返回true
    // 在实际实现中，需要：
    // 1. 获取用户角色
    // 2. 获取角色权限
    // 3. 检查权限匹配
    // 4. 验证权限条件

    // 临时实现：管理员拥有所有权限
    // TODO: 实现完整的权限检查逻辑
    return true;
  } catch (error) {
    console.error('检查用户权限失败:', error);
    return false;
  }
}

/**
 * 获取用户所有权限
 */
export const getUserPermissions = async (userId: string): Promise<Permission[]> => {
  try {
    // TODO: 实现从数据库获取用户权限
    // 1. 获取用户角色
    // 2. 获取角色对应的权限
    // 3. 返回权限列表
    return [];
  } catch (error) {
    console.error('获取用户权限失败:', error);
    return [];
  }
};

/**
 * 检查用户是否有特定角色
 */
export const hasRole = async (userId: string, roleName: string): Promise<boolean> => {
  try {
    // TODO: 实现角色检查逻辑
    return false;
  } catch (error) {
    console.error('检查用户角色失败:', error);
    return false;
  }
};

/**
 * 获取用户角色列表
 */
export const getUserRoles = async (userId: string): Promise<Role[]> => {
  try {
    // TODO: 实现获取用户角色逻辑
    return [];
  } catch (error) {
    console.error('获取用户角色失败:', error);
    return [];
  }
};

/**
 * 数据所有权检查
 */
export const checkDataOwnership = async (
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> => {
  try {
    // TODO: 实现数据所有权检查
    // 根据资源类型和ID检查用户是否拥有该数据的操作权限
    return false;
  } catch (error) {
    console.error('检查数据所有权失败:', error);
    return false;
  }
};

/**
 * 创建Casbin权限模型配置
 */
export const createCasbinModel = (): Model => {
  const modelText = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
`;

  return new Model(modelText);
};

/**
 * 初始化Casbin执行器
 */
export const initializeEnforcer = async (): Promise<any> => {
  try {
    const model = createCasbinModel();
    // TODO: 创建文件适配器或数据库适配器
    const adapter = new FileAdapter('policy.csv');
    const enforcer = await newEnforcer(model, adapter);
    return enforcer;
  } catch (error) {
    console.error('初始化Casbin执行器失败:', error);
    throw error;
  }
};