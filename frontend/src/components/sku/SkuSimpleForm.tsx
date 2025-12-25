/**
 * SKU简化表单组件
 * 左右布局：左侧基础属性 + 右侧BOM配方管理
 * 参考设计原型: ProductBOM.tsx
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col, Card, Button, Empty, message, Spin, Typography, Table, Tooltip } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, SaveOutlined, DeleteOutlined, SearchOutlined, CloseOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSpusQuery, useUnitsQuery, useCreateSkuMutation, useUpdateSkuMutation, useSkuQuery, useIngredientsQuery } from '@/hooks/useSku';
import { skuService } from '@/services/skuService';
import { SkuStatus } from '@/types/sku';
import type { SPU } from '@/types/sku';

const { Option } = Select;
const { Text } = Typography;

// 原料接口 (基于真实 SKU 数据)
interface Ingredient {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
}

// BOM配方项接口
interface BOMItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

// 简化版表单Schema
const simpleFormSchema = z.object({
  spuId: z.string().min(1, '请选择所属SPU'),
  name: z.string().min(1, '请输入商品名称').max(200, '商品名称不能超过200个字符'),
  price: z.number().min(0, '零售价不能为负'),
  status: z.nativeEnum(SkuStatus),
});

type SimpleFormValues = z.infer<typeof simpleFormSchema>;

interface SkuSimpleFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  skuId?: string;
}

/**
 * SKU简化表单 - 左右布局
 */
export const SkuSimpleForm: React.FC<SkuSimpleFormProps> = ({
  open,
  onClose,
  onSuccess,
  mode = 'create',
  skuId,
}) => {
  const { data: spus = [] } = useSpusQuery();
  const { data: units = [] } = useUnitsQuery();
  const { data: rawIngredients = [] } = useIngredientsQuery();
  const createMutation = useCreateSkuMutation();
  const updateMutation = useUpdateSkuMutation();
  
  // 转换原料 SKU 为 Ingredient 格式
  const ingredients: Ingredient[] = useMemo(() => {
    return rawIngredients.map((sku: any) => ({
      id: sku.id,
      name: sku.name,
      unit: sku.mainUnit || 'g',
      unitPrice: sku.standardCost || 0,
    }));
  }, [rawIngredients]);
  
  // 编辑模式下加载SKU数据
  const { data: skuData, isLoading: loadingSku } = useSkuQuery(
    mode === 'edit' ? skuId || null : null,
    mode === 'edit' && open
  );
  
  const isEditMode = mode === 'edit';
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // BOM配方状态
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  // 原料选择弹窗状态
  const [isIngModalOpen, setIsIngModalOpen] = useState(false);
  const [ingSearchTerm, setIngSearchTerm] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SimpleFormValues>({
    resolver: zodResolver(simpleFormSchema),
    defaultValues: {
      spuId: '',
      name: '',
      price: 0,
      status: SkuStatus.DRAFT,
    },
  });

  const price = watch('price') || 0;
  const spuId = watch('spuId');
  
  // 获取选中的SPU信息
  const selectedSpu = spus.find((spu: SPU) => spu.id === spuId);

  // 过滤后的原料列表
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing: Ingredient) => 
      ing.name.toLowerCase().includes(ingSearchTerm.toLowerCase())
    );
  }, [ingSearchTerm, ingredients]);

  // 计算BOM总成本
  const totalCost = useMemo(() => {
    return bomItems.reduce((sum, item) => sum + item.cost, 0);
  }, [bomItems]);

  // 计算毛利率
  const marginRate = useMemo(() => {
    if (price <= 0) return 0;
    return ((price - totalCost) / price) * 100;
  }, [price, totalCost]);

  // 添加原料到BOM
  const addBOMItem = (ing: Ingredient) => {
    if (bomItems.find(b => b.ingredientId === ing.id)) return;
    const newItem: BOMItem = {
      ingredientId: ing.id,
      name: ing.name,
      quantity: 1,
      unit: ing.unit,
      cost: ing.unitPrice
    };
    setBomItems([...bomItems, newItem]);
  };

  // 更新BOM项数量
  const updateBOMItemQuantity = (ingredientId: string, quantity: number) => {
    const ing = ingredients.find((i: Ingredient) => i.id === ingredientId);
    setBomItems(items => items.map(item => 
      item.ingredientId === ingredientId 
        ? { ...item, quantity, cost: Number((quantity * (ing?.unitPrice || 0)).toFixed(3)) }
        : item
    ));
  };

  // 删除BOM项
  const removeBOMItem = (ingredientId: string) => {
    setBomItems(items => items.filter(item => item.ingredientId !== ingredientId));
  };

  // 关闭时重置表单
  useEffect(() => {
    if (!open) {
      reset();
      setBomItems([]);
    }
  }, [open, reset]);

  // 编辑模式下填充表单数据
  // 使用 setValue 而不是 reset，避免 destroyOnClose 导致的时序问题
  useEffect(() => {
    if (open && isEditMode && skuData && spus.length > 0) {
      // 确保 SPU 存在于列表中
      const spuExists = spus.some((spu: SPU) => spu.id === skuData.spuId);
      
      // 获取 BOM 数据（如果存在）
      const skuDataWithBom = skuData as any;
      const bomData = skuDataWithBom.bomComponents || [];
      
      console.log('[Edit Mode] Setting form values:', {
        spuId: skuData.spuId,
        spuExists,
        spusCount: spus.length,
        name: skuData.name,
        status: skuData.status,
        standardCost: skuData.standardCost,
        bomCount: bomData.length,
      });
      
      // 填充 BOM 配方数据
      if (bomData.length > 0) {
        const convertedBomItems: BOMItem[] = bomData.map((bom: any) => ({
          ingredientId: bom.componentId || bom.id,
          name: bom.componentName || '原料',
          quantity: Number(bom.quantity) || 0,
          unit: bom.unit || 'g',
          cost: Number(bom.unitCost) || 0,
        }));
        setBomItems(convertedBomItems);
      }
      
      // 延迟设置值，确保 Select 组件已渲染完成
      setTimeout(() => {
        if (spuExists) {
          setValue('spuId', skuData.spuId, { shouldValidate: true });
        }
        setValue('name', skuData.name || '', { shouldValidate: true });
        // 使用 standardCost 作为零售价（如果没有专门的零售价字段）
        setValue('price', skuData.standardCost || 0);
        setValue('status', skuData.status || SkuStatus.DRAFT, { shouldValidate: true });
      }, 100);
    }
  }, [open, isEditMode, skuData, spus, setValue]);

  // 提交表单
  const onSubmit = async (values: SimpleFormValues) => {
    try {
      // 获取默认单位ID（优先使用“份”，如果没有则使用第一个单位）
      const defaultUnit = units.find((u: { name: string }) => u.name === '份') || units[0];
      const mainUnitId = defaultUnit?.id || '';
        
      if (!mainUnitId) {
        message.error('未找到可用的库存单位，请先配置单位数据');
        return;
      }
  
      if (isEditMode && skuId) {
        // 编辑模式
        await updateMutation.mutateAsync({
          id: skuId,
          formData: {
            spuId: values.spuId,
            name: values.name,
            mainUnitId: skuData?.mainUnitId || mainUnitId,
            status: values.status,
            manageInventory: skuData?.manageInventory ?? true,
            allowNegativeStock: skuData?.allowNegativeStock ?? false,
            salesUnits: skuData?.salesUnits?.map(su => ({
              unitId: su.unitId,
              conversionRate: su.conversionRate,
              enabled: su.enabled,
            })) || [],
            otherBarcodes: skuData?.otherBarcodes?.map(b => ({
              code: b.code,
              remark: b.remark,
            })) || [],
            mainBarcode: skuData?.mainBarcode || skuData?.code || '',
          },
        });
        
        // 更新BOM配方（如果有bomItems）
        if (bomItems.length > 0) {
          const bomComponents = bomItems.map((item, index) => ({
            componentId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit,
            isOptional: false,
            sortOrder: index,
          }));
          
          try {
            await skuService.updateBom(skuId, bomComponents, 0);
            console.log('[Edit Mode] BOM updated successfully');
          } catch (bomError: any) {
            console.error('[Edit Mode] BOM update failed:', bomError);
            message.warning('SKU信息已更新，但BOM配方更新失败: ' + (bomError?.message || '未知错误'));
          }
        }
        
        message.success('SKU更新成功');
      } else {
        // 创建模式
        const autoCode = `SKU${Date.now()}`;
        await createMutation.mutateAsync({
          spuId: values.spuId,
          name: values.name,
          mainUnitId: mainUnitId,
          status: values.status,
          manageInventory: true,
          allowNegativeStock: false,
          salesUnits: [],
          otherBarcodes: [],
          mainBarcode: autoCode,
        });
        message.success('SKU创建成功');
      }
      onClose();
      onSuccess?.();
    } catch (error: any) {
      message.error(error?.message || (isEditMode ? 'SKU更新失败' : 'SKU创建失败'));
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeftOutlined onClick={onClose} style={{ cursor: 'pointer' }} />
          <span>{isEditMode ? '编辑 SKU' : '新建 SKU'}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
      styles={{ body: { padding: '24px', background: '#f5f5f5' } }}
    >
      <Spin spinning={isSubmitting || loadingSku}>
        <Row gutter={24}>
          {/* 左侧 - 基础属性 */}
          <Col span={10}>
            <Card 
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🎁</span>
                  基础属性
                </span>
              }
              style={{ marginBottom: 16 }}
            >
              <Form layout="vertical">
                {/* 所属SPU */}
                <Form.Item
                  label="所属 SPU"
                  required
                  validateStatus={errors.spuId ? 'error' : undefined}
                  help={errors.spuId?.message}
                >
                  <Controller
                    name="spuId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="请选择SPU"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {spus.map((spu: SPU) => (
                          <Option key={spu.id} value={spu.id}>
                            {spu.name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                </Form.Item>

                {/* 品牌和分类（自动继承自SPU） */}
                {selectedSpu && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="品牌">
                        <Input 
                          value={selectedSpu.brand || '-'} 
                          disabled 
                          style={{ background: '#f5f5f5' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="分类">
                        <Input 
                          value={selectedSpu.category || '-'} 
                          disabled 
                          style={{ background: '#f5f5f5' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {/* 商品名称 */}
                <Form.Item
                  label="商品名称"
                  required
                  validateStatus={errors.name ? 'error' : undefined}
                  help={errors.name?.message}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        {...field} 
                        placeholder="如: 经典马天尼"
                      />
                    )}
                  />
                </Form.Item>

                {/* 零售价 + 状态 */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="零售价 (¥)"
                      validateStatus={errors.price ? 'error' : undefined}
                      help={errors.price?.message}
                    >
                      <Controller
                        name="price"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            placeholder="0"
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="当前状态">
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select {...field}>
                            <Option value={SkuStatus.DRAFT}>草稿</Option>
                            <Option value={SkuStatus.ENABLED}>启用</Option>
                            <Option value={SkuStatus.DISABLED}>停用</Option>
                          </Select>
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            {/* 盈利分析卡片 */}
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
                color: 'white',
                border: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 16 }}>📊</span>
                <span style={{ fontWeight: 'bold' }}>盈利分析</span>
              </div>
              <Row gutter={32}>
                <Col span={12}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>估算成本</Text>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>¥ {totalCost.toFixed(2)}</div>
                </Col>
                <Col span={12}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>预估毛利</Text>
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold',
                    color: marginRate > 60 ? '#4ade80' : marginRate > 30 ? '#fbbf24' : '#f87171'
                  }}>
                    {marginRate.toFixed(1)}%
                  </div>
                </Col>
              </Row>
              <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                * 成本基于 BOM 配方各原料单价累加自动计算得出
              </div>
            </Card>
          </Col>

          {/* 右侧 - BOM配方管理 */}
          <Col span={14}>
            <Card 
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, color: '#1890ff' }}>◇</span>
                  BOM 配方管理
                </span>
              }
              extra={
                <Button 
                  type="primary" 
                  ghost
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setIngSearchTerm('');
                    setIsIngModalOpen(true);
                  }}
                >
                  添加配方原料
                </Button>
              }
              style={{ minHeight: 400 }}
              styles={{ body: { padding: bomItems.length > 0 ? 0 : 24 } }}
            >
              {bomItems.length > 0 ? (
                <>
                  <Table
                    dataSource={bomItems}
                    rowKey="ingredientId"
                    pagination={false}
                    size="middle"
                    columns={[
                      {
                        title: '原料名称',
                        dataIndex: 'name',
                        key: 'name',
                        render: (name: string) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: 8, 
                              background: '#e6f7ff', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: '#1890ff'
                            }}>
                              ◇
                            </div>
                            <span style={{ fontWeight: 500 }}>{name}</span>
                          </div>
                        )
                      },
                      {
                        title: '标准用量',
                        dataIndex: 'quantity',
                        key: 'quantity',
                        width: 150,
                        align: 'center' as const,
                        render: (quantity: number, record: BOMItem) => (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <InputNumber
                              value={quantity}
                              min={0}
                              style={{ width: 80 }}
                              onChange={(val) => updateBOMItemQuantity(record.ingredientId, val || 0)}
                            />
                            <span style={{ color: '#999' }}>{record.unit}</span>
                          </div>
                        )
                      },
                      {
                        title: '成本小计',
                        dataIndex: 'cost',
                        key: 'cost',
                        width: 100,
                        align: 'right' as const,
                        render: (cost: number) => (
                          <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>¥ {cost.toFixed(2)}</span>
                        )
                      },
                      {
                        title: '操作',
                        key: 'action',
                        width: 60,
                        align: 'center' as const,
                        render: (_: unknown, record: BOMItem) => (
                          <Button 
                            type="text" 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeBOMItem(record.ingredientId)}
                          />
                        )
                      }
                    ]}
                    summary={() => (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          <span style={{ color: '#999' }}>共 {bomItems.length} 项原料</span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <span style={{ fontSize: 16, fontWeight: 600 }}>¥ {totalCost.toFixed(2)}</span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} />
                      </Table.Summary.Row>
                    )}
                  />
                </>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ color: '#999' }}>
                      尚未配置配方，点击右上角按钮从原料库中选择
                    </span>
                  }
                  style={{ marginTop: 80 }}
                >
                  <Button type="primary" ghost onClick={() => setIsIngModalOpen(true)}>
                    立即去添加
                  </Button>
                </Empty>
              )}
            </Card>
          </Col>
        </Row>

        {/* 原料选择弹窗 */}
        <Modal
          title={
            <div style={{ paddingBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#1a1a2e' }}>🧪 选择原料库</div>
              <div style={{ fontSize: 14, color: '#666', fontWeight: 'normal', marginTop: 6 }}>点击下方卡片将原料添加至配方</div>
            </div>
          }
          open={isIngModalOpen}
          onCancel={() => setIsIngModalOpen(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 14, color: '#666' }}>
                已选择 <span style={{ color: '#1890ff', fontWeight: 700, fontSize: 18 }}>{bomItems.length}</span> 种原料
              </div>
              <Button 
                type="primary"
                size="large"
                onClick={() => setIsIngModalOpen(false)}
                style={{ 
                  borderRadius: 10,
                  fontWeight: 600,
                  paddingLeft: 32,
                  paddingRight: 32,
                  height: 44,
                  fontSize: 15
                }}
              >
                完成选择
              </Button>
            </div>
          }
          width={560}
          styles={{ 
            body: { 
              padding: 0, 
              maxHeight: '60vh', 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column' 
            },
            header: {
              borderBottom: '2px solid #f0f0f0',
              padding: '20px 24px 16px'
            },
            footer: {
              borderTop: '2px solid #f0f0f0',
              padding: '16px 24px'
            }
          }}
        >
          {/* 搜索框 */}
          <div style={{ 
            padding: '20px 24px', 
            background: 'linear-gradient(180deg, #f8f9fc 0%, #fff 100%)', 
            borderBottom: '1px solid #eee' 
          }}>
            <Input
              placeholder="🔍  输入原料名称搜索..."
              value={ingSearchTerm}
              onChange={(e) => setIngSearchTerm(e.target.value)}
              allowClear
              autoFocus
              size="large"
              style={{ 
                borderRadius: 12,
                background: '#fff',
                height: 48,
                fontSize: 15,
                border: '2px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            />
          </div>

          {/* 原料列表 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fafbfc' }}>
            {filteredIngredients.map((ing, index) => {
              const isAdded = bomItems.some(b => b.ingredientId === ing.id);
              return (
                <div
                  key={ing.id}
                  onClick={() => !isAdded && addBOMItem(ing)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 14,
                    cursor: isAdded ? 'default' : 'pointer',
                    background: isAdded ? 'linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%)' : '#fff',
                    border: isAdded ? '2px solid #95de64' : '2px solid #f0f0f0',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    marginBottom: 12,
                    boxShadow: isAdded ? '0 4px 12px rgba(82,196,26,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isAdded) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #e6f4ff 0%, #f0f7ff 100%)';
                      e.currentTarget.style.border = '2px solid #69b1ff';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(24,144,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAdded) {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.border = '2px solid #f0f0f0';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* 序号标识 */}
                    <div style={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      background: isAdded ? '#52c41a' : '#f0f0f0', 
                      color: isAdded ? '#fff' : '#999',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700
                    }}>
                      {index + 1}
                    </div>
                    {/* 原料图标 */}
                    <div style={{ 
                      width: 52, 
                      height: 52, 
                      borderRadius: 14, 
                      background: isAdded ? '#fff' : 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)', 
                      border: isAdded ? '2px solid #b7eb8f' : '2px solid #91caff',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: isAdded ? '#52c41a' : '#1890ff',
                      fontSize: 22,
                      fontWeight: 600
                    }}>
                      {isAdded ? '✓' : '◇'}
                    </div>
                    {/* 原料信息 */}
                    <div>
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: 16,
                        color: isAdded ? '#389e0d' : '#1a1a2e',
                        marginBottom: 4,
                        letterSpacing: 0.3
                      }}>
                        {ing.name}
                      </div>
                      <div style={{ 
                        fontSize: 14, 
                        color: isAdded ? '#73d13d' : '#666',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <span style={{ 
                          background: isAdded ? '#f6ffed' : '#fff7e6', 
                          padding: '2px 8px', 
                          borderRadius: 4,
                          fontSize: 13,
                          color: isAdded ? '#52c41a' : '#fa8c16'
                        }}>
                          ¥{ing.unitPrice}
                        </span>
                        <span style={{ color: '#999' }}>/ {ing.unit}</span>
                      </div>
                    </div>
                  </div>
                  {/* 操作按钮区域 */}
                  {isAdded ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      color: '#52c41a', 
                      fontSize: 14,
                      fontWeight: 700,
                      padding: '10px 16px',
                      background: '#fff',
                      borderRadius: 10,
                      border: '2px solid #b7eb8f',
                      boxShadow: '0 2px 6px rgba(82,196,26,0.15)'
                    }}>
                      <CheckCircleOutlined style={{ fontSize: 18 }} /> 已添加
                    </div>
                  ) : (
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%)',
                      border: '2px dashed #91caff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      <PlusOutlined style={{ color: '#1890ff', fontSize: 20, fontWeight: 700 }} />
                    </div>
                  )}
                </div>
              );
            })}
            {filteredIngredients.length === 0 && (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description={
                  <span style={{ color: '#999', fontSize: 15 }}>未找到相关原料，请尝试其他关键词</span>
                }
                style={{ marginTop: 60, marginBottom: 60 }}
              />
            )}
          </div>
        </Modal>

        {/* 保存按钮 */}
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              paddingLeft: 32,
              paddingRight: 32
            }}
          >
            保存商品
          </Button>
        </div>
      </Spin>
    </Modal>
  );
};

export default SkuSimpleForm;
