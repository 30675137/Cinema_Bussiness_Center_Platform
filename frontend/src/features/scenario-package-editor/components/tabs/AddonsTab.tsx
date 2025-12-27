/**
 * AddonsTab 组件
 * 加购项关联标签页
 * Feature: 001-scenario-package-tabs
 */

import React, { useState, useMemo } from 'react';
import { Empty, Button, Skeleton, message, Row, Col, Input, Select, Space } from 'antd';
import { SaveOutlined, SearchOutlined } from '@ant-design/icons';
import { EditableCard } from '../';
import AddOnItemCard from '../molecules/AddOnItemCard';
import { useScenarioPackageStore } from '../../stores/useScenarioPackageStore';
import {
  useAllAddOnItems,
  usePackageAddOns,
  useUpdatePackageAddOns,
} from '../../hooks/useScenarioPackageQueries';
import type { AddOnCategory } from '../../types';

interface AddonsTabProps {
  /** 场景包ID */
  packageId: string;
  /** 是否加载中 */
  loading?: boolean;
}

/**
 * 加购项关联标签页
 */
const AddonsTab: React.FC<AddonsTabProps> = ({
  packageId,
  loading: parentLoading = false,
}) => {
  const isDirty = useScenarioPackageStore((state) => state.dirtyTabs.addons);
  const setDirty = useScenarioPackageStore((state) => state.setDirty);

  // 筛选状态
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AddOnCategory | ''>('');

  // 选中状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [requiredIds, setRequiredIds] = useState<Set<string>>(new Set());

  // 查询数据
  const { data: allItems = [], isLoading: loadingItems } = useAllAddOnItems();
  const { data: packageAddons = [], isLoading: loadingAddons } = usePackageAddOns(packageId);
  const updateMutation = useUpdatePackageAddOns(packageId);

  // 初始化选中状态
  React.useEffect(() => {
    const selected = new Set(packageAddons.map((a) => a.addOnItemId));
    const required = new Set(packageAddons.filter((a) => a.isRequired).map((a) => a.addOnItemId));
    setSelectedIds(selected);
    setRequiredIds(required);
  }, [packageAddons]);

  // 筛选加购项
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (!item.isActive) return false;
      if (searchText && !item.name.includes(searchText)) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      return true;
    });
  }, [allItems, searchText, categoryFilter]);

  // 选择/取消加购项
  const handleSelect = (itemId: string, selected: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (selected) {
      newSelectedIds.add(itemId);
    } else {
      newSelectedIds.delete(itemId);
      // 同时移除必选状态
      const newRequiredIds = new Set(requiredIds);
      newRequiredIds.delete(itemId);
      setRequiredIds(newRequiredIds);
    }
    setSelectedIds(newSelectedIds);
    setDirty('addons', true);
  };

  // 设置/取消必选
  const handleRequiredChange = (itemId: string, required: boolean) => {
    const newRequiredIds = new Set(requiredIds);
    if (required) {
      newRequiredIds.add(itemId);
    } else {
      newRequiredIds.delete(itemId);
    }
    setRequiredIds(newRequiredIds);
    setDirty('addons', true);
  };

  // 保存
  const handleSave = async () => {
    try {
      const addons = Array.from(selectedIds).map((itemId, index) => ({
        addOnItemId: itemId,
        sortOrder: index,
        isRequired: requiredIds.has(itemId),
      }));
      await updateMutation.mutateAsync({ addons });
      message.success('加购项配置已保存');
      setDirty('addons', false);
    } catch (error) {
      message.error('保存失败');
    }
  };

  const loading = parentLoading || loadingItems || loadingAddons;

  return (
    <EditableCard
      title="加购项关联"
      description="配置可选加购项目"
      isDirty={isDirty}
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={updateMutation.isPending}
          disabled={!isDirty}
        >
          保存
        </Button>
      }
    >
      {/* 筛选栏 */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索加购项"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          placeholder="分类筛选"
          value={categoryFilter || undefined}
          onChange={(v) => setCategoryFilter(v || '')}
          style={{ width: 120 }}
          allowClear
          options={[
            { value: 'CATERING', label: '餐饮' },
            { value: 'BEVERAGE', label: '饮品' },
            { value: 'SERVICE', label: '服务' },
            { value: 'DECORATION', label: '布置' },
          ]}
        />
      </Space>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : filteredItems.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无可用加购项"
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredItems.map((item) => (
            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
              <AddOnItemCard
                item={item}
                selected={selectedIds.has(item.id)}
                onSelect={handleSelect}
                isRequired={requiredIds.has(item.id)}
                onRequiredChange={handleRequiredChange}
              />
            </Col>
          ))}
        </Row>
      )}
    </EditableCard>
  );
};

export default AddonsTab;
