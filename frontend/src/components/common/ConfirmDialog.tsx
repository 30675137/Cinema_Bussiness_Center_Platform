import React from 'react'
import { Modal, Typography, Button } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

interface ConfirmDialogProps {
  visible: boolean
  title?: string
  content?: React.ReactNode
  description?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  okText?: string
  cancelText?: string
  onOk?: () => void | Promise<void>
  onCancel?: () => void
  width?: number
  centered?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title = '确认操作',
  content,
  description,
  type = 'warning',
  okText = '确认',
  cancelText = '取消',
  onOk,
  onCancel,
  width = 416,
  centered = true
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      width={width}
      centered={centered}
      okType={type === 'error' ? 'danger' : 'primary'}
      icon={<ExclamationCircleOutlined />}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button key="ok" type={type === 'error' ? 'danger' : 'primary'} onClick={onOk}>
          {okText}
        </Button>
      ]}
    >
      {content || (
        <div>
          <Text>{description || '此操作将影响相关数据，请确认是否继续？'}</Text>
        </div>
      )}
    </Modal>
  )
}

export default ConfirmDialog