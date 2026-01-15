import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Checkbox,
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
  DatePicker,
  Input,
} from 'antd';
import {
  DownloadOutlined,
  ExportOutlined,
  SearchOutlined,
  SettingOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ExportConfig, ExportTask, ExportFormat, ExportDataType } from '@/types/spu';
import { exportService } from '@/services/exportService';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface DataExportProps {
  className?: string;
  style?: React.CSSProperties;
  onExportComplete?: (task: ExportTask) => void;
}

const DataExport: React.FC<DataExportProps> = ({ className, style, onExportComplete }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportTasks, setExportTasks] = useState<ExportTask[]>([]);
  const [selectedDataType, setSelectedDataType] = useState<ExportDataType>('spu');
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 数据类型配置
  const dataTypeOptions = [
    { value: 'spu', label: 'SPU商品', description: '导出SPU商品数据' },
    { value: 'category', label: '商品分类', description: '导出商品分类数据' },
    { value: 'brand', label: '商品品牌', description: '导出商品品牌数据' },
    { value: 'attribute_template', label: '属性模板', description: '导出属性模板数据' },
  ];

  // 导出格式配置
  const formatOptions = [
    { value: 'xlsx', label: 'Excel (.xlsx)', icon: <FileExcelOutlined /> },
    { value: 'csv', label: 'CSV (.csv)', icon: <FileTextOutlined /> },
    { value: 'json', label: 'JSON (.json)', icon: <FileOutlined /> },
  ];

  // 默认字段配置
  const defaultFields = {
    spu: ['code', 'name', 'shortName', 'brandName', 'categoryName', 'status', 'createdAt'],
    category: ['code', 'name', 'level', 'status', 'createdAt'],
    brand: ['code', 'name', 'contactPerson', 'phone', 'email', 'status', 'createdAt'],
    attribute_template: ['code', 'name', 'categoryId', 'status', 'attributeCount', 'createdAt'],
  };

  // 加载导出任务历史
  const loadExportTasks = async () => {
    try {
      const tasks = await exportService.getExportTasks();
      setExportTasks(tasks);
    } catch (error) {
      console.error('Load export tasks error:', error);
    }
  };

  // 获取可用字段
  const getAvailableFields = (dataType: ExportDataType) => {
    const fieldsMap: Record<ExportDataType, string[]> = {
      spu: [
        'code',
        'name',
        'shortName',
        'description',
        'unit',
        'brandId',
        'brandName',
        'categoryId',
        'categoryName',
        'categoryPath',
        'status',
        'auditStatus',
        'skuCount',
        'priceRange',
        'inventory',
        'tags',
        'createdAt',
        'updatedAt',
        'createdBy',
        'updatedBy',
      ],
      category: [
        'code',
        'name',
        'description',
        'parentId',
        'level',
        'path',
        'status',
        'sort',
        'childrenCount',
        'createdAt',
        'updatedAt',
      ],
      brand: [
        'code',
        'name',
        'description',
        'logo',
        'contactPerson',
        'phone',
        'email',
        'website',
        'status',
        'createdAt',
        'updatedAt',
      ],
      attribute_template: [
        'code',
        'name',
        'description',
        'categoryId',
        'categoryName',
        'status',
        'isSystem',
        'attributeCount',
        'createdAt',
        'updatedAt',
      ],
    };

    return fieldsMap[dataType] || [];
  };

  // 处理数据类型变更
  const handleDataTypeChange = (dataType: ExportDataType) => {
    setSelectedDataType(dataType);
    const fields = getAvailableFields(dataType);
    setAvailableFields(fields);

    // 设置默认选中字段
    form.setFieldsValue({
      fields: defaultFields[dataType] || [],
    });
  };

  // 处理导出
  const handleExport = async (values: any) => {
    try {
      setExporting(true);
      setLoading(true);

      const exportConfig: ExportConfig = {
        dataType: values.dataType,
        format: values.format,
        fields: values.fields,
        filters: {
          dateRange: values.dateRange,
          keyword: values.keyword,
          status: values.status,
        },
        includeHeaders: values.includeHeaders,
        pageSize: values.pageSize,
      };

      const response = await exportService.createExportTask(exportConfig);

      if (response.success) {
        message.success('导出任务已创建，正在处理中...');

        // 开始轮询任务状态
        if (response.data?.taskId) {
          pollTaskStatus(response.data.taskId);
        }

        // 重新加载任务列表
        loadExportTasks();

        onExportComplete?.(response.data as any);
      } else {
        message.error(response.message || '创建导出任务失败');
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('导出失败，请重试');
    } finally {
      setExporting(false);
      setLoading(false);
    }
  };

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const task = await exportService.getExportTask(taskId);

        if (task.status === 'completed') {
          clearInterval(pollInterval);
          message.success(`导出完成：${task.fileName}`);
          loadExportTasks();
        } else if (task.status === 'failed') {
          clearInterval(pollInterval);
          message.error(`导出失败：${task.errorMessage}`);
          loadExportTasks();
        } else {
          // 更新任务状态
          setExportTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
        }
      } catch (error) {
        clearInterval(pollInterval);
        console.error('Poll task status error:', error);
      }
    }, 2000);

    // 最多轮询5分钟
    setTimeout(
      () => {
        clearInterval(pollInterval);
      },
      5 * 60 * 1000
    );
  };

  // 处理下载
  const handleDownload = (task: ExportTask) => {
    if (task.downloadUrl) {
      window.open(task.downloadUrl, '_blank');
    }
  };

  // 处理删除任务
  const handleDeleteTask = async (taskId: string) => {
    try {
      await exportService.deleteExportTask(taskId);
      message.success('删除任务成功');
      loadExportTasks();
    } catch (error) {
      console.error('Delete task error:', error);
      message.error('删除任务失败');
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    loadExportTasks();
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'default', text: '等待中' },
      processing: { color: 'processing', text: '处理中' },
      completed: { color: 'success', text: '已完成' },
      failed: { color: 'error', text: '失败' },
    };

    const config = statusMap[status as keyof typeof statusMap];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取格式图标
  const getFormatIcon = (format: string) => {
    const iconMap = {
      xlsx: <FileExcelOutlined />,
      csv: <FileTextOutlined />,
      json: <FileOutlined />,
    };
    return iconMap[format as keyof typeof iconMap] || <FileOutlined />;
  };

  // 任务表格列定义
  const taskColumns: ColumnsType<ExportTask> = [
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 120,
      render: (dataType) => {
        const option = dataTypeOptions.find((opt) => opt.value === dataType);
        return option?.label || dataType;
      },
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      width: 80,
      render: (format) => <Tooltip title={format.toUpperCase()}>{getFormatIcon(format)}</Tooltip>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '进度',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const percent =
          record.totalRecords > 0
            ? Math.round((record.processedRecords / record.totalRecords) * 100)
            : 0;

        return (
          <Progress
            percent={percent}
            size="small"
            status={record.status === 'failed' ? 'exception' : 'active'}
            format={() => `${record.processedRecords}/${record.totalRecords}`}
          />
        );
      },
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
      render: (fileName, record) => (
        <div>
          {fileName || '-'}
          {record.downloadUrl && (
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              style={{ padding: 0, marginLeft: 8 }}
            >
              下载
            </Button>
          )}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="删除">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDeleteTask(record.id)}
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    loadExportTasks();
    handleDataTypeChange('spu');
  }, []);

  return (
    <div className={className} style={style}>
      {/* 导出配置 */}
      <Card title="数据导出配置" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleExport}
          initialValues={{
            dataType: 'spu',
            format: 'xlsx',
            includeHeaders: true,
            fields: defaultFields.spu,
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="数据类型"
                name="dataType"
                rules={[{ required: true, message: '请选择数据类型' }]}
              >
                <Select placeholder="请选择要导出的数据类型" onChange={handleDataTypeChange}>
                  {dataTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <div>
                        <div>{option.label}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{option.description}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="导出格式"
                name="format"
                rules={[{ required: true, message: '请选择导出格式' }]}
              >
                <Select placeholder="请选择导出格式">
                  {formatOptions.map((option) => (
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

            <Col span={8}>
              <Form.Item name="includeHeaders" valuePropName="checked">
                <Checkbox>包含表头</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="导出字段"
            name="fields"
            rules={[{ required: true, message: '请选择要导出的字段' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择要导出的字段"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {availableFields.map((field) => (
                <Option key={field} value={field}>
                  {field}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 高级选项 */}
          <div style={{ marginBottom: 16 }}>
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '收起' : '展开'}高级选项
            </Button>
          </div>

          {showAdvanced && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="日期范围" name="dateRange">
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="关键词搜索" name="keyword">
                    <Input placeholder="搜索关键词" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="状态筛选" name="status">
                    <Select placeholder="请选择状态" allowClear>
                      <Option value="active">启用</Option>
                      <Option value="inactive">停用</Option>
                      <Option value="draft">草稿</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="分页大小" name="pageSize">
                    <Select placeholder="请选择分页大小" defaultValue={1000}>
                      <Option value={500}>500条/页</Option>
                      <Option value={1000}>1000条/页</Option>
                      <Option value={2000}>2000条/页</Option>
                      <Option value={5000}>5000条/页</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => form.resetFields()}>重置</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<ExportOutlined />}
                loading={exporting}
              >
                开始导出
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      {/* 导出任务历史 */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>导出任务历史</span>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} size="small">
              刷新
            </Button>
          </div>
        }
      >
        {exportTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <ExportOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
            <div style={{ color: '#999' }}>暂无导出任务</div>
          </div>
        ) : (
          <Table
            columns={taskColumns}
            dataSource={exportTasks}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>
    </div>
  );
};

export default DataExport;
