import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, message, Space, Breadcrumb } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import SPUForm from '@/components/forms/SPUForm'
import { SPUNotificationService } from '@/components/common/Notification'
import type { Brand, Category } from '@/types/spu'
import type { CreateSPURequest } from '@/services/spuService'
import { spuService } from '@/services/spuService'
import { validateSPUForm } from '@/utils/validation'
import { Breadcrumb as CustomBreadcrumb } from '@/components/common'

const SPUCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  // 加载品牌和分类数据
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setDataLoading(true)

      // 并行加载品牌和分类数据
      const [brandsResult, categoriesResult] = await Promise.all([
        loadBrands(),
        loadCategories(),
      ])

      setBrands(brandsResult)
      setCategories(categoriesResult)
    } catch (error) {
      console.error('Failed to load initial data:', error)
      message.error('加载数据失败，请刷新页面重试')
    } finally {
      setDataLoading(false)
    }
  }

  // Mock加载品牌数据
  const loadBrands = async (): Promise<Brand[]> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    return [
      {
        id: 'brand_001',
        name: '可口可乐',
        code: 'COKE',
        description: '全球知名碳酸饮料品牌',
        status: 'active',
        logo: '/images/brands/coke.png',
      },
      {
        id: 'brand_002',
        name: '百事可乐',
        code: 'PEPSI',
        description: '全球知名碳酸饮料品牌',
        status: 'active',
        logo: '/images/brands/pepsi.png',
      },
      {
        id: 'brand_003',
        name: '农夫山泉',
        code: 'NONGFU',
        description: '中国知名饮用水品牌',
        status: 'active',
        logo: '/images/brands/nongfu.png',
      },
      {
        id: 'brand_004',
        name: '康师傅',
        code: 'KSF',
        description: '知名食品饮料品牌',
        status: 'active',
      },
      {
        id: 'brand_005',
        name: '统一',
        code: 'UNI',
        description: '知名食品饮料品牌',
        status: 'active',
      },
    ]
  }

  // Mock加载分类数据
  const loadCategories = async (): Promise<Category[]> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    return [
      {
        id: 'category_001',
        name: '食品饮料',
        code: 'food_beverage',
        level: 1,
        status: 'active',
        children: [
          {
            id: 'category_002',
            name: '饮料',
            code: 'beverage',
            level: 2,
            status: 'active',
            parentId: 'category_001',
            children: [
              {
                id: 'category_003',
                name: '碳酸饮料',
                code: 'carbonated',
                level: 3,
                status: 'active',
                parentId: 'category_002',
              },
              {
                id: 'category_004',
                name: '果汁饮料',
                code: 'juice',
                level: 3,
                status: 'active',
                parentId: 'category_002',
              },
              {
                id: 'category_005',
                name: '茶饮料',
                code: 'tea',
                level: 3,
                status: 'active',
                parentId: 'category_002',
              },
            ],
          },
          {
            id: 'category_006',
            name: '零食',
            code: 'snacks',
            level: 2,
            status: 'active',
            parentId: 'category_001',
            children: [
              {
                id: 'category_007',
                name: '膨化食品',
                code: 'puffed',
                level: 3,
                status: 'active',
                parentId: 'category_006',
              },
              {
                id: 'category_008',
                name: '坚果炒货',
                code: 'nuts',
                level: 3,
                status: 'active',
                parentId: 'category_006',
              },
            ],
          },
        ],
      },
      {
        id: 'category_009',
        name: '日用百货',
        code: 'daily_goods',
        level: 1,
        status: 'active',
        children: [
          {
            id: 'category_010',
            name: '洗护用品',
            code: 'personal_care',
            level: 2,
            status: 'active',
            parentId: 'category_009',
            children: [
              {
                id: 'category_011',
                name: '洗发水',
                code: 'shampoo',
                level: 3,
                status: 'active',
                parentId: 'category_010',
              },
            ],
          },
        ],
      },
    ]
  }

  // 处理表单提交
  const handleSubmit = useCallback(async (formData: CreateSPURequest) => {
    // 客户端验证
    const validation = validateSPUForm(formData)
    if (!validation.isValid) {
      SPUNotificationService.validationFailed(validation.fieldErrors)
      return
    }

    try {
      setLoading(true)

      // 调用API创建SPU
      const response = await spuService.createSPU(formData)

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
            navigate(`/spu/${response.data.id}`, { replace: true })
          }
        )

        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          // 跳转到SPU详情页
          navigate(`/spu/${response.data.id}`, { replace: true })
        }, 2000)
      } else {
        SPUNotificationService.actionFailed('创建SPU', response.message)
      }
    } catch (error) {
      console.error('Create SPU error:', error)
      SPUNotificationService.networkError('创建SPU')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  // 处理取消操作
  const handleCancel = useCallback(() => {
    // 确认取消
    const confirmed = window.confirm('确定要取消创建吗？未保存的数据将丢失。')
    if (confirmed) {
      navigate('/spu')
    }
  }, [navigate])

  // 面包屑导航
  const breadcrumbItems = [
    { title: '首页', path: '/dashboard' },
    { title: 'SPU管理', path: '/spu' },
    { title: '创建SPU' },
  ]

  if (dataLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Card loading style={{ marginBottom: 16 }} />
        <Card loading />
      </div>
    )
  }

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题和导航 */}
      <div style={{ marginBottom: 24 }}>
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>

      {/* 返回按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/spu')}
        >
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
      <div style={{
        marginTop: 24,
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
      }}>
        <p>提示：请填写完整的SPU信息，标记 * 的为必填项</p>
      </div>
    </div>
  )
}

export default SPUCreatePage