/**
 * 类目管理主页面
 * 左侧显示类目树，右侧显示类目详情
 * 集成搜索、选择、状态管理等功能
 */

import React, { useEffect, useCallback } from 'react';
import { Layout, Card, message, Button, Space } from 'antd';
import { useParams, useNavigate } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';
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
// import type { Category } from './types/category.types';

// 组件导入
import CategoryTree from './components/CategoryTree';
import CategoryDetail from './components/CategoryDetail';
import CategoryForm from './components/CategoryForm';

// Hooks和Store导入
import { useCategoryStore, useCategoryActions } from '../../../stores/categoryStore';
import { useCategoryTreeQuery, useCategoryQuery } from '../../../services/category/categoryQueries';
import { CategoryTreeUtils } from '../../../utils/categoryUtils';

const { Sider, Content } = Layout;

/**
 * 类目管理主页面组件
 */
const CategoryManagement: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // 状态管理hooks
  const selectedCategoryId = useCategoryStore(state => state.selectedCategoryId);
  const expandedKeys = useCategoryStore(state => state.expandedKeys);
  const searchKeyword = useCategoryStore(state => state.searchKeyword);

  // 创建顶级类目弹窗状态
  const [createTopLevelFormVisible, setCreateTopLevelFormVisible] = React.useState(false);

  // 状态管理actions
  const {
    setSelectedCategoryId,
    setExpandedKeys,
    selectCategory,
    performSearch,
    clearSearch
  } = useCategoryActions();

  // 数据查询hooks
  const {
    data: treeData,
    isLoading: isTreeLoading,
    error: treeError,
    refetch: refetchTree
  } = useCategoryTreeQuery(searchKeyword);

  const {
    data: selectedCategory,
    isLoading: isDetailLoading,
    error: detailError
  } = useCategoryQuery(
    selectedCategoryId || id || '',
    {
      enabled: !!(selectedCategoryId || id)
    }
  );

  // 处理URL参数变化
  useEffect(() => {
    if (id && id !== selectedCategoryId) {
      selectCategory(id);
    } else if (!id && selectedCategoryId) {
      navigate(`/mdm-pim/category/${selectedCategoryId}`, { replace: true });
    }
  }, [id, selectedCategoryId, selectCategory, navigate]);

  // 错误处理
  useEffect(() => {
    if (treeError) {
      message.error('加载类目树失败: ' + treeError.message);
    }
    if (detailError) {
      message.error('加载类目详情失败: ' + detailError.message);
    }
  }, [treeError, detailError]);

  /**
   * 处理类目节点选择
   */
  const handleSelect = useCallback((categoryId: string) => {
    selectCategory(categoryId);
    navigate(`/mdm-pim/category/${categoryId}`);
  }, [selectCategory, navigate]);

  /**
   * 处理类目节点展开/收起
   */
  const handleExpand = useCallback((keys: string[]) => {
    setExpandedKeys(keys);
  }, [setExpandedKeys]);

  /**
   * 处理搜索
   */
  const handleSearch = useCallback((keyword: string) => {
    performSearch(keyword);

    // 搜索后自动展开匹配的路径
    if (keyword.trim() && treeData?.data) {
      const expandedKeys = CategoryTreeUtils.getExpandedKeys(treeData.data, keyword);
      setExpandedKeys(expandedKeys);
    }
  }, [performSearch, treeData?.data, setExpandedKeys]);

  /**
   * 处理搜索清除
   */
  const handleSearchClear = useCallback(() => {
    clearSearch();
  }, [clearSearch]);

  /**
   * 处理类目更新成功
   */
  const handleCategoryUpdate = useCallback((category: Category) => {
    refetchTree(); // 刷新树结构数据
    message.success('类目更新成功');
  }, [refetchTree]);

  /**
   * 处理类目创建成功
   */
  const handleCategoryCreate = useCallback((category: Category) => {
    refetchTree(); // 刷新树结构数据
    handleSelect(category.id); // 选中新创建的类目
    message.success('类目创建成功');
  }, [refetchTree, handleSelect]);

  /**
   * 处理类目删除成功
   */
  const handleCategoryDelete = useCallback(() => {
    refetchTree(); // 刷新树结构数据
    setSelectedCategoryId(null); // 清除选择
    navigate('/mdm-pim/category'); // 回到根页面
    message.success('类目删除成功');
  }, [refetchTree, setSelectedCategoryId, navigate]);

  /**
   * 处理创建顶级类目
   */
  const handleCreateTopLevel = useCallback(() => {
    setCreateTopLevelFormVisible(true);
  }, []);

  /**
   * 处理顶级类目创建成功
   */
  const handleTopLevelCreateSuccess = useCallback((category: Category) => {
    setCreateTopLevelFormVisible(false);
    refetchTree(); // 刷新树结构数据
    handleSelect(category.id); // 选中新创建的类目
    message.success('顶级类目创建成功');
  }, [refetchTree, handleSelect]);

  /**
   * 处理刷新
   */
  const handleRefresh = useCallback(() => {
    refetchTree();
    if (selectedCategoryId) {
      // 重新查询当前类目数据
      window.location.reload(); // 简单实现，实际可以通过 queryClient 重新获取
    }
  }, [refetchTree, selectedCategoryId]);

  // 获取当前选中的类目（优先使用URL参数）
  const currentCategory = selectedCategory || undefined;

  return (
    <div className="category-management">
      <Layout style={{ height: 'calc(100vh - 64px)', background: '#f5f5f5' }}>
        {/* 左侧类目树 */}
        <Sider
          width={320}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            overflow: 'hidden'
          }}
        >
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>类目管理</span>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleCreateTopLevel}
                  style={{ fontSize: 12 }}
                >
                  添加顶级类目
                </Button>
              </div>
            }
            size="small"
            style={{
              height: '100%',
              border: 'none',
              boxShadow: 'none'
            }}
            styles={{
              body: {
                padding: '8px',
                height: 'calc(100% - 57px)',
                overflow: 'hidden'
              }
            }}
          >
            <CategoryTree
              treeData={treeData?.data || []}
              loading={isTreeLoading}
              selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
              expandedKeys={expandedKeys}
              searchKeyword={searchKeyword}
              onSelect={handleSelect}
              onExpand={handleExpand}
              onSearch={handleSearch}
              onSearchClear={handleSearchClear}
            />
          </Card>
        </Sider>

        {/* 右侧类目详情 */}
        <Content style={{ padding: '16px', overflow: 'auto' }}>
          <Card
            title={currentCategory ? `类目详情 - ${currentCategory.name}` : '类目详情'}
            style={{
              minHeight: 400,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
            }}
          >
            <CategoryDetail
              category={currentCategory}
              loading={isDetailLoading}
              onUpdate={handleCategoryUpdate}
              onCreate={handleCategoryCreate}
              onDelete={handleCategoryDelete}
              onRefresh={handleRefresh}
            />
          </Card>
        </Content>
      </Layout>

      {/* 创建顶级类目弹窗 */}
      <CategoryForm
        mode="create"
        visible={createTopLevelFormVisible}
        onCancel={() => setCreateTopLevelFormVisible(false)}
        onSuccess={handleTopLevelCreateSuccess}
      />
    </div>
  );
};

export default CategoryManagement;