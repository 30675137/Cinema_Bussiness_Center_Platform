import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Tree, Input, Button, Space, Card, Typography, Tag, Tooltip, Spin, message } from 'antd';
import { debounce } from '@/utils/helpers';
import {
  SearchOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { DataNode, EventDataNode } from 'antd/es/tree';
import type { Category, CategoryTree as CategoryTreeType } from '@/types/category';
import {
  useCategoryTreeQuery,
  useCategoryChildrenQuery,
  useCategorySearchQuery,
} from '@/hooks/api/useCategoryQuery';
import { useDeleteCategoryMutation } from '@/hooks/api/useCategoryMutation';
import { useCategoryStore } from '@/stores/categoryStore';
import { useQueryClient } from '@tanstack/react-query';
import { categoryKeys } from '@/services/queryKeys';

const { Search } = Input;
const { Title, Text } = Typography;

interface CategoryTreeProps {
  mode?: 'select' | 'manage';
  onCategorySelect?: (category: Category) => void;
  onCategoryEdit?: (category: Category) => void;
  onCategoryDelete?: (categoryId: string) => void;
  onCategoryAdd?: (parentId?: string) => void;
  showSearch?: boolean;
  showActions?: boolean;
  height?: number;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  mode = 'select',
  onCategorySelect,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryAdd,
  showSearch = true,
  showActions = true,
  height = 600,
}) => {
  // Zustand Store - UI状态管理
  const {
    expandedKeys,
    selectedCategoryId,
    searchKeyword,
    setExpandedKeys,
    setSelectedCategoryId,
    setSearchKeyword,
    toggleExpand,
  } = useCategoryStore();

  // TanStack Query - 数据获取
  const queryClient = useQueryClient();
  const {
    data: treeData,
    isLoading: treeLoading,
    error: treeError,
    refetch: refetchTree,
  } = useCategoryTreeQuery(true);
  const deleteMutation = useDeleteCategoryMutation();

  // 调试日志
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('CategoryTree - treeData:', treeData);
      console.log('CategoryTree - isLoading:', treeLoading);
      console.log('CategoryTree - error:', treeError);
    }
  }, [treeData, treeLoading, treeError]);

  // 搜索查询（仅在有关键词时启用）
  const { data: searchResults, isLoading: searchLoading } = useCategorySearchQuery(
    searchKeyword,
    searchKeyword.trim().length > 0
  );

  // 本地状态
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());

  // 将 CategoryTree 转换为 Ant Design Tree 的 DataNode 格式
  const convertToTreeData = useCallback((categories: CategoryTreeType[]): DataNode[] => {
    return categories.map((category) => ({
      key: category.id,
      title: category.name,
      data: category,
      isLeaf: category.isLeaf || category.level === 3,
      children: category.children ? convertToTreeData(category.children) : undefined,
    }));
  }, []);

  // 构建树形数据（支持搜索高亮）
  const buildTreeData = useCallback(
    (data: CategoryTreeType[] | undefined, searchResults?: Category[]): DataNode[] => {
      if (!data) return [];

      const treeNodes = convertToTreeData(data);

      // 如果有搜索结果，高亮匹配节点并自动展开路径
      if (searchResults && searchResults.length > 0) {
        const matchedIds = new Set(searchResults.map((cat) => cat.id));
        const expandKeys = new Set<string>();

        // 递归标记匹配节点并收集需要展开的父节点
        const markMatches = (nodes: DataNode[]): DataNode[] => {
          return nodes.map((node) => {
            const category = node.data as CategoryTreeType;
            const isMatched = matchedIds.has(category.id);

            // 如果节点匹配，收集所有父节点ID用于展开
            if (isMatched) {
              let currentId: string | undefined = category.parentId;
              while (currentId) {
                expandKeys.add(currentId);
                // 查找父节点
                const findParent = (nodes: DataNode[]): DataNode | null => {
                  for (const n of nodes) {
                    if (n.key === currentId) return n;
                    if (n.children) {
                      const found = findParent(n.children);
                      if (found) return found;
                    }
                  }
                  return null;
                };
                const parent = findParent(treeNodes);
                currentId = parent?.data ? (parent.data as CategoryTreeType).parentId : undefined;
              }
            }

            return {
              ...node,
              title: renderTreeNodeTitle(category, isMatched),
              children: node.children ? markMatches(node.children) : undefined,
            };
          });
        };

        const markedNodes = markMatches(treeNodes);

        // 自动展开匹配路径
        if (expandKeys.size > 0) {
          const newExpandedKeys = Array.from(new Set([...expandedKeys, ...Array.from(expandKeys)]));
          setExpandedKeys(newExpandedKeys);
        }

        return markedNodes;
      }

      // 无搜索时，正常渲染
      return treeNodes.map((node) => ({
        ...node,
        title: renderTreeNodeTitle(node.data as CategoryTreeType, false),
      }));
    },
    [expandedKeys]
  );

  // 渲染树节点标题
  const renderTreeNodeTitle = useCallback(
    (category: CategoryTreeType, isHighlighted: boolean = false) => {
      const isSelected = selectedCategoryId === category.id;

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '4px 8px',
            backgroundColor: isSelected ? '#e6f7ff' : isHighlighted ? '#fffbe6' : 'transparent',
            borderRadius: 4,
            transition: 'background-color 0.2s',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCategoryId(category.id);
            onCategorySelect?.(category as Category);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <span
              style={{
                fontWeight: category.level === 1 ? 600 : category.level === 2 ? 500 : 400,
                color: category.status === 'inactive' ? '#999' : '#000',
              }}
            >
              {category.name}
            </span>
            <Tag color="blue" style={{ fontSize: '11px' }}>
              {category.code}
            </Tag>
            {category.level > 1 && (
              <Tag color="gray" style={{ fontSize: '10px' }}>
                L{category.level}
              </Tag>
            )}
            {category.status === 'inactive' && (
              <Tag color="orange" style={{ fontSize: '11px' }}>
                停用
              </Tag>
            )}
            {category.status === 'active' && (
              <Tag color="green" style={{ fontSize: '11px' }}>
                启用
              </Tag>
            )}
          </div>

          {showActions && mode === 'manage' && (
            <Space size="small" onClick={(e) => e.stopPropagation()}>
              {category.level < 3 && (
                <Tooltip title="添加子类目">
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategoryAdd?.(category.id);
                    }}
                  />
                </Tooltip>
              )}
              <Tooltip title="编辑">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategoryEdit?.(category as Category);
                  }}
                />
              </Tooltip>
              <Tooltip
                title={
                  category.spuCount > 0
                    ? '该类目已有 SPU 使用，不可删除'
                    : category.hasChildren && !category.isLeaf
                      ? '无法删除包含子类目的类目'
                      : '删除类目'
                }
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConfirm(category as Category);
                  }}
                  disabled={category.spuCount > 0 || (category.hasChildren && !category.isLeaf)}
                  loading={deleteMutation.isPending}
                />
              </Tooltip>
            </Space>
          )}
        </div>
      );
    },
    [
      selectedCategoryId,
      showActions,
      mode,
      onCategorySelect,
      onCategoryEdit,
      onCategoryAdd,
      setSelectedCategoryId,
    ]
  );

  // 懒加载子节点
  const loadData = useCallback(
    async (node: EventDataNode) => {
      const category = node.data as CategoryTreeType;

      // 如果已经是叶子节点或已有子节点，不加载
      if (node.isLeaf || (node.children && node.children.length > 0)) {
        return Promise.resolve();
      }

      // 标记为加载中
      setLoadingNodes((prev) => new Set(prev).add(category.id));

      try {
        // 直接调用 service 获取子节点
        const { categoryService } = await import('@/services/categoryService');
        const childrenData = await categoryService.getCategoryChildren(category.id);

        if (childrenData.success) {
          const children = childrenData.data;

          // 更新缓存中的树数据
          queryClient.setQueryData(categoryKeys.tree(), (old: any) => {
            if (!old || !old.data) return old;

            const updateTreeData = (nodes: CategoryTreeType[]): CategoryTreeType[] => {
              return nodes.map((n) => {
                if (n.id === category.id) {
                  return {
                    ...n,
                    children: children.map(
                      (child) =>
                        ({
                          ...child,
                          hasChildren: false,
                          isLeaf: child.level === 3,
                          key: child.id,
                          title: child.name,
                        }) as CategoryTreeType
                    ),
                    hasChildren: children.length > 0,
                    isLeaf: false,
                  };
                }
                if (n.children) {
                  return { ...n, children: updateTreeData(n.children) };
                }
                return n;
              });
            };

            return {
              ...old,
              data: updateTreeData(old.data),
            };
          });
        }
      } catch (error) {
        message.error('加载子节点失败');
        console.error('Load children error:', error);
      } finally {
        setLoadingNodes((prev) => {
          const next = new Set(prev);
          next.delete(category.id);
          return next;
        });
      }
    },
    [queryClient]
  );

  // 处理删除确认
  const handleDeleteConfirm = async (category: Category) => {
    if (category.spuCount > 0) {
      message.warning('该类目已有 SPU 使用，不可删除');
      return;
    }

    // 检查是否有子类目
    if (category.hasChildren && !category.isLeaf) {
      message.warning('无法删除包含子类目的类目');
      return;
    }

    try {
      await deleteMutation.mutateAsync(category.id);
      // 删除成功后，刷新树并清除选中状态（如果删除的是当前选中的类目）
      if (selectedCategoryId === category.id) {
        setSelectedCategoryId(null);
      }
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      onCategoryDelete?.(category.id);
    } catch (error) {
      console.error('Delete category error:', error);
    }
  };

  // 处理树节点选择
  const handleSelect = (
    selectedKeys: React.Key[],
    info: { event: 'select'; selected: boolean; node: EventDataNode }
  ) => {
    if (info.selected && info.node.data) {
      const category = info.node.data as Category;
      setSelectedCategoryId(category.id);
      onCategorySelect?.(category);
    } else {
      setSelectedCategoryId(null);
    }
  };

  // 处理树节点展开
  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys as string[]);
    setAutoExpandParent(false);
  };

  // 防抖搜索处理（使用 useRef 存储防抖函数）
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 处理搜索（带防抖）
  const handleSearch = useCallback((value: string) => {
    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 设置新的防抖定时器
    searchTimeoutRef.current = setTimeout(() => {
      setSearchKeyword(value);
      setAutoExpandParent(true);
    }, 300);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 处理刷新
  const handleRefresh = () => {
    refetchTree();
    setExpandedKeys([]);
    setSearchKeyword('');
    setSelectedCategoryId(null);
  };

  // 构建最终的树数据
  const finalTreeData = useMemo(() => {
    if (searchKeyword.trim().length > 0 && searchResults) {
      // 使用搜索结果构建树（需要从完整树中提取匹配路径）
      return buildTreeData(treeData, searchResults);
    }
    return buildTreeData(treeData);
  }, [treeData, searchResults, searchKeyword, buildTreeData]);

  // 获取统计信息
  const stats = useMemo(() => {
    if (!treeData) return { total: 0, active: 0, level1: 0, level2: 0, level3: 0 };

    const countNodes = (
      nodes: CategoryTreeType[]
    ): { total: number; active: number; level1: number; level2: number; level3: number } => {
      let total = 0;
      let active = 0;
      let level1 = 0;
      let level2 = 0;
      let level3 = 0;

      const traverse = (nodes: CategoryTreeType[]) => {
        nodes.forEach((node) => {
          total++;
          if (node.status === 'active') active++;
          if (node.level === 1) level1++;
          if (node.level === 2) level2++;
          if (node.level === 3) level3++;
          if (node.children) traverse(node.children);
        });
      };

      traverse(nodes);
      return { total, active, level1, level2, level3 };
    };

    return countNodes(treeData);
  }, [treeData]);

  const isLoading = treeLoading || searchLoading;

  return (
    <Card
      size="small"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      role="region"
      aria-label="类目树导航"
    >
      {/* 标题和操作栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
        role="toolbar"
        aria-label="类目树操作工具栏"
      >
        <div>
          <Title level={5} style={{ margin: 0 }}>
            <FolderOutlined /> 类目树
          </Title>
          <div style={{ marginTop: 4 }}>
            <Space size="small">
              <Text type="secondary">总计: {stats.total}</Text>
              <Text type="success">启用: {stats.active}</Text>
              <Text type="secondary">L1: {stats.level1}</Text>
              <Text type="secondary">L2: {stats.level2}</Text>
              <Text type="secondary">L3: {stats.level3}</Text>
            </Space>
          </div>
        </div>

        <Space size="small">
          {showSearch && (
            <Search
              placeholder="搜索类目..."
              size="small"
              style={{ width: 180, minWidth: 120 }}
              allowClear
              aria-label="搜索类目"
              role="searchbox"
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined />}
            />
          )}
          <Button
            icon={<ReloadOutlined />}
            size="small"
            onClick={handleRefresh}
            loading={isLoading}
          >
            刷新
          </Button>
          {mode === 'manage' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => onCategoryAdd?.()}
            >
              新增类目
            </Button>
          )}
        </Space>
      </div>

      {/* 分类树 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid #f0f0f0',
          borderRadius: 6,
          padding: 8,
          minHeight: 0,
        }}
      >
        {isLoading && finalTreeData.length === 0 ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
            }}
          >
            <Spin size="large" />
          </div>
        ) : finalTreeData.length > 0 ? (
          <Tree
            virtual
            showIcon
            showLine={{ showLeafIcon: false }}
            defaultExpandParent={autoExpandParent}
            expandedKeys={expandedKeys}
            selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
            onExpand={handleExpand}
            onSelect={handleSelect}
            loadData={loadData}
            treeData={finalTreeData}
            role="tree"
            aria-label="类目树"
            aria-multiselectable="false"
            icon={({ expanded }) =>
              expanded ? (
                <FolderOpenOutlined style={{ color: '#1890ff' }} />
              ) : (
                <FolderOutlined style={{ color: '#1890ff' }} />
              )
            }
            blockNode
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#999',
            }}
          >
            <FolderOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>{searchKeyword ? '没有找到匹配的类目' : '暂无类目数据'}</div>
            {!searchKeyword && mode === 'manage' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                onClick={() => onCategoryAdd?.()}
                style={{ marginTop: 16 }}
              >
                新增类目
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CategoryTree;
