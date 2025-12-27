/**
 * 库存管理响应式布局组件
 * 提供适配不同屏幕尺寸的布局容器
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Row,
  Col,
  Space,
  Button,
  Drawer,
  Typography,
  Card,
  BackTop,
  Affix,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FilterOutlined,
  SettingOutlined,
  ArrowUpOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useResponsive } from '@/hooks/useResponsive';
import UserRoleSelector from '@/components/Inventory/UserRoleSelector';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
  siderContent?: React.ReactNode;
  filterContent?: React.ReactNode;
  showBreadcrumb?: boolean;
  showUserSelector?: boolean;
  className?: string;
}

// 响应式断点配置
const RESPONSIVE_CONFIG = {
  xs: 24,    // 手机: 1列
  sm: 24,    // 小屏: 1列
  md: 24,    // 中屏: 1列
  lg: 18,    // 大屏: 内容18列, 侧边栏6列
  xl: 18,    // 超大屏: 内容18列, 侧边栏6列
  xxl: 16,   // 超大屏: 内容16列, 侧边栏8列
};

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  title,
  subtitle,
  extra,
  siderContent,
  filterContent,
  showBreadcrumb = false,
  showUserSelector = true,
  className,
}) => {
  const { isMobile, isTablet, isDesktop, width, breakpoint } = useResponsive();
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [siderDrawerVisible, setSiderDrawerVisible] = useState(false);

  // 响应式布局自动调整
  useEffect(() => {
    if (isMobile) {
      setSiderCollapsed(true);
    } else if (isDesktop) {
      setSiderCollapsed(false);
    }
  }, [isMobile, isDesktop]);

  // 计算主内容列数
  const mainContentCol = isDesktop ? RESPONSIVE_CONFIG[breakpoint] : 24;
  const siderCol = siderContent ? 24 - mainContentCol : 0;

  // 渲染页面头部
  const renderHeader = () => {
    if (!title && !subtitle && !extra) return null;

    return (
      <div style={{
        padding: '16px 0',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 16
      }}>
        <Row justify="space-between" align="middle" gutter={[16, 8]}>
          <Col xs={24} sm={16} md={18}>
            <Space direction="vertical" size="small">
              {title && (
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                  {title}
                </Title>
              )}
              {subtitle && (
                <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                  {subtitle}
                </Typography.Text>
              )}
            </Space>
          </Col>
          <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
            <Space wrap>
              {extra}
              {showUserSelector && !isMobile && (
                <UserRoleSelector compact />
              )}
            </Space>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染筛选器区域
  const renderFilters = () => {
    if (!filterContent) return null;

    if (isMobile) {
      return (
        <>
          <Affix offsetTop={80}>
            <Card
              size="small"
              style={{ margin: '0 0 16px 0', borderRadius: 0 }}
              bodyStyle={{ padding: '12px' }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={() => setFilterDrawerVisible(true)}
                    size="small"
                  >
                    筛选
                  </Button>
                </Col>
                <Col>
                  {extra}
                </Col>
              </Row>
            </Card>
          </Affix>

          <Drawer
            title="筛选条件"
            placement="bottom"
            height="80%"
            open={filterDrawerVisible}
            onClose={() => setFilterDrawerVisible(false)}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: 16 }}>
              {filterContent}
            </div>
          </Drawer>
        </>
      );
    }

    return (
      <div style={{ marginBottom: 16 }}>
        {filterContent}
      </div>
    );
  };

  // 渲染侧边栏
  const renderSider = () => {
    if (!siderContent) return null;

    if (isMobile) {
      // 移动端使用浮动按钮和抽屉
      return (
        <>
          <Button
            type="primary"
            icon={<MenuOutlined />}
            style={{
              position: 'fixed',
              right: 16,
              bottom: 80,
              zIndex: 1000,
              borderRadius: '50%',
              width: 48,
              height: 48,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
            onClick={() => setSiderDrawerVisible(true)}
          />

          <Drawer
            title="功能菜单"
            placement="right"
            width={width * 0.8}
            open={siderDrawerVisible}
            onClose={() => setSiderDrawerVisible(false)}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: 16 }}>
              {siderContent}
            </div>
          </Drawer>
        </>
      );
    }

    if (isTablet) {
      // 平板端使用可折叠的侧边栏
      return (
        <Col span={siderCollapsed ? 0 : 8}>
          <div
            style={{
              height: '100%',
              transition: 'all 0.3s',
              overflow: 'hidden',
            }}
          >
            {siderCollapsed ? null : siderContent}
          </div>
        </Col>
      );
    }

    // 桌面端使用固定侧边栏
    return (
      <Col span={siderCol}>
        <div style={{
          position: 'sticky',
          top: 80,
          height: 'fit-content'
        }}>
          {siderContent}
        </div>
      </Col>
    );
  };

  // 渲染主内容区
  const renderMainContent = () => {
    if (isMobile || !siderContent) {
      return (
        <Col span={24}>
          <div className="inventory-layout">
            {renderHeader()}
            {renderFilters()}
            <div style={{ minHeight: 'calc(100vh - 200px)' }}>
              {children}
            </div>
          </div>
        </Col>
      );
    }

    return (
      <Col span={mainContentCol}>
        <div className="inventory-layout">
          {renderHeader()}
          {renderFilters()}
          <div style={{ minHeight: 'calc(100vh - 200px)' }}>
            {children}
          </div>
        </div>
      </Col>
    );
  };

  // 渲染布局控制按钮
  const renderLayoutControls = () => {
    if (!isDesktop && !siderContent) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 999,
      }}>
        <Space direction="vertical">
          {siderContent && isDesktop && (
            <Button
              type="primary"
              icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSiderCollapsed(!siderCollapsed)}
              style={{ borderRadius: 6 }}
            />
          )}
          <BackTop>
            <Button
              type="primary"
              icon={<ArrowUpOutlined />}
              shape="circle"
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
            />
          </BackTop>
        </Space>
      </div>
    );
  };

  // 主渲染逻辑
  if (isMobile || !siderContent) {
    // 移动端或无侧边栏：单列布局
    return (
      <Layout className={className}>
        <Content style={{ padding: isMobile ? 8 : 16 }}>
          {renderMainContent()}
        </Content>
        {renderLayoutControls()}
        {showUserSelector && isMobile && (
          <div style={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 999,
          }}>
            <UserRoleSelector compact />
          </div>
        )}
      </Layout>
    );
  }

  // 桌面端：双列布局
  return (
    <Layout className={className}>
      <Content style={{ padding: 16 }}>
        <Row gutter={16}>
          {renderMainContent()}
          {renderSider()}
        </Row>
      </Content>
      {renderLayoutControls()}
    </Layout>
  );
};

// 特殊的库存管理布局组件
export const InventoryLayout: React.FC<ResponsiveLayoutProps> = (props) => {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveLayout
      {...props}
      title="库存管理"
      subtitle="实时库存数据查询和管理"
      showUserSelector={!isMobile}
      showBreadcrumb={true}
    />
  );
};

// 统计卡片布局
export const StatisticsLayout: React.FC<{
  children: React.ReactNode;
  columns?: number;
}> = ({ children, columns = 4 }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const responsiveColumns = isMobile ? 1 : isTablet ? 2 : columns;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {React.Children.map(children, (child, index) => (
        <Col
          key={index}
          span={24 / responsiveColumns}
          xs={24}
          sm={12}
          md={8}
          lg={6}
        >
          {child}
        </Col>
      ))}
    </Row>
  );
};

// 表单布局组件
export const FormLayout: React.FC<{
  children: React.ReactNode;
  layout?: 'horizontal' | 'vertical' | 'inline';
  columns?: number;
}> = ({ children, layout = 'vertical', columns = 2 }) => {
  const { isMobile, isTablet } = useResponsive();

  const responsiveColumns = isMobile ? 1 : isTablet ? 1 : columns;
  const formLayout = isMobile ? 'vertical' : layout;

  return (
    <div data-layout={formLayout} data-columns={responsiveColumns}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;