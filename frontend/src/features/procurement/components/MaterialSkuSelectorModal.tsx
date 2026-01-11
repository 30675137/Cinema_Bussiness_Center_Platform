/**
 * @spec N004-procurement-material-selector
 * 物料/SKU 选择器模态框组件
 * 支持在采购订单中选择 Material（物料，占95%业务）或 SKU（成品，占5%业务）
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  Modal,
  Table,
  Input,
  Space,
  Tag,
  Button,
  message,
  Segmented,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DatabaseOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { skuService } from '@/services/skuService';
import { materialService } from '@/services/materialService';
import type { SKU } from '@/types/sku';
import { SkuStatus } from '@/types/sku';
import type { Material } from '@/types/material';
import { PurchaseOrderItemType } from '@/types/purchase';
import type { ColumnsType } from 'antd/es/table';

// 已选择的采购项（支持 Material 和 SKU）
export interface SelectedProcurementItem {
  itemType: PurchaseOrderItemType;
  // Material 字段
  materialId?: string;
  materialCode?: string;
  materialName?: string;
  purchaseUnit?: string;
  inventoryUnit?: string;
  // SKU 字段
  skuId?: string;
  skuCode?: string;
  skuName?: string;
  mainUnit?: string;
  // 通用字段
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

interface MaterialSkuSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (items: SelectedProcurementItem[]) => void;
  excludeIds?: string[]; // 已添加的 ID，避免重复选择
  defaultType?: PurchaseOrderItemType;
}

const MaterialSkuSelectorModal: React.FC<MaterialSkuSelectorModalProps> = ({
  open,
  onClose,
  onSelect,
  excludeIds = [],
  defaultType = PurchaseOrderItemType.MATERIAL,
}) => {
  const [itemType, setItemType] = useState<PurchaseOrderItemType>(defaultType);
  const [keyword, setKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedItems, setSelectedItems] = useState<(Material | SKU)[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 查询物料列表
  const { data: materialsData, isLoading: materialsLoading } = useQuery({
    queryKey: ['materials', 'selector', keyword],
    queryFn: () => materialService.getAll(),
    enabled: open && itemType === PurchaseOrderItemType.MATERIAL,
  });

  // 查询 SKU 列表
  const { data: skusData, isLoading: skusLoading } = useQuery({
    queryKey: ['skus', 'selector', keyword, page, pageSize],
    queryFn: () =>
      skuService.getSkus({
        keyword: keyword || undefined,
        status: SkuStatus.ENABLED,
        page,
        pageSize,
      }),
    enabled: open && itemType === PurchaseOrderItemType.SKU,
  });

  // 过滤后的物料列表（支持搜索和排除）
  // 注意：后端已只返回 ACTIVE 状态的物料，无需前端再过滤 status
  const filteredMaterials = useMemo(() => {
    if (!materialsData) return [];
    let list = materialsData.filter((m: Material) => !excludeIds.includes(m.id));
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(
        (m: Material) =>
          m.name.toLowerCase().includes(kw) || m.code.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [materialsData, keyword, excludeIds]);

  // 过滤后的 SKU 列表
  const filteredSkus = useMemo(() => {
    return (skusData?.items || []).filter(
      (sku: SKU) => !excludeIds.includes(sku.id)
    );
  }, [skusData, excludeIds]);

  const isLoading =
    itemType === PurchaseOrderItemType.MATERIAL ? materialsLoading : skusLoading;

  // 搜索处理
  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
    setSelectedRowKeys([]);
    setSelectedItems([]);
  }, []);

  // 类型切换
  const handleTypeChange = useCallback((value: string | number) => {
    setItemType(value as PurchaseOrderItemType);
    setKeyword('');
    setPage(1);
    setSelectedRowKeys([]);
    setSelectedItems([]);
  }, []);

  // 选择行变化
  const handleRowSelectionChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: (Material | SKU)[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedItems(selectedRows);
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedItems.length === 0) {
      message.warning('请至少选择一个商品');
      return;
    }

    const items: SelectedProcurementItem[] = selectedItems.map((item) => {
      if (itemType === PurchaseOrderItemType.MATERIAL) {
        const material = item as Material;
        return {
          itemType: PurchaseOrderItemType.MATERIAL,
          materialId: material.id,
          materialCode: material.code,
          materialName: material.name,
          purchaseUnit: material.purchaseUnit?.code || material.purchaseUnit?.name,
          inventoryUnit: material.inventoryUnit?.code || material.inventoryUnit?.name,
          quantity: 1,
          unitPrice: 0,
          lineAmount: 0,
        };
      } else {
        const sku = item as SKU;
        return {
          itemType: PurchaseOrderItemType.SKU,
          skuId: sku.id,
          skuCode: sku.code,
          skuName: sku.name,
          mainUnit: sku.mainUnit,
          quantity: 1,
          unitPrice: sku.standardCost || 0,
          lineAmount: sku.standardCost || 0,
        };
      }
    });

    onSelect(items);
    handleClose();
  };

  // 关闭重置状态
  const handleClose = () => {
    setKeyword('');
    setSelectedRowKeys([]);
    setSelectedItems([]);
    setPage(1);
    onClose();
  };

  // 物料表格列定义
  const materialColumns: ColumnsType<Material> = [
    {
      title: '物料编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '物料名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => {
        const categoryMap: Record<string, { color: string; text: string }> = {
          FOOD: { color: 'orange', text: '食材' },
          BEVERAGE: { color: 'blue', text: '饮品' },
          PACKAGING: { color: 'green', text: '包材' },
          CLEANING: { color: 'cyan', text: '清洁' },
          OTHER: { color: 'default', text: '其他' },
        };
        const config = categoryMap[category] || { color: 'default', text: category };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '采购单位',
      key: 'purchaseUnit',
      width: 90,
      render: (_, record) => (
        <Tooltip title="采购时使用此单位">
          <Tag color="blue">{record.purchaseUnit?.name || '-'}</Tag>
        </Tooltip>
      ),
    },
    {
      title: '库存单位',
      key: 'inventoryUnit',
      width: 90,
      render: (_, record) => (
        <Tooltip title="入库时自动换算为此单位">
          <Tag color="green">{record.inventoryUnit?.name || '-'}</Tag>
        </Tooltip>
      ),
    },
  ];

  // SKU 表格列定义
  const skuColumns: ColumnsType<SKU> = [
    {
      title: 'SKU 编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'skuType',
      key: 'skuType',
      width: 80,
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          raw_material: { color: 'blue', text: '原料' },
          packaging: { color: 'green', text: '包材' },
          finished_product: { color: 'orange', text: '成品' },
          combo: { color: 'purple', text: '套餐' },
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '单位',
      dataIndex: 'mainUnit',
      key: 'mainUnit',
      width: 80,
    },
    {
      title: '标准成本',
      dataIndex: 'standardCost',
      key: 'standardCost',
      width: 100,
      render: (cost: number | undefined) =>
        cost !== undefined ? `¥${cost.toFixed(2)}` : '-',
    },
  ];

  // 类型切换选项
  const typeOptions = [
    {
      label: (
        <Space>
          <DatabaseOutlined />
          物料 (95%)
        </Space>
      ),
      value: PurchaseOrderItemType.MATERIAL,
    },
    {
      label: (
        <Space>
          <ShoppingOutlined />
          SKU (5%)
        </Space>
      ),
      value: PurchaseOrderItemType.SKU,
    },
  ];

  return (
    <Modal
      title={
        <Space>
          {itemType === PurchaseOrderItemType.MATERIAL ? (
            <DatabaseOutlined />
          ) : (
            <ShoppingOutlined />
          )}
          选择采购商品
        </Space>
      }
      open={open}
      onCancel={handleClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button
          key="confirm"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleConfirm}
          disabled={selectedItems.length === 0}
        >
          添加选中商品 ({selectedItems.length})
        </Button>,
      ]}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 类型切换器 */}
        <Segmented
          value={itemType}
          onChange={handleTypeChange}
          options={typeOptions}
          block
          size="large"
        />

        {/* 搜索框 */}
        <Input.Search
          placeholder={
            itemType === PurchaseOrderItemType.MATERIAL
              ? '搜索物料编码或名称'
              : '搜索 SKU 编码或名称'
          }
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ width: 300 }}
        />

        {/* 物料表格 */}
        {itemType === PurchaseOrderItemType.MATERIAL && (
          <Table<Material>
            rowKey="id"
            columns={materialColumns}
            dataSource={filteredMaterials}
            loading={materialsLoading}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys,
              onChange: handleRowSelectionChange as any,
            }}
            pagination={{
              current: page,
              pageSize,
              total: filteredMaterials.length,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            size="small"
            scroll={{ y: 400 }}
          />
        )}

        {/* SKU 表格 */}
        {itemType === PurchaseOrderItemType.SKU && (
          <Table<SKU>
            rowKey="id"
            columns={skuColumns}
            dataSource={filteredSkus}
            loading={skusLoading}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys,
              onChange: handleRowSelectionChange as any,
            }}
            pagination={{
              current: page,
              pageSize,
              total: skusData?.total || 0,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            size="small"
            scroll={{ y: 400 }}
          />
        )}
      </Space>
    </Modal>
  );
};

export default MaterialSkuSelectorModal;
