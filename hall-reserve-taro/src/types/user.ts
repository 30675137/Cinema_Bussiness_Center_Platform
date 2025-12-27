/**
 * 用户类型定义
 *
 * 映射后端返回的用户数据结构
 */

/**
 * 用户基本信息
 */
export interface User {
  /** 用户唯一标识（UUID） */
  id: string

  /** 微信 OpenID */
  openid: string

  /** 昵称（可选） */
  nickname?: string

  /** 头像 URL（可选） */
  avatarUrl?: string

  /** 手机号（可选） */
  phone?: string
}

/**
 * 用户元数据（Supabase Auth user_metadata）
 */
export interface UserMetadata {
  openid: string
  unionid?: string
  nickname?: string
  avatar_url?: string
  phone?: string
  provider: string
  last_login_at?: string
}
