/**
 * @spec O003-beverage-order
 * C端环境配置 - API端点和应用常量
 */

// API 端点配置
export const API_CONFIG = {
  // 后端 API 基础 URL
  BASE_URL: process.env.TARO_APP_API_BASE_URL || 'http://localhost:8080',

  // API 超时时间（毫秒）
  TIMEOUT: 30000,

  // Supabase 配置
  SUPABASE_URL: process.env.TARO_APP_SUPABASE_URL || 'https://fxhgyxceqrmnpezluaht.supabase.co',
  SUPABASE_ANON_KEY: process.env.TARO_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aGd5eGNlcXJtbnBlemx1YWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MjU3OTAsImV4cCI6MjA1MDMwMTc5MH0.X5oJxVHQY2nHfEb9qCkZVW9ZdGMJRJYMYr7Pd6ujDWs',
}

// 饮品订单相关常量 (@spec O003-beverage-order)
export const BEVERAGE_CONFIG = {
  // 订单状态轮询间隔（毫秒） - 8秒轮询
  POLLING_INTERVAL_MS: 8000,

  // Mock 支付延迟时间（毫秒）- MVP 阶段模拟支付
  MOCK_PAYMENT_DELAY_MS: 500,

  // 订单号前缀
  ORDER_NUMBER_PREFIX: 'BORDT',

  // 取餐号配置
  QUEUE_NUMBER_PREFIX: 'D',
  QUEUE_NUMBER_MIN: 1,
  QUEUE_NUMBER_MAX: 999,
}

// 存储配置
export const STORAGE_CONFIG = {
  // 本地存储键名前缀
  PREFIX: 'cinema_beverage_',

  // 认证相关存储键
  TOKEN_KEY: 'cinema_beverage_token',
  USER_KEY: 'cinema_beverage_user',

  // 购物车存储键
  CART_KEY: 'cinema_beverage_cart',

  // 订单历史缓存键
  ORDER_HISTORY_KEY: 'cinema_beverage_order_history',
}

// 应用配置
export const APP_CONFIG = {
  // 应用名称
  APP_NAME: '影院吧台',

  // 应用版本
  VERSION: '1.0.0',

  // 环境标识
  ENV: process.env.NODE_ENV || 'development',

  // 是否启用调试模式
  DEBUG: process.env.NODE_ENV === 'development',
}

// 导出所有配置
export default {
  API_CONFIG,
  BEVERAGE_CONFIG,
  STORAGE_CONFIG,
  APP_CONFIG,
}
