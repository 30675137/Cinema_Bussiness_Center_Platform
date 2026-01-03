/**
 * @spec O007-miniapp-menu-api
 * 价格格式化工具
 */

/**
 * 价格格式化选项
 */
export interface PriceFormatOptions {
  /** 是否显示小数位（默认：true，当价格为整数时自动隐藏） */
  showDecimals?: boolean
  /** 是否显示货币符号（默认：true） */
  showCurrency?: boolean
  /** 免费商品的显示文本（默认：'免费'） */
  freeText?: string
}

/**
 * 格式化价格（分转元）
 * @param priceInCents 价格（分）
 * @param options 格式化选项
 * @returns 格式化后的价格字符串
 * @example
 * formatPrice(2800) // "¥28"
 * formatPrice(2850) // "¥28.5"
 * formatPrice(0) // "免费"
 * formatPrice(2800, { showCurrency: false }) // "28"
 */
export function formatPrice(
  priceInCents: number,
  options: PriceFormatOptions = {}
): string {
  const {
    showDecimals = true,
    showCurrency = true,
    freeText = '免费',
  } = options

  // 处理免费商品
  if (priceInCents === 0) {
    return freeText
  }

  // 分转元
  const priceInYuan = priceInCents / 100

  // 判断是否为整数
  const isInteger = priceInYuan % 1 === 0

  // 格式化价格
  let formattedPrice: string
  if (showDecimals && !isInteger) {
    // 显示小数（最多2位，自动去除尾部0）
    formattedPrice = priceInYuan.toFixed(2).replace(/\.?0+$/, '')
  } else {
    // 只显示整数部分
    formattedPrice = Math.floor(priceInYuan).toString()
  }

  // 添加货币符号
  return showCurrency ? `¥${formattedPrice}` : formattedPrice
}
