/**
 * @spec O003-beverage-order
 * 语音播报 Hook
 */
import { useState, useCallback } from 'react'
import { message } from 'antd'
import { voiceAnnouncement } from '../utils/voiceAnnouncement'

/**
 * 语音播报 Hook
 */
export const useVoiceAnnouncement = () => {
  const [isAnnouncing, setIsAnnouncing] = useState(false)

  /**
   * 播报取餐号
   */
  const announceQueueNumber = useCallback(async (queueNumber: string) => {
    if (!voiceAnnouncement.isVoiceSupported()) {
      message.warning('您的浏览器不支持语音播报')
      return
    }

    try {
      setIsAnnouncing(true)
      await voiceAnnouncement.announceQueueNumber(queueNumber)
      message.success(`已播报取餐号: ${queueNumber}`)
    } catch (error) {
      console.error('语音播报失败:', error)
      message.error('语音播报失败')
    } finally {
      setIsAnnouncing(false)
    }
  }, [])

  /**
   * 播报多个取餐号
   */
  const announceMultipleQueueNumbers = useCallback(async (queueNumbers: string[]) => {
    if (!voiceAnnouncement.isVoiceSupported()) {
      message.warning('您的浏览器不支持语音播报')
      return
    }

    if (queueNumbers.length === 0) {
      message.info('没有需要播报的取餐号')
      return
    }

    try {
      setIsAnnouncing(true)
      await voiceAnnouncement.announceMultipleQueueNumbers(queueNumbers)
      message.success(`已播报 ${queueNumbers.length} 个取餐号`)
    } catch (error) {
      console.error('语音播报失败:', error)
      message.error('语音播报失败')
    } finally {
      setIsAnnouncing(false)
    }
  }, [])

  /**
   * 新订单提醒
   */
  const announceNewOrder = useCallback(async () => {
    if (!voiceAnnouncement.isVoiceSupported()) {
      return
    }

    try {
      await voiceAnnouncement.announceNewOrder()
    } catch (error) {
      console.error('语音播报失败:', error)
    }
  }, [])

  /**
   * 停止播报
   */
  const cancelAnnouncement = useCallback(() => {
    voiceAnnouncement.cancel()
    setIsAnnouncing(false)
  }, [])

  return {
    isAnnouncing,
    announceQueueNumber,
    announceMultipleQueueNumbers,
    announceNewOrder,
    cancelAnnouncement,
    isSupported: voiceAnnouncement.isVoiceSupported(),
  }
}
