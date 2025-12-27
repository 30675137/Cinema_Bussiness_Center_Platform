/**
 * Clipboard Utility
 *
 * 剪贴板操作工具函数，支持小程序和 H5 环境
 *
 * @since 020-store-address
 */

import Taro from '@tarojs/taro';

/**
 * 复制文本到剪贴板
 *
 * 在小程序环境下使用 Taro.setClipboardData
 * 在 H5 环境下使用 navigator.clipboard API 或 fallback
 *
 * @param text 要复制的文本
 * @param showToast 是否显示提示，默认 true
 * @returns Promise<boolean> 是否复制成功
 */
export async function copyToClipboard(
  text: string,
  showToast = true
): Promise<boolean> {
  if (!text) {
    if (showToast) {
      Taro.showToast({
        title: '复制内容为空',
        icon: 'none',
      });
    }
    return false;
  }

  try {
    if (process.env.TARO_ENV === 'h5') {
      // H5 环境
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) {
          throw new Error('Copy command failed');
        }
      }
    } else {
      // 小程序环境
      await Taro.setClipboardData({
        data: text,
      });
    }

    if (showToast) {
      Taro.showToast({
        title: '已复制到剪贴板',
        icon: 'success',
        duration: 1500,
      });
    }
    return true;
  } catch (error) {
    console.error('复制到剪贴板失败:', error);
    if (showToast) {
      Taro.showToast({
        title: '复制失败',
        icon: 'none',
      });
    }
    return false;
  }
}

/**
 * 从剪贴板读取文本
 *
 * @returns Promise<string | null> 剪贴板内容或 null
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    if (process.env.TARO_ENV === 'h5') {
      // H5 环境
      if (navigator.clipboard && navigator.clipboard.readText) {
        return await navigator.clipboard.readText();
      }
      return null;
    } else {
      // 小程序环境
      const result = await Taro.getClipboardData();
      return result.data || null;
    }
  } catch (error) {
    console.error('读取剪贴板失败:', error);
    return null;
  }
}
