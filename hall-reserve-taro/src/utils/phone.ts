/**
 * Phone Utility
 *
 * 电话拨打工具函数，支持小程序和 H5 环境
 *
 * @since 020-store-address
 */

import Taro from '@tarojs/taro';

/**
 * 检查是否为有效的电话号码格式
 * @param phone 电话号码
 * @returns 是否有效
 */
export function isValidPhone(phone: string | undefined | null): boolean {
  if (!phone || phone.trim() === '') {
    return false;
  }
  // 支持手机号、座机、400热线
  const phonePattern = /^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$/;
  return phonePattern.test(phone);
}

/**
 * 拨打电话
 *
 * 在小程序环境下使用 Taro.makePhoneCall
 * 在 H5 环境下使用 window.location.href = 'tel:xxx'
 *
 * @param phone 电话号码
 * @returns Promise
 */
export async function makePhoneCall(phone: string): Promise<void> {
  if (!isValidPhone(phone)) {
    Taro.showToast({
      title: '电话号码格式不正确',
      icon: 'none',
    });
    return;
  }

  // 移除电话号码中的连字符以便拨打
  const cleanPhone = phone.replace(/-/g, '');

  try {
    if (process.env.TARO_ENV === 'h5') {
      // H5 环境使用 tel 协议
      window.location.href = `tel:${cleanPhone}`;
    } else {
      // 小程序环境使用 Taro API
      await Taro.makePhoneCall({
        phoneNumber: cleanPhone,
      });
    }
  } catch (error) {
    console.error('拨打电话失败:', error);
    // 用户取消拨打不算错误
    if ((error as { errMsg?: string })?.errMsg?.includes('cancel')) {
      return;
    }
    Taro.showToast({
      title: '拨打电话失败',
      icon: 'none',
    });
  }
}

/**
 * 格式化电话号码显示
 * 手机号格式: 138 **** 1234
 * 座机格式: 010-12345678
 * 400热线: 400-123-4567
 *
 * @param phone 电话号码
 * @param mask 是否脱敏显示
 * @returns 格式化后的电话号码
 */
export function formatPhone(phone: string, mask = false): string {
  if (!phone) return '';

  if (mask && phone.length === 11 && phone.startsWith('1')) {
    // 手机号脱敏
    return `${phone.slice(0, 3)} **** ${phone.slice(7)}`;
  }

  return phone;
}
