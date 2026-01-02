/**
 * @spec O006-miniapp-channel-order
 * 格式化工具函数 - 价格、日期、文本等
 */

/**
 * 价格格式化(分 → 元,带货币符号)
 *
 * @param priceInCents 价格(单位:分)
 * @param showSymbol 是否显示货币符号(默认 true)
 * @returns 格式化后的价格字符串
 *
 * @example
 * ```typescript
 * formatPrice(2500) // "¥25.00"
 * formatPrice(2500, false) // "25.00"
 * formatPrice(99) // "¥0.99"
 * formatPrice(0) // "¥0.00"
 * ```
 */
export const formatPrice = (
  priceInCents: number,
  showSymbol = true
): string => {
  const yuan = (priceInCents / 100).toFixed(2)
  return showSymbol ? `¥${yuan}` : yuan
}

/**
 * 日期格式化(ISO 8601 → 人类可读)
 *
 * @param dateString ISO 8601 日期字符串
 * @param format 格式类型
 * @returns 格式化后的日期字符串
 *
 * @example
 * ```typescript
 * formatDate('2026-01-02T15:30:00Z') // "2026-01-02"
 * formatDate('2026-01-02T15:30:00Z', 'datetime') // "2026-01-02 15:30"
 * formatDate('2026-01-02T15:30:00Z', 'time') // "15:30"
 * formatDate('2026-01-02T15:30:00Z', 'relative') // "2小时前"
 * ```
 */
export const formatDate = (
  dateString: string,
  format: 'date' | 'datetime' | 'time' | 'relative' = 'date'
): string => {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  if (format === 'date') {
    // 格式: YYYY-MM-DD
    return date.toISOString().split('T')[0] ?? '-'
  }

  if (format === 'datetime') {
    // 格式: YYYY-MM-DD HH:mm
    const datePart = date.toISOString().split('T')[0]
    const timePart = date.toTimeString().split(':').slice(0, 2).join(':')
    return `${datePart} ${timePart}`
  }

  if (format === 'time') {
    // 格式: HH:mm
    return date.toTimeString().split(':').slice(0, 2).join(':')
  }

  if (format === 'relative') {
    // 相对时间: "刚刚", "5分钟前", "2小时前", "3天前"
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
      return '刚刚'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`
    } else if (diffHours < 24) {
      return `${diffHours}小时前`
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      // 超过 7 天显示具体日期
      return formatDate(dateString, 'date')
    }
  }

  return '-'
}

/**
 * 订单号格式化(添加分隔符)
 *
 * @param orderNumber 订单号(如 CP202601020001)
 * @returns 格式化后的订单号(如 CP-20260102-0001)
 *
 * @example
 * ```typescript
 * formatOrderNumber('CP202601020001') // "CP-20260102-0001"
 * formatOrderNumber('ABC123') // "ABC123" (格式不匹配,原样返回)
 * ```
 */
export const formatOrderNumber = (orderNumber: string): string => {
  // 匹配格式: CP + YYYYMMDD + 序号
  const match = /^(CP)(\d{8})(\d+)$/.exec(orderNumber)

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }

  return orderNumber
}

/**
 * 取餐号格式化(添加样式)
 *
 * @param queueNumber 取餐号(如 A001)
 * @returns 格式化后的取餐号(如 A-001)
 *
 * @example
 * ```typescript
 * formatQueueNumber('A001') // "A-001"
 * formatQueueNumber('B123') // "B-123"
 * ```
 */
export const formatQueueNumber = (queueNumber: string): string => {
  // 匹配格式: [A-Z][0-9]{3}
  const match = /^([A-Z])(\d{3})$/.exec(queueNumber)

  if (match) {
    return `${match[1]}-${match[2]}`
  }

  return queueNumber
}

/**
 * 手机号脱敏
 *
 * @param phoneNumber 手机号
 * @returns 脱敏后的手机号(如 138****8888)
 *
 * @example
 * ```typescript
 * maskPhoneNumber('13812345678') // "138****5678"
 * maskPhoneNumber('1234567') // "1234567" (长度不足,原样返回)
 * ```
 */
export const maskPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber.length !== 11) {
    return phoneNumber
  }

  return phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 文本截断(超长文本添加省略号)
 *
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param ellipsis 省略符(默认 '...')
 * @returns 截断后的文本
 *
 * @example
 * ```typescript
 * truncateText('这是一段很长的文本内容', 10) // "这是一段很长的文..."
 * truncateText('短文本', 10) // "短文本"
 * ```
 */
export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis = '...'
): string => {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength) + ellipsis
}

/**
 * 数字格式化(千分位分隔)
 *
 * @param num 数字
 * @returns 格式化后的数字字符串
 *
 * @example
 * ```typescript
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1000) // "1,000"
 * formatNumber(999) // "999"
 * ```
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 百分比格式化
 *
 * @param value 数值(0-1)
 * @param decimals 小数位数(默认 0)
 * @returns 格式化后的百分比字符串
 *
 * @example
 * ```typescript
 * formatPercent(0.856) // "86%"
 * formatPercent(0.856, 1) // "85.6%"
 * formatPercent(0.856, 2) // "85.60%"
 * ```
 */
export const formatPercent = (value: number, decimals = 0): string => {
  const percent = (value * 100).toFixed(decimals)
  return `${percent}%`
}

/**
 * 文件大小格式化
 *
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 *
 * @example
 * ```typescript
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 * formatFileSize(1073741824) // "1 GB"
 * formatFileSize(500) // "500 B"
 * ```
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 空值替换(undefined/null → 默认值)
 *
 * @param value 原始值
 * @param defaultValue 默认值(默认 '-')
 * @returns 处理后的值
 *
 * @example
 * ```typescript
 * fallbackValue(null) // "-"
 * fallbackValue(undefined, '无') // "无"
 * fallbackValue('有值') // "有值"
 * fallbackValue(0) // 0 (0 不会被替换)
 * ```
 */
export const fallbackValue = <T>(
  value: T | null | undefined,
  defaultValue: T | string = '-'
): T | string => {
  return value ?? defaultValue
}
