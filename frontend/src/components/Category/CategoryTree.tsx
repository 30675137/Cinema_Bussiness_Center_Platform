import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Tree,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Tag,
  Tooltip,
  Switch,
  Modal,
  message
} from 'antd'
import {
  SearchOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import type { DataNode, EventDataNode } from 'antd/es/tree'
import type { Category } from '@/types/spu'

const { Search } = Input
const { Title, Text } = Typography

interface CategoryTreeProps {
  categories?: Category[]
  mode?: 'select' | 'manage'
  onCategorySelect?: (category: Category) => void
  onCategoryEdit?: (category: Category) => void
  onCategoryDelete?: (categoryId: string) => void
  onCategoryAdd?: (parentId?: string) => void
  selectedCategoryIds?: string[]
  defaultExpandedKeys?: string[]
  showSearch?: boolean
  showActions?: boolean
  maxLevel?: number
  height?: number
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories = [],
  mode = 'select',
  onCategorySelect,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryAdd,
  selectedCategoryIds = [],
  defaultExpandedKeys = [],
  showSearch = true,
  showActions = true,
  maxLevel = 3,
  height = 400
}) => {
  const [treeData, setTreeData] = useState<DataNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>(defaultExpandedKeys)
  const [selectedKeys, setSelectedKeys] = useState<string[]>(selectedCategoryIds)
  const [searchValue, setSearchValue] = useState('')
  const [autoExpandParent, setAutoExpandParent] = useState(true)

  // 构建树形数据
  const buildTreeData = useCallback((categories: Category[]): DataNode[] => {
    const rootCategories = categories.filter(cat => !cat.parentId || cat.level === 1)

    return rootCategories.map(category => ({
      key: category.id,
      title: renderTreeNodeTitle(category),
      data: category,
      children: buildChildren(categories, category.id)
    }))
  }, [])

  // 构建子节点
  const buildChildren = useCallback((categories: Category[], parentId: string): DataNode[] => {
    const children = categories.filter(cat => cat.parentId === parentId)

    return children.map(category => ({
      key: category.id,
      title: renderTreeNodeTitle(category),
      data: category,
      children: buildChildren(categories, category.id)
    }))
  }, [])

  // 渲染树节点标题
  const renderTreeNodeTitle = useCallback((category: Category) => {
    const isSelected = selectedKeys.includes(category.id)
    const matchesSearch = searchValue && (
      category.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      category.code.toLowerCase().includes(searchValue.toLowerCase())
    )

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '2px 0',
          backgroundColor: isSelected ? '#e6f7ff' : matchesSearch ? '#fffbe6' : 'transparent',
          borderRadius: 4
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{
            fontWeight: category.level === 1 ? 600 : category.level === 2 ? 500 : 400,
            color: category.status === 'inactive' ? '#999' : '#000'
          }}>
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
            <Tag color="orange" style={{ fontSize: '11px' }}>停用</Tag>
          )}
          {category.children && category.children.length > 0 && (
            <Tag color="green" style={{ fontSize: '10px' }}>
              {category.children.length}
            </Tag>
          )}
        </div>

        {showActions && (
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            {mode === 'manage' && (
              <>
                {category.level < maxLevel && (
                  <Tooltip title="添加子分类">
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onCategoryAdd?.(category.id)
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
                      e.stopPropagation()
                      onCategoryEdit?.(category)
                    }}
                  />
                </Tooltip>
                <Tooltip title="删除">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteConfirm(category)
                    }}
                    disabled={category.children && category.children.length > 0}
                  />
                </Tooltip>
              </>
            )}
            {mode === 'select' && (
              <Tooltip title="选择">
                <Button
                  type="text"
                  size="small"
                  icon={<span style={{ color: '#1890ff' }}>✓</span>}
                  onClick={(e) => {
                    e.stopPropagation()
                    onCategorySelect?.(category)
                  }}
                />
              </Tooltip>
            )}
          </Space>
        )}
      </div>
    )
  }, [selectedKeys, searchValue, showActions, mode, maxLevel, onCategoryAdd, onCategoryEdit, onCategorySelect])

  // 处理删除确认
  const handleDeleteConfirm = (category: Category) => {
    if (category.children && category.children.length > 0) {
      message.warning('该分类下还有子分类，无法删除')
      return
    }

    Modal.confirm({
      title: '确认删除',
      content: (
        <div>
          <p>确定要删除分类 "<strong>{category.name}</strong>" 吗？</p>
          {category.status === 'active' && (
            <p style={{ color: '#ff4d4f' }}>
              注意：删除后，相关商品可能受影响。
            </p>
          )}
        </div>
      ),
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        onCategoryDelete?.(category.id)
      }
    })
  }

  // 搜索过滤
  const filteredTreeData = useMemo(() => {
    if (!searchValue) {
      return buildTreeData(categories)
    }

    const expandKeys = new Set<string>()
    const filterNodes = (nodes: Category[]): DataNode[] => {
      return nodes
        .filter(node => {
          const matchesSearch = node.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            node.code.toLowerCase().includes(searchValue.toLowerCase())

          const hasMatchingChild = node.children && node.children.length > 0 &&
            filterNodes(node.children).length > 0

          if (matchesSearch || hasMatchingChild) {
            expandKeys.add(node.id)
            return true
          }
          return false
        })
        .map(node => ({
          key: node.id,
          title: renderTreeNodeTitle(node),
          data: node,
          children: node.children ? filterNodes(node.children) : undefined
        }))
    }

    const filteredData = filterNodes(categories)
    if (expandKeys.size > 0) {
      setExpandedKeys(Array.from(expandKeys))
    }

    return filteredData
  }, [categories, searchValue, buildTreeData, renderTreeNodeTitle])

  // 初始化
  useEffect(() => {
    if (categories.length > 0) {
      const data = buildTreeData(categories)
      setTreeData(data)

      // 默认展开第一级
      if (defaultExpandedKeys.length === 0) {
        const firstLevelKeys = data.map(node => node.key as string)
        setExpandedKeys(firstLevelKeys)
      }
    }
  }, [categories, buildTreeData, defaultExpandedKeys])

  // 处理树节点选择
  const handleSelect = (selectedKeys: React.Key[], info: { event: 'select'; selected: boolean; node: EventDataNode }) => {
    setSelectedKeys(selectedKeys as string[])
    if (mode === 'select' && info.node.data) {
      onCategorySelect?.(info.node.data as Category)
    }
  }

  // 处理树节点展开
  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys as string[])
    setAutoExpandParent(false)
  }

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value)
    setAutoExpandParent(true)
  }

  // 获取分类统计
  const getCategoryStats = () => {
    const total = categories.length
    const active = categories.filter(cat => cat.status === 'active').length
    const level1 = categories.filter(cat => cat.level === 1).length
    const level2 = categories.filter(cat => cat.level === 2).length
    const level3 = categories.filter(cat => cat.level === 3).length

    return { total, active, level1, level2, level3 }
  }

  const stats = getCategoryStats()

  return (
    <Card size="small">
      {/* 标题和操作栏 */}
      <div style={{
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            <FolderOutlined /> 分类树
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

        <Space>
          {showSearch && (
            <Search
              placeholder="搜索分类名称或编码"
              style={{ width: 200 }}
              allowClear
              value={searchValue}
              onChange={e => handleSearch(e.target.value)}
            />
          )}
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setExpandedKeys(defaultExpandedKeys.length > 0 ? defaultExpandedKeys :
                categories.filter(cat => cat.level === 1).map(cat => cat.id)
              )
              setSearchValue('')
            }}
          >
            重置
          </Button>
          {mode === 'manage' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onCategoryAdd?.()}
            >
              添加分类
            </Button>
          )}
        </Space>
      </div>

      {/* 分类树 */}
      <div style={{ height, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 6, padding: 8 }}>
        {filteredTreeData.length > 0 ? (
          <Tree
            showIcon
            showLine={{ showLeafIcon: false }}
            defaultExpandParent={autoExpandParent}
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            onExpand={handleExpand}
            onSelect={handleSelect}
            treeData={filteredTreeData}
            icon={({ expanded }) =>
              expanded ? <FolderOpenOutlined style={{ color: '#1890ff' }} /> :
              <FolderOutlined style={{ color: '#1890ff' }} />
            }
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60%',
            color: '#999'
          }}>
            <FolderOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>
              {searchValue ? '没有找到匹配的分类' : '暂无分类数据'}
            </div>
            {!searchValue && mode === 'manage' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => onCategoryAdd?.()}
                style={{ marginTop: 16 }}
              >
                添加第一个分类
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default CategoryTree