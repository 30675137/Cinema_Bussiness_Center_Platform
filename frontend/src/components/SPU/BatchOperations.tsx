import React, { useState, useCallback } from 'react';
import { Button, Dropdown, Space, message, Popconfirm, Modal, Form, Select } from 'antd';
import {
  DeleteOutlined,
  ExportOutlined,
  EditOutlined,
  CopyOutlined,
  MoreOutlined,
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { SPUStatus, SPUItem } from '@/types/spu';
import { SPUNotificationService } from '@/components/common/Notification';
import { statusColors } from '@/theme';

const { Option } = Select;

interface BatchOperationsProps {
  selectedRowKeys: React.Key[];
  selectedRows: SPUItem[];
  dataSource: SPUItem[];
  onBatchDelete?: (ids: string[]) => void;
  onBatchExport?: (ids: string[]) => void;
  onBatchStatusChange?: (ids: string[], status: SPUStatus) => void;
  onBatchCopy?: (ids: string[]) => void;
  onClearSelection?: () => void;
  onSelectAll?: () => void;
  loading?: boolean;
}

const BatchOperations: React.FC<BatchOperationsProps> = ({
  selectedRowKeys,
  selectedRows,
  dataSource,
  onBatchDelete,
  onBatchExport,
  onBatchStatusChange,
  onBatchCopy,
  onClearSelection,
  onSelectAll,
  loading = false,
}) => {
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusForm] = Form.useForm();
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  // 检查是否有选中的项目
  const hasSelection = selectedRowKeys.length > 0;
  const isAllSelected = selectedRowKeys.length === dataSource.length;

  // 处理批量删除
  const handleBatchDelete = useCallback(() => {
    if (!hasSelection || !onBatchDelete) return;

    const ids = selectedRowKeys as string[];
    Modal.confirm({
      title: '批量删除确认',
      content: (
        <div>
          <p>
            确定要删除选中的 <strong>{selectedRowKeys.length}</strong> 个SPU吗？
          </p>
          <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 8 }}>
            此操作不可恢复，请谨慎操作！
          </p>
          <div style={{ marginTop: 12, padding: 8, backgroundColor: '#fff2f0', borderRadius: 4 }}>
            <p style={{ margin: 0, fontSize: '12px' }}>
              <strong>提示:</strong> 删除的SPU将无法恢复，相关数据可能受到影响。
            </p>
          </div>
        </div>
      ),
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      okButtonProps: { loading },
      onOk: () => {
        onBatchDelete(ids);
        SPUNotificationService.batchSuccess('删除', ids.length);
      },
    });
  }, [hasSelection, selectedRowKeys.length, onBatchDelete, loading]);

  // 处理批量导出
  const handleBatchExport = useCallback(() => {
    if (!hasSelection || !onBatchExport) return;

    const ids = selectedRowKeys as string[];
    onBatchExport(ids);
    message.success(`正在导出 ${ids.length} 个SPU数据...`);
  }, [hasSelection, selectedRowKeys.length, onBatchExport]);

  // 处理状态变更
  const handleStatusChange = useCallback(
    (status: SPUStatus) => {
      setCurrentAction('statusChange');
      setStatusModalVisible(true);
      statusForm.setFieldsValue({ status });
    },
    [statusForm]
  );

  // 确认状态变更
  const handleStatusChangeConfirm = useCallback(async () => {
    if (!hasSelection || !onBatchStatusChange) return;

    try {
      const values = await statusForm.validateFields();
      const ids = selectedRowKeys as string[];
      const newStatus = values.status as SPUStatus;

      onBatchStatusChange(ids, newStatus);

      const statusText = statusColors[newStatus as keyof typeof statusColors]?.text;
      SPUNotificationService.batchSuccess(`将状态更改为"${statusText}"`, ids.length);

      setStatusModalVisible(false);
      statusForm.resetFields();
    } catch (error) {
      console.error('Status change validation failed:', error);
    }
  }, [hasSelection, selectedRowKeys, onBatchStatusChange, statusForm]);

  // 处理批量复制
  const handleBatchCopy = useCallback(() => {
    if (!hasSelection || !onBatchCopy) return;

    const ids = selectedRowKeys as string[];
    Modal.confirm({
      title: '批量复制确认',
      content: (
        <div>
          <p>
            确定要复制选中的 <strong>{selectedRowKeys.length}</strong> 个SPU吗？
          </p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            复制的SPU将创建为草稿状态，您可以稍后修改。
          </p>
        </div>
      ),
      okText: '确认复制',
      cancelText: '取消',
      onOk: () => {
        onBatchCopy(ids);
        SPUNotificationService.batchSuccess('复制', ids.length);
      },
    });
  }, [hasSelection, selectedRowKeys.length, onBatchCopy]);

  // 处理批量编辑
  const handleBatchEdit = useCallback(() => {
    if (!hasSelection) return;

    message.info('批量编辑功能开发中...');
  }, [hasSelection]);

  // 批量操作菜单
  const batchMenuItems: MenuProps['items'] = [
    {
      key: 'status',
      label: '批量更改状态',
      icon: <SettingOutlined />,
      children: Object.entries(statusColors).map(([key, config]) => ({
        key,
        label: <span style={{ color: config.color }}>{config.text}</span>,
        onClick: () => handleStatusChange(key as SPUStatus),
      })),
    },
    {
      type: 'divider',
    },
    {
      key: 'copy',
      label: '批量复制',
      icon: <CopyOutlined />,
      onClick: handleBatchCopy,
    },
    {
      key: 'edit',
      label: '批量编辑',
      icon: <EditOutlined />,
      onClick: handleBatchEdit,
      disabled: true, // 暂时禁用
    },
    {
      type: 'divider',
    },
    {
      key: 'export',
      label: '批量导出',
      icon: <ExportOutlined />,
      onClick: handleBatchExport,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '批量删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleBatchDelete,
    },
  ];

  // 全选/取消全选
  const handleSelectToggle = useCallback(() => {
    if (isAllSelected) {
      onClearSelection?.();
    } else {
      onSelectAll?.();
    }
  }, [isAllSelected, onClearSelection, onSelectAll]);

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderBottom: hasSelection ? '1px solid #f0f0f0' : 'none',
          backgroundColor: hasSelection ? '#f6ffed' : 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {hasSelection && (
            <>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>
                已选择 <strong>{selectedRowKeys.length}</strong> 项
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}>
                {isAllSelected ? '已全选' : `共 ${dataSource.length} 项`}
              </span>
            </>
          )}
        </div>

        <Space>
          {!hasSelection ? (
            <Button onClick={handleSelectToggle}>
              <CheckOutlined /> 全选
            </Button>
          ) : (
            <>
              <Button onClick={handleSelectToggle}>
                {isAllSelected ? (
                  <>
                    <CloseOutlined /> 取消全选
                  </>
                ) : (
                  <>
                    <CheckOutlined /> 全选
                  </>
                )}
              </Button>

              <Button onClick={onClearSelection}>
                <CloseOutlined /> 清除选择
              </Button>

              <Dropdown menu={{ items: batchMenuItems }} trigger={['click']} placement="bottomLeft">
                <Button loading={loading}>
                  <MoreOutlined /> 批量操作
                </Button>
              </Dropdown>
            </>
          )}
        </Space>
      </div>

      {/* 状态变更弹窗 */}
      <Modal
        title="批量更改状态"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          statusForm.resetFields();
          setCurrentAction(null);
        }}
        onOk={handleStatusChangeConfirm}
        okText="确认更改"
        cancelText="取消"
        confirmLoading={loading}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item
            name="status"
            label="选择新状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态" style={{ width: '100%' }}>
              {Object.entries(statusColors).map(([key, config]) => (
                <Option key={key} value={key}>
                  <span style={{ color: config.color }}>{config.text}</span>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="影响范围">
            <div style={{ padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <p style={{ margin: 0, fontSize: '13px' }}>
                <strong>数量:</strong> {selectedRowKeys.length} 个SPU
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                <strong>操作:</strong> 将状态批量更改为选定的状态
              </p>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// 选择统计组件
export const SelectionInfo: React.FC<{
  selectedCount: number;
  totalCount: number;
  onClearSelection?: () => void;
}> = ({ selectedCount, totalCount, onClearSelection }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: '#f6ffed',
        border: '1px solid #b7eb8f',
        borderRadius: 4,
        fontSize: '13px',
      }}
    >
      <span style={{ color: '#52c41a', fontWeight: 500 }}>已选择 {selectedCount} 项</span>
      <span style={{ color: '#999', margin: '0 8px' }}>/</span>
      <span style={{ color: '#666' }}>共 {totalCount} 项</span>
      {onClearSelection && (
        <Button
          type="link"
          size="small"
          onClick={onClearSelection}
          style={{ marginLeft: 12, padding: 0, height: 'auto' }}
        >
          清除选择
        </Button>
      )}
    </div>
  );
};

export default BatchOperations;
