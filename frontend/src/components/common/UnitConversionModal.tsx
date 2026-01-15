/** @spec M001-material-unit-system */
import React, { useState } from 'react'
import { Modal, Form, InputNumber, Space, Button, Alert } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import { UnitSelector } from './UnitSelector'
import { useUnitConversion } from '@/hooks/useUnitConversion'
import type { UnitCategory } from '@/types/unit'

interface UnitConversionModalProps {
  open: boolean
  onClose: () => void
  category?: UnitCategory
  materialId?: string
}

export const UnitConversionModal: React.FC<UnitConversionModalProps> = ({ open, onClose, category, materialId }) => {
  const [form] = Form.useForm()
  const { convert, loading, result } = useUnitConversion()
  const [showResult, setShowResult] = useState(false)

  const handleConvert = async () => {
    const values = await form.validateFields()
    const response = await convert({
      fromUnitCode: values.fromUnitCode,
      toUnitCode: values.toUnitCode,
      quantity: values.quantity,
      materialId,
    })

    if (response) {
      setShowResult(true)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setShowResult(false)
    onClose()
  }

  return (
    <Modal title="单位换算" open={open} onCancel={handleClose} footer={null} width={500}>
      <Form form={form} layout="vertical">
        <Form.Item name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
          <InputNumber min={0.000001} precision={6} style={{ width: '100%' }} placeholder="输入数量" />
        </Form.Item>

        <Form.Item name="fromUnitCode" label="源单位" rules={[{ required: true, message: '请选择源单位' }]}>
          <UnitSelector category={category} placeholder="选择源单位" valueType="code" />
        </Form.Item>

        <SwapOutlined style={{ display: 'block', textAlign: 'center', fontSize: 20, margin: '16px 0' }} />

        <Form.Item name="toUnitCode" label="目标单位" rules={[{ required: true, message: '请选择目标单位' }]}>
          <UnitSelector category={category} placeholder="选择目标单位" valueType="code" />
        </Form.Item>

        {showResult && result && (
          <Alert
            message="换算结果"
            description={
              <div>
                <p>
                  <strong>{result.originalQuantity}</strong> {result.fromUnitCode} ={' '}
                  <strong>{result.convertedQuantity}</strong> {result.toUnitCode}
                </p>
                <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>{result.conversionPath}</p>
              </div>
            }
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" onClick={handleConvert} loading={loading}>
              换算
            </Button>
            <Button onClick={handleClose}>关闭</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
