import bcrypt from 'bcryptjs';
import { User, UserStatus, CreateUserData } from '../models/User';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';

/**
 * 登录请求数据接口
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登录响应数据接口
 */
export interface LoginResponse {
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * 用户信息接口（不包含敏感信息）
 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  status: UserStatus;
  lastLoginAt?: Date;
  roles: string[];
  permissions: string[];
}

/**
 * 刷新令牌请求接口
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * 刷新令牌响应接口
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * 认证服务类
 */
export class AuthService {
  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const { username, password } = credentials;

      // 验证用户名和密码不能为空
      if (!username || !password) {
        throw new Error('用户名和密码不能为空');
      }

      // 根据用户名查找用户
      // TODO: 实现数据库查询逻辑
      const user = await this.findUserByUsername(username);

      if (!user) {
        throw new Error('用户名或密码错误');
      }

      // 检查用户状态
      if (user.status !== UserStatus.ACTIVE) {
        throw new Error('用户账户已被禁用');
      }

      // 验证密码
      const isPasswordValid = await this.validatePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('用户名或密码错误');
      }

      // 更新最后登录时间
      await this.updateLastLoginTime(user.id);

      // 获取用户角色和权限
      const roles = await this.getUserRoles(user.id);
      const permissions = await this.getUserPermissions(user.id);

      // 生成JWT令牌
      const accessToken = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email
      });

      const refreshToken = generateRefreshToken({
        userId: user.id
      });

      // 计算过期时间
      const expiresIn = this.parseExpirationTime(process.env.JWT_EXPIRES_IN || '24h');

      // 返回用户信息（不包含敏感信息）
      const userInfo: UserInfo = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
        lastLoginAt: new Date(),
        roles: roles.map(role => role.name),
        permissions: permissions.map(perm => perm.code)
      };

      return {
        user: userInfo,
        accessToken,
        refreshToken,
        expiresIn
      };
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      const { refreshToken } = request;

      if (!refreshToken) {
        throw new Error('刷新令牌不能为空');
      }

      // 验证刷新令牌
      const decoded = verifyRefreshToken(refreshToken);

      // 检查用户是否存在且状态正常
      const user = await this.findUserById(decoded.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new Error('用户不存在或已被禁用');
      }

      // 生成新的访问令牌和刷新令牌
      const newAccessToken = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email
      });

      const newRefreshToken = generateRefreshToken({
        userId: user.id
      });

      const expiresIn = this.parseExpirationTime(process.env.JWT_EXPIRES_IN || '24h');

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn
      };
    } catch (error) {
      console.error('刷新令牌失败:', error);
      throw new Error('刷新令牌无效或已过期');
    }
  }

  /**
   * 用户注册
   */
  async register(userData: CreateUserData): Promise<UserInfo> {
    try {
      // 检查用户名是否已存在
      const existingUser = await this.findUserByUsername(userData.username);
      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 检查邮箱是否已存在
      const existingEmail = await this.findUserByEmail(userData.email);
      if (existingEmail) {
        throw new Error('邮箱已被使用');
      }

      // 加密密码
      const hashedPassword = await this.hashPassword(userData.password);

      // 创建用户
      const newUser = await this.createUser({
        ...userData,
        password: hashedPassword
      });

      // 分配默认角色
      await this.assignDefaultRole(newUser.id);

      // 获取用户角色和权限
      const roles = await this.getUserRoles(newUser.id);
      const permissions = await this.getUserPermissions(newUser.id);

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        phone: newUser.phone,
        status: newUser.status,
        roles: roles.map(role => role.name),
        permissions: permissions.map(perm => perm.code)
      };
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      // 获取用户信息
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证旧密码
      const isOldPasswordValid = await this.validatePassword(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new Error('原密码错误');
      }

      // 加密新密码
      const hashedNewPassword = await this.hashPassword(newPassword);

      // 更新密码
      await this.updateUserPassword(userId, hashedNewPassword);
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }

  /**
   * 验证密码
   */
  private async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 加密密码
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * 解析过期时间字符串为秒数
   */
  private parseExpirationTime(timeString: string): number {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default:
        return parseInt(timeString);
    }
  }

  // 以下为数据库操作方法，需要根据实际数据库实现
  // TODO: 实现具体的数据库操作逻辑

  private async findUserByUsername(username: string): Promise<User & { password: string } | null> {
    // TODO: 实现数据库查询
    throw new Error('方法未实现');
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    // TODO: 实现数据库查询
    throw new Error('方法未实现');
  }

  private async findUserById(userId: string): Promise<User | null> {
    // TODO: 实现数据库查询
    throw new Error('方法未实现');
  }

  private async createUser(userData: CreateUserData & { password: string }): Promise<User> {
    // TODO: 实现数据库插入
    throw new Error('方法未实现');
  }

  private async updateLastLoginTime(userId: string): Promise<void> {
    // TODO: 实现数据库更新
    throw new Error('方法未实现');
  }

  private async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    // TODO: 实现数据库更新
    throw new Error('方法未实现');
  }

  private async assignDefaultRole(userId: string): Promise<void> {
    // TODO: 实现默认角色分配
    throw new Error('方法未实现');
  }

  private async getUserRoles(userId: string): Promise<Array<{ id: string; name: string; displayName: string }>> {
    // TODO: 实现获取用户角色
    return [];
  }

  private async getUserPermissions(userId: string): Promise<Array<{ id: string; code: string; name: string }>> {
    // TODO: 实现获取用户权限
    return [];
  }
}

// 导出服务实例
export const authService = new AuthService();