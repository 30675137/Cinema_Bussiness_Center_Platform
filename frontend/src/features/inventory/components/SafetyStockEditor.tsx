/**
 * P004-inventory-adjustment: 安全库存编辑器组件
 * 
 * 提供安全库存的查看和编辑功能，支持乐观锁冲突处理。
 * 实现 T057 和 T062 任务。
 * 
 * @since US5 - 设置安全库存阈值
 */

import React, { useState, useEffect } from 'react';
import {
  InputNumber,
  Button,
  Space,
  Typography,
  Tooltip,
  Alert,
} from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSafetyStock, isConflictError } from '../hooks/useSafetyStock';

const { Text } = Typography;

export interface SafetyStockEditorProps {
  /** 库存记录ID */
  inventoryId: string;
  /** 当前安全库存值 */
  currentValue: number;
  /** 版本号（用于乐观锁） */
  version: number;
  /** 单位 */
  unit?: string;
  /** 是否禁用编辑 */
  disabled?: boolean;
  /** 更新成功回调 */
  onSuccess?: (newValue: number) => void;
  /** 冲突时刷新数据的回调 */
  onRefresh?: () => void;
}

/**
 * 安全库存编辑器组件
 * 
 * 功能：
 * - 点击编辑按钮进入编辑模式
 * - 输入新的安全库存值
 * - 保存时自动处理乐观锁冲突
 * - 冲突时显示刷新按钮
 * 
 * @example
 * ```tsx
 * <SafetyStockEditor
 *   inventoryId="xxx"
 *   currentValue={10}
 *   version={1}
 *   unit="个"
 *   onSuccess={(newValue) => console.log('Updated to:', newValue)}
 *   onRefresh={() => refetch()}
 * />
 * ```
 */
export const SafetyStockEditor: React.FC<SafetyStockEditorProps> = ({
  inventoryId,
  currentValue,
  version,
  unit = '',
  disabled = false,
  onSuccess,
  onRefresh,
}) => {
  // 状态管理
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<number>(currentValue);
  const [hasConflict, setHasConflict] = useState(false);

  // 当外部值变化时更新编辑值
  useEffect(() => {
    setEditValue(currentValue);
    setHasConflict(false);
  }, [currentValue]);

  // 安全库存更新 mutation
  const { mutate: updateSafetyStock, isPending } = useSafetyStock({
    onSuccess: (data) => {
      setIsEditing(false);
      setHasConflict(false);
      if (data) {
        onSuccess?.(data.safetyStock);
      }
    },
    onConflict: () => {
      setHasConflict(true);
    },
  });

  // 开始编辑
  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(currentValue);
    setHasConflict(false);
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(currentValue);
    setHasConflict(false);
  };

  // 保存
  const handleSave = () => {
    if (editValue === currentValue) {
      setIsEditing(false);
      return;
    }

    updateSafetyStock({
      inventoryId,
      safetyStock: editValue,
      version,
    });
  };

  // 刷新数据
  const handleRefresh = () => {
    setHasConflict(false);
    setIsEditing(false);
    onRefresh?.();
  };

  // 冲突警告
  if (hasConflict) {
    return (
      <div>
        <Alert
          type="warning"
          message="数据冲突"
          description="该记录已被他人修改，请刷新后重试"
          showIcon
          action={
            <Button 
              size="small" 
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              刷新
            </Button>
          }
          style={{ marginBottom: 8 }}
        />
        <Space>
          <Text>{currentValue}</Text>
          {unit && <Text type="secondary">{unit}</Text>}
        </Space>
      </div>
    );
  }

  // 编辑模式
  if (isEditing) {
    return (
      <Space>
        <InputNumber
          value={editValue}
          onChange={(value) => setEditValue(value || 0)}
          min={0}
          precision={0}
          style={{ width: 100 }}
          autoFocus
          disabled={isPending}
          onPressEnter={handleSave}
          data-testid="safety-stock-input"
        />
        {unit && <Text type="secondary">{unit}</Text>}
        <Tooltip title="保存">
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            loading={isPending}
            onClick={handleSave}
            data-testid="safety-stock-save"
          />
        </Tooltip>
        <Tooltip title="取消">
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={handleCancel}
            disabled={isPending}
            data-testid="safety-stock-cancel"
          />
        </Tooltip>
      </Space>
    );
  }

  // 查看模式
  return (
    <Space>
      <Text>{currentValue}</Text>
      {unit && <Text type="secondary">{unit}</Text>}
      {!disabled && (
        <Tooltip title="编辑安全库存">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={handleEdit}
            data-testid="safety-stock-edit"
          />
        </Tooltip>
      )}
    </Space>
  );
};

export default SafetyStockEditor;
