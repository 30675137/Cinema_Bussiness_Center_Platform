import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Image,
  Divider,
  Typography,
  Alert,
  Spin,
  Row,
  Col,
  Timeline,
  Tabs,
  List,
  Avatar,
  Tooltip,
  message
} from 'antd'
import {
  EditOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  TagOutlined,
  SettingOutlined,
  HistoryOutlined,
  StarOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import type { SPUItem, SPUStatus } from '@/types/spu'
import { spuService } from '@/services/spuService'
import { formatSPUStatus, formatSPUDate, formatSpecifications } from '@/utils/spuHelpers'
import { statusColors } from '@/theme'
import { SPUNotificationService } from '@/components/common/Notification'
import { AttributeDisplay } from './AttributeDisplay'

const { Title, Paragraph, Text } = Typography
const { TabPane } = Tabs

interface SPUDetailProps {
  spuId?: string
  showHeader?: boolean
  showActions?: boolean
  mode?: 'page' | 'modal'
  onEdit?: (spu: SPUItem) => void
  onClose?: () => void
}

const SPUDetail: React.FC<SPUDetailProps> = ({
  spuId,
  showHeader = true,
  showActions = true,
  mode = 'page',
  onEdit,
  onClose
}) => {
  const navigate = useNavigate()
  const params = useParams()
  const currentSpuid = spuId || params.id

  // 状态管理
  const [loading, setLoading] = useState(true)
  const [spu, setSPU] = useState<SPUItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')

  // 加载SPU详情数据
  const loadSPUDetail = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await spuService.getSPUDetail(id)

      if (response.success) {
        setSPU(response.data)
        SPUNotificationService.success('加载SPU详情成功')
      } else {
        throw new Error(response.message || '加载SPU详情失败')
      }
    } catch (error) {
      console.error('Load SPU detail error:', error)
      setError(error instanceof Error ? error.message : '加载SPU详情失败')
      message.error('加载SPU详情失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始化加载数据
  useEffect(() => {
    if (currentSpuid) {
      loadSPUDetail(currentSpuid)
    }
  }, [currentSpuid, loadSPUDetail])

  // 处理编辑
  const handleEdit = useCallback(() => {
    if (spu) {
      if (onEdit) {
        onEdit(spu)
      } else {
        navigate(`/spu/${spu.id}/edit`)
      }
    }
  }, [spu, onEdit, navigate])

  // 处理返回
  const handleBack = useCallback(() => {
    if (onClose) {
      onClose()
    } else {
      navigate('/spu')
    }
  }, [navigate, onClose])

  // 处理分享
  const handleShare = useCallback(() => {
    if (spu) {
      const shareUrl = `${window.location.origin}/spu/${spu.id}`
      navigator.clipboard.writeText(shareUrl).then(() => {
        message.success('分享链接已复制到剪贴板')
      }).catch(() => {
        message.error('复制链接失败')
      })
    }
  }, [spu])

  // 处理打印
  const handlePrint = useCallback(() => {
    if (spu) {
      window.print()
    }
  }, [spu])

  // 处理导出
  const handleExport = useCallback(async () => {
    if (spu) {
      try {
        const response = await spuService.exportSPU(spu.id)
        if (response.success) {
          // 模拟下载
          const link = document.createElement('a')
          link.href = response.data.downloadUrl
          link.download = response.data.fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          message.success(`导出成功：${response.data.fileName}`)
        }
      } catch (error) {
        message.error('导出失败，请重试')
      }
    }
  }, [spu])

  // 获取状态标签
  const getStatusTag = (status: SPUStatus) => {
    const statusInfo = statusColors[status as keyof typeof statusColors]
    return (
      <Tag color={statusInfo.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
        {statusInfo.text}
      </Tag>
    )
  }

  // 渲染操作历史
  const renderOperationHistory = () => {
    if (!spu?.operationHistory || spu.operationHistory.length === 0) {
      return (
        <Alert
          message="暂无操作记录"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      )
    }

    return (
      <Timeline>
        {spu.operationHistory.map((history, index) => (
          <Timeline.Item
            key={index}
            color={history.type === 'create' ? 'green' : history.type === 'update' ? 'blue' : 'red'}
          >
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <strong>{history.action}</strong>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatSPUDate(history.timestamp)}
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserOutlined style={{ fontSize: '12px' }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {history.operator}
                </Text>
                {history.changes && (
                  <Tooltip title={JSON.stringify(history.changes, null, 2)}>
                    <FileTextOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
                  </Tooltip>
                )}
              </div>
              {history.description && (
                <Text type="secondary" style={{ fontSize: '13px', marginTop: 4 }}>
                  {history.description}
                </Text>
              )}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    )
  }

  // 渲染基础信息
  const renderBasicInfo = () => {
    if (!spu) return null

    return (
      <Descriptions
        bordered
        column={{ xs: 1, sm: 2, md: 3 }}
        size="middle"
        style={{ marginTop: 16 }}
      >
        <Descriptions.Item label="SPU编码" span={1}>
          <Text code style={{ fontSize: '14px', fontWeight: 500 }}>
            {spu.code}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="SPU名称" span={1}>
          <strong style={{ fontSize: '16px' }}>{spu.name}</strong>
          {spu.shortName && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">简称: {spu.shortName}</Text>
            </div>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="状态" span={1}>
          {getStatusTag(spu.status)}
        </Descriptions.Item>

        <Descriptions.Item label="标准单位" span={1}>
          {spu.unit || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="品牌" span={1}>
          {spu.brand ? (
            <Space>
              {spu.brand.logo && (
                <Avatar
                  src={spu.brand.logo}
                  size="small"
                  alt={spu.brand.name}
                />
              )}
              <span>{spu.brand.name}</span>
              {spu.brand.code && (
                <Text type="secondary">({spu.brand.code})</Text>
              )}
            </Space>
          ) : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="分类" span={1}>
          {spu.category ? (
            <Tooltip title={spu.category.path?.join(' / ')}>
              <Tag color="green">{spu.category.name}</Tag>
            </Tooltip>
          ) : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="标签" span={2}>
          {spu.tags && spu.tags.length > 0 ? (
            <Space wrap size={[4, 4]}>
              {spu.tags.map((tag, index) => (
                <Tag key={index} style={{ fontSize: '12px' }}>
                  {tag}
                </Tag>
              ))}
            </Space>
          ) : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="创建时间" span={1}>
          {formatSPUDate(spu.createdAt)}
        </Descriptions.Item>

        <Descriptions.Item label="创建者" span={1}>
          {spu.createdBy || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="更新时间" span={1}>
          {formatSPUDate(spu.updatedAt)}
        </Descriptions.Item>

        <Descriptions.Item label="更新者" span={1}>
          {spu.updatedBy || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="审核状态" span={1}>
          {spu.auditStatus ? (
            <Tag color={spu.auditStatus === 'approved' ? 'green' : 'orange'}>
              {spu.auditStatus === 'approved' ? '已审核' : '待审核'}
            </Tag>
          ) : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="商品描述" span={3}>
          <Paragraph ellipsis={{ rows: 4, expandable: true }}>
            {spu.description || '-'}
          </Paragraph>
        </Descriptions.Item>
      </Descriptions>
    )
  }

  // 渲染图片信息
  const renderImages = () => {
    if (!spu?.images || spu.images.length === 0) {
      return (
        <Alert
          message="暂无图片"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      )
    }

    return (
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {spu.images.map((image, index) => (
          <Col xs={12} sm={8} md={6} key={index}>
            <Image
              width="100%"
              src={image.url}
              alt={image.alt || `图片${index + 1}`}
              style={{ borderRadius: '8px', border: '1px solid #f0f0f0' }}
              preview={{
                mask: '预览'
              }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMCThS6VzhQM+oi6lP4UrWixxg1Gko1+B8OJh0l7IJgJZYC7tdy4wJKjEzzHJcNglMcAA=="
            />
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {image.alt || `图片${index + 1}`}
              </Text>
            </div>
          </Col>
        ))}
      </Row>
    )
  }

  // 渲染规格参数
  const renderSpecifications = () => {
    if (!spu?.specifications || spu.specifications.length === 0) {
      return (
        <Alert
          message="暂无规格参数"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      )
    }

    return (
      <Descriptions
        bordered
        column={{ xs: 1, sm: 2 }}
        size="middle"
        style={{ marginTop: 16 }}
      >
        {spu.specifications.map((spec, index) => (
          <Descriptions.Item key={index} label={spec.name}>
            {spec.value}
          </Descriptions.Item>
        ))}
      </Descriptions>
    )
  }

  // 加载状态
  if (loading) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">正在加载SPU详情...</Text>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error || !spu) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <Alert
          message="加载失败"
          description={error || 'SPU不存在或已被删除'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/spu')}>
              返回列表
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div style={{ padding: 24, backgroundColor: '#fff' }}>
      {/* 页面头部 */}
      {showHeader && mode === 'page' && (
        <div style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            >
              返回
            </Button>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {spu.name}
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                SPU编码: {spu.code}
              </Text>
            </div>
          </div>

          {showActions && (
            <Space wrap>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑
              </Button>
              <Button
                icon={<ShareAltOutlined />}
                onClick={handleShare}
              >
                分享
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                打印
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                导出
              </Button>
            </Space>
          )}
        </div>
      )}

      {/* 主要内容区域 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              基础信息
            </span>
          }
          key="basic"
        >
          {renderBasicInfo()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <EyeOutlined />
              图片信息
            </span>
          }
          key="images"
        >
          {renderImages()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined />
              规格参数
            </span>
          }
          key="specifications"
        >
          {renderSpecifications()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <TagOutlined />
              动态属性
            </span>
          }
          key="attributes"
        >
          <div style={{ marginTop: 16 }}>
            <AttributeDisplay
              attributes={spu.attributes || []}
              mode="view"
            />
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <HistoryOutlined />
              操作历史
            </span>
          }
          key="history"
        >
          {renderOperationHistory()}
        </TabPane>
      </Tabs>
    </div>
  )
}

export default SPUDetail