import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tree,
  Tooltip,
  Popconfirm,
  Typography,
  Divider,
  Badge,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { CategoryItem } from '@/types/category';

const { Option } = Select;
const { Title, Text } = Typography;

interface CategoryManagerProps {
  categories: CategoryItem[];
  onCreate?: (category: Partial<CategoryItem>) => Promise<void>;
  onUpdate?: (id: string, category: Partial<CategoryItem>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  loading?: boolean;
  mode?: 'manage' | 'select';
  onSelect?: (category: CategoryItem) => void;
  selectedKeys?: string[];
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCreate,
  onUpdate,
  onDelete,
  loading = false,
  mode = 'manage',
  onSelect,
  selectedKeys = [],
}) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [treeData, setTreeData] = useState<DataNode[]>([]);

  // 构建树形数据结构
  const buildTreeData = (categories: CategoryItem[], keyword?: string): DataNode[] => {
    const filteredCategories = keyword
      ? categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(keyword.toLowerCase()) ||
            cat.code.toLowerCase().includes(keyword.toLowerCase())
        )
      : categories;

    const buildNode = (category: CategoryItem): DataNode => {
      const children = filteredCategories.filter((cat) => cat.parentId === category.id);

      return {
        title: (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">{category.name}</span>
              <Badge
                count={category.spuCount || 0}
                size="small"
                style={{ backgroundColor: '#52c41a' }}
              />
            </div>
            {mode === 'manage' && (
              <Space size="small" onClick={(e) => e.stopPropagation()}>
                <Tooltip title="编辑">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(category);
                    }}
                  />
                </Tooltip>
                <Popconfirm
                  title="确认删除"
                  description={`确定要删除分类 "${category.name}" 吗？`}
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDelete(category.id);
                  }}
                  okText="确认"
                  cancelText="取消"
                >
                  <Tooltip title="删除">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )}
          </div>
        ),
        key: category.id,
        icon: children.length > 0 ? <FolderOpenOutlined /> : <FolderOutlined />,
        children: children.length > 0 ? children.map(buildNode) : undefined,
        categoryData: category,
      };
    };

    // 找到根分类（parentId为null或undefined的分类）
    const rootCategories = filteredCategories.filter((cat) => !cat.parentId);
    return rootCategories.map(buildNode);
  };

  // 更新树形数据
  React.useEffect(() => {
    setTreeData(buildTreeData(categories, searchKeyword));
  }, [categories, searchKeyword]);

  // 处理添加分类
  const handleAdd = (parentCategory?: CategoryItem) => {
    setEditingCategory(null);
    form.resetFields();
    if (parentCategory) {
      form.setFieldsValue({
        parentId: parentCategory.id,
        parentName: parentCategory.name,
        level: parentCategory.level + 1,
      });
    }
    setModalVisible(true);
  };

  // 处理编辑分类
  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    form.setFieldsValue({
      ...category,
      parentName: category.parentId
        ? categories.find((c) => c.id === category.parentId)?.name
        : '根分类',
    });
    setModalVisible(true);
  };

  // 处理删除分类
  const handleDelete = async (id: string) => {
    if (onDelete) {
      try {
        await onDelete(id);
        message.success('分类删除成功');
      } catch (error) {
        message.error('删除失败');
        console.error('Delete category error:', error);
      }
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (onCreate && !editingCategory) {
        await onCreate(values);
        message.success('分类创建成功');
      } else if (onUpdate && editingCategory) {
        await onUpdate(editingCategory.id, values);
        message.success('分类更新成功');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingCategory(null);
  };

  // 处理树选择
  const handleTreeSelect = (selectedKeys: React.Key[], info: any) => {
    if (mode === 'select' && onSelect && selectedKeys.length > 0) {
      const selectedNode = info.node as any;
      if (selectedNode?.categoryData) {
        onSelect(selectedNode.categoryData);
      }
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    // 如果有搜索关键词，展开所有节点
    if (value) {
      const allKeys = categories.map((cat) => cat.id);
      setExpandedKeys(allKeys);
    }
  };

  // 渲染添加按钮
  const renderAddButton = (parentCategory?: CategoryItem) => (
    <Button
      type="dashed"
      icon={<PlusOutlined />}
      onClick={() => handleAdd(parentCategory)}
      style={{ width: '100%', marginTop: '8px' }}
      disabled={loading}
    >
      {parentCategory ? `添加子分类` : '添加根分类'}
    </Button>
  );

  if (mode === 'select') {
    return (
      <Card size="small" title="选择分类">
        <div className="space-y-3">
          <Input.Search
            placeholder="搜索分类"
            allowClear
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && setSearchKeyword('')}
            style={{ marginBottom: '8px' }}
          />

          {treeData.length === 0 ? (
            <Empty description="暂无分类数据" />
          ) : (
            <Tree
              treeData={treeData}
              onSelect={handleTreeSelect}
              selectedKeys={selectedKeys}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys as string[])}
              showIcon
              blockNode
            />
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="category-manager">
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FolderOutlined className="mr-2" />
              <span>分类管理</span>
              <Badge count={categories.length} style={{ marginLeft: '8px' }} />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAdd()}
              loading={loading}
            >
              新建分类
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* 搜索栏 */}
          <div>
            <Input.Search
              placeholder="搜索分类名称或编码"
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && setSearchKeyword('')}
              prefix={<SearchOutlined />}
            />
          </div>

          {/* 分类树 */}
          {treeData.length === 0 ? (
            <Empty description="暂无分类数据" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              {renderAddButton()}
            </Empty>
          ) : (
            <Tree
              treeData={treeData}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys as string[])}
              showIcon
              blockNode
              titleRender={(nodeData) => {
                const node = nodeData as any;
                return (
                  <div className="flex items-center justify-between w-full pr-2">
                    <div className="flex items-center">
                      {node.icon}
                      <span className="ml-2">{node.title}</span>
                    </div>
                    <div className="flex items-center">
                      <Text type="secondary" className="text-xs mr-2">
                        {node.categoryData?.code}
                      </Text>
                      <Text type="secondary" className="text-xs mr-2">
                        Level {node.categoryData?.level || 1}
                      </Text>
                      {node.categoryData?.spuCount > 0 && (
                        <Badge
                          count={node.categoryData.spuCount}
                          size="small"
                          style={{ backgroundColor: '#52c41a' }}
                        />
                      )}
                    </div>
                  </div>
                );
              }}
            />
          )}

          {/* 快速添加按钮 */}
          {categories.length > 0 && <Divider />}
          {renderAddButton()}
        </div>
      </Card>

      {/* 添加/编辑分类弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            level: 1,
            sortOrder: 0,
          }}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 50, message: '分类名称不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="分类编码"
            rules={[
              { required: true, message: '请输入分类编码' },
              { pattern: /^[A-Z0-9_-]+$/, message: '编码只能包含大写字母、数字、下划线和连字符' },
              { max: 20, message: '分类编码不能超过20个字符' },
            ]}
          >
            <Input placeholder="请输入分类编码" disabled={!!editingCategory} />
          </Form.Item>

          <Form.Item name="parentId" label="上级分类">
            <Select
              placeholder="请选择上级分类（不选择则为根分类）"
              allowClear
              showSearch
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase())
              }
            >
              {categories
                .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                .map((category) => (
                  <Option key={category.id} value={category.id}>
                    {Array(category.level).fill('　').join('')}
                    {category.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="level" label="分类层级">
            <Input disabled placeholder="根据上级分类自动设置" />
          </Form.Item>

          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序"
            rules={[{ type: 'number', message: '请输入有效的数字' }]}
          >
            <Input type="number" placeholder="数字越小排序越靠前" min={0} />
          </Form.Item>

          <Form.Item name="description" label="分类描述">
            <Input.TextArea rows={3} placeholder="请输入分类描述" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager;
