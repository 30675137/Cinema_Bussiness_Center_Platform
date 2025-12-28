/**
 * UnsavedChangesAlert 分子组件
 * 未保存修改警告弹窗
 * Feature: 001-scenario-package-tabs
 */

import React from 'react';
import { Modal, Typography, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface UnsavedChangesAlertProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 点击"不保存"继续 */
  onConfirm: () => void;
  /** 点击取消/关闭 */
  onCancel: () => void;
  /** 点击"保存后离开" */
  onSave?: () => void;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 是否正在保存 */
  saving?: boolean;
}

/**
 * 未保存修改警告弹窗
 * 
 * @example
 * <UnsavedChangesAlert
 *   open={showLeaveConfirm}
 *   onConfirm={handleLeaveWithoutSaving}
 *   onCancel={handleCancelLeave}
 *   onSave={handleSaveAndLeave}
 * />
 */
const UnsavedChangesAlert: React.FC<UnsavedChangesAlertProps> = ({
  open,
  onConfirm,
  onCancel,
  onSave,
  title = '有未保存的修改',
  description = '当前页面有未保存的修改，离开后修改将丢失。',
  saving = false,
}) => {
  return (
    <Modal
      open={open}
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>{title}</span>
        </Space>
      }
      onCancel={onCancel}
      okText={onSave ? '保存后离开' : '确认离开'}
      cancelText="取消"
      confirmLoading={saving}
      okButtonProps={{
        danger: !onSave,
      }}
      onOk={() => {
        if (onSave) {
          onSave();
        } else {
          onConfirm();
        }
      }}
      footer={(_, { OkBtn, CancelBtn }) => (
        <Space>
          <CancelBtn />
          {onSave && (
            <a
              onClick={onConfirm}
              style={{ marginRight: 8 }}
            >
              不保存，直接离开
            </a>
          )}
          <OkBtn />
        </Space>
      )}
    >
      <Text type="secondary">{description}</Text>
    </Modal>
  );
};

export default UnsavedChangesAlert;
