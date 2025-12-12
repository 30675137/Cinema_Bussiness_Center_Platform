import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Select,
  Button,
  Space,
  Row,
  Col,
  Progress,
  Table,
  message,
  Typography,
  Divider,
  Alert,
  Tag,
  Tooltip,
  Modal,
  Upload,
  Steps,
  Badge,
  Timeline,
  Input,
  Switch,
  Collapse,
  Radio
} from 'antd'
import {
  UploadOutlined,
  ImportOutlined,
  DownloadOutlined,
  SearchOutlined,
  SettingOutlined,
  DeleteOutlined,
  EyeOutlined,
  RefreshOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  FileExcelOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd/es/upload/interface'
import type { ImportConfig, ImportTask, ImportFormat, ImportDataType, ImportError, ImportWarning } from '@/types/spu'
import { importService } from '@/services/importService'

const { Title, Text } = Typography
const { Option } = Select
const { Step } = Steps
const { Panel } = Collapse
const { Radio: RadioGroup } = Radio

interface DataImportProps {
  className?: string
  style?: React.CSSProperties
  onImportComplete?: (task: ImportTask) => void
}

const DataImport: React.FC<DataImportProps> = ({
  className,
  style,
  onImportComplete
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [importTasks, setImportTasks] = useState<ImportTask[]>([])
  const [selectedDataType, setSelectedDataType] = useState<ImportDataType>('spu')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [showMapping, setShowMapping] = useState(false)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})

  // 数据类型配置
  const dataTypeOptions = [
    { value: 'spu', label: 'SPU商品', description: '导入SPU商品数据' },
    { value: 'category', label: '商品分类', description: '导入商品分类数据' },
    { value: 'brand', label: '商品品牌', description: '导入商品品牌数据' },
    { value: 'attribute_template', label: '属性模板', description: '导入属性模板数据' }
  ]

  // 导入格式配置
  const formatOptions = [
    { value: 'xlsx', label: 'Excel (.xlsx)', icon: <FileExcelOutlined /> },
    { value: 'csv', label: 'CSV (.csv)', icon: <FileTextOutlined /> }
  ]

  // 字段映射配置
  const fieldMappingTemplates = {
    spu: {
      required: ['name', 'code'],
      optional: ['shortName', 'description', 'unit', 'brandCode', 'categoryCode', 'status']
    },
    category: {
      required: ['name', 'code'],
      optional: ['description', 'parentCode', 'level', 'status']
    },
    brand: {
      required: ['name', 'code'],
      optional: ['description', 'contactPerson', 'phone', 'email', 'website', 'status']
    },
    attribute_template: {
      required: ['name', 'code'],
      optional: ['description', 'categoryCode', 'status']
    }
  }

  // 加载导入任务历史
  const loadImportTasks = async () => {
    try {
      const tasks = await importService.getImportTasks()
      setImportTasks(tasks)
    } catch (error) {
      console.error('Load import tasks error:', error)
    }
  }

  // 处理文件上传
  const handleFileUpload: UploadProps['beforeUpload'] = (file) => {
    const isValidFormat = ['xlsx', 'xls', 'csv'].includes(file.name.split('.').pop()?.toLowerCase() || '')
    if (!isValidFormat) {
      message.error('只支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式')
      return false
    }

    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      message.error('文件大小不能超过 10MB')
      return false
    }

    setUploadedFile(file)
    setCurrentStep(1)
    return false // 阻止自动上传
  }

  // 处理数据类型变更
  const handleDataTypeChange = (dataType: ImportDataType) => {
    setSelectedDataType(dataType)
    setFieldMapping({})
    setValidationResult(null)
  }

  // 处理下一步
  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // 验证文件上传
        if (!uploadedFile) {
          message.error('请先上传文件')
          return
        }
        setCurrentStep(1)
      } else if (currentStep === 1) {
        // 验证文件格式
        setLoading(true)
        const values = await form.validateFields()

        const importConfig: ImportConfig = {
          dataType: values.dataType,
          format: values.format,
          filePath: URL.createObjectURL(uploadedFile),
          options: {
            skipFirstRow: values.skipFirstRow,
            sheetName: values.sheetName,
            mapping: fieldMapping,
            validation: true
          }
        }

        const response = await importService.validateFile(importConfig)

        if (response.success && response.data?.validationResult) {
          setValidationResult(response.data.validationResult)

          if (response.data.validationResult.isValid) {
            setCurrentStep(2)
          } else {
            message.warning('文件验证失败，请查看错误信息')
          }
        } else {
          message.error('文件验证失败')
        }
      } else if (currentStep === 2) {
        // 确认导入
        await handleImport()
      }
    } catch (error) {
      console.error('Next step error:', error)
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理上一步
  const handlePrev = () => {
    setCurrentStep(Math.max(0, currentStep - 1))
  }

  // 处理导入
  const handleImport = async () => {
    try {
      setImporting(true)
      setLoading(true)

      const values = await form.validateFields()

      const importConfig: ImportConfig = {
        dataType: values.dataType,
        format: values.format,
        filePath: URL.createObjectURL(uploadedFile!),
        options: {
          skipFirstRow: values.skipFirstRow,
          sheetName: values.sheetName,
          mapping: fieldMapping,
          validation: false,
          batchSize: values.batchSize
        }
      }

      const response = await importService.createImportTask(importConfig)

      if (response.success) {
        message.success('导入任务已创建，正在处理中...')
        setCurrentStep(3)

        // 开始轮询任务状态
        if (response.data?.taskId) {
          pollTaskStatus(response.data.taskId)
        }

        // 重新加载任务列表
        loadImportTasks()

        onImportComplete?.(response.data as any)
      } else {
        message.error(response.message || '创建导入任务失败')
      }
    } catch (error) {
      console.error('Import error:', error)
      message.error('导入失败，请重试')
    } finally {
      setImporting(false)
      setLoading(false)
    }
  }

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const task = await importService.getImportTask(taskId)

        if (task.status === 'completed') {
          clearInterval(pollInterval)
          message.success(`导入完成：成功 ${task.successCount} 条，失败 ${task.errorCount} 条`)
          loadImportTasks()
        } else if (task.status === 'failed') {
          clearInterval(pollInterval)
          message.error(`导入失败：${task.errors?.[0]?.message || '未知错误'}`)
          loadImportTasks()
        } else {
          // 更新任务状态
          setImportTasks(prev =>
            prev.map(t => t.id === taskId ? task : t)
          )
        }
      } catch (error) {
        clearInterval(pollInterval)
        console.error('Poll task status error:', error)
      }
    }, 2000)

    // 最多轮询5分钟
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 5 * 60 * 1000)
  }

  // 下载导入模板
  const handleDownloadTemplate = () => {
    importService.downloadTemplate(selectedDataType)
  }

  // 重置导入流程
  const handleReset = () => {
    setCurrentStep(0)
    setUploadedFile(null)
    setValidationResult(null)
    setFieldMapping({})
    form.resetFields()
  }

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'default', text: '等待中' },
      processing: { color: 'processing', text: '处理中' },
      validating: { color: 'warning', text: '验证中' },
      importing: { color: 'processing', text: '导入中' },
      completed: { color: 'success', text: '已完成' },
      failed: { color: 'error', text: '失败' }
    }

    const config = statusMap[status as keyof typeof statusMap]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 错误列表表格列
  const errorColumns: ColumnsType<ImportError> = [
    { title: '行号', dataIndex: 'row', key: 'row', width: 80 },
    { title: '列名', dataIndex: 'column', key: 'column', width: 120 },
    { title: '字段', dataIndex: 'field', key: 'field', width: 120 },
    { title: '值', dataIndex: 'value', key: 'value', ellipsis: true },
    { title: '错误信息', dataIndex: 'message', key: 'message', ellipsis: true }
  ]

  // 任务历史表格列
  const taskColumns: ColumnsType<ImportTask> = [
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 120,
      render: (dataType) => {
        const option = dataTypeOptions.find(opt => opt.value === dataType)
        return option?.label || dataType
      }
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '进度',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const percent = record.totalRows > 0
          ? Math.round((record.processedRows / record.totalRows) * 100)
          : 0

        return (
          <div>
            <Progress
              percent={percent}
              size="small"
              status={record.status === 'failed' ? 'exception' : 'active'}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
              成功: {record.successCount} | 失败: {record.errorCount}
            </div>
          </div>
        )
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('zh-CN')
    }
  ]

  // 导入步骤配置
  const steps = [
    {
      title: '上传文件',
      description: '选择并上传要导入的文件',
      icon: <UploadOutlined />
    },
    {
      title: '验证数据',
      description: '验证文件格式和数据有效性',
      icon: <SearchOutlined />
    },
    {
      title: '确认导入',
      description: '确认导入配置并开始导入',
      icon: <CheckCircleOutlined />
    },
    {
      title: '导入完成',
      description: '查看导入结果',
      icon: <LoadingOutlined />
    }
  ]

  useEffect(() => {
    loadImportTasks()
  }, [])

  return (
    <div className={className} style={style}>
      <Card title="数据导入向导" style={{ marginBottom: 16 }}>
        {/* 步骤条 */}
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>

        {/* 步骤内容 */}
        <Form form={form} layout="vertical" initialValues={{
          dataType: 'spu',
          format: 'xlsx',
          skipFirstRow: true,
          batchSize: 100
        }}>
          {/* 步骤 0: 上传文件 */}
          {currentStep === 0 && (
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="数据类型"
                    name="dataType"
                    rules={[{ required: true, message: '请选择数据类型' }]}
                  >
                    <Select
                      placeholder="请选择要导入的数据类型"
                      onChange={handleDataTypeChange}
                    >
                      {dataTypeOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          <div>
                            <div>{option.label}</div>
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              {option.description}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="文件格式"
                    name="format"
                    rules={[{ required: true, message: '请选择文件格式' }]}
                  >
                    <Select placeholder="请选择文件格式">
                      {formatOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          <Space>
                            {option.icon}
                            {option.label}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <Upload
                  beforeUpload={handleFileUpload}
                  accept=".xlsx,.xls,.csv"
                  showUploadList={false}
                  disabled={!!uploadedFile}
                >
                  <div style={{ border: '2px dashed #d9d9d9', borderRadius: 8, padding: '40px', textAlign: 'center' }}>
                    <UploadOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                    <div style={{ color: '#999', marginBottom: 16 }}>
                      点击或拖拽文件到此区域上传
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式，文件大小不超过 10MB
                    </div>
                  </div>
                </Upload>

                {uploadedFile && (
                  <div style={{ marginTop: 16 }}>
                    <Alert
                      message={`已选择文件: ${uploadedFile.name}`}
                      type="info"
                      showIcon
                      action={
                        <Button size="small" onClick={() => setUploadedFile(null)}>
                          重新选择
                        </Button>
                      }
                    />
                  </div>
                )}

                <div style={{ marginTop: 16 }}>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadTemplate}
                  >
                    下载导入模板
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 步骤 1: 验证数据 */}
          {currentStep === 1 && (
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="skipFirstRow" valuePropName="checked">
                    <Checkbox>跳过第一行（表头）</Checkbox>
                  </Form.Item>
                </Col>

                {form.getFieldValue('format') === 'xlsx' && (
                  <Col span={12}>
                    <Form.Item name="sheetName" label="工作表名称">
                      <Input placeholder="默认为第一个工作表" />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleNext}
                  loading={loading}
                >
                  验证文件
                </Button>
              </div>

              {validationResult && (
                <div style={{ marginTop: 24 }}>
                  {validationResult.isValid ? (
                    <Alert
                      message="文件验证成功"
                      description={`共验证 ${validationResult.totalRows} 行数据，其中有效 ${validationResult.validRows} 行`}
                      type="success"
                      showIcon
                    />
                  ) : (
                    <Alert
                      message="文件验证失败"
                      description={`发现 ${validationResult.invalidRows} 条无效数据`}
                      type="error"
                      showIcon
                    />
                  )}

                  {validationResult.errors && validationResult.errors.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Title level={5}>错误详情</Title>
                      <Table
                        columns={errorColumns}
                        dataSource={validationResult.errors}
                        rowKey="row"
                        pagination={{ pageSize: 5 }}
                        size="small"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 步骤 2: 确认导入 */}
          {currentStep === 2 && (
            <div>
              <Alert
                message="准备导入数据"
                description={`将导入 ${validationResult?.validRows || 0} 条有效数据`}
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="批次大小" name="batchSize">
                    <Select>
                      <Option value={50}>50条/批</Option>
                      <Option value={100}>100条/批</Option>
                      <Option value={200}>200条/批</Option>
                      <Option value={500}>500条/批</Option>
                      <Option value={1000}>1000条/批</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="validateBatch" valuePropName="checked" label="批次验证">
                    <RadioGroup>
                      <Radio value={true}>启用</Radio>
                      <Radio value={false}>禁用</Radio>
                    </RadioGroup>
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Space size="large">
                  <Button onClick={handlePrev}>
                    上一步
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleImport}
                    loading={importing}
                    icon={<ImportOutlined />}
                  >
                    开始导入
                  </Button>
                </Space>
              </div>
            </div>
          )}

          {/* 步骤 3: 导入完成 */}
          {currentStep === 3 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
              <Title level={3}>导入任务已创建</Title>
              <Text type="secondary">
                正在后台处理导入任务，您可以在下方的导入历史中查看进度
              </Text>
              <div style={{ marginTop: 24 }}>
                <Button onClick={handleReset}>
                  重新导入
                </Button>
              </div>
            </div>
          )}
        </Form>
      </Card>

      {/* 导入任务历史 */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>导入任务历史</span>
            <Button
              icon={<RefreshOutlined />}
              onClick={loadImportTasks}
              size="small"
            >
              刷新
            </Button>
          </div>
        }
      >
        {importTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <ImportOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
            <div style={{ color: '#999' }}>暂无导入任务</div>
          </div>
        ) : (
          <Table
            columns={taskColumns}
            dataSource={importTasks}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </div>
  )
}

export default DataImport