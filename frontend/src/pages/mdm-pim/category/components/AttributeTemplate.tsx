/**
 * 属性模板组件
 * 显示和配置类目的属性模板
 * 支持属性的增删改查操作
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  AutoComplete,
  Divider,
  Empty,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type {
  AttributeTemplate,
  CategoryAttribute,
  CreateAttributeRequest,
  UpdateAttributeRequest,
} from '../types/category.types';

// 临时定义以避免模块导入问题
type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select';

// Hooks和Store导入
import { useAttributeTemplateQuery } from '../../../../services/category/categoryQueries';
import {
  useAddAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
} from '../../../../services/category/categoryMutations';
import { useSaveAttributeTemplateMutation } from '../../../../services/category/categoryMutations';

const { Option } = Select;
const { TextArea } = Input;

/**
 * AttributeTemplate组件属性接口
 */
export interface AttributeTemplateProps {
  /** 类目ID */
  categoryId: string;
  /** 是否禁用编辑 */
  disabled?: boolean;
}

/**
 * 格式化属性类型显示
 */
const formatAttributeType = (type: AttributeType): { color: string; text: string } => {
  const typeMap = {
    text: { color: 'blue', text: '文本' },
    number: { color: 'green', text: '数字' },
    'single-select': { color: 'orange', text: '单选' },
    'multi-select': { color: 'purple', text: '多选' },
  };
  return typeMap[type] || { color: 'default', text: type };
};

/**
 * 属性模板组件
 */
const AttributeTemplate: React.FC<AttributeTemplateProps> = ({ categoryId, disabled = false }) => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<CategoryAttribute | null>(null);
  const [form] = Form.useForm();

  // Mutations
  const addMutation = useAddAttributeMutation();
  const updateMutation = useUpdateAttributeMutation();
  const deleteMutation = useDeleteAttributeMutation();

  // 属性模板查询
  const { data: attributeTemplate, isLoading: loading } = useAttributeTemplateQuery(categoryId);

  // 获取属性列表
  const attributes = attributeTemplate?.attributes || [];

  // 错误处理
  React.useEffect(() => {
    if (addMutation.error) {
      message.error(addMutation.error.message);
    }
    if (updateMutation.error) {
      message.error(updateMutation.error.message);
    }
    if (deleteMutation.error) {
      message.error(deleteMutation.error.message);
    }
  }, [addMutation.error, updateMutation.error, deleteMutation.error]);

  /**
   * 表格列配置
   */
  const columns = [
    {
      title: '属性名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '属性类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: AttributeType) => (
        <Tag color={formatAttributeType(type).color}>{formatAttributeType(type).text}</Tag>
      ),
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (required: boolean) => (
        <Tag color={required ? 'red' : 'default'}>{required ? '必填' : '可选'}</Tag>
      ),
    },
    {
      title: '可选值',
      dataIndex: 'optionalValues',
      key: 'optionalValues',
      width: 200,
      render: (optionalValues: string[] | undefined) => {
        if (!optionalValues || optionalValues.length === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <div style={{ maxWidth: 200 }}>
            {optionalValues.slice(0, 3).map((value, index) => (
              <Tag key={index} size="small" style={{ margin: '2px' }}>
                {value}
              </Tag>
            ))}
            {optionalValues.length > 3 && (
              <Tooltip title={optionalValues.slice(3).join(', ')}>
                <Tag size="small" color="default">
                  +{optionalValues.length - 3}
                </Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 120,
      render: (defaultValue: string | undefined) => (
        <span style={{ color: '#666' }}>{defaultValue || '-'}</span>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      render: (sortOrder: number) => sortOrder,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (description: string | undefined) => (
        <Tooltip title={description}>
          <span>{description || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: CategoryAttribute) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={disabled}
          />
          <Popconfirm
            title="确定要删除这个属性吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record)}
            disabled={disabled}
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} disabled={disabled} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /**
   * 处理添加属性
   */
  const handleAdd = () => {
    setEditingAttribute(null);
    setFormVisible(true);
    form.resetFields();
    form.setFieldsValue({
      name: '',
      type: 'text',
      required: false,
      optionalValues: [],
      defaultValue: '',
      placeholder: '',
      description: '',
      sortOrder: attributes.length + 1,
    });
  };

  /**
   * 处理编辑属性
   */
  const handleEdit = (attribute: CategoryAttribute) => {
    setEditingAttribute(attribute);
    setFormVisible(true);
    form.setFieldsValue({
      name: attribute.name,
      type: attribute.type,
      required: attribute.required,
      optionalValues: attribute.optionalValues || [],
      defaultValue: attribute.defaultValue || '',
      placeholder: attribute.placeholder || '',
      description: attribute.description || '',
      sortOrder: attribute.sortOrder,
    });
  };

  /**
   * 处理删除属性
   */
  const handleDelete = async (attribute: CategoryAttribute) => {
    try {
      await deleteMutation.mutateAsync({
        categoryId,
        attributeId: attribute.id,
      });
    } catch (error) {
      console.error('删除属性失败:', error);
    }
  };

  /**
   * 处理表单提交
   */
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 处理可选值文本域数据
      if (values.optionalValues && typeof values.optionalValues === 'string') {
        values.optionalValues = values.optionalValues
          .split('\n')
          .map((value: string) => value.trim())
          .filter((value: string) => value.length > 0);
      }

      if (editingAttribute) {
        // 编辑模式
        await updateMutation.mutateAsync({
          categoryId,
          attributeId: editingAttribute.id,
          data: values as UpdateAttributeRequest,
        });
      } else {
        // 创建模式
        await addMutation.mutateAsync({
          categoryId,
          data: values as CreateAttributeRequest,
        });
      }

      setFormVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  /**
   * 处理表单取消
   */
  const handleFormCancel = () => {
    setFormVisible(false);
    form.resetFields();
    setEditingAttribute(null);
  };

  /**
   * 处理属性类型变化
   */
  const handleTypeChange = (type: AttributeType) => {
    const isSelectType = type === 'single-select' || type === 'multi-select';
    if (!isSelectType) {
      form.setFieldsValue({ optionalValues: [] });
    }
  };

  return (
    <div className="attribute-template">
      <Card
        title="属性模板"
        extra={
          !disabled && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加属性
            </Button>
          )
        }
        style={{ marginTop: 16 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }}>⚙️</div>
            <div style={{ color: '#666' }}>加载属性模板...</div>
          </div>
        ) : attributes.length === 0 ? (
          <Empty
            description={disabled ? '该类目暂无属性模板' : '暂无属性配置，点击"添加属性"开始配置'}
            style={{ padding: '40px 0' }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={attributes}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 1200 }}
            loading={loading}
          />
        )}

        {/* 属性配置表单弹窗 */}
        <Modal
          title={editingAttribute ? '编辑属性' : '添加属性'}
          open={formVisible}
          onCancel={handleFormCancel}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              label="属性名称"
              name="name"
              rules={[
                { required: true, message: '请输入属性名称' },
                { min: 2, message: '属性名称至少需要2个字符' },
                { max: 30, message: '属性名称不能超过30个字符' },
              ]}
            >
              <Input placeholder="请输入属性名称" />
            </Form.Item>

            <Form.Item
              label="属性类型"
              name="type"
              rules={[{ required: true, message: '请选择属性类型' }]}
            >
              <Select placeholder="请选择属性类型" onChange={handleTypeChange}>
                <Option value="text">文本</Option>
                <Option value="number">数字</Option>
                <Option value="single-select">单选</Option>
                <Option value="multi-select">多选</Option>
              </Select>
            </Form.Item>

            <Form.Item label="是否必填" name="required" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => {
                const type = currentValues?.type;
                return type === 'single-select' || type === 'multi-select';
              }}
            >
              <Form.Item
                label="可选值"
                name="optionalValues"
                rules={[
                  ({ getFieldValue }) => {
                    const type = getFieldValue('type');
                    if (
                      (type === 'single-select' || type === 'multi-select') &&
                      (!getFieldValue('optionalValues') ||
                        getFieldValue('optionalValues').length === 0)
                    ) {
                      return Promise.reject(new Error('选择类型属性必须提供可选值'));
                    }
                    return true;
                  },
                ]}
              >
                <TextArea placeholder="请输入可选值，每行一个选项" rows={4} />
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  提示：每行输入一个可选值，支持中英文、数字、符号等
                </div>
              </Form.Item>
            </Form.Item>

            <Form.Item label="默认值" name="defaultValue">
              <Input placeholder="请输入默认值" />
            </Form.Item>

            <Form.Item label="占位符" name="placeholder">
              <Input placeholder="请输入占位符文本" />
            </Form.Item>

            <Form.Item label="描述" name="description">
              <TextArea rows={2} placeholder="请输入属性描述" />
            </Form.Item>

            <Form.Item
              label="排序序号"
              name="sortOrder"
              rules={[{ type: 'number', min: 1, message: '排序序号必须大于0' }]}
            >
              <InputNumber placeholder="请输入排序序号" style={{ width: '100%' }} min={1} />
            </Form.Item>

            {/* 表单操作按钮 */}
            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={handleFormCancel}>取消</Button>
                  <Button type="primary" onClick={handleFormSubmit}>
                    {editingAttribute ? '更新' : '创建'}
                  </Button>
                </Space>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AttributeTemplate;
