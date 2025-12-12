import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Space, message, Breadcrumb, Typography, Row, Col } from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  DownloadOutlined,
  SettingOutlined
} from '@ant-design/icons'
import SPUDetail from '@/components/SPU/SPUDetail'
import SPUEditForm from '@/components/forms/SPUEditForm'
import StatusManager from '@/components/SPU/StatusManager'
import type { SPUItem, SPUStatus } from '@/types/spu'
import { spuService } from '@/services/spuService'
import { Breadcrumb as CustomBreadcrumb } from '@/components/common'

const { Title } = Typography

interface SPUDetailPageProps {}

const SPUDetailPage: React.FC<SPUDetailPageProps> = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [currentSPU, setCurrentSPU] = useState<SPUItem | null>(null)
  const [loading, setLoading] = useState(false)

  // 面包屑导航
  const breadcrumbItems = [
    { title: '首页', path: '/dashboard' },
    { title: 'SPU管理', path: '/spu' },
    { title: 'SPU详情' },
  ]

  // 处理编辑
  const handleEdit = () => {
    setMode('edit')
  }

  // 处理保存
  const handleSave = (updatedData: SPUItem) => {
    setCurrentSPU(updatedData)
    setMode('view')
    message.success('SPU更新成功')
  }

  // 处理取消
  const handleCancel = () => {
    setMode('view')
  }

  // 处理状态变更
  const handleStatusChange = (newStatus: SPUStatus, reason?: string) => {
    if (currentSPU) {
      setCurrentSPU({
        ...currentSPU,
        status: newStatus
      })
    }
  }

  // 处理返回
  const handleBack = () => {
    navigate('/spu')
  }

  // 处理分享
  const handleShare = () => {
    if (id) {
      const shareUrl = `${window.location.origin}/spu/${id}`
      navigator.clipboard.writeText(shareUrl).then(() => {
        message.success('分享链接已复制到剪贴板')
      }).catch(() => {
        message.error('复制链接失败')
      })
    }
  }

  // 处理打印
  const handlePrint = () => {
    window.print()
  }

  // 处理导出
  const handleExport = async () => {
    if (id) {
      try {
        setLoading(true)
        const response = await spuService.exportSPU({ spuId: id })
        if (response.success) {
          // 模拟下载
          const link = document.createElement('a')
          link.href = response.data.downloadUrl
          link.download = `${currentSPU?.name || 'SPU'}_详情.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          message.success('导出成功')
        }
      } catch (error) {
        message.error('导出失败，请重试')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题和导航 */}
      <div style={{ marginBottom: 24 }}>
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>

      {/* 页面标题和操作按钮 */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {mode === 'edit' && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
            >
              取消编辑
            </Button>
          )}
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {mode === 'edit' ? '编辑SPU' : 'SPU详情'}
            </Title>
            {currentSPU && (
              <div style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
                {currentSPU.name} ({currentSPU.code})
              </div>
            )}
          </div>
        </div>

        {mode === 'view' && (
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
              loading={loading}
            >
              导出
            </Button>
            <Button onClick={handleBack}>
              返回列表
            </Button>
          </Space>
        )}
      </div>

      {/* 主要内容区域 */}
      {mode === 'view' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* SPU详情组件 */}
          <SPUDetail
            spuId={id}
            mode="page"
            onEdit={handleEdit}
            onClose={handleBack}
          />

          {/* 状态管理组件 */}
          {currentSPU && (
            <StatusManager
              spuId={id!}
              currentStatus={currentSPU.status}
              onStatusChange={handleStatusChange}
              compact={false}
            />
          )}
        </div>
      ) : (
        /* 编辑模式 */
        <SPUEditForm
          spuId={id}
          mode="edit"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default SPUDetailPage