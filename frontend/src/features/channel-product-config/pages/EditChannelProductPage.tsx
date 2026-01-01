/**
 * @spec O005-channel-product-config
 * Edit Channel Product Page
 */

import React, { useEffect } from 'react';
import { Form, Button, Space, App, Typography, Spin, Card, Divider } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useChannelProduct, useUpdateChannelProduct } from '../services/channelProductService';
import { ChannelProductBasicForm } from '../components/ChannelProductBasicForm';
import type { UpdateChannelProductFormData } from '../schemas/channelProductSchema';

const { Title } = Typography;

export const EditChannelProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<UpdateChannelProductFormData>();

  // Queries
  const { data: product, isLoading, isError } = useChannelProduct(id || '');
  const updateMutation = useUpdateChannelProduct();

  // Initialize form
  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        displayName: product.displayName,
        channelCategory: product.channelCategory,
        channelPrice: product.channelPrice,
        mainImage: product.mainImage,
        description: product.description,
        isRecommended: product.isRecommended,
        status: product.status,
        sortOrder: product.sortOrder,
        // specs and detailImages handling (future)
      });
    }
  }, [product, form]);

  const handleFinish = async (values: UpdateChannelProductFormData) => {
    if (!id) return;

    try {
      await updateMutation.mutateAsync({ id, data: values });
      message.success('更新成功');
      navigate('/channel-products/mini-program');
    } catch (error: any) {
      console.error(error);
      message.error(error.message || '更新失败');
    }
  };

  if (!id) return <div>无效的 ID</div>;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={4} type="danger">
          加载失败或商品不存在
        </Title>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>编辑渠道商品</Title>
          <Space>
            <Button onClick={() => navigate(-1)}>取消</Button>
            <Button type="primary" onClick={form.submit} loading={updateMutation.isPending}>
              保存
            </Button>
          </Space>
        </div>

        <Card
          title={`SKU: ${product.sku?.skuName || '未知'} (${product.sku?.skuCode || 'N/A'})`}
          size="small"
        >
          {/* Read-only SKU info context */}
        </Card>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <ChannelProductBasicForm />
        </Form>
      </Space>
    </div>
  );
};
