/**
 * @spec M002-material-filter
 * Material Import Modal - 物料批量导入弹窗
 * User Story: US3 - 批量导入物料数据
 */
import { useState } from 'react'
import { Modal, Upload, Button, Alert, Table, message, Space } from 'antd'
import { UploadOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import type { UploadFile, RcFile } from 'antd/es/upload/interface'
import type { MaterialImportRecord } from '@/types/material'

interface MaterialImportModalProps {
  open: boolean
  onCancel: () => void
  onSuccess: () => void
  onPreview: (file: File) => Promise<MaterialImportResult>
  onConfirm: (file: File) => Promise<MaterialImportResult>
}

interface MaterialImportResult {
  totalCount: number
  successCount: number
  failureCount: number
  records: MaterialImportRecord[]
}

/**
 * 物料导入弹窗
 * 
 * 功能：
 * 1. 上传 Excel 文件
 * 2. 预览校验结果
 * 3. 确认导入
 * 4. 下载导入模板
 */
export function MaterialImportModal({
  open,
  onCancel,
  onSuccess,
  onPreview,
  onConfirm,
}: MaterialImportModalProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewResult, setPreviewResult] = useState<MaterialImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  // 文件上传前校验
  const beforeUpload = (file: RcFile): boolean => {
    // 1. 检查文件类型
    const isExcel =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')

    if (!isExcel) {
      message.error('只支持上传 .xlsx 或 .xls 格式的 Excel 文件')
      return false
    }

    // 2. 检查文件大小（最大 10MB）
    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      message.error('文件大小不能超过 10MB')
      return false
    }

    return true
  }

  // 处理文件上传
  const handleUpload = async (file: RcFile) => {
    setFileList([file as UploadFile])
    setLoading(true)
    setPreviewResult(null)

    try {
      const result = await onPreview(file as File)
      setPreviewResult(result)

      if (result.failureCount === 0) {
        message.success(`校验成功！共 ${result.successCount} 条记录`)
      } else {
        message.warning(`校验完成，成功 ${result.successCount} 条，失败 ${result.failureCount} 条`)
      }
    } catch (error: any) {
      message.error(error.message || '文件解析失败，请检查文件格式')
      setFileList([])
    } finally {
      setLoading(false)
    }

    return false // 阻止自动上传
  }

  // 确认导入
  const handleConfirm = async () => {
    if (!fileList.length) {
      message.warning('请先上传文件')
      return
    }

    const file = fileList[0] as RcFile
    setImporting(true)

    try {
      const result = await onConfirm(file as File)

      if (result.failureCount === 0) {
        message.success(`导入成功！共导入 ${result.successCount} 条记录`)
        onSuccess()
        handleClose()
      } else {
        message.warning(`导入完成，成功 ${result.successCount} 条，失败 ${result.failureCount} 条`)
        setPreviewResult(result)
      }
    } catch (error: any) {
      message.error(error.message || '导入失败，请稍后重试')
    } finally {
      setImporting(false)
    }
  }

  // 下载导入模板
  const handleDownloadTemplate = () => {
    // 创建模板数据（示例行）
    const templateData = [
      ['物料编码', '物料名称*', '分类*', '库存单位名称*', '采购单位名称*', '换算率', '使用全局换算', '标准成本', '规格', '描述'],
      ['MAT001', '示例原料', 'RAW_MATERIAL', '千克', '吨', '1000', 'false', '50.00', '食品级', '这是一个示例原料'],
      ['', '示例包材', 'PACKAGING', '个', '箱', '100', 'false', '5.00', '标准包装', '这是一个示例包材'],
    ]

    // 创建 CSV 内容（使用 BOM 使 Excel 正确识别 UTF-8 编码）
    const BOM = '\uFEFF'
    const csvContent = BOM + templateData.map(row => row.join(',')).join('\n')

    // 创建 Blob 并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = '物料导入模板.csv'
    link.click()
    window.URL.revokeObjectURL(link.href)

    message.success('模板下载成功')
  }

  // 关闭弹窗
  const handleClose = () => {
    setFileList([])
    setPreviewResult(null)
    onCancel()
  }

  // 表格列定义
  const columns = [
    {
      title: '行号',
      dataIndex: 'rowIndex',
      key: 'rowIndex',
      width: 80,
    },
    {
      title: '物料编码',
      dataIndex: ['data', 'code'],
      key: 'code',
      width: 120,
    },
    {
      title: '物料名称',
      dataIndex: ['data', 'name'],
      key: 'name',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: ['data', 'category'],
      key: 'category',
      width: 100,
      render: (category: string) => (category === 'RAW_MATERIAL' ? '原料' : '包材'),
    },
    {
      title: '状态',
      dataIndex: 'valid',
      key: 'valid',
      width: 80,
      render: (valid: boolean) =>
        valid ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        ),
    },
    {
      title: '错误信息',
      dataIndex: 'errors',
      key: 'errors',
      render: (errors?: string[]) => (errors && errors.length > 0 ? errors.join('; ') : '-'),
    },
  ]

  return (
    <Modal
      title="批量导入物料"
      open={open}
      onCancel={handleClose}
      width={900}
      footer={[
        <Button key="template" icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
          下载模板
        </Button>,
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button
          key="confirm"
          type="primary"
          loading={importing}
          disabled={!previewResult || previewResult.successCount === 0}
          onClick={handleConfirm}
        >
          确认导入
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 文件上传 */}
        <Upload
          fileList={fileList}
          beforeUpload={beforeUpload}
          customRequest={({ file }) => handleUpload(file as RcFile)}
          onRemove={() => {
            setFileList([])
            setPreviewResult(null)
          }}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            {loading ? '解析中...' : '选择 Excel 文件'}
          </Button>
        </Upload>

        {/* 预览结果汇总 */}
        {previewResult && (
          <>
            <Alert
              type={previewResult.failureCount === 0 ? 'success' : 'warning'}
              message={
                <Space>
                  <span>共 {previewResult.totalCount} 条记录</span>
                  <span style={{ color: '#52c41a' }}>成功 {previewResult.successCount} 条</span>
                  {previewResult.failureCount > 0 && (
                    <span style={{ color: '#ff4d4f' }}>失败 {previewResult.failureCount} 条</span>
                  )}
                </Space>
              }
            />

            {/* 预览结果详情表格 */}
            <Table
              dataSource={previewResult.records}
              columns={columns}
              rowKey="rowIndex"
              pagination={{ pageSize: 10 }}
              scroll={{ y: 400 }}
              size="small"
            />
          </>
        )}
      </Space>
    </Modal>
  )
}
