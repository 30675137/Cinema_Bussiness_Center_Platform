/**
 * 类目树组件
 * 支持搜索、选择、展开/收起、懒加载等功能
 * 使用Ant Design Tree组件实现
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tree, Input, Spin, Empty, Tag, Tooltip, Button, Space } from 'antd';
import type { DataNode, EventDataNode } from 'antd/es/tree';
import {
  SearchOutlined,
  ReloadOutlined,
  ExpandOutlined,
  CompressOutlined,
  LoadingOutlined
} from '@ant-design/icons';
// 临时定义以避免模块导入问题
type CategoryLevel = 1 | 2 | 3;
type CategoryStatus = 'enabled' | 'disabled';
type Category = {
  id: string;
  name: string;
  code?: string;
  level: CategoryLevel;
  parentId?: string;
  sortOrder?: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};
type CategoryTreeNode = Category & {
  children?: CategoryTreeNode[];
  path: string;
  isLeaf: boolean;
};
// import type { CategoryTreeNode, CategoryStatus } from '../types/category.types';

const { Search } = Input;

/**
 * CategoryTree组件属性接口
 */
export interface CategoryTreeProps {
  /** 树数据 */
  treeData: CategoryTreeNode[];
  /** 是否加载中 */
  loading?: boolean;
  /** 选中的节点keys */
  selectedKeys?: string[];
  /** 展开的节点keys */
  expandedKeys?: string[];
  /** 搜索关键词 */
  searchKeyword?: string;
  /** 是否启用懒加载 */
  lazy?: boolean;
  /** 是否启用虚拟滚动 */
  virtual?: boolean;
  /** 节点选择回调 */
  onSelect?: (selectedKeys: string[], info: { selected: boolean; node: EventDataNode }) => void;
  /** 节点展开回调 */
  onExpand?: (expandedKeys: string[], info: { expanded: boolean; node: EventDataNode }) => void;
  /** 搜索回调 */
  onSearch?: (keyword: string) => void;
  /** 搜索清除回调 */
  onSearchClear?: () => void;
  /** 懒加载回调 */
  onLoadData?: ({ key, children }: { key: string; children: any[] }) => Promise<any[]>;
}

/**
 * 将类目树节点转换为Ant Design Tree节点
 */
const convertToTreeNode = (node: CategoryTreeNode, lazy = false): DataNode => {
  const hasChildren = node.children && node.children.length > 0;

  return {
    key: node.id,
    title: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ flex: 1 }}>{node.name}</span>
        <Space size={4}>
          {node.status === 'disabled' && (
            <Tag color="default" size="small">停用</Tag>
          )}
          {node.level === 1 && (
            <Tag color="blue" size="small">一级</Tag>
          )}
          {node.level === 2 && (
            <Tag color="green" size="small">二级</Tag>
          )}
          {node.level === 3 && (
            <Tag color="orange" size="small">三级</Tag>
          )}
          {hasChildren && (
            <Tag color="purple" size="small">{node.children?.length || 0}</Tag>
          )}
        </Space>
      </div>
    ),
    isLeaf: node.isLeaf,
    children: lazy && hasChildren ? undefined : node.children?.map(child => convertToTreeNode(child, lazy)),
    // 存储原始数据，供其他操作使用
    nodeData: node
  };
};

/**
 * 类目树组件
 */
const CategoryTree: React.FC<CategoryTreeProps> = ({
  treeData,
  loading = false,
  selectedKeys = [],
  expandedKeys = [],
  searchKeyword = '',
  lazy = false,
  virtual = true,
  onSelect,
  onExpand,
  onSearch,
  onSearchClear,
  onLoadData
}) => {
  const [localExpandedKeys, setLocalExpandedKeys] = useState<string[]>(expandedKeys);
  const [searchValue, setSearchValue] = useState(searchKeyword);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  // 同步外部传入的expandedKeys
  useEffect(() => {
    setLocalExpandedKeys(expandedKeys);
  }, [expandedKeys]);

  // 同步外部传入的searchKeyword
  useEffect(() => {
    setSearchValue(searchKeyword);
  }, [searchKeyword]);

  // 生成Ant Design Tree数据
  const antdTreeData = useMemo(() => {
    return treeData.map(convertToTreeNode);
  }, [treeData]);

  /**
   * 处理搜索输入变化
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  }, []);

  /**
   * 处理搜索
   */
  const handleSearch = useCallback(() => {
    onSearch?.(searchValue);
    setAutoExpandParent(true);
  }, [searchValue, onSearch]);

  /**
   * 处理搜索清除
   */
  const handleSearchClear = useCallback(() => {
    setSearchValue('');
    onSearchClear?.();
    setAutoExpandParent(false);
  }, [onSearchClear]);

  /**
   * 处理键盘事件
   */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      handleSearchClear();
    }
  }, [handleSearch, handleSearchClear]);

  /**
   * 处理节点选择
   */
  const handleSelect = useCallback((
    selectedKeys: React.Key[],
    info: { selected: boolean; node: EventDataNode }
  ) => {
    onSelect?.(selectedKeys as string[], info);
  }, [onSelect]);

  /**
   * 处理节点展开
   */
  const handleExpand = useCallback(async (
    expandedKeys: React.Key[],
    info: { expanded: boolean; node: EventDataNode }
  ) => {
    setLocalExpandedKeys(expandedKeys as string[]);
    setAutoExpandParent(false);

    const { expanded, node } = info;
    const nodeKey = String(node.key);
    const nodeData = node.nodeData as CategoryTreeNode;

    // 如果是展开操作且启用懒加载
    if (expanded && lazy && onLoadData && !node.children?.length && nodeData?.children?.length) {
      setLoadingKeys(prev => new Set(prev).add(nodeKey));

      try {
        const childrenData = await onLoadData({
          key: nodeKey,
          children: []
        });

        // 更新节点的children
        if (childrenData && childrenData.length > 0) {
          // 这里需要更新树数据，但由于props是只读的，实际实现中可能需要通过状态管理来处理
          console.log('懒加载完成:', nodeKey, childrenData);
        }
      } catch (error) {
        console.error('懒加载失败:', error);
      } finally {
        setLoadingKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(nodeKey);
          return newSet;
        });
      }
    }

    onExpand?.(expandedKeys as string[], info);
  }, [lazy, onLoadData, onExpand]);

  /**
   * 全部展开
   */
  const handleExpandAll = useCallback(() => {
    const allKeys: string[] = [];
    const collectKeys = (nodes: CategoryTreeNode[]) => {
      nodes.forEach(node => {
        allKeys.push(node.id);
        if (node.children && node.children.length > 0) {
          collectKeys(node.children);
        }
      });
    };
    collectKeys(treeData);
    setLocalExpandedKeys(allKeys);
    onExpand?.(allKeys, { expanded: true, node: {} as EventDataNode });
  }, [treeData, onExpand]);

  /**
   * 全部收起
   */
  const handleCollapseAll = useCallback(() => {
    setLocalExpandedKeys([]);
    onExpand?.([], { expanded: false, node: {} as EventDataNode });
  }, [onExpand]);

  // 过滤树数据（高亮匹配节点）
  const filteredTreeData = useMemo(() => {
    if (!searchValue.trim()) {
      return antdTreeData;
    }

    const filterData = (data: DataNode[], searchValue: string): DataNode[] => {
      const expandedKeys: string[] = [];

      const filterNode = (node: DataNode): DataNode | null => {
        const nodeTitle = typeof node.title === 'string'
          ? node.title
          : node.key;

        const titleLower = nodeTitle.toLowerCase();
        const searchLower = searchValue.toLowerCase();

        if (titleLower.includes(searchLower)) {
          // 匹配的节点保持子节点
          const filteredChildren = node.children ? filterData(node.children, searchValue) : [];

          return {
            ...node,
            children: filteredChildren
          };
        }

        // 不匹配的节点，检查子节点
        if (node.children) {
          const filteredChildren = filterData(node.children, searchValue);
          if (filteredChildren.length > 0) {
            expandedKeys.push(String(node.key));
            return {
              ...node,
              children: filteredChildren
            };
          }
        }

        return null;
      };

      const filtered = data.map(filterNode).filter(Boolean) as DataNode[];

      return filtered;
    };

    return filterData(antdTreeData, searchValue);
  }, [antdTreeData, searchValue]);

  return (
    <div className="category-tree" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 搜索和工具栏 */}
      <div style={{ marginBottom: 12 }}>
        <Space orientation="vertical" style={{ width: '100%' }} size={8}>
          {/* 搜索框 */}
          <Search
            placeholder="搜索类目名称"
            allowClear
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onSearch={handleSearch}
            onClear={handleSearchClear}
            prefix={<SearchOutlined />}
            loading={loading}
          />

          {/* 工具栏 */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Space size={8}>
              <Tooltip title="全部展开">
                <Button
                  type="text"
                  size="small"
                  icon={<ExpandOutlined />}
                  onClick={handleExpandAll}
                  disabled={loading}
                />
              </Tooltip>
              <Tooltip title="全部收起">
                <Button
                  type="text"
                  size="small"
                  icon={<CompressOutlined />}
                  onClick={handleCollapseAll}
                  disabled={loading}
                />
              </Tooltip>
            </Space>

            <Tooltip title="刷新">
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                disabled={loading}
                onClick={() => window.location.reload()}
              />
            </Tooltip>
          </div>
        </Space>
      </div>

      {/* 树形列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>加载类目树...</div>
          </div>
        ) : filteredTreeData.length === 0 ? (
          <Empty
            description={
              searchValue.trim()
                ? `没有找到包含"${searchValue}"的类目`
                : '暂无类目数据'
            }
            style={{ marginTop: 40 }}
          />
        ) : (
          <Tree
            showLine={{ showLeafIcon: false }}
            showIcon={false}
            defaultExpandParent={autoExpandParent}
            selectedKeys={selectedKeys}
            expandedKeys={localExpandedKeys}
            onSelect={handleSelect}
            onExpand={handleExpand}
            treeData={filteredTreeData}
            virtual={virtual}
            height={virtual ? 400 : (treeData.length > 50 ? 400 : undefined)}
            blockNode={virtual}
            listHeight={virtual ? 400 : undefined}
            loadData={lazy ? async (node: any) => {
              const nodeKey = String(node.key);
              if (onLoadData) {
                const childrenData = await onLoadData({
                  key: nodeKey,
                  children: []
                });
                return childrenData;
              }
              return [];
            } : undefined}
            style={{
              background: 'transparent',
              fontSize: 14
            }}
            titleRender={(nodeData) => {
              const node = nodeData.nodeData as CategoryTreeNode;
              const isLoading = loadingKeys.has(node.key as string);

              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '2px 0'
                }}>
                  <span style={{
                    flex: 1,
                    color: node.status === 'disabled' ? '#999' : 'inherit'
                  }}>
                    {node.name}
                  </span>
                  <Space size={4}>
                    {isLoading && <LoadingOutlined style={{ color: '#1890ff' }} />}
                    {node.status === 'disabled' && (
                      <Tag color="default" size="small">停用</Tag>
                    )}
                    {node.level === 1 && (
                      <Tag color="blue" size="small">一级</Tag>
                    )}
                    {node.level === 2 && (
                      <Tag color="green" size="small">二级</Tag>
                    )}
                    {node.level === 3 && (
                      <Tag color="orange" size="small">三级</Tag>
                    )}
                    {node.children && node.children.length > 0 && !virtual && (
                      <Tag color="purple" size="small">{node.children.length}</Tag>
                    )}
                  </Space>
                </div>
              );
            }}
          />
        )}
      </div>

      {/* 统计信息 */}
      {!loading && filteredTreeData.length > 0 && (
        <div style={{
          borderTop: '1px solid #f0f0f0',
          paddingTop: 8,
          marginTop: 8,
          fontSize: 12,
          color: '#666'
        }}>
          共 {treeData.length} 个类目
          {searchValue.trim() && ` (搜索到 ${filteredTreeData.length} 个)`}
        </div>
      )}
    </div>
  );
};

export default CategoryTree;