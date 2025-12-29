/**
 * @spec O001-product-order-list
 * 订单操作按钮组件 - User Story 4
 */

import React, { useState } from 'react'
import { Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd'
import { CheckOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons'
import type { ProductOrder, OrderStatus } from '../types/order'
import { canShipOrder, canCompleteOrder, canCancelOrder } from '../utils/formatOrderStatus'
import { useUpdateOrderStatus } from '../hooks/useUpdateOrderStatus'

const { TextArea } = Input

export interface OrderActionsProps {
  /**
   * 订单数据
   */
  order: ProductOrder

  /**
   * 操作成功回调（可选）
   */
  onSuccess?: () => void
}

/**
 * 订单操作按钮组件
 *
 * 根据订单当前状态显示可用的操作按钮:
 * - 已支付 → 可以"标记发货"或"取消订单"
 * - 已发货 → 可以"标记完成"
 * - 待支付 → 可以"取消订单"
 * - 已完成/已取消 → 无操作按钮
 *
 * 特性:
 * - 状态机验证：只显示合法的状态转换操作
 * - 取消订单需要输入原因
 * - 操作前确认
 * - 乐观更新 + 错误回滚
 *
 * @example
 * ```tsx
 * <OrderActions
 *   order={orderData}
 *   onSuccess={() => message.success('操作成功')}
 * />
 * ```
 */
export const OrderActions: React.FC<OrderActionsProps> = React.memo(
  ({ order, onSuccess }) => {
    const [cancelModalVisible, setCancelModalVisible] = useState(false)
    const [cancelForm] = Form.useForm()

    const updateStatus = useUpdateOrderStatus()

    // 处理标记发货
    const handleShip = () => {
      updateStatus.mutate(
        {
          orderId: order.id,
          request: {
            status: 'SHIPPED' as OrderStatus,
            version: order.version
          }
        },
        {
          onSuccess: () => {
            message.success('订单已标记为发货')
            onSuccess?.()
          },
          onError: (error) => {
            message.error(error.message || '标记发货失败，请重试')
          }
        }
      )
    }

    // 处理标记完成
    const handleComplete = () => {
      updateStatus.mutate(
        {
          orderId: order.id,
          request: {
            status: 'COMPLETED' as OrderStatus,
            version: order.version
          }
        },
        {
          onSuccess: () => {
            message.success('订单已标记为完成')
            onSuccess?.()
          },
          onError: (error) => {
            message.error(error.message || '标记完成失败，请重试')
          }
        }
      )
    }

    // 处理取消订单
    const handleCancel = async () => {
      try {
        const values = await cancelForm.validateFields()

        updateStatus.mutate(
          {
            orderId: order.id,
            request: {
              status: 'CANCELLED' as OrderStatus,
              version: order.version,
              cancelReason: values.cancelReason
            }
          },
          {
            onSuccess: () => {
              message.success('订单已取消')
              setCancelModalVisible(false)
              cancelForm.resetFields()
              onSuccess?.()
            },
            onError: (error) => {
              message.error(error.message || '取消订单失败，请重试')
            }
          }
        )
      } catch (error) {
        // 表单验证失败
        console.error('Form validation failed:', error)
      }
    }

    // 检查是否可以执行各种操作
    const canShip = canShipOrder(order.status)
    const canComplete = canCompleteOrder(order.status)
    const canCancel = canCancelOrder(order.status)

    // 如果没有可用操作，不渲染任何内容
    if (!canShip && !canComplete && !canCancel) {
      return null
    }

    return (
      <>
        <Space className="order-actions">
          {/* 标记发货按钮 - 仅"已支付"状态可用 */}
          {canShip && (
            <Popconfirm
              title="确认标记发货"
              description="确定要将此订单标记为已发货吗？"
              onConfirm={handleShip}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={updateStatus.isPending}
              >
                标记发货
              </Button>
            </Popconfirm>
          )}

          {/* 标记完成按钮 - 仅"已发货"状态可用 */}
          {canComplete && (
            <Popconfirm
              title="确认标记完成"
              description="确定要将此订单标记为已完成吗？"
              onConfirm={handleComplete}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={updateStatus.isPending}
              >
                标记完成
              </Button>
            </Popconfirm>
          )}

          {/* 取消订单按钮 - "待支付"或"已支付"状态可用 */}
          {canCancel && (
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => setCancelModalVisible(true)}
              loading={updateStatus.isPending}
            >
              取消订单
            </Button>
          )}
        </Space>

        {/* 取消订单对话框 */}
        <Modal
          title="取消订单"
          open={cancelModalVisible}
          onOk={handleCancel}
          onCancel={() => {
            setCancelModalVisible(false)
            cancelForm.resetFields()
          }}
          confirmLoading={updateStatus.isPending}
          okText="确定取消"
          cancelText="返回"
        >
          <Form
            form={cancelForm}
            layout="vertical"
            style={{ marginTop: 16 }}
          >
            <Form.Item
              label="取消原因"
              name="cancelReason"
              rules={[
                { required: true, message: '请输入取消原因' },
                { min: 5, message: '取消原因至少5个字符' },
                { max: 200, message: '取消原因不超过200个字符' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="请输入取消订单的原因（5-200个字符）"
                maxLength={200}
                showCount
              />
            </Form.Item>
          </Form>
        </Modal>
      </>
    )
  }
)

OrderActions.displayName = 'OrderActions'

export default OrderActions
