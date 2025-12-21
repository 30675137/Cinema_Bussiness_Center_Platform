/**
 * DictionaryItemDrawer Component (Organism)
 *
 * Drawer component for creating and editing dictionary items.
 * Features:
 * - Create new dictionary items
 * - Edit existing dictionary items
 * - Auto-generate code from name
 * - Validate duplicate names
 */

import React from 'react';
import { Drawer, Button, Space } from 'antd';
import DictionaryItemForm from '../molecules/DictionaryItemForm';
import {
  useCreateDictionaryItemMutation,
  useUpdateDictionaryItemMutation,
} from '../../hooks/useDictionaryMutations';
import type { DictionaryItem } from '@/features/attribute-dictionary/types';
import type { DictionaryItemFormValues, DrawerMode } from '../../types/attribute.types';

interface DictionaryItemDrawerProps {
  visible: boolean;
  mode: DrawerMode;
  typeId: string;
  initialData?: DictionaryItem;
  onClose: () => void;
  onSubmit?: (data: DictionaryItemFormValues) => void;
}

/**
 * Dictionary Item Drawer Component
 */
const DictionaryItemDrawer: React.FC<DictionaryItemDrawerProps> = ({
  visible,
  mode,
  typeId,
  initialData,
  onClose,
  onSubmit,
}) => {
  const createMutation = useCreateDictionaryItemMutation();
  const updateMutation = useUpdateDictionaryItemMutation();

  const handleSubmit = async (data: DictionaryItemFormValues) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          typeId,
          data: data as any,
        });
      } else if (mode === 'edit' && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          typeId,
          data: data as any,
        });
      }
      onSubmit?.(data);
      onClose();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Drawer
      title={mode === 'create' ? '新增字典项' : mode === 'edit' ? '编辑字典项' : '查看字典项'}
      open={visible}
      onClose={onClose}
      width={600}
      destroyOnClose
      footer={
        mode !== 'view' ? (
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={onClose}>取消</Button>
              <Button
                type="primary"
                form="dictionary-item-form"
                htmlType="submit"
                loading={loading}
              >
                {mode === 'create' ? '创建' : '保存'}
              </Button>
            </Space>
          </div>
        ) : null
      }
    >
      <DictionaryItemForm
        mode={mode}
        typeId={typeId}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
      />
    </Drawer>
  );
};

export default DictionaryItemDrawer;


