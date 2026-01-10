import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, message, Space, Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import SPUForm from '@/components/forms/SPUForm';
import { SPUNotificationService } from '@/components/common/Notification';
import type { Brand, Category } from '@/types/spu';
import type { CreateSPURequest } from '@/services/spuService';
import { spuService } from '@/services/spuService';
import { brandService } from '@/pages/mdm-pim/brand/services/brandService';
import { categoryService } from '@/services/categoryService';
import { validateSPUForm } from '@/utils/validation';
import { Breadcrumb as CustomBreadcrumb } from '@/components/common';

const SPUCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // 加载品牌和分类数据
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setDataLoading(true);

      // 并行加载品牌和分类数据
      const [brandsResult, categoriesResult] = await Promise.all([loadBrands(), loadCategories()]);

      setBrands(brandsResult);
      setCategories(categoriesResult);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      message.error('加载数据失败，请刷新页面重试');
    } finally {
      setDataLoading(false);
    }
  };

  // 加载品牌数据 - 从后端 API 获取
  const loadBrands = async (): Promise<Brand[]> => {
    try {
      const response = await brandService.getBrands({ pageSize: 100, status: 'enabled' });
      if (response.data) {
        // 转换为 SPU 表单所需的 Brand 格式
        return response.data.map((brand) => ({
          id: brand.id,
          name: brand.name,
          code: brand.brandCode,
          description: brand.description,
          status: brand.status === 'enabled' ? 'active' : 'inactive',
          logo: brand.logoUrl,
        }));
      }
      return [];
    } catch (error) {
      console.error('Load brands error:', error);
      return [];
    }
  };

  // 过滤无效分类（递归处理，确保所有节点都有有效的id）
  const filterValidCategories = (categories: Category[]): Category[] => {
    return categories
      .filter((cat) => {
        const isValid = cat && cat.id && typeof cat.id === 'string' && cat.id.trim() !== '';
        if (!isValid) {
          console.warn('[SPUCreate] 过滤无效分类:', cat);
        }
        return isValid;
      })
      .map((cat) => ({
        ...cat,
        children: cat.children ? filterValidCategories(cat.children) : undefined,
      }));
  };

  // 加载分类数据 - 从 API 获取
  const loadCategories = async (): Promise<Category[]> => {
    try {
      // getCategoryTree(false) 获取完整树结构（非懒加载）
      const response = await categoryService.getCategoryTree(false);
      if (response.success && response.data) {
        // 过滤并验证分类数据，确保没有空id
        const validCategories = filterValidCategories(response.data as unknown as Category[]);
        console.log('[SPUCreate] Loaded categories:', validCategories.length);
        return validCategories;
      }
      return [];
    } catch (error) {
      console.error('Load categories error:', error);
      return [];
    }
  };

  // 处理表单提交
  const handleSubmit = useCallback(
    async (formData: CreateSPURequest) => {
      // 客户端验证
      const validation = validateSPUForm(formData);
      if (!validation.isValid) {
        SPUNotificationService.validationFailed(validation.fieldErrors);
        return;
      }

      try {
        setLoading(true);

        // 调用API创建SPU
        const response = await spuService.createSPU(formData);

        if (response.success) {
          // 显示创建成功通知，并提供操作选项
          SPUNotificationService.createSuccess(
            {
              id: response.data.id,
              name: response.data.name,
              code: response.data.code,
            },
            () => {
              // 点击通知时跳转到详情页
              navigate(`/spu/${response.data.id}`, { replace: true });
            }
          );

          // 延迟跳转，让用户看到成功消息
          setTimeout(() => {
            // 跳转到SPU详情页
            navigate(`/spu/${response.data.id}`, { replace: true });
          }, 2000);
        } else {
          SPUNotificationService.actionFailed('创建SPU', response.message);
        }
      } catch (error) {
        console.error('Create SPU error:', error);
        SPUNotificationService.networkError('创建SPU');
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // 处理取消操作
  const handleCancel = useCallback(() => {
    // 确认取消
    const confirmed = window.confirm('确定要取消创建吗？未保存的数据将丢失。');
    if (confirmed) {
      navigate('/spu');
    }
  }, [navigate]);

  // 面包屑导航
  const breadcrumbItems = [
    { title: '首页', path: '/dashboard' },
    { title: 'SPU管理', path: '/spu' },
    { title: '创建SPU' },
  ];

  if (dataLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Card loading style={{ marginBottom: 16 }} />
        <Card loading />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题和导航 */}
      <div style={{ marginBottom: 24 }}>
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>

      {/* 返回按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/spu')}>
          返回列表
        </Button>
      </div>

      {/* 主要内容区域 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>创建SPU</span>
            <span style={{ marginLeft: 12, fontSize: 14, color: '#666', fontWeight: 'normal' }}>
              填写SPU基础信息
            </span>
          </div>
        }
        style={{
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          borderRadius: 8,
        }}
      >
        <SPUForm
          brands={brands}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </Card>

      {/* 页脚信息 */}
      <div
        style={{
          marginTop: 24,
          textAlign: 'center',
          color: '#666',
          fontSize: 12,
        }}
      >
        <p>提示：请填写完整的SPU信息，标记 * 的为必填项</p>
      </div>
    </div>
  );
};

export default SPUCreatePage;
