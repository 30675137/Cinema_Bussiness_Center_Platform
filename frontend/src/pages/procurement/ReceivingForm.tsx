/**
 * @spec N001-purchase-inbound
 * 收货入库创建页面
 */
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Table,
  InputNumber,
  Space,
  message,
  Divider,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { usePurchaseOrder } from '@/features/procurement/hooks/usePurchaseOrders';
import { useCreateGoodsReceipt } from '@/features/procurement/hooks/useGoodsReceipts';
import type { CreateGoodsReceiptRequest } from '@/features/procurement/types';

const { Option } = Select;
const { TextArea } = Input;

interface ReceivingItem {
  key: string;
  // N004: 支持 MATERIAL 和 SKU
  itemType: 'MATERIAL' | 'SKU';
  materialId?: string;
  skuId?: string;
  productName: string;
  productCode: string;
  specification: string;
  unit: string;
  orderedQuantity: number;
  receivingQuantity: number;
  pendingQuantity: number;
  qualityStatus: string;
  remark: string;
}

/**
 * @spec N001-purchase-inbound
 * 收货入库创建/编辑页面
 * 路由: /purchase-management/receipts/create?orderId=xxx
 */
const ReceivingForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [receivingItems, setReceivingItems] = useState<ReceivingItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取采购订单详情
  const { data: orderData, isLoading: orderLoading } = usePurchaseOrder(orderId || '');

  // 创建收货单 mutation
  const createGoodsReceiptMutation = useCreateGoodsReceipt();

  // 当采购订单数据加载完成后，填充表单
  useEffect(() => {
    if (orderData?.data && orderId) {
      const order = orderData.data;

      // 填充表单基本信息
      form.setFieldsValue({
        purchaseOrderNumber: order.orderNumber,
        supplier: order.supplier?.name || '未知供应商',
        receivingDate: dayjs(),
        warehouse: undefined,
      });

      // N004: 转换订单明细为收货明细（支持 MATERIAL 和 SKU）
      const items: ReceivingItem[] = (order.items || []).map((item, index) => {
        const itemType = item.itemType || 'SKU';
        const isMaterial = itemType === 'MATERIAL';
        
        return {
          key: item.id || String(index + 1),
          itemType: itemType as 'MATERIAL' | 'SKU',
          materialId: isMaterial ? item.material?.id : undefined,
          skuId: !isMaterial ? item.sku?.id : undefined,
          productName: isMaterial ? (item.material?.name || '未知物料') : (item.sku?.name || '未知商品'),
          productCode: isMaterial ? (item.material?.code || '') : (item.sku?.code || ''),
          specification: isMaterial ? (item.material?.specification || '-') : '-',
          unit: isMaterial ? (item.material?.purchaseUnit || '个') : (item.sku?.mainUnit || '个'),
          orderedQuantity: Number(item.quantity) || 0,
          receivingQuantity: Number(item.pendingQty) || Number(item.quantity) || 0,
          pendingQuantity: Number(item.pendingQty) || Number(item.quantity) || 0,
          qualityStatus: 'pending',
          remark: '',
        };
      });

      setReceivingItems(items);
    }
  }, [orderData, orderId, form]);

  const handleQuantityChange = (key: string, value: number | null) => {
    setReceivingItems((items) =>
      items.map((item) => (item.key === key ? { ...item, receivingQuantity: value || 0 } : item))
    );
  };

  const handleQualityStatusChange = (key: string, value: string) => {
    setReceivingItems((items) =>
      items.map((item) => (item.key === key ? { ...item, qualityStatus: value } : item))
    );
  };

  const handleRemarkChange = (key: string, value: string) => {
    setReceivingItems((items) =>
      items.map((item) => (item.key === key ? { ...item, remark: value } : item))
    );
  };

  const handleDeleteItem = (key: string) => {
    setReceivingItems((items) => items.filter((item) => item.key !== key));
  };

  const columns: ColumnsType<ReceivingItem> = [
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '订购数量',
      dataIndex: 'orderedQuantity',
      key: 'orderedQuantity',
      width: 100,
    },
    {
      title: '实收数量',
      key: 'receivingQuantity',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.orderedQuantity}
          value={record.receivingQuantity}
          onChange={(value) => handleQuantityChange(record.key, value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '质检状态',
      key: 'qualityStatus',
      width: 120,
      render: (_, record) => (
        <Select
          value={record.qualityStatus}
          onChange={(value) => handleQualityStatusChange(record.key, value)}
          style={{ width: '100%' }}
        >
          <Option value="pending">待质检</Option>
          <Option value="passed">质检通过</Option>
          <Option value="failed">质检不合格</Option>
        </Select>
      ),
    },
    {
      title: '备注',
      key: 'remark',
      width: 200,
      render: (_, record) => (
        <Input
          value={record.remark}
          onChange={(e) => handleRemarkChange(record.key, e.target.value)}
          placeholder="请输入备注"
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(record.key)}
        >
          删除
        </Button>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
    if (!orderId) {
      message.error('缺少采购订单ID');
      return;
    }

    if (receivingItems.length === 0) {
      message.warning('请至少添加一条收货明细');
      return;
    }

    const hasInvalidQuantity = receivingItems.some(
      (item) => item.receivingQuantity <= 0 || item.receivingQuantity > item.orderedQuantity
    );

    if (hasInvalidQuantity) {
      message.warning('请检查收货数量，实收数量应在0到订购数量之间');
      return;
    }

    // 映射前端质检状态到后端枚举
    // 后端枚举: QUALIFIED, UNQUALIFIED, PENDING_CHECK
    const qualityStatusMap: Record<string, string> = {
      pending: 'PENDING_CHECK',
      passed: 'QUALIFIED',
      failed: 'UNQUALIFIED',
    };

    // N004: 构建请求数据（支持 MATERIAL 和 SKU）
    const requestData: CreateGoodsReceiptRequest = {
      purchaseOrderId: orderId,
      remarks: values.remark || '',
      items: receivingItems.map((item) => ({
        itemType: item.itemType,
        materialId: item.itemType === 'MATERIAL' ? item.materialId : undefined,
        skuId: item.itemType === 'SKU' ? item.skuId : undefined,
        receivedQty: item.receivingQuantity,
        qualityStatus: qualityStatusMap[item.qualityStatus] || 'PENDING_CHECK',
        rejectionReason: item.qualityStatus === 'failed' ? item.remark : undefined,
      })),
    };

    try {
      await createGoodsReceiptMutation.mutateAsync(requestData);
      message.success('收货单创建成功');
      navigate('/purchase-management/receipts');
    } catch (error: any) {
      message.error(error.message || '创建失败，请重试');
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      // TODO: 调用API保存草稿
      console.log('保存草稿:', { ...values, items: receivingItems, status: 'draft' });
      message.success('草稿保存成功');
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/purchase-management/receipts');
  };

  // 计算汇总信息
  const totalOrderedQuantity = receivingItems.reduce((sum, item) => sum + item.orderedQuantity, 0);
  const totalReceivedQuantity = receivingItems.reduce(
    (sum, item) => sum + item.receivingQuantity,
    0
  );
  const qualityPassedCount = receivingItems.filter(
    (item) => item.qualityStatus === 'passed'
  ).length;
  const qualityFailedCount = receivingItems.filter(
    (item) => item.qualityStatus === 'failed'
  ).length;

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Spin spinning={orderLoading} tip="加载采购订单数据...">
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack} type="text" />
            <span>{orderId ? '新建收货单（基于采购订单）' : '新建收货单'}</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={loading}>
              保存草稿
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => form.submit()}
              loading={createGoodsReceiptMutation.isPending}
            >
              确认收货
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            receivingDate: dayjs(),
            status: 'pending',
          }}
        >
          {/* 基本信息 */}
          <Card type="inner" title="基本信息" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="采购单号"
                  name="purchaseOrderNumber"
                  tooltip={orderId ? '采购单号继承自采购订单' : undefined}
                  rules={orderId ? [] : [{ required: true, message: '请输入或选择采购单号' }]}
                >
                  <Input placeholder="请输入采购单号" disabled={!!orderId} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="供应商"
                  name="supplier"
                  tooltip={orderId ? '供应商信息继承自采购订单，不可修改' : undefined}
                >
                  <Input placeholder="供应商名称" disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="收货日期"
                  name="receivingDate"
                  rules={[{ required: true, message: '请选择收货日期' }]}
                >
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="收货仓库"
                  name="warehouse"
                  rules={[{ required: true, message: '请选择收货仓库' }]}
                >
                  <Select placeholder="请选择收货仓库">
                    <Option value="warehouse1">中心仓库</Option>
                    <Option value="warehouse2">门店仓库A</Option>
                    <Option value="warehouse3">门店仓库B</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="收货人" name="receiver">
                  <Input placeholder="请输入收货人" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="联系电话" name="phone">
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* 收货明细 */}
          <Card type="inner" title="收货明细" style={{ marginBottom: 16 }}>
            <Table
              columns={columns}
              dataSource={receivingItems}
              pagination={false}
              scroll={{ x: 1200 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <strong>合计</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>{totalOrderedQuantity}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <strong>{totalReceivedQuantity}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} colSpan={3}>
                      <Space>
                        <span>质检通过: {qualityPassedCount}</span>
                        <Divider type="vertical" />
                        <span>质检不合格: {qualityFailedCount}</span>
                      </Space>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>

          {/* 其他信息 */}
          <Card type="inner" title="其他信息">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="备注说明" name="remark">
                  <TextArea rows={4} placeholder="请输入备注说明" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Card>
      </Spin>
    </div>
  );
};

export default ReceivingForm;
