import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Tag,
  Modal,
  Form,
  InputNumber,
  Radio,
  Alert,
  message,
  Progress,
  Divider,
  Checkbox,
  Tooltip,
  Badge
} from 'antd';
import {
  EditOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  SettingOutlined,
  CalculatorOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  usePricesQuery,
  useBatchUpdatePricesMutation
} from '@/stores/priceStore';
import { PriceConfig, PriceType } from '@/types/price';
import { z } from 'zod';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// 批量价格调整表单验证模式
const BatchPriceAdjustmentSchema = z.object({
  adjustmentType: z.enum(['percentage', 'fixed', 'fixed_price']),
  adjustmentValue: z.number().min(0, '调整值不能为负数'),
  roundTo: z.enum(['none', 'nearest', 'up', 'down']).optional(),
  minMargin: z.number().optional(),
  maxAdjustment: z.number().optional(),
  applyTo: z.enum(['all', 'selected', 'filtered']),
  priceType: z.enum(['base', 'current', 'all']).optional()
});

type BatchPriceAdjustmentData = z.infer<typeof BatchPriceAdjustmentSchema>;

interface BatchPriceAdjustmentProps {
  selectedProductIds?: string[];
  onSelectionChange?: (productIds: string[]) => void;
}

const BatchPriceAdjustment: React.FC<BatchPriceAdjustmentProps> = ({
  selectedProductIds = [],
  onSelectionChange
}) => {
  const [adjustmentModalVisible, setAdjustmentModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(selectedProductIds);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [priceTypeFilter, setPriceTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const {
    data: productsData,
    isLoading,
    refetch
  } = usePricesQuery({
    keyword: searchKeyword,
    page: 1,
    pageSize: 100
  });

  const batchUpdateMutation = useBatchUpdatePricesMutation();

  const form = useForm<BatchPriceAdjustmentData>({
    resolver: zodResolver(BatchPriceAdjustmentSchema),
    defaultValues: {
      adjustmentType: 'percentage',
      adjustmentValue: 0,
      roundTo: 'nearest',
      applyTo: 'selected',
      priceType: 'current'
    }
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = form;

  // 监听表单变化
  const watchedValues = watch();

  // 表格列定义
  const columns = [
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <span>{text}</span>
          {record.category && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.category}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: '当前价格',
      key: 'currentPrice',
      width: 120,
      render: (_, record: any) => (
        <Text>¥{(record.currentPrice || 0).toFixed(2)}</Text>
      )
    },
    {
      title: '基础价格',
      key: 'basePrice',
      width: 120,
      render: (_, record: any) => (
        <Text>¥{(record.basePrice || 0).toFixed(2)}</Text>
      )
    },
    {
      title: '价格类型',
      dataIndex: 'priceType',
      key: 'priceType',
      width: 100,
      render: (type: PriceType) => {
        const typeConfig = {
          base: { color: 'blue', text: '基础价格' },
          member: { color: 'green', text: '会员价格' },
          promotion: { color: 'red', text: '促销价格' },
          special: { color: 'purple', text: '特殊价格' },
          wholesale: { color: 'orange', text: '批发价格' },
          channel: { color: 'cyan', text: '渠道价格' }
        };
        const config = typeConfig[type] || typeConfig.base;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '毛利率',
      key: 'margin',
      width: 100,
      render: (_, record: any) => {
        const margin = calculateMargin(record.basePrice, record.currentPrice);
        const color = margin >= 30 ? 'green' : margin >= 15 ? 'orange' : 'red';
        return <Text style={{ color }}>{margin.toFixed(1)}%</Text>;
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-'
    }
  ];

  // 计算毛利率
  const calculateMargin = (costPrice: number, sellingPrice: number): number => {
    if (!costPrice || !sellingPrice || costPrice <= 0) return 0;
    return ((sellingPrice - costPrice) / sellingPrice) * 100;
  };

  // 预览价格调整
  const handlePreview = (data: BatchPriceAdjustmentData) => {
    const products = productsData?.data || [];
    let targetProducts = products;

    // 根据应用范围筛选商品
    if (data.applyTo === 'selected') {
      targetProducts = products.filter(p => selectedRowKeys.includes(p.id));
    } else if (data.applyTo === 'filtered') {
      // 这里可以基于当前筛选条件
      targetProducts = products;
    }

    // 计算调整后的价格
    const previewResults = targetProducts.map(product => {
      let currentPrice = product.currentPrice || 0;
      let basePrice = product.basePrice || 0;
      let newPrice = currentPrice;

      if (data.priceType === 'base') {
        currentPrice = basePrice;
      }

      switch (data.adjustmentType) {
        case 'percentage':
          newPrice = currentPrice * (1 + data.adjustmentValue / 100);
          break;
        case 'fixed':
          newPrice = currentPrice + data.adjustmentValue;
          break;
        case 'fixed_price':
          newPrice = data.adjustmentValue;
          break;
      }

      // 应用舍入规则
      switch (data.roundTo) {
        case 'nearest':
          newPrice = Math.round(newPrice);
          break;
        case 'up':
          newPrice = Math.ceil(newPrice);
          break;
        case 'down':
          newPrice = Math.floor(newPrice);
          break;
      }

      // 确保价格为正数
      newPrice = Math.max(0.01, newPrice);

      const oldMargin = calculateMargin(basePrice, currentPrice);
      const newMargin = calculateMargin(basePrice, newPrice);

      return {
        ...product,
        oldPrice: currentPrice,
        newPrice: newPrice,
        priceChange: newPrice - currentPrice,
        priceChangePercent: ((newPrice - currentPrice) / currentPrice * 100),
        oldMargin,
        newMargin,
        marginChange: newMargin - oldMargin
      };
    });

    setPreviewData(previewResults);
    setPreviewModalVisible(true);
  };

  // 执行批量调整
  const handleExecute = async (data: BatchPriceAdjustmentData) => {
    let productIds: string[] = [];

    if (data.applyTo === 'all') {
      productIds = (productsData?.data || []).map(p => p.id);
    } else if (data.applyTo === 'selected') {
      productIds = selectedRowKeys;
    } else if (data.applyTo === 'filtered') {
      // 基于当前筛选条件
      productIds = (productsData?.data || []).map(p => p.id);
    }

    if (productIds.length === 0) {
      message.warning('请选择要调整价格的商品');
      return;
    }

    try {
      const result = await batchUpdateMutation.mutateAsync({
        productIds,
        adjustment: {
          type: data.adjustmentType,
          value: data.adjustmentValue,
          roundTo: data.roundTo,
          priceType: data.priceType
        }
      });

      message.success(`成功更新 ${result.updated} 个商品的价格`);
      if (result.failed > 0) {
        message.warning(`${result.failed} 个商品更新失败`);
      }

      setAdjustmentModalVisible(false);
      refetch();
    } catch (error) {
      message.error('批量价格调整失败');
    }
  };

  // 导出价格模板
  const handleExportTemplate = async () => {
    try {
      const result = await exportTemplateMutation.mutateAsync({
        format: 'excel',
        includeHeaders: true,
        productIds: selectedRowKeys.length > 0 ? selectedRowKeys : undefined
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([result.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'price_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('价格模板导出成功');
    } catch (error) {
      message.error('价格模板导出失败');
    }
  };

  // 导入价格数据
  const handleImportPrice = async (file: File) => {
    try {
      const result = await importMutation.mutateAsync({
        file,
        updateMode: 'update' // or 'create'
      });

      message.success(`成功导入 ${result.imported} 个商品的价格`);
      if (result.failed > 0) {
        message.warning(`${result.failed} 个商品导入失败`);
      }

      refetch();
    } catch (error) {
      message.error('价格数据导入失败');
    }
  };

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[]);
      onSelectionChange?.(keys as string[]);
    }
  };

  // 预览表格列
  const previewColumns = [
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 200
    },
    {
      title: '原价格',
      dataIndex: 'oldPrice',
      key: 'oldPrice',
      width: 100,
      render: (price: number) => <Text>¥{price.toFixed(2)}</Text>
    },
    {
      title: '新价格',
      dataIndex: 'newPrice',
      key: 'newPrice',
      width: 100,
      render: (price: number) => <Text strong>¥{price.toFixed(2)}</Text>
    },
    {
      title: '价格变动',
      key: 'priceChange',
      width: 120,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text style={{ color: record.priceChange >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {record.priceChange >= 0 ? '+' : ''}¥{record.priceChange.toFixed(2)}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.priceChangePercent >= 0 ? '+' : ''}{record.priceChangePercent.toFixed(1)}%
          </Text>
        </Space>
      )
    },
    {
      title: '毛利率变化',
      key: 'marginChange',
      width: 120,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>{record.oldMargin.toFixed(1)}% → {record.newMargin.toFixed(1)}%</Text>
          <Text
            type={record.marginChange >= 0 ? 'success' : 'danger'}
            style={{ fontSize: 12 }}
          >
            {record.marginChange >= 0 ? '+' : ''}{record.marginChange.toFixed(1)}%
          </Text>
        </Space>
      )
    }
  ];

  return (
    <div className="batch-price-adjustment">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <CalculatorOutlined style={{ marginRight: 8 }} />
              批量价格调整
            </Title>
            <Text type="secondary">
              对多个商品进行批量价格调整，支持百分比、固定金额等方式
            </Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleExportTemplate}>
                导出模板
              </Button>
              <Button icon={<UploadOutlined />}>
                导入价格
              </Button>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => setAdjustmentModalVisible(true)}
                disabled={selectedRowKeys.length === 0}
              >
                批量调整
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Search
              placeholder="搜索商品名称或编码"
              allowClear
              enterButton
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            <Select
              placeholder="价格类型"
              style={{ width: 150 }}
              allowClear
              value={priceTypeFilter}
              onChange={setPriceTypeFilter}
            >
              <Option value="base">基础价格</Option>
              <Option value="member">会员价格</Option>
              <Option value="promotion">促销价格</Option>
              <Option value="special">特殊价格</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                {productsData?.data?.length || 0}
              </Title>
              <Text type="secondary">总商品数</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                {selectedRowKeys.length}
              </Title>
              <Text type="secondary">已选择</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#faad14', margin: 0 }}>
                {/* 平均毛利率 */}
                {(() => {
                  const products = productsData?.data || [];
                  const validProducts = products.filter(p => p.basePrice && p.currentPrice);
                  if (validProducts.length === 0) return 0;
                  const totalMargin = validProducts.reduce((sum, p) =>
                    sum + calculateMargin(p.basePrice, p.currentPrice), 0
                  );
                  return (totalMargin / validProducts.length).toFixed(1);
                })()}%
              </Title>
              <Text type="secondary">平均毛利率</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#722ed1', margin: 0 }}>
                {/* 价格总值 */}
                ¥{(productsData?.data?.reduce((sum, p) => sum + (p.currentPrice || 0), 0) || 0).toFixed(0)}
              </Title>
              <Text type="secondary">价格总值</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 操作提示 */}
      <Alert
        message="批量调整说明"
        description="1. 选择需要调整价格的商品 2. 点击批量调整按钮设置调整参数 3. 预览调整效果后执行 4. 支持导出Excel模板进行离线编辑"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 商品列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={productsData?.data || []}
          rowKey="id"
          loading={isLoading}
          rowSelection={rowSelection}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 批量调整弹窗 */}
      <Modal
        title="批量价格调整"
        open={adjustmentModalVisible}
        onCancel={() => setAdjustmentModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setAdjustmentModalVisible(false)}>
            取消
          </Button>,
          <Button key="preview" onClick={handleSubmit(handlePreview)}>
            预览效果
          </Button>,
          <Button
            key="execute"
            type="primary"
            onClick={handleSubmit(handleExecute)}
            loading={batchUpdateMutation.isPending}
          >
            执行调整
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="调整方式"
                required
                validateStatus={errors.adjustmentType ? 'error' : undefined}
                help={errors.adjustmentType?.message}
              >
                <Controller
                  name="adjustmentType"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group {...field}>
                      <Radio value="percentage">百分比</Radio>
                      <Radio value="fixed">固定金额</Radio>
                      <Radio value="fixed_price">固定价格</Radio>
                    </Radio.Group>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="调整值"
                required
                validateStatus={errors.adjustmentValue ? 'error' : undefined}
                help={errors.adjustmentValue?.message}
              >
                <Controller
                  name="adjustmentValue"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="0"
                      min={watchedValues.adjustmentType === 'fixed_price' ? 0.01 : undefined}
                      addonAfter={
                        watchedValues.adjustmentType === 'percentage' ? '%' :
                        watchedValues.adjustmentType === 'fixed' ? '元' : '元'
                      }
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item label="舍入规则">
                <Controller
                  name="roundTo"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} style={{ width: '100%' }}>
                      <Option value="none">不舍入</Option>
                      <Option value="nearest">四舍五入</Option>
                      <Option value="up">向上取整</Option>
                      <Option value="down">向下取整</Option>
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="应用对象">
                <Controller
                  name="applyTo"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} style={{ width: '100%' }}>
                      <Option value="selected">已选择商品</Option>
                      <Option value="filtered">筛选结果</Option>
                      <Option value="all">全部商品</Option>
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {watchedValues.adjustmentType !== 'fixed_price' && (
            <Row gutter={[16, 0]}>
              <Col span={24}>
                <Form.Item label="调整对象">
                  <Controller
                    name="priceType"
                    control={control}
                    render={({ field }) => (
                      <Radio.Group {...field}>
                        <Radio value="current">当前价格</Radio>
                        <Radio value="base">基础价格</Radio>
                        <Radio value="all">所有价格</Radio>
                      </Radio.Group>
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          {watchedValues.adjustmentType === 'percentage' && (
            <Alert
              message="调整说明"
              description={`所有商品价格将${watchedValues.adjustmentValue >= 0 ? '增加' : '减少'} ${Math.abs(watchedValues.adjustmentValue)}%`}
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Form>
      </Modal>

      {/* 预览效果弹窗 */}
      <Modal
        title={`价格调整预览 (${previewData.length} 个商品)`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="execute"
            type="primary"
            onClick={() => {
              setPreviewModalVisible(false);
              handleSubmit(handleExecute)();
            }}
            loading={batchUpdateMutation.isPending}
          >
            确认执行
          </Button>
        ]}
      >
        <Table
          columns={previewColumns}
          dataSource={previewData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
          summary={(pageData) => {
            const totalOldPrice = pageData.reduce((sum, p) => sum + p.oldPrice, 0);
            const totalNewPrice = pageData.reduce((sum, p) => sum + p.newPrice, 0);
            const totalChange = totalNewPrice - totalOldPrice;

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong>合计</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Text>¥{totalOldPrice.toFixed(2)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <Text strong>¥{totalNewPrice.toFixed(2)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text strong style={{ color: totalChange >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {totalChange >= 0 ? '+' : ''}¥{totalChange.toFixed(2)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Modal>
    </div>
  );
};

export default BatchPriceAdjustment;