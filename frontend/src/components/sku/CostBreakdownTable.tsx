/**
 * SKU 成本明细展示组件
 * 展示BOM组件或套餐子项的成本计算明细
 * @since P001-sku-master-data T027
 */
import React from 'react';
import { Table, Typography, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

// BOM 组件类型
export interface BomComponent {
  id: string;
  componentId: string;
  componentName: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  isOptional?: boolean;
}

// 套餐子项类型
export interface ComboItem {
  id: string;
  subItemId: string;
  subItemName: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  isOptional?: boolean;
}

interface CostBreakdownTableProps {
  /**
   * 数据源：BOM组件或套餐子项
   */
  items: BomComponent[] | ComboItem[];

  /**
   * 类型：finished_product（成品）或 combo（套餐）
   */
  type: 'finished_product' | 'combo';

  /**
   * 损耗率（仅成品类型使用）
   */
  wasteRate?: number;

  /**
   * 是否显示为紧凑模式
   */
  compact?: boolean;
}

/**
 * 成本明细表格组件
 */
export const CostBreakdownTable: React.FC<CostBreakdownTableProps> = ({
  items,
  type,
  wasteRate = 0,
  compact = false,
}) => {
  // 计算总计
  const componentTotal = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  const wasteCost = type === 'finished_product' ? componentTotal * (wasteRate / 100) : 0;
  const grandTotal = componentTotal + wasteCost;

  // 判断是BOM组件还是套餐子项
  const isBom = 'componentName' in (items[0] || {});
  const itemNameKey = isBom ? 'componentName' : 'subItemName';

  // 表格列定义
  const columns: ColumnsType<BomComponent | ComboItem> = [
    {
      title: type === 'finished_product' ? '组件名称' : '子项名称',
      dataIndex: itemNameKey,
      key: 'name',
      width: compact ? 150 : 200,
      render: (name: string, record) => (
        <Space>
          <Text>{name}</Text>
          {record.isOptional && <Tag color="blue">可选</Tag>}
        </Space>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: compact ? 80 : 100,
      align: 'right',
      render: (quantity: number, record) => `${quantity} ${record.unit}`,
    },
    {
      title: '单位成本',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: compact ? 100 : 120,
      align: 'right',
      render: (cost: number | undefined) => (
        <Text>{cost !== undefined ? `¥${cost.toFixed(2)}` : '-'}</Text>
      ),
    },
    {
      title: '小计',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: compact ? 100 : 120,
      align: 'right',
      render: (cost: number | undefined) => (
        <Text strong>{cost !== undefined ? `¥${cost.toFixed(2)}` : '-'}</Text>
      ),
    },
  ];

  // 汇总行数据
  const summaryRows = [
    {
      key: 'component-total',
      label: type === 'finished_product' ? '组件成本合计' : '子项成本合计',
      value: componentTotal,
      highlight: false,
    },
  ];

  if (type === 'finished_product' && wasteRate > 0) {
    summaryRows.push({
      key: 'waste-cost',
      label: `损耗成本 (${wasteRate}%)`,
      value: wasteCost,
      highlight: false,
    });
  }

  summaryRows.push({
    key: 'grand-total',
    label: '标准成本总计',
    value: grandTotal,
    highlight: true,
  });

  return (
    <div className="cost-breakdown-table" data-testid="cost-breakdown-table">
      <Table
        columns={columns}
        dataSource={items}
        pagination={false}
        size={compact ? 'small' : 'middle'}
        rowKey="id"
        bordered
        summary={() => (
          <Table.Summary fixed>
            {summaryRows.map((row) => (
              <Table.Summary.Row
                key={row.key}
                style={{ backgroundColor: row.highlight ? '#fafafa' : undefined }}
              >
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <Text strong={row.highlight} style={{ fontSize: row.highlight ? 16 : 14 }}>
                    {row.label}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text
                    strong
                    style={{
                      fontSize: row.highlight ? 16 : 14,
                      color: row.highlight ? '#1890ff' : undefined,
                    }}
                  >
                    ¥{row.value.toFixed(2)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            ))}
          </Table.Summary>
        )}
      />

      {items.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          暂无{type === 'finished_product' ? '组件' : '子项'}数据
        </div>
      )}
    </div>
  );
};

export default CostBreakdownTable;
