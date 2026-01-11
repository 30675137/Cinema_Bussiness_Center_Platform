/**
 * @spec N001-purchase-inbound
 * SKU 选择器模态框组件
 * 用于在采购订单中选择商品
 */
import React, { useState, useCallback } from 'react';
import {
  Modal,
  Table,
  Input,
  Space,
  Tag,
  Button,
  message,
} from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { skuService } from '@/services/skuService';
import type { SKU } from '@/types/sku';
import type { ColumnsType } from 'antd/es/table';

// 已选择的 SKU 项（带数量和单价）
export interface SelectedSkuItem {
  skuId: string;
  skuCode: string;
  skuName: string;
  mainUnit: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

interface SkuSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (items: SelectedSkuItem[]) => void;
  excludeSkuIds?: string[]; // 已添加的 SKU，避免重复选择
}

const SkuSelectorModal: React.FC<SkuSelectorModalProps> = ({
  open,
  onClose,
  onSelect,
  excludeSkuIds = [],
}) => {
  const [keyword, setKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedSkus, setSelectedSkus] = useState<SKU[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 查询 SKU 列表
  const { data, isLoading } = useQuery({
    queryKey: ['skus', 'selector', keyword, page, pageSize],
    queryFn: () =>
      skuService.getSkus({
        keyword: keyword || undefined,
        status: 'enabled',
        page,
        pageSize,
      }),
    enabled: open,
  });

  // 过滤掉已添加的 SKU
  const filteredItems = (data?.items || []).filter(
    (sku) => !excludeSkuIds.includes(sku.id)
  );

  // 搜索处理
  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
  }, []);

  // 选择行变化
  const handleRowSelectionChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: SKU[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedSkus(selectedRows);
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedSkus.length === 0) {
      message.warning('请至少选择一个商品');
      return;
    }

    const items: SelectedSkuItem[] = selectedSkus.map((sku) => ({
      skuId: sku.id,
      skuCode: sku.code,
      skuName: sku.name,
      mainUnit: sku.mainUnit,
      quantity: 1, // 默认数量
      unitPrice: sku.standardCost || 0, // 默认使用标准成本作为采购单价
      lineAmount: sku.standardCost || 0,
    }));

    onSelect(items);
    handleClose();
  };

  // 关闭重置状态
  const handleClose = () => {
    setKeyword('');
    setSelectedRowKeys([]);
    setSelectedSkus([]);
    setPage(1);
    onClose();
  };

  // 表格列定义
  const columns: ColumnsType<SKU> = [
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

  return (
    <Modal
      title="选择采购商品"
      open={open}
      onCancel={handleClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button
          key="confirm"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleConfirm}
          disabled={selectedSkus.length === 0}
        >
          添加选中商品 ({selectedSkus.length})
        </Button>,
      ]}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Input.Search
          placeholder="搜索商品编码或名称"
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ width: 300 }}
        />

        <Table<SKU>
          rowKey="id"
          columns={columns}
          dataSource={filteredItems}
          loading={isLoading}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: handleRowSelectionChange,
          }}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
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
      </Space>
    </Modal>
  );
};

export default SkuSelectorModal;
