import React, { useState } from 'react'
import {
  Card,
  Tabs,
  Button,
  Space,
  Typography,
  Alert,
  Switch,
  Modal,
  message
} from 'antd'
import {
  EditOutlined,
  EyeOutlined,
  SaveOutlined,
  SettingOutlined,
  PlusOutlined
} from '@ant-design/icons'
import type { SPUAttribute } from '@/types/spu'
import AttributeDisplay from '@/components/SPU/AttributeDisplay'
import AttributeEditor from '@/components/Attribute/AttributeEditor'
import { SPUNotificationService } from '@/components/common/Notification'

const { Title, Text } = Typography
const { TabPane } = Tabs

interface AttributePanelProps {
  attributes: SPUAttribute[]
  categoryId?: string
  mode?: 'view' | 'edit'
  onAttributesChange?: (attributes: SPUAttribute[]) => void
  loading?: boolean
  showHeader?: boolean
  compact?: boolean
}

const AttributePanel: React.FC<AttributePanelProps> = ({
  attributes = [],
  categoryId,
  mode = 'view',
  onAttributesChange,
  loading = false,
  showHeader = true,
  compact = false
}) => {
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('view')
  const [tempAttributes, setTempAttributes] = useState<SPUAttribute[]>(attributes)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 监听编辑模式变化
  React.useEffect(() => {
    if (editMode) {
      setTempAttributes([...attributes])
      setHasUnsavedChanges(false)
      setActiveTab('edit')
    } else {
      setActiveTab('view')
      setTempAttributes([])
    }
  }, [editMode, attributes])

  // 处理属性变化
  const handleAttributesChange = (newAttributes: SPUAttribute[]) => {
    setTempAttributes(newAttributes)
    setHasUnsavedChanges(true)
  }

  // 保存编辑
  const handleSave = () => {
    // 验证属性数据
    const hasInvalidAttribute = tempAttributes.some(attr =>
      !attr.name || !attr.type || (attr.required && !attr.value)
    )

    if (hasInvalidAttribute) {
      message.error('请完善所有必填属性')
      return
    }

    onAttributesChange?.(tempAttributes)
    setHasUnsavedChanges(false)
    setEditMode(false)
    SPUNotificationService.success('属性保存', 'SPU属性')
  }

  // 取消编辑
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认取消编辑',
        content: '您有未保存的更改，确定要取消吗？',
        okText: '确定',
        cancelText: '继续编辑',
        onOk: () => {
          setEditMode(false)
          setHasUnsavedChanges(false)
        }
      })
    } else {
      setEditMode(false)
    }
  }

  // 渲染头部
  const renderHeader = () => {
    if (!showHeader) return null

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <SettingOutlined /> 动态属性
          </Title>
          {compact && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {attributes.length} 个属性
            </Text>
          )}
        </div>

        <Space>
          {mode === 'edit' && !editMode && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditMode(true)}
            >
              编辑属性
            </Button>
          )}

          {editMode && (
            <Space>
              <Button onClick={handleCancel}>
                取消
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
              >
                保存更改
              </Button>
            </Space>
          )}
        </Space>
      </div>
    )
  }

  // 渲染更改提醒
  const renderChangeAlert = () => {
    if (!editMode || !hasUnsavedChanges) return null

    return (
      <Alert
        message="有未保存的更改"
        description="您对属性进行了修改，请记得保存更改"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        action={
          <Button size="small" type="primary" onClick={handleSave}>
            立即保存
          </Button>
        }
      />
    )
  }

  // 紧凑模式渲染
  if (compact) {
    return (
      <Card size="small" title={showHeader && "属性信息"}>
        <div style={{ marginBottom: 8 }}>
          <Text strong>属性数量: </Text>
          <Text>{attributes.length}</Text>
        </div>

        {mode === 'edit' && (
          <Button
            size="small"
            icon={editMode ? <EyeOutlined /> : <EditOutlined />}
            onClick={() => editMode ? handleCancel() : setEditMode(true)}
          >
            {editMode ? '查看' : '编辑'}
          </Button>
        )}

        {editMode && hasUnsavedChanges && (
          <div style={{ marginTop: 8 }}>
            <Alert
              message="有未保存的更改"
              type="warning"
              showIcon
              style={{ fontSize: 12 }}
            />
          </div>
        )}

        {!editMode && attributes.length > 0 ? (
          <AttributeDisplay
            attributes={attributes}
            mode="view"
            layout="vertical"
          />
        ) : editMode ? (
          <AttributeEditor
            attributes={tempAttributes}
            mode="edit"
            categoryId={categoryId}
            onChange={handleAttributesChange}
          />
        ) : (
          <Alert
            message="暂无属性"
            type="info"
            showIcon
            style={{ marginTop: 8 }}
          />
        )}
      </Card>
    )
  }

  // 标准模式渲染
  return (
    <div>
      {renderHeader()}

      {renderChangeAlert()}

      {loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            属性加载中...
          </div>
        </Card>
      ) : (
        <Card>
          {!editMode ? (
            // 查看模式
            <div>
              {attributes.length === 0 ? (
                <Alert
                  message="暂无动态属性"
                  description={
                    mode === 'edit' ? '点击编辑按钮开始添加属性' : '该SPU暂未设置动态属性'
                  }
                  type="info"
                  showIcon
                  action={
                    mode === 'edit' && (
                      <Button size="small" type="primary" onClick={() => setEditMode(true)}>
                        添加属性
                      </Button>
                    )
                  }
                />
              ) : (
                <AttributeDisplay
                  attributes={attributes}
                  mode="view"
                  layout="horizontal"
                />
              )}
            </div>
          ) : (
            // 编辑模式
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                  正在编辑 {tempAttributes.length} 个属性
                </Text>
              </div>

              <AttributeEditor
                attributes={tempAttributes}
                mode="edit"
                categoryId={categoryId}
                onChange={handleAttributesChange}
              />
            </div>
          )}
        </Card>
      )}

      {/* 编辑模式的底部操作栏 */}
      {editMode && !compact && (
        <div style={{
          marginTop: 16,
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
          borderRadius: '0 0 6px 6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Text type="secondary">
              {hasUnsavedChanges ? '有未保存的更改' : '已同步'}
            </Text>
          </div>

          <Space>
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              保存更改
            </Button>
          </Space>
        </div>
      )}
    </div>
  )
}

export default AttributePanel