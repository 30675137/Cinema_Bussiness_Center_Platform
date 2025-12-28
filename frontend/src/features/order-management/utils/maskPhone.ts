/**
 * @spec O001-product-order-list
 * 手机号脱敏工具函数
 * 格式: 138****8000 (保留前3位和后4位，中间4位用星号替代)
 */

export const maskPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) {
    return phone
  }

  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 验证是否为有效的中国大陆手机号
 */
export const isValidPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone)
}
