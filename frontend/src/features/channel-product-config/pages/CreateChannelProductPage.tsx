/**
 * @spec O005-channel-product-config
 * Create Channel Product Page
 */

import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Space,
  App,
  Steps,
  Card,
  Descriptions,
  Typography,
  Divider,
  Modal,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useChannelProductStore } from '../stores/useChannelProductStore';
import {
  useCreateChannelProduct,
  useDeleteChannelProduct,
} from '../services/channelProductService';
import { ChannelSkuSelector } from '../components/ChannelSkuSelector';
import { ChannelProductBasicForm } from '../components/ChannelProductBasicForm';
import type { CreateChannelProductFormData } from '../schemas/channelProductSchema';
import type { SKU } from '@/types/sku';
import { ChannelType, ChannelCategory, ChannelProductStatus } from '../types';

const { Title } = Typography;

export const CreateChannelProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<CreateChannelProductFormData>();

  // Local state
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
  const [isSkuSelectorOpen, setIsSkuSelectorOpen] = useState(false);

  // API Mutation
  const createMutation = useCreateChannelProduct();
  const deleteMutation = useDeleteChannelProduct();

  // Store actions (if needed)
  const { resetFilters } = useChannelProductStore();

  // State for duplicate conflict
  const [duplicateConflictData, setDuplicateConflictData] = useState<{
    visible: boolean;
    existingId?: string;
  }>({ visible: false });

  useEffect(() => {
    // Reset store on mount
    resetFilters();
  }, [resetFilters]);

  // Handlers
  const handleSkuSelect = (sku: SKU) => {
    setSelectedSku(sku);
    setIsSkuSelectorOpen(false);

    // Auto-fill form values from SKU
    form.setFieldsValue({
      skuId: sku.id,
      displayName: sku.name, // Default to SKU name
      channelPrice: sku.standardCost, // Default to standard cost (business rule may vary)
      mainImage: null, // SKU type usually doesn't have image url directly exposed in basic type, assume manual entry or separate query
      channelCategory: ChannelCategory.OTHER, // Default
      status: ChannelProductStatus.ACTIVE,
      sortOrder: 0,
      isRecommended: false,
    });

    setCurrentStep(1); // Move to next step
  };

  const handleFinish = async (values: CreateChannelProductFormData) => {
    if (!selectedSku) {
      message.error('请先选择 SKU');
      return;
    }

    try {
      const payload: CreateChannelProductFormData = {
        ...values,
        skuId: selectedSku.id,
        channelType: ChannelType.MINI_PROGRAM, // Hardcoded for MVP
      };

      await createMutation.mutateAsync(payload);
      message.success('创建成功');
      navigate('/channel-products/mini-program');
    } catch (error: any) {
      console.error(error);

      // Check if it's a duplicate error
      const errorMessage = (error.message || '').toLowerCase();
      if (
        errorMessage.includes('already configured') ||
        errorMessage.includes('重复') ||
        errorMessage.includes('duplicate')
      ) {
        // Show conflict modal
        setDuplicateConflictData({ visible: true });
      } else {
        message.error(error.message || '创建失败');
      }
    }
  };

  const handleDeleteAndRecreate = async () => {
    if (!selectedSku) return;

    try {
      // First, query to find the existing config ID
      const response = await fetch(
        `/api/channel-products?channelType=MINI_PROGRAM&keyword=${selectedSku.code}`
      );
      const result = await response.json();

      if (result.data?.content?.length > 0) {
        const existingConfig = result.data.content.find(
          (item: any) => item.skuId === selectedSku.id
        );

        if (existingConfig) {
          // Delete existing
          await deleteMutation.mutateAsync(existingConfig.id);
          message.success('已删除旧配置，请重新提交');
          setDuplicateConflictData({ visible: false });

          // Auto-submit after deletion
          form.submit();
        }
      }
    } catch (error) {
      message.error('删除失败，请稍后重试');
    }
  };

  const handleNavigateToEdit = async () => {
    if (!selectedSku) return;

    try {
      // Query to find the existing config ID
      const response = await fetch(
        `/api/channel-products?channelType=MINI_PROGRAM&keyword=${selectedSku.code}`
      );
      const result = await response.json();

      if (result.data?.content?.length > 0) {
        const existingConfig = result.data.content.find(
          (item: any) => item.skuId === selectedSku.id
        );

        if (existingConfig) {
          navigate(`/channel-products/mini-program/edit/${existingConfig.id}`);
        }
      }
    } catch (error) {
      message.error('查询失败，请稍后重试');
    }
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <Card
          title="第一步：选择 SKU"
          bordered={false}
          style={{ textAlign: 'center', padding: 50 }}
        >
          <Space direction="vertical" size="large">
            <Typography.Text type="secondary">
              请先选择一个成品 SKU 作为渠道商品的基础
            </Typography.Text>
            <Button type="primary" size="large" onClick={() => setIsSkuSelectorOpen(true)}>
              打开 SKU 选择器
            </Button>
          </Space>
        </Card>
      );
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {selectedSku && (
          <Card
            size="small"
            title="已选 SKU 信息"
            extra={
              <Button type="link" onClick={() => setCurrentStep(0)}>
                重新选择
              </Button>
            }
          >
            <Descriptions column={3}>
              <Descriptions.Item label="名称">{selectedSku.name}</Descriptions.Item>
              <Descriptions.Item label="编码">{selectedSku.code}</Descriptions.Item>
              <Descriptions.Item label="单位">{selectedSku.mainUnit}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            channelType: ChannelType.MINI_PROGRAM,
            status: ChannelProductStatus.ACTIVE,
            sortOrder: 0,
            isRecommended: false,
          }}
        >
          {/* Hidden field for skuId */}
          <Form.Item name="skuId" hidden>
            <input />
          </Form.Item>

          <ChannelProductBasicForm />

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                提交
              </Button>
              <Button onClick={() => navigate(-1)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>新增渠道商品</Title>

      <Steps
        current={currentStep}
        items={[{ title: '选择 SKU' }, { title: '配置基础信息' }]}
        style={{ marginBottom: 24, maxWidth: 800 }}
      />

      {renderStepContent()}

      <ChannelSkuSelector
        visible={isSkuSelectorOpen}
        onCancel={() => setIsSkuSelectorOpen(false)}
        onSelect={handleSkuSelect}
        excludeSkuIds={[]} // Optionally pass already configured SKUs here if we fetch them
      />

      {/* Duplicate Conflict Modal */}
      <Modal
        title="检测到重复配置"
        open={duplicateConflictData.visible}
        onCancel={() => setDuplicateConflictData({ visible: false })}
        footer={null}
        centered
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Typography.Paragraph>
            该 SKU <strong>{selectedSku?.name}</strong> 已经为"小程序"渠道配置过商品。
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary">您可以选择：</Typography.Paragraph>

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              block
              onClick={handleNavigateToEdit}
              loading={deleteMutation.isPending}
            >
              前往编辑已有配置
            </Button>
            <Button
              danger
              block
              onClick={handleDeleteAndRecreate}
              loading={deleteMutation.isPending}
            >
              删除旧配置并重新创建
            </Button>
            <Button block onClick={() => setDuplicateConflictData({ visible: false })}>
              取消
            </Button>
          </Space>
        </Space>
      </Modal>
    </div>
  );
};
