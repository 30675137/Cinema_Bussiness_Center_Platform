/**
 * @spec O004-beverage-sku-reuse
 * SKU Selector Modal Component
 *
 * 可复用的 SKU 选择器模态框组件,支持类型过滤、搜索、分页
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 *
 * 功能特性:
 * - 按 SKU 类型过滤 (finished_product / raw_material / packaging / combo)
 * - 实时搜索 (关键词 + 类型)
 * - 分页支持 (大数据量场景)
 * - 客户端类型守卫 (防御性编程)
 */

import React, { useState, useMemo } from 'react';
import { Modal, Select, Input, Table, Space, Tag, Button, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useSKUs } from '@/hooks/useSKUs';
import type { SKU, SkuType } from '@/types/sku';

/**
 * SKU 类型配置
 */
const SKU_TYPE_CONFIG: Record<SkuType, { label: string; color: string }> = {
  raw_material: { label: '原料', color: 'blue' },
  packaging: { label: '包材', color: 'cyan' },
  finished_product: { label: '成品', color: 'green' },
  combo: { label: '套餐', color: 'purple' },
};

/**
 * SKU Selector Modal Props
 */
export interface SKUSelectorModalProps {
  /** 模态框是否可见 */
  visible: boolean;

  /** 关闭模态框回调 */
  onCancel: () => void;

  /** 选择 SKU 后回调 */
  onSelect: (sku: SKU) => void;

  /** SKU 类型过滤 (默认: finished_product) */
  skuType?: SkuType;

  /** 是否允许多选 (默认: false) */
  multiple?: boolean;

  /** 已选中的 SKU ID 列表 (多选模式) */
  selectedSkuIds?: string[];

  /** 模态框标题 (默认: "选择 SKU") */
  title?: string;

  /** 是否显示 SKU 类型列 (默认: false) */
  showTypeColumn?: boolean;

  /** 排除的 SKU ID 列表 (不显示在选择器中) */
  excludeSkuIds?: string[];
}

/**
 * SKU Selector Modal Component
 *
 * @example
 * ```tsx
 * // 单选模式 (默认)
 * <SKUSelectorModal
 *   visible={isVisible}
 *   onCancel={() => setIsVisible(false)}
 *   onSelect={(sku) => {
 *     console.log('Selected SKU:', sku);
 *     setIsVisible(false);
 *   }}
 *   skuType="finished_product"
 *   title="选择成品 SKU"
 * />
 *
 * // 多选模式
 * <SKUSelectorModal
 *   visible={isVisible}
 *   onCancel={() => setIsVisible(false)}
 *   onSelect={(sku) => {
 *     setSelectedSkus([...selectedSkus, sku]);
 *   }}
 *   multiple
 *   selectedSkuIds={selectedSkus.map(s => s.id)}
 *   skuType="raw_material"
 * />
 * ```
 */
export const SKUSelectorModal: React.FC<SKUSelectorModalProps> = ({
  visible,
  onCancel,
  onSelect,
  skuType = 'finished_product',
  multiple = false,
  selectedSkuIds = [],
  title = '选择 SKU',
  showTypeColumn = false,
  excludeSkuIds = [],
}) => {
  // 本地搜索状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 查询 SKU 列表 (带类型过滤)
  const { data, isLoading } = useSKUs(
    {
      keyword: searchKeyword || undefined,
      status: 'enabled', // 只显示启用状态的 SKU
      page,
      pageSize,
    },
    {
      enabled: visible, // 仅在模态框可见时查询
    }
  );

  /**
   * 客户端类型守卫:
   * 即使 API 返回了混合类型,也要在前端过滤
   * (防御性编程,符合 Defense in Depth 原则)
   */
  const filteredSkus = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((sku) => {
      // 类型过滤
      if (sku.skuType !== skuType) return false;

      // 排除指定的 SKU
      if (excludeSkuIds.includes(sku.id)) return false;

      return true;
    });
  }, [data?.items, skuType, excludeSkuIds]);

  /**
   * 处理搜索
   */
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPage(1); // 重置到第 1 页
  };

  /**
   * 处理行点击 (单选模式)
   */
  const handleRowClick = (sku: SKU) => {
    if (!multiple) {
      onSelect(sku);
    }
  };

  /**
   * 处理行选择 (多选模式)
   */
  const handleRowSelect = (selectedRowKeys: React.Key[], selectedRows: SKU[]) => {
    // 多选模式:每次选择都触发回调
    if (multiple && selectedRows.length > 0) {
      const newSelectedSku = selectedRows[selectedRows.length - 1];
      onSelect(newSelectedSku);
    }
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<SKU> = [
    {
      title: 'SKU 编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      fixed: 'left',
    },
    {
      title: 'SKU 名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    ...(showTypeColumn
      ? [
          {
            title: 'SKU 类型',
            dataIndex: 'skuType',
            key: 'skuType',
            width: 100,
            render: (skuType: SkuType) => {
              const config = SKU_TYPE_CONFIG[skuType];
              return <Tag color={config.color}>{config.label}</Tag>;
            },
          },
        ]
      : []),
    {
      title: 'SPU 名称',
      dataIndex: 'spuName',
      key: 'spuName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
      ellipsis: true,
    },
    {
      title: '类目',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      ellipsis: true,
    },
    {
      title: '主单位',
      dataIndex: 'mainUnit',
      key: 'mainUnit',
      width: 80,
    },
    {
      title: '标准成本',
      dataIndex: 'standardCost',
      key: 'standardCost',
      width: 120,
      render: (cost: number | undefined) =>
        cost !== undefined ? `¥${(cost / 100).toFixed(2)}` : '-',
    },
  ];

  /**
   * 行选择配置 (多选模式)
   */
  const rowSelection = multiple
    ? {
        selectedRowKeys: selectedSkuIds,
        onChange: handleRowSelect,
        type: 'checkbox' as const,
      }
    : undefined;

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={
        multiple ? (
          <Button onClick={onCancel}>关闭</Button>
        ) : (
          <Button onClick={onCancel}>取消</Button>
        )
      }
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 类型过滤提示 */}
        <Alert
          message={`当前仅显示「${SKU_TYPE_CONFIG[skuType].label}」类型的 SKU`}
          type="info"
          showIcon
        />

        {/* 搜索栏 */}
        <Input
          placeholder="搜索 SKU 名称或编码"
          prefix={<SearchOutlined />}
          value={searchKeyword}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ width: '100%' }}
        />

        {/* SKU 列表表格 */}
        <Table<SKU>
          dataSource={filteredSkus}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: filteredSkus.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize || 10);
            },
          }}
          rowSelection={rowSelection}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: multiple ? 'default' : 'pointer' },
          })}
          scroll={{ x: 900 }}
        />

        {/* 无数据提示 */}
        {!isLoading && filteredSkus.length === 0 && (
          <Alert
            message="没有找到符合条件的 SKU"
            description={
              searchKeyword
                ? `请尝试修改搜索关键词 "${searchKeyword}"`
                : `当前没有「${SKU_TYPE_CONFIG[skuType].label}」类型的 SKU,请先创建`
            }
            type="warning"
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
};
