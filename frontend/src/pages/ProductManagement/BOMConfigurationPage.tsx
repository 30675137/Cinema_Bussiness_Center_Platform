/**
 * @spec O004-beverage-sku-reuse
 * BOM Configuration Page
 *
 * BOM 配方配置页面,用于配置成品 SKU 的 BOM 组件
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 *
 * 功能特性:
 * - 选择成品 SKU (使用 SKUSelectorModal,仅显示 finished_product 类型)
 * - 添加/编辑/删除 BOM 组件
 * - 计算 BOM 总成本
 * - 配置损耗率
 * - 保存 BOM 配方
 */

import React, { useState, useMemo } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Table,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Alert,
  Divider,
  Row,
  Col,
  Statistic,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { SKUSelectorModal } from '@/components/molecules/SKUSelectorModal';
import { useSKUDetail, useUpdateBom, useUnits } from '@/hooks/useSKUs';
import type { SKU } from '@/types/sku';

const { Title, Text } = Typography;

/**
 * BOM 组件数据结构
 */
interface BomComponent {
  /** 临时 ID (用于前端列表 key) */
  tempId: string;

  /** 组件 SKU ID */
  componentId: string;

  /** 组件 SKU 名称 */
  componentName: string;

  /** 组件 SKU 编码 */
  componentCode: string;

  /** 用量 */
  quantity: number;

  /** 单位 */
  unit: string;

  /** 单位成本 (分) */
  unitCost: number;

  /** 总成本 (quantity * unitCost) */
  totalCost: number;

  /** 是否可选 (默认: false) */
  isOptional: boolean;

  /** 排序顺序 */
  sortOrder: number;
}

/**
 * BOM Configuration Page Component
 */
export const BOMConfigurationPage: React.FC = () => {
  // ===== State =====
  const [selectedFinishedProduct, setSelectedFinishedProduct] = useState<SKU | null>(null);
  const [bomComponents, setBomComponents] = useState<BomComponent[]>([]);
  const [wasteRate, setWasteRate] = useState<number>(0); // 损耗率 (0-1)
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);
  const [isAddingComponent, setIsAddingComponent] = useState(false); // 是否正在添加组件

  // ===== Hooks =====
  const { data: finishedProductDetail, isLoading: isLoadingDetail } = useSKUDetail(
    selectedFinishedProduct?.id || '',
    {
      enabled: !!selectedFinishedProduct,
    }
  );
  const updateBom = useUpdateBom();
  const { data: units = [] } = useUnits();

  /**
   * 处理选择成品 SKU
   */
  const handleSelectFinishedProduct = (sku: SKU) => {
    setSelectedFinishedProduct(sku);
    setIsSelectorVisible(false);

    // 如果 SKU 已有 BOM 数据,加载现有配方
    if (sku.bomComponents && sku.bomComponents.length > 0) {
      const existingBom: BomComponent[] = sku.bomComponents.map((bom, index) => ({
        tempId: `existing-${bom.id || index}`,
        componentId: bom.componentId,
        componentName: bom.componentName || '',
        componentCode: '', // TODO: 从组件 SKU 获取
        quantity: bom.quantity,
        unit: bom.unit,
        unitCost: bom.unitCost || 0,
        totalCost: bom.totalCost || 0,
        isOptional: bom.isOptional || false,
        sortOrder: bom.sortOrder || index + 1,
      }));
      setBomComponents(existingBom);
      setWasteRate(sku.wasteRate || 0);
    } else {
      // 新 SKU,清空 BOM 列表
      setBomComponents([]);
      setWasteRate(0);
    }
  };

  /**
   * 处理添加组件 (打开选择器)
   */
  const handleAddComponent = () => {
    setIsAddingComponent(true);
    setIsSelectorVisible(true);
  };

  /**
   * 处理选择组件 SKU
   */
  const handleSelectComponent = (sku: SKU) => {
    // 检查是否已添加过该组件
    const exists = bomComponents.some((c) => c.componentId === sku.id);
    if (exists) {
      message.warning(`组件 "${sku.name}" 已添加,请勿重复添加`);
      return;
    }

    // 添加新组件
    const newComponent: BomComponent = {
      tempId: `new-${Date.now()}-${Math.random()}`,
      componentId: sku.id,
      componentName: sku.name,
      componentCode: sku.code,
      quantity: 1, // 默认用量 1
      unit: sku.mainUnit || 'ml',
      unitCost: sku.standardCost || 0,
      totalCost: sku.standardCost || 0,
      isOptional: false,
      sortOrder: bomComponents.length + 1,
    };

    setBomComponents([...bomComponents, newComponent]);
    setIsSelectorVisible(false);
    setIsAddingComponent(false);
    message.success(`已添加组件: ${sku.name}`);
  };

  /**
   * 处理删除组件
   */
  const handleDeleteComponent = (tempId: string) => {
    const filtered = bomComponents.filter((c) => c.tempId !== tempId);
    // 重新排序
    const reordered = filtered.map((c, index) => ({
      ...c,
      sortOrder: index + 1,
    }));
    setBomComponents(reordered);
    message.success('已删除组件');
  };

  /**
   * 处理更新组件用量
   */
  const handleUpdateQuantity = (tempId: string, quantity: number) => {
    const updated = bomComponents.map((c) =>
      c.tempId === tempId
        ? {
            ...c,
            quantity,
            totalCost: quantity * c.unitCost,
          }
        : c
    );
    setBomComponents(updated);
  };

  /**
   * 处理更新组件单位
   */
  const handleUpdateUnit = (tempId: string, unit: string) => {
    const updated = bomComponents.map((c) => (c.tempId === tempId ? { ...c, unit } : c));
    setBomComponents(updated);
  };

  /**
   * 计算 BOM 总成本 (不含损耗)
   */
  const rawTotalCost = useMemo(() => {
    return bomComponents.reduce((sum, component) => sum + component.totalCost, 0);
  }, [bomComponents]);

  /**
   * 计算 BOM 总成本 (含损耗)
   */
  const totalCostWithWaste = useMemo(() => {
    return rawTotalCost * (1 + wasteRate);
  }, [rawTotalCost, wasteRate]);

  /**
   * 处理保存 BOM 配方
   */
  const handleSaveBom = async () => {
    if (!selectedFinishedProduct) {
      message.error('请先选择成品 SKU');
      return;
    }

    if (bomComponents.length === 0) {
      message.error('请至少添加一个 BOM 组件');
      return;
    }

    try {
      const components = bomComponents.map((c) => ({
        componentId: c.componentId,
        quantity: c.quantity,
        unit: c.unit,
        isOptional: c.isOptional,
        sortOrder: c.sortOrder,
      }));

      const result = await updateBom.mutateAsync({
        skuId: selectedFinishedProduct.id,
        components,
        wasteRate,
      });

      message.success(`BOM 配方保存成功!计算成本: ¥${(result.calculatedCost / 100).toFixed(2)}`);
    } catch (error) {
      message.error(`BOM 配方保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 处理重置
   */
  const handleReset = () => {
    if (selectedFinishedProduct && finishedProductDetail?.bomComponents) {
      // 重置到原始数据
      handleSelectFinishedProduct(finishedProductDetail as SKU);
      message.success('已重置到原始数据');
    } else {
      // 清空
      setBomComponents([]);
      setWasteRate(0);
      message.success('已清空 BOM 配方');
    }
  };

  /**
   * BOM 组件表格列定义
   */
  const columns: ColumnsType<BomComponent> = [
    {
      title: '序号',
      key: 'sortOrder',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '组件编码',
      dataIndex: 'componentCode',
      key: 'componentCode',
      width: 120,
    },
    {
      title: '组件名称',
      dataIndex: 'componentName',
      key: 'componentName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '用量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      render: (quantity: number, record) => (
        <InputNumber
          value={quantity}
          min={0.01}
          step={0.1}
          precision={2}
          onChange={(value) => handleUpdateQuantity(record.tempId, value || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      render: (unit: string, record) => (
        <Select
          value={unit}
          onChange={(value) => handleUpdateUnit(record.tempId, value)}
          options={units.map((u) => ({
            label: u.name,
            value: u.id,
          }))}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '单位成本',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      render: (cost: number) => `¥${(cost / 100).toFixed(2)}`,
    },
    {
      title: '总成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      render: (cost: number) => `¥${(cost / 100).toFixed(2)}`,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="确认删除该组件?"
          onConfirm={() => handleDeleteComponent(record.tempId)}
          okText="确认"
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
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <Title level={2}>BOM 配方配置</Title>

      {/* 成品 SKU 选择 */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>第一步: 选择成品 SKU</Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsAddingComponent(false);
                setIsSelectorVisible(true);
              }}
              style={{ marginLeft: 16 }}
            >
              选择成品 SKU
            </Button>
          </div>

          {selectedFinishedProduct && (
            <Alert
              message={
                <div>
                  <strong>已选成品:</strong> {selectedFinishedProduct.name} (
                  {selectedFinishedProduct.code})
                </div>
              }
              type="success"
              showIcon
            />
          )}
        </Space>
      </Card>

      {/* BOM 组件配置 */}
      {selectedFinishedProduct && (
        <>
          <Card title="第二步: 配置 BOM 组件" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddComponent}>
                  添加 BOM 组件
                </Button>
              </div>

              {/* BOM 组件列表 */}
              <Table<BomComponent>
                dataSource={bomComponents}
                columns={columns}
                rowKey="tempId"
                loading={isLoadingDetail}
                pagination={false}
                scroll={{ x: 1000 }}
                locale={{
                  emptyText: '暂无 BOM 组件,请点击"添加 BOM 组件"按钮',
                }}
              />
            </Space>
          </Card>

          {/* 成本计算 */}
          <Card title="第三步: 成本计算与保存" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 损耗率配置 */}
              <Row gutter={16}>
                <Col span={8}>
                  <div>
                    <Text strong>损耗率 (%)</Text>
                    <InputNumber
                      value={wasteRate * 100}
                      min={0}
                      max={100}
                      step={1}
                      precision={2}
                      onChange={(value) => setWasteRate((value || 0) / 100)}
                      addonAfter="%"
                      style={{ width: '100%', marginTop: 8 }}
                    />
                  </div>
                </Col>
              </Row>

              <Divider />

              {/* 成本统计 */}
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="原材料成本"
                    value={rawTotalCost / 100}
                    precision={2}
                    prefix="¥"
                  />
                </Col>
                <Col span={6}>
                  <Statistic title="损耗率" value={wasteRate * 100} precision={2} suffix="%" />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="总成本 (含损耗)"
                    value={totalCostWithWaste / 100}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
              </Row>

              <Divider />

              {/* 操作按钮 */}
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveBom}
                  loading={updateBom.isPending}
                  disabled={bomComponents.length === 0}
                >
                  保存 BOM 配方
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Space>
          </Card>
        </>
      )}

      {/* SKU 选择器模态框 */}
      <SKUSelectorModal
        visible={isSelectorVisible}
        onCancel={() => setIsSelectorVisible(false)}
        onSelect={isAddingComponent ? handleSelectComponent : handleSelectFinishedProduct}
        skuType={isAddingComponent ? 'raw_material' : 'finished_product'}
        title={isAddingComponent ? '选择 BOM 组件 (原料/包材)' : '选择成品 SKU'}
        excludeSkuIds={isAddingComponent ? bomComponents.map((c) => c.componentId) : []}
      />
    </div>
  );
};
