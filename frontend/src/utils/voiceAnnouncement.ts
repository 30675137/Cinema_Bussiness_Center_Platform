/**
 * @spec O003-beverage-order
 * 语音播报工具
 */

/**
 * 语音播报配置
 */
interface VoiceConfig {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * 语音播报服务
 */
export class VoiceAnnouncementService {
  private synth: SpeechSynthesis | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  /**
   * 检查浏览器是否支持语音播报
   */
  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  /**
   * 播报取餐号
   *
   * @param queueNumber 取餐号（如 "D001"）
   * @param config 播报配置
   */
  announceQueueNumber(queueNumber: string, config?: VoiceConfig): Promise<void> {
    return this.speak(`请${queueNumber}号顾客取餐`, config);
  }

  /**
   * 播报多个取餐号
   *
   * @param queueNumbers 取餐号列表
   * @param config 播报配置
   */
  async announceMultipleQueueNumbers(queueNumbers: string[], config?: VoiceConfig): Promise<void> {
    for (const queueNumber of queueNumbers) {
      await this.announceQueueNumber(queueNumber, config);
      // 延迟2秒再播报下一个
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  /**
   * 新订单提醒
   */
  announceNewOrder(config?: VoiceConfig): Promise<void> {
    return this.speak('您有新的订单，请注意查收', config);
  }

  /**
   * 通用语音播报
   *
   * @param text 播报内容
   * @param config 播报配置
   */
  speak(text: string, config?: VoiceConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('浏览器不支持语音播报'));
        return;
      }

      // 取消当前正在播报的内容
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // 配置语音参数
      utterance.lang = config?.lang || 'zh-CN';
      utterance.rate = config?.rate || 1.0; // 语速（0.1-10）
      utterance.pitch = config?.pitch || 1.0; // 音调（0-2）
      utterance.volume = config?.volume || 1.0; // 音量（0-1）

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      this.synth.speak(utterance);
    });
  }

  /**
   * 停止当前播报
   */
  cancel(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * 暂停播报
   */
  pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  /**
   * 恢复播报
   */
  resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }
}

// 导出单例
export const voiceAnnouncement = new VoiceAnnouncementService();
