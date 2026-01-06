/**
 * @spec O010-shopping-cart
 * 防抖 Hook
 */
import { useRef, useCallback } from 'react'

/**
 * 使用防抖处理函数调用
 * @param callback 要防抖的回调函数
 * @param delay 防抖延迟（毫秒）
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 设置新的定时器
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  return debouncedCallback
}
