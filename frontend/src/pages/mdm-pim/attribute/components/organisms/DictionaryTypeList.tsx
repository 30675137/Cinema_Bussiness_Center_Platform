/**
 * DictionaryTypeList Component (Organism)
 *
 * Main component for dictionary type management.
 * Features:
 * - Tabs for each dictionary type
 * - Dictionary item table for each type
 * - Create/edit dictionary types
 * - Create/edit dictionary items via drawer
 */

import React, { useState } from 'react';
import { Tabs, Button, Space, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDictionaryTypesQuery } from '../../hooks/useDictionaryQueries';
import {
  useCreateDictionaryTypeMutation,
  useUpdateDictionaryTypeMutation,
  useDeleteDictionaryTypeMutation,
} from '../../hooks/useDictionaryMutations';
import DictionaryItemTable from '../molecules/DictionaryItemTable';
import DictionaryTypeForm from '../molecules/DictionaryTypeForm';
import DictionaryItemDrawer from './DictionaryItemDrawer';
import type { DictionaryType, DictionaryItem } from '@/features/attribute-dictionary/types';
import type { DictionaryTypeFormValues, DrawerMode } from '../../types/attribute.types';

/**
 * Dictionary Type List Component
 */
const DictionaryTypeList: React.FC = () => {
  const [activeTypeId, setActiveTypeId] = useState<string | null>(null);
  const [typeDrawerVisible, setTypeDrawerVisible] = useState(false);
  const [typeDrawerMode, setTypeDrawerMode] = useState<DrawerMode>('create');
  const [editingType, setEditingType] = useState<DictionaryType | undefined>();
  
  const [itemDrawerVisible, setItemDrawerVisible] = useState(false);
  const [itemDrawerMode, setItemDrawerMode] = useState<DrawerMode>('create');
  const [editingItem, setEditingItem] = useState<DictionaryItem | undefined>();

  // Queries
  const { data: typesData, isLoading, error } = useDictionaryTypesQuery();
  const types = typesData?.data || [];

  // Log for debugging
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('DictionaryTypeList - typesData:', typesData);
      console.log('DictionaryTypeList - isLoading:', isLoading);
      console.log('DictionaryTypeList - error:', error);
      console.log('DictionaryTypeList - types:', types);
    }
  }, [typesData, isLoading, error, types]);

  // Mutations
  const createTypeMutation = useCreateDictionaryTypeMutation();
  const updateTypeMutation = useUpdateDictionaryTypeMutation();
  const deleteTypeMutation = useDeleteDictionaryTypeMutation();

  // Set first type as active when types load
  React.useEffect(() => {
    if (types.length > 0 && !activeTypeId) {
      setActiveTypeId(types[0].id);
    }
  }, [types, activeTypeId]);

  // Handle type tab change
  const handleTypeChange = (typeId: string) => {
    setActiveTypeId(typeId);
  };

  // Handle create type
  const handleCreateType = () => {
    setEditingType(undefined);
    setTypeDrawerMode('create');
    setTypeDrawerVisible(true);
  };

  // Handle edit type
  const handleEditType = (type: DictionaryType) => {
    setEditingType(type);
    setTypeDrawerMode('edit');
    setTypeDrawerVisible(true);
  };

  // Handle delete type
  const handleDeleteType = async (type: DictionaryType) => {
    // Check if type has items (FR-001b)
    if (type.itemCount && type.itemCount > 0) {
      message.warning('该字典类型下存在字典项，无法删除');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除字典类型"${type.name}"吗？删除后无法恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteTypeMutation.mutateAsync(type.id);
          // If deleted type was active, switch to first available type
          if (activeTypeId === type.id && types.length > 1) {
            const remainingTypes = types.filter(t => t.id !== type.id);
            if (remainingTypes.length > 0) {
              setActiveTypeId(remainingTypes[0].id);
            } else {
              setActiveTypeId(null);
            }
          }
        } catch (error) {
          // Error handled by mutation hook
        }
      },
    });
  };

  // Handle type form submit
  const handleTypeSubmit = async (data: DictionaryTypeFormValues) => {
    try {
      if (typeDrawerMode === 'create') {
        await createTypeMutation.mutateAsync(data);
      } else if (editingType) {
        await updateTypeMutation.mutateAsync({
          id: editingType.id,
          data,
        });
      }
      setTypeDrawerVisible(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Handle create item
  const handleCreateItem = () => {
    if (!activeTypeId) {
      message.warning('请先选择一个字典类型');
      return;
    }
    setEditingItem(undefined);
    setItemDrawerMode('create');
    setItemDrawerVisible(true);
  };

  // Handle edit item
  const handleEditItem = (item: DictionaryItem) => {
    setEditingItem(item);
    setItemDrawerMode('edit');
    setItemDrawerVisible(true);
  };

  // Handle item form submit
  const handleItemSubmit = async (data: any) => {
    // This will be handled by DictionaryItemDrawer
    setItemDrawerVisible(false);
  };

  // Tab items for dictionary types
  const tabItems = types.map((type) => ({
    key: type.id,
    label: (
      <Space>
        <span>{type.name}</span>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleEditType(type);
          }}
        />
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteType(type);
          }}
        />
      </Space>
    ),
    children: (
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateItem}
          >
            新增字典项
          </Button>
        </div>
        <DictionaryItemTable
          typeId={type.id}
          onEdit={handleEditItem}
        />
      </div>
    ),
  }));

  return (
    <div className="dictionary-type-list">
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateType}
        >
          新增字典类型
        </Button>
      </div>

      {error ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#ff4d4f' }}>
          加载失败: {error.message || '未知错误'}
        </div>
      ) : types.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#999' }}>
          {isLoading ? '加载中...' : '暂无字典类型，请先创建'}
        </div>
      ) : (
        <Tabs
          activeKey={activeTypeId || undefined}
          onChange={handleTypeChange}
          items={tabItems}
          type="card"
        />
      )}

      {/* Dictionary Type Drawer */}
      <Modal
        title={typeDrawerMode === 'create' ? '新增字典类型' : '编辑字典类型'}
        open={typeDrawerVisible}
        onCancel={() => setTypeDrawerVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <DictionaryTypeForm
          mode={typeDrawerMode}
          initialData={editingType}
          onSubmit={handleTypeSubmit}
          onCancel={() => setTypeDrawerVisible(false)}
          loading={createTypeMutation.isPending || updateTypeMutation.isPending}
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => setTypeDrawerVisible(false)}>取消</Button>
            <Button
              type="primary"
              form="dictionary-type-form"
              htmlType="submit"
              loading={createTypeMutation.isPending || updateTypeMutation.isPending}
            >
              {typeDrawerMode === 'create' ? '创建' : '保存'}
            </Button>
          </Space>
        </div>
      </Modal>

      {/* Dictionary Item Drawer */}
      <DictionaryItemDrawer
        visible={itemDrawerVisible}
        mode={itemDrawerMode}
        typeId={activeTypeId || ''}
        initialData={editingItem}
        onClose={() => setItemDrawerVisible(false)}
        onSubmit={handleItemSubmit}
      />
    </div>
  );
};

export default DictionaryTypeList;

