import React, { useState, useCallback } from 'react';
import { Card, Typography, Space, Button, Switch, InputNumber, Divider, Alert } from 'antd';
import { LazyDataTable, LazyFormField } from '@/components/lazy';
import { DataTableColumn, FormFieldConfig, FormFieldType } from '@/components/ui';
import { cn, tailwindPreset, tw } from '@/utils';

const { Title, Paragraph, Text } = Typography;

/**
 * 性能优化演示页面
 */
const PerformanceDemo: React.FC = () => {
  const [enableVirtualScroll, setEnableVirtualScroll] = useState(true);
  const [enablePerformanceMonitoring, setEnablePerformanceMonitoring] = useState(true);
  const [enableStrictMode, setEnableStrictMode] = useState(false);
  const [dataSize, setDataSize] = useState(100);

  // 生成大量模拟数据
  const generateLargeDataset = useCallback((size: number) => {
    return Array.from({ length: size }, (_, index) => ({
      id: `ITEM_${index + 1}`,
      name: `商品 ${index + 1}`,
      category: ['饮料', '零食', '票务', '周边'][index % 4],
      price: parseFloat((Math.random() * 100 + 5).toFixed(2)),
      stock: Math.floor(Math.random() * 200) + 10,
      status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'pending' : 'inactive',
      description: `这是商品 ${index + 1} 的详细描述信息，包含产品的各种特性和使用说明`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }));
  }, []);

  const [largeData] = useState(() => generateLargeDataset(dataSize));

  // 表格列配置
  const tableColumns: DataTableColumn[] = [
    {
      title: '商品编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      sortable: true,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      sortable: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      filterable: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right',
      sortable: true,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      align: 'right',
      sortable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value: string) => {
        const colorMap = {
          active: '#52c41a',
          pending: '#faad14',
          inactive: '#f5222d',
        };
        return (
          <span
            style={{
              color: colorMap[value as keyof typeof colorMap],
              fontWeight: 'bold',
            }}
          >
            {value === 'active' ? '生效' : value === 'pending' ? '待审核' : '已下架'}
          </span>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
  ];

  // 表格操作配置
  const tableActions = {
    actions: [
      {
        label: '查看',
        onClick: (record: any) => console.log('查看:', record),
      },
      {
        label: '编辑',
        onClick: (record: any) => console.log('编辑:', record),
      },
      {
        label: '删除',
        onClick: (record: any) => console.log('删除:', record),
        danger: true,
      },
    ],
  };

  // 表单字段配置
  const formFields: FormFieldConfig[] = [
    {
      name: 'productName',
      label: '商品名称',
      type: FormFieldType.INPUT,
      required: true,
      placeholder: '请输入商品名称',
      rules: [{ required: true, message: '商品名称是必填项' }],
    },
    {
      name: 'category',
      label: '商品分类',
      type: FormFieldType.SELECT,
      required: true,
      placeholder: '请选择商品分类',
      options: [
        { label: '饮料', value: 'drink' },
        { label: '零食', value: 'snack' },
        { label: '票务', value: 'ticket' },
        { label: '周边', value: 'merchandise' },
      ],
    },
    {
      name: 'price',
      label: '商品价格',
      type: FormFieldType.NUMBER,
      required: true,
      placeholder: '请输入商品价格',
      rules: [
        { required: true, message: '商品价格是必填项' },
        { type: 'number', min: 0, message: '价格不能小于0' },
      ],
    },
    {
      name: 'description',
      label: '商品描述',
      type: FormFieldType.TEXTAREA,
      placeholder: '请输入商品描述',
      description: '选填，详细描述商品特点和优势',
    },
    {
      name: 'isActive',
      label: '启用状态',
      type: FormFieldType.SWITCH,
      defaultValue: true,
    },
  ];

  return (
    <div className={cn('performance-demo p-6 bg-gray-50 min-h-screen')}>
      <div className={cn('max-w-7xl mx-auto')}>
        {/* 页面标题 */}
        <div className="mb-8">
          <Title level={2}>性能优化演示</Title>
          <Paragraph type="secondary">
            展示懒加载、虚拟滚动、性能监控等优化技术的应用效果
          </Paragraph>
        </div>

        {/* 性能控制面板 */}
        <Card title="性能控制" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={cn('flex items-center justify-between', tailwindPreset('card-compact'))}>
              <Text strong>虚拟滚动</Text>
              <Switch
                checked={enableVirtualScroll}
                onChange={setEnableVirtualScroll}
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </div>

            <div className={cn('flex items-center justify-between', tailwindPreset('card-compact'))}>
              <Text strong>性能监控</Text>
              <Switch
                checked={enablePerformanceMonitoring}
                onChange={setEnablePerformanceMonitoring}
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </div>

            <div className={cn('flex items-center justify-between', tailwindPreset('card-compact'))}>
              <Text strong>严格模式</Text>
              <Switch
                checked={enableStrictMode}
                onChange={setEnableStrictMode}
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </div>

            <div className={cn('flex items-center space-x-2', tailwindPreset('card-compact'))}>
              <Text strong>数据量：</Text>
              <InputNumber
                min={10}
                max={1000}
                step={10}
                value={dataSize}
                onChange={(value) => value && setDataSize(value)}
              />
              <Text type="secondary">条</Text>
            </div>
          </div>
        </Card>

        {/* 性能优化说明 */}
        <Alert
          message="性能优化特性"
          description={
            <div className="space-y-1">
              <div>✅ <Text strong>懒加载</Text>: 组件按需加载，减少初始包体积</div>
              <div>✅ <Text strong>虚拟滚动</Text>: 大数据集渲染优化，只渲染可见区域</div>
              <div>✅ <Text strong>React.memo</Text>: 组件重渲染优化，避免不必要的更新</div>
              <div>✅ <Text strong>性能监控</Text>: 实时监控组件渲染性能</div>
              <div>✅ <Text strong>骨架屏</Text>: 优雅的加载状态，提升用户体验</div>
            </div>
          }
          type="info"
          className="mb-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 懒加载表格演示 */}
          <Card
            title={`懒加载表格 (${largeData.length} 条数据)`}
            className={cn(tailwindPreset('transition-fast'), 'hover:shadow-lg')}
          >
            <LazyDataTable
              columns={tableColumns}
              dataSource={largeData}
              title="大数据集表格"
              description={`展示 ${largeData.length} 条数据的性能表现`}
              virtualScroll={{
                enabled: enableVirtualScroll,
                itemHeight: 54,
                bufferSize: 5,
                overscan: 10,
              }}
              performance={{
                enabled: enablePerformanceMonitoring,
                renderThreshold: 16,
                logRerenders: true,
              }}
              strictMode={enableStrictMode}
              pagination={{
                current: 1,
                pageSize: 20,
                total: largeData.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              }}
              selection={{
                enabled: true,
                type: 'checkbox',
              }}
              actions={tableActions}
              striped
              bordered
              size="middle"
            />
          </Card>

          {/* 懒加载表单演示 */}
          <Card
            title="懒加载表单"
            className={cn(tailwindPreset('transition-fast'), 'hover:shadow-lg')}
          >
            <div className="space-y-4">
              <Text type="secondary">
                以下是使用懒加载的表单字段组件，每个字段都支持复杂的验证和交互
              </Text>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formFields.map((field) => (
                  <LazyFormField
                    key={field.name}
                    config={field}
                    value={undefined}
                    onChange={(value, name) => {
                      console.log('表单变化:', { value, name });
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="primary"
                  onClick={() => console.log('表单提交')}
                  className={tw(tailwindPreset('button-primary'))}
                >
                  提交表单
                </Button>
                <Button
                  onClick={() => console.log('重置表单')}
                  className={tw(tailwindPreset('button-secondary'))}
                >
                  重置
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* 性能监控结果 */}
        <Card title="性能监控结果" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={cn('text-center p-4', tailwindPreset('card'))}>
              <Title level={3} className="text-blue-600 mb-2">
                {largeData.length}
              </Title>
              <Text type="secondary">数据总量</Text>
            </div>

            <div className={cn('text-center p-4', tailwindPreset('card'))}>
              <Title level={3} className="text-green-600 mb-2">
                {enableVirtualScroll ? '已启用' : '未启用'}
              </Title>
              <Text type="secondary">虚拟滚动</Text>
            </div>

            <div className={cn('text-center p-4', tailwindPreset('card'))}>
              <Title level={3} className="text-orange-600 mb-2">
                {enablePerformanceMonitoring ? '监控中' : '未监控'}
              </Title>
              <Text type="secondary">性能监控</Text>
            </div>
          </div>
        </Card>

        {/* 使用说明 */}
        <Card title="使用说明" className="mt-6">
          <div className="prose max-w-none">
            <Paragraph>
              本页面演示了如何在影院商品管理中台中应用性能优化技术：
            </Paragraph>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Title level={4}>📦 懒加载组件</Title>
                <ul>
                  <li>使用 React.lazy() 实现代码分割</li>
                  <li>配合 Suspense 提供优雅的加载状态</li>
                  <li>错误边界处理加载失败的情况</li>
                  <li>支持预加载和重试机制</li>
                </ul>
              </div>

              <div>
                <Title level={4}>⚡ 虚拟滚动</Title>
                <ul>
                  <li>只渲染可见区域的DOM元素</li>
                  <li>大幅提升大数据集渲染性能</li>
                  <li>支持自定义行高和缓冲区</li>
                  <li>保持原表格的所有功能</li>
                </ul>
              </div>

              <div>
                <Title level={4}>🔍 性能监控</Title>
                <ul>
                  <li>实时监控组件渲染时间</li>
                  <li>记录组件重渲染次数</li>
                  <li>性能阈值警告</li>
                  <li>开发环境调试信息</li>
                </ul>
              </div>

              <div>
                <Title level={4}>🎯 内存优化</Title>
                <ul>
                  <li>使用 React.memo 避免不必要重渲染</li>
                  <li>useMemo 缓存昂贵的计算结果</li>
                  <li>useCallback 缓存事件处理函数</li>
                  <li>清理事件监听器和定时器</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceDemo;