import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import type { CategoryAttribute } from '@/types/category';
import {
  useAttributeTemplateQuery,
  useAddAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
} from '@/hooks/api/useAttributeTemplateQuery';
import AttributeForm from '@/components/Attribute/AttributeForm';

const { Title, Text } = Typography;

interface AttributeTemplatePanelProps {
  categoryId: string | null;
  categoryName?: string;
}

const AttributeTemplatePanel: React.FC<AttributeTemplatePanelProps> = ({
  categoryId,
  categoryName,
}) => {
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<CategoryAttribute | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const {
    data: template,
    isLoading,
    refetch,
  } = useAttributeTemplateQuery(categoryId, !!categoryId);
  const addMutation = useAddAttributeMutation();
  const updateMutation = useUpdateAttributeMutation();
  const deleteMutation = useDeleteAttributeMutation();

  // 处理新增属性
  const handleAddAttribute = () => {
    setFormMode('create');
    setEditingAttribute(undefined);
    setFormModalVisible(true);
  };

  // 处理编辑属性
  const handleEditAttribute = (attribute: CategoryAttribute) => {
    setFormMode('edit');
    setEditingAttribute(attribute);
    setFormModalVisible(true);
  };

  // 处理删除属性
  const handleDeleteAttribute = async (attributeId: string) => {
    if (!categoryId) return;

    try {
      await deleteMutation.mutateAsync({ categoryId, attributeId });
      refetch();
    } catch (error) {
      console.error('Delete attribute error:', error);
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (
    values: Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!categoryId) return;

    try {
      if (formMode === 'create') {
        await addMutation.mutateAsync({ categoryId, attribute: values });
      } else if (editingAttribute) {
        await updateMutation.mutateAsync({
          categoryId,
          attributeId: editingAttribute.id,
          attribute: values,
        });
      }
      setFormModalVisible(false);
      setEditingAttribute(undefined);
      refetch();
    } catch (error) {
      console.error('Save attribute error:', error);
    }
  };

  // 处理取消表单
  const handleFormCancel = () => {
    setFormModalVisible(false);
    setEditingAttribute(undefined);
  };

  // 格式化属性类型显示
  const formatAttributeType = (type: string): string => {
    const typeMap: Record<string, string> = {
      text: '文本',
      number: '数字',
      'single-select': '单选',
      'multi-select': '多选',
    };
    return typeMap[type] || type;
  };

  // 表格列定义
  const columns = [
    {
      title: '属性名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CategoryAttribute) => (
        <Space>
          <Text strong>{text}</Text>
          {record.displayName && record.displayName !== text && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({record.displayName})
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '属性类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color="blue">{formatAttributeType(type)}</Tag>,
    },
    {
      title: '是否必填',
      dataIndex: 'required',
      key: 'required',
      width: 100,
      render: (required: boolean) => (
        <Tag color={required ? 'red' : 'default'}>{required ? '必填' : '可选'}</Tag>
      ),
    },
    {
      title: '可选值',
      dataIndex: 'optionalValues',
      key: 'optionalValues',
      render: (values: string[] | undefined) => {
        if (!values || values.length === 0) {
          return <Text type="secondary">-</Text>;
        }
        return (
          <Space size={[4, 4]} wrap>
            {values.slice(0, 3).map((value, index) => (
              <Tag key={index} style={{ margin: 0 }}>
                {value}
              </Tag>
            ))}
            {values.length > 3 && <Tag>+{values.length - 3}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      sorter: (a: CategoryAttribute, b: CategoryAttribute) => a.sortOrder - b.sortOrder,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: CategoryAttribute) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditAttribute(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description="删除后无法恢复，确定要删除该属性吗？"
            onConfirm={() => handleDeleteAttribute(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!categoryId) {
    return (
      <Card>
        <Empty description="请选择一个类目查看属性模板" />
      </Card>
    );
  }

  const attributes = template?.attributes || [];
  const hasTemplate = !!template;

  return (
    <>
      <Card
        title={
          <Space>
            <SettingOutlined />
            <Title level={5} style={{ margin: 0 }}>
              属性模板配置
            </Title>
            {categoryName && (
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {categoryName}
              </Text>
            )}
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddAttribute}
            disabled={!hasTemplate && attributes.length === 0}
          >
            新增属性
          </Button>
        }
        style={{ marginTop: 16 }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">加载中...</Text>
          </div>
        ) : !hasTemplate && attributes.length === 0 ? (
          <Empty description="该类目尚未配置属性模板" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAttribute}>
              创建第一个属性
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={attributes}
            rowKey="id"
            pagination={false}
            size="small"
            locale={{
              emptyText: '暂无属性，点击"新增属性"添加',
            }}
          />
        )}
      </Card>

      {/* 属性表单弹窗 */}
      <Modal
        title={formMode === 'create' ? '新增属性' : '编辑属性'}
        open={formModalVisible}
        onCancel={handleFormCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <AttributeForm
          mode={formMode}
          initialValues={editingAttribute}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={formMode === 'create' ? addMutation.isPending : updateMutation.isPending}
        />
      </Modal>
    </>
  );
};

export default AttributeTemplatePanel;
