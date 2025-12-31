import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Breadcrumb,
  Row,
  Col,
  message,
  Tabs,
  Statistic,
} from 'antd';
import {
  ShopOutlined,
  PlusOutlined,
  SettingOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExportOutlined,
  StarOutlined,
  UserOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import BrandManager from '@/components/Brand/BrandManager';
import { Breadcrumb as CustomBreadcrumb } from '@/components/common';
import { brandService } from '@/services/brandService';
import type { Brand } from '@/types/spu';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface BrandManagementProps {}

const BrandManagementPage: React.FC<BrandManagementProps> = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeTab, setActiveTab] = useState('list');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withWebsite: 0,
    withContact: 0,
  });

  // 面包屑导航
  const breadcrumbItems = [
    { title: '首页', path: '/dashboard' },
    { title: '系统管理', path: '/system' },
    { title: '品牌管理' },
  ];

  // 加载品牌数据
  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await brandService.getBrandList({
        page: 1,
        pageSize: 1000, // 获取所有数据用于统计
      });

      if (response.success) {
        const brandsData = response.data.list;
        setBrands(brandsData);

        // 计算统计数据
        const newStats = {
          total: brandsData.length,
          active: brandsData.filter((brand) => brand.status === 'active').length,
          inactive: brandsData.filter((brand) => brand.status === 'inactive').length,
          withWebsite: brandsData.filter((brand) => brand.website).length,
          withContact: brandsData.filter((brand) => brand.contactPerson).length,
        };
        setStats(newStats);
      } else {
        message.error(response.message || '加载品牌数据失败');
      }
    } catch (error) {
      console.error('Load brands error:', error);
      message.error('加载品牌数据失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    loadBrands();
  }, []);

  // 处理添加品牌
  const handleAddBrand = () => {
    message.info('添加品牌功能开发中...');
  };

  // 处理编辑品牌
  const handleEditBrand = (brand: Brand) => {
    message.info(`编辑品牌 "${brand.name}" 功能开发中...`);
  };

  // 处理删除品牌
  const handleDeleteBrand = (brandId: string) => {
    message.info('删除品牌功能开发中...');
  };

  // 处理品牌选择
  const handleSelectBrand = (brand: Brand) => {
    message.info(`选择品牌 "${brand.name}" 功能开发中...`);
  };

  // 处理导出
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 处理刷新
  const handleRefresh = () => {
    loadBrands();
  };

  // 处理返回
  const handleBack = () => {
    navigate('/dashboard');
  };

  // 处理批量操作
  const handleBatchOperation = (operation: 'activate' | 'deactivate' | 'delete') => {
    message.info(
      `批量${operation === 'activate' ? '启用' : operation === 'deactivate' ? '停用' : '删除'}功能开发中...`
    );
  };

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题和导航 */}
      <div style={{ marginBottom: 24 }}>
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>

      {/* 页面标题和操作按钮 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <ShopOutlined /> 品牌管理
          </Title>
          <div style={{ fontSize: '14px', color: '#666', marginTop: 8 }}>商品品牌信息管理</div>
        </div>

        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={handleAddBrand}>
            添加品牌
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            导出数据
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
          <Button onClick={handleBack}>返回</Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总品牌数"
              value={stats.total}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="启用品牌"
              value={stats.active}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="有官网"
              value={stats.withWebsite}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="有联系人"
              value={stats.withContact}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                列表管理
              </span>
            }
            key="list"
          >
            <div style={{ padding: '16px 0' }}>
              <BrandManager mode="manage" showActions={true} height={500} />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <EyeOutlined />
                数据统计
              </span>
            }
            key="stats"
          >
            <div style={{ padding: '32px' }}>
              <Title level={4}>品牌数据统计</Title>
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <Card title="品牌状态分布" size="small">
                    <div style={{ padding: '24px 0' }}>
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text>总品牌数</Text>
                          <Text strong style={{ fontSize: '18px' }}>
                            {stats.total}
                          </Text>
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#52c41a' }}>启用品牌</Text>
                          <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                            {stats.active}
                          </Text>
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#fa8c16' }}>停用品牌</Text>
                          <Text strong style={{ fontSize: '18px', color: '#fa8c16' }}>
                            {stats.inactive}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="信息完整性统计" size="small">
                    <div style={{ padding: '24px 0' }}>
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text>有官网的品牌</Text>
                          <Text strong style={{ fontSize: '18px' }}>
                            {stats.withWebsite}
                          </Text>
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text>有联系人的品牌</Text>
                          <Text strong style={{ fontSize: '18px' }}>
                            {stats.withContact}
                          </Text>
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text>信息完整度</Text>
                          <Text strong style={{ fontSize: '18px' }}>
                            {stats.total > 0
                              ? Math.round(
                                  ((stats.withWebsite + stats.withContact) / (stats.total * 2)) *
                                    100
                                )
                              : 0}
                            %
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <div style={{ marginTop: 32 }}>
                <Title level={5}>热门品牌预览</Title>
                <Row gutter={[16, 16]}>
                  {brands.slice(0, 6).map((brand) => (
                    <Col xs={12} sm={8} md={6} lg={4} key={brand.id}>
                      <Card
                        size="small"
                        hoverable
                        onClick={() => handleSelectBrand(brand)}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                      >
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 4,
                              marginBottom: 8,
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <ShopOutlined style={{ fontSize: 32, color: '#ccc', marginBottom: 8 }} />
                        )}
                        <div style={{ fontWeight: 500 }}>{brand.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{brand.code}</div>
                        {brand.status === 'active' ? (
                          <div style={{ marginTop: 4 }}>
                            <span style={{ fontSize: '10px', color: '#52c41a' }}>● 启用</span>
                          </div>
                        ) : (
                          <div style={{ marginTop: 4 }}>
                            <span style={{ fontSize: '10px', color: '#fa8c16' }}>● 停用</span>
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default BrandManagementPage;
