/**
 * @spec D001-menu-panel
 * 权限过滤工具函数
 */
import type { ModuleCard } from '@/types/module';

/**
 * 根据用户权限过滤模块
 * 
 * @param modules - 模块列表
 * @param userPermissions - 用户权限列表
 * @returns 过滤后的模块列表
 * 
 * @note 当前阶段返回所有模块（B端管理后台暂不实现权限过滤）
 * @note 预留接口，便于后续扩展权限控制逻辑
 */
export function filterModulesByPermission(
  modules: ModuleCard[],
  userPermissions: string[] = []
): ModuleCard[] {
  // 当前阶段：返回所有模块（暂不过滤）
  // 后续：实现基于 requiredPermissions 的过滤逻辑
  // 
  // 实现示例：
  // return modules.filter(module => {
  //   if (!module.requiredPermissions || module.requiredPermissions.length === 0) {
  //     return true; // 无权限要求的模块，所有人可见
  //   }
  //   return module.requiredPermissions.some(permission => 
  //     userPermissions.includes(permission)
  //   );
  // });

  return modules;
}

/**
 * 检查用户是否有访问模块的权限
 * 
 * @param module - 模块配置
 * @param userPermissions - 用户权限列表
 * @returns 是否有权限
 */
export function hasModulePermission(
  module: ModuleCard,
  userPermissions: string[] = []
): boolean {
  // 无权限要求的模块，所有人可见
  if (!module.requiredPermissions || module.requiredPermissions.length === 0) {
    return true;
  }

  // 当前阶段：默认返回 true
  // 后续：检查用户是否拥有任一所需权限
  return true;
  
  // 实现示例：
  // return module.requiredPermissions.some(permission => 
  //   userPermissions.includes(permission)
  // );
}
