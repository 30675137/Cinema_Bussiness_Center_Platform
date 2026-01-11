/**
 * @spec N001-purchase-inbound
 * 采购订单 (PO) 创建页面
 * 路由: /purchase-management/orders
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Space,
  Row,
  Col,
  Table,
  Popconfirm,
  message,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import SkuSelectorModal, {
  type SelectedSkuItem,
} from '@/features/procurement/components/SkuSelectorModal';
import {
  useSuppliers,
  useCreatePurchaseOrder,
  useProcurementStores,
} from '@/features/procurement/hooks/usePurchaseOrders';

const { Title } = Typography;
const { TextArea } = Input;

// 订单项类型
interface OrderItem extends SelectedSkuItem {
  key: string;
}

const PurchaseOrders: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 商品列表状态
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [skuSelectorOpen, setSkuSelectorOpen] = useState(false);

  // 获取供应商列表
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const suppliers = suppliersData?.data || [];

  // 获取门店列表（使用采购模块专用的 JPA 数据源）
  const { data: stores = [], isLoading: storesLoading } = useProcurementStores();

  // 创建采购订单
  const createMutation = useCreatePurchaseOrder();

  // 已添加的 SKU ID 列表（用于排除重复选择）
  const excludeSkuIds = useMemo(
    () => orderItems.map((item) => item.skuId),
    [orderItems]
  );

  // 计算订单汇总
  const orderSummary = useMemo(() => {
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = orderItems.reduce((sum, item) => sum + item.lineAmount, 0);
    return { totalQuantity, totalAmount };
  }, [orderItems]);

  // 添加商品
  const handleAddItems = useCallback((items: SelectedSkuItem[]) => {
    const newItems: OrderItem[] = items.map((item) => ({
      ...item,
      key: item.skuId,
    }));
    setOrderItems((prev) => [...prev, ...newItems]);
    message.success(`已添加 ${items.length} 个商品`);
  }, []);

  // 删除商品
  const handleRemoveItem = useCallback((skuId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.skuId !== skuId));
  }, []);

  // 更新商品数量
  const handleQuantityChange = useCallback((skuId: string, quantity: number) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.skuId === skuId) {
          const newQuantity = quantity || 0;
          return {
            ...item,
            quantity: newQuantity,
            lineAmount: newQuantity * item.unitPrice,
          };
        }
        return item;
      })
    );
  }, []);

  // 更新商品单价
  const handleUnitPriceChange = useCallback((skuId: string, unitPrice: number) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.skuId === skuId) {
          const newPrice = unitPrice || 0;
          return {
            ...item,
            unitPrice: newPrice,
            lineAmount: item.quantity * newPrice,
          };
        }
        return item;
      })
    );
  }, []);

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    setOrderItems([]);
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();

      if (orderItems.length === 0) {
        message.error('请至少添加一个采购商品');
        return;
      }

      const requestData = {
        supplierId: values.supplierId,
        storeId: values.storeId,
        plannedArrivalDate: values.plannedArrivalDate?.format('YYYY-MM-DD'),
        remarks: values.remarks,
        items: orderItems.map((item) => ({
          skuId: item.skuId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      await createMutation.mutateAsync(requestData);
      message.success('采购订单创建成功');
      navigate('/purchase-management/orders/list');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  // 采购明细表格列定义
  const columns: ColumnsType<OrderItem> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'SKU 编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 120,
    },
    {
      title: '商品名称',
      dataIndex: 'skuName',
      key: 'skuName',
      ellipsis: true,
    },
    {
      title: '单位',
      dataIndex: 'mainUnit',
      key: 'mainUnit',
      width: 80,
    },
    {
      title: '采购数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity: number, record) => (
        <InputNumber
          value={quantity}
          min={1}
          precision={0}
          onChange={(value) => handleQuantityChange(record.skuId, value || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '采购单价 (¥)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      render: (price: number, record) => (
        <InputNumber
          value={price}
          min={0}
          precision={2}
          onChange={(value) => handleUnitPriceChange(record.skuId, value || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '行小计 (¥)',
      dataIndex: 'lineAmount',
      key: 'lineAmount',
      width: 120,
      render: (amount: number) => (
        <span style={{ fontWeight: 500 }}>{amount.toFixed(2)}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="确定删除该商品？"
          onConfirm={() => handleRemoveItem(record.skuId)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title={
          <Space>
            <PlusOutlined />
            <span>创建采购订单 (PO)</span>
          </Space>
        }
        extra={
          <Space>
            <Button onClick={handleReset} icon={<CloseOutlined />}>
              重置
            </Button>
            <Button
              type="primary"
              onClick={handleSaveDraft}
              icon={<SaveOutlined />}
              loading={createMutation.isPending}
            >
              保存草稿
            </Button>
          </Space>
        }
      >
        <Spin spinning={suppliersLoading || storesLoading}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: 'DRAFT',
            }}
          >
            <Title level={4}>基本信息</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="供应商"
                  name="supplierId"
                  rules={[{ required: true, message: '请选择供应商' }]}
                >
                  <Select
                    placeholder="请选择供应商"
                    showSearch
                    optionFilterProp="children"
                    loading={suppliersLoading}
                  >
                    {suppliers.map((supplier) => (
                      <Select.Option key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.code})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="目标门店"
                  name="storeId"
                  rules={[{ required: true, message: '请选择目标门店' }]}
                >
                  <Select
                    placeholder="请选择目标门店"
                    showSearch
                    optionFilterProp="children"
                    loading={storesLoading}
                  >
                    {stores.map((store) => (
                      <Select.Option key={store.id} value={store.id}>
                        {store.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="计划到货日期" name="plannedArrivalDate">
                  <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="备注" name="remarks">
                  <TextArea rows={2} placeholder="请输入订单备注信息" />
                </Form.Item>
              </Col>
            </Row>

            {/* 采购明细 */}
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  采购明细
                </Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setSkuSelectorOpen(true)}
                >
                  添加采购商品
                </Button>
              </div>

              <Table<OrderItem>
                rowKey="key"
                columns={columns}
                dataSource={orderItems}
                pagination={false}
                bordered
                size="middle"
                locale={{
                  emptyText: '暂无采购商品，请点击"添加采购商品"按钮',
                }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <strong>合计</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{orderSummary.totalQuantity}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong style={{ color: '#1890ff', fontSize: 16 }}>
                          ¥{orderSummary.totalAmount.toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>-</Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>

            {/* 订单汇总 */}
            <Title level={4} style={{ marginTop: 24 }}>
              订单汇总
            </Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="商品种类">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={orderItems.length}
                    disabled
                    addonAfter="种"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="商品总数">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={orderSummary.totalQuantity}
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="订单总额">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={orderSummary.totalAmount}
                    precision={2}
                    prefix="¥"
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>

      {/* SKU 选择器模态框 */}
      <SkuSelectorModal
        open={skuSelectorOpen}
        onClose={() => setSkuSelectorOpen(false)}
        onSelect={handleAddItems}
        excludeSkuIds={excludeSkuIds}
      />
    </div>
  );
};

export default PurchaseOrders;
