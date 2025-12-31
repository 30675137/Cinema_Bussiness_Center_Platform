import React from 'react';
import {
  Card,
  Typography,
  Empty,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Space,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * 采购订单 (PO) 创建页面
 * 路由: /purchase-management/orders
 */
const PurchaseOrders: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('提交采购订单:', values);
    // TODO: 调用API创建采购订单
  };

  const handleReset = () => {
    form.resetFields();
  };

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
            <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />}>
              保存订单
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            priority: 'normal',
            status: 'draft',
          }}
        >
          <Title level={4}>基本信息</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="订单标题"
                name="title"
                rules={[{ required: true, message: '请输入订单标题' }]}
              >
                <Input placeholder="请输入采购订单标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="供应商"
                name="supplierId"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select placeholder="请选择供应商">
                  <Option value="supplier1">供应商A</Option>
                  <Option value="supplier2">供应商B</Option>
                  <Option value="supplier3">供应商C</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="优先级"
                name="priority"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select>
                  <Option value="low">低</Option>
                  <Option value="normal">普通</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="预计交付日期"
                name="expectedDeliveryDate"
                rules={[{ required: true, message: '请选择预计交付日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="订单描述" name="description">
                <TextArea rows={4} placeholder="请输入订单描述或备注信息" />
              </Form.Item>
            </Col>
          </Row>

          <Title level={4} style={{ marginTop: 24 }}>
            采购明细
          </Title>
          <Empty description="采购明细功能开发中" style={{ margin: '40px 0' }}>
            <Button type="primary" icon={<PlusOutlined />}>
              添加采购商品
            </Button>
          </Empty>

          <Title level={4} style={{ marginTop: 24 }}>
            订单汇总
          </Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="商品总数" name="totalQuantity">
                <InputNumber style={{ width: '100%' }} placeholder="0" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="订单总额" name="totalAmount">
                <InputNumber style={{ width: '100%' }} placeholder="0.00" prefix="¥" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="订单状态" name="status">
                <Select disabled>
                  <Option value="draft">草稿</Option>
                  <Option value="pending">待审核</Option>
                  <Option value="approved">已审核</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default PurchaseOrders;
