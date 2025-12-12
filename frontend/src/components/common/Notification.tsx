import React from 'react'
import { message, notification } from 'antd'
import type { ArgsProps } from 'antd/es/message'
import type { NotificationArgsProps } from 'antd/es/notification'

/**
 * 通知工具类
 */
export class NotificationService {
  /**
   * 成功消息
   * @param content 消息内容
   * @param duration 显示时长（秒）
   * @param options 其他选项
   */
  static success(content: string, duration = 3, options?: Partial<ArgsProps>) {
    return message.success({
      content,
      duration,
      ...options,
    })
  }

  /**
   * 错误消息
   * @param content 消息内容
   * @param duration 显示时长（秒）
   * @param options 其他选项
   */
  static error(content: string, duration = 5, options?: Partial<ArgsProps>) {
    return message.error({
      content,
      duration,
      ...options,
    })
  }

  /**
   * 警告消息
   * @param content 消息内容
   * @param duration 显示时长（秒）
   * @param options 其他选项
   */
  static warning(content: string, duration = 4, options?: Partial<ArgsProps>) {
    return message.warning({
      content,
      duration,
      ...options,
    })
  }

  /**
   * 信息消息
   * @param content 消息内容
   * @param duration 显示时长（秒）
   * @param options 其他选项
   */
  static info(content: string, duration = 3, options?: Partial<ArgsProps>) {
    return message.info({
      content,
      duration,
      ...options,
    })
  }

  /**
   * 加载中消息
   * @param content 消息内容
   * @param duration 显示时长（秒）
   * @param options 其他选项
   */
  static loading(content: string, duration = 0, options?: Partial<ArgsProps>) {
    return message.loading({
      content,
      duration,
      ...options,
    })
  }

  /**
   * 成功通知弹窗
   * @param title 标题
   * @param content 内容
   * @param options 其他选项
   */
  static successNotification(
    title: string,
    content: React.ReactNode,
    options?: Partial<NotificationArgsProps>
  ) {
    return notification.success({
      message: title,
      description: content,
      duration: 4.5,
      ...options,
    })
  }

  /**
   * 错误通知弹窗
   * @param title 标题
   * @param content 内容
   * @param options 其他选项
   */
  static errorNotification(
    title: string,
    content: React.ReactNode,
    options?: Partial<NotificationArgsProps>
  ) {
    return notification.error({
      message: title,
      description: content,
      duration: 6,
      ...options,
    })
  }

  /**
   * 警告通知弹窗
   * @param title 标题
   * @param content 内容
   * @param options 其他选项
   */
  static warningNotification(
    title: string,
    content: React.ReactNode,
    options?: Partial<NotificationArgsProps>
  ) {
    return notification.warning({
      message: title,
      description: content,
      duration: 5,
      ...options,
    })
  }

  /**
   * 信息通知弹窗
   * @param title 标题
   * @param content 内容
   * @param options 其他选项
   */
  static infoNotification(
    title: string,
    content: React.ReactNode,
    options?: Partial<NotificationArgsProps>
  ) {
    return notification.info({
      message: title,
      description: content,
      duration: 4.5,
      ...options,
    })
  }
}

/**
 * SPU相关通知
 */
export class SPUNotificationService {
  /**
   * 成功消息
   * @param action 操作类型（如：创建、更新、删除等）
   * @param entity 实体名称（可选，如：SPU名称）
   */
  static success(action: string, entity?: string) {
    const message = entity ? `${action}${entity}成功` : action
    NotificationService.success(message)
  }

  /**
   * SPU创建成功通知
   * @param spuData SPU数据
   * @param callback 回调函数
   */
  static createSuccess(spuData: { id: string; name: string; code: string }, callback?: () => void) {
    // 显示成功消息
    NotificationService.success(`SPU"${spuData.name}"创建成功！`)

    // 显示详细信息通知
    notification.success({
      message: '创建成功',
      description: (
        <div>
          <p>SPU <strong>{spuData.name}</strong> 已成功创建</p>
          <p style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
            编码: {spuData.code}
          </p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            ID: {spuData.id}
          </p>
          <p style={{ marginTop: '12px', fontSize: '12px' }}>
            <strong>接下来您可以:</strong>
          </p>
          <ul style={{ fontSize: '12px', marginTop: '8px', paddingLeft: '20px' }}>
            <li>查看SPU详情</li>
            <li>创建SKU库存</li>
            <li>设置价格策略</li>
          </ul>
        </div>
      ),
      duration: 6,
      placement: 'topRight',
      onClick: callback,
    })
  }

  /**
   * SPU更新成功通知
   * @param spuName SPU名称
   */
  static updateSuccess(spuName: string) {
    NotificationService.success(`SPU"${spuName}"更新成功！`)
  }

  /**
   * SPU删除成功通知
   * @param spuName SPU名称
   */
  static deleteSuccess(spuName: string) {
    NotificationService.warning(`SPU"${spuName}"已删除`)
  }

  /**
   * SPU状态变更通知
   * @param spuName SPU名称
   * @param oldStatus 旧状态
   * @param newStatus 新状态
   */
  static statusChangeSuccess(spuName: string, oldStatus: string, newStatus: string) {
    NotificationService.success(
      `SPU"${spuName}"状态已从"${oldStatus}"更改为"${newStatus}"`
    )
  }

  /**
   * 批量操作成功通知
   * @param action 操作类型
   * @param count 操作数量
   */
  static batchSuccess(action: string, count: number) {
    NotificationService.success(`成功${action}${count}个SPU`)
  }

  /**
   * 操作失败通知
   * @param action 操作类型
   * @param error 错误信息
   */
  static actionFailed(action: string, error?: string) {
    NotificationService.error(
      `${action}失败${error ? `: ${error}` : ''}`,
      5
    )
  }

  /**
   * 表单验证失败通知
   * @param errors 错误列表
   */
  static validationFailed(errors: string[]) {
    if (errors.length === 1) {
      NotificationService.error(errors[0])
    } else {
      NotificationService.errorNotification(
        '表单验证失败',
        (
          <div>
            <p>请检查以下字段:</p>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {errors.slice(0, 5).map((error, index) => (
                <li key={index} style={{ fontSize: '12px' }}>{error}</li>
              ))}
              {errors.length > 5 && (
                <li style={{ fontSize: '12px', color: '#666' }}>
                  ...还有{errors.length - 5}个错误
                </li>
              )}
            </ul>
          </div>
        )
      )
    }
  }

  /**
   * 网络错误通知
   * @param action 操作名称
   */
  static networkError(action: string) {
    NotificationService.errorNotification(
      '网络错误',
      (
        <div>
          <p>{action}时发生网络错误</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            请检查网络连接后重试
          </p>
        </div>
      )
    )
  }
}

/**
 * 成功提示组件
 */
interface SuccessPromptProps {
  title: string
  description: string
  actions?: Array<{
    label: string
    onClick: () => void
    type?: 'primary' | 'default' | 'danger'
  }>
  duration?: number
}

export const SuccessPrompt: React.FC<SuccessPromptProps> = ({
  title,
  description,
  actions = [],
  duration = 5,
}) => {
  React.useEffect(() => {
    const key = `success-${Date.now()}`

    notification.success({
      key,
      message: title,
      description: (
        <div>
          <p>{description}</p>
          {actions.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              {actions.map((action, index) => (
                <button
                  key={index}
                  className={`ant-btn ant-btn-${action.type || 'default'}`}
                  onClick={() => {
                    action.onClick()
                    notification.close(key)
                  }}
                  style={{ fontSize: '12px' }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ),
      duration,
      placement: 'topRight',
    })
  }, [title, description, actions, duration])

  return null
}

export default NotificationService