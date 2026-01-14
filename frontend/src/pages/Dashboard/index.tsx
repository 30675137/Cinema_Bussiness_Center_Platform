/**
 * @spec D002-process-flow-map
 * Dashboard 页面 - 支持泳道视图和流程视图切换
 * 
 * 功能：
 * - 双视图切换：泳道架构视图（D001）+ 流程地图视图（D002）
 * - 视图状态持久化（sessionStorage）
 * - 标签页式视图切换器
 * - 支持权限过滤
 */
import React, { useState, useMemo, useEffect } from 'react';
import { Typography } from 'antd';
import { 
  ThunderboltFilled,
  ApartmentOutlined,
} from '@ant-design/icons';
import { BUSINESS_MODULES } from '@/constants/modules';
import { filterModulesByPermission } from '@/utils/permission';
import { ViewType } from '@/types/view';
import { saveViewState, loadViewState } from '@/utils/viewState';
import ViewSwitcher from '@/components/common/ViewSwitcher';
import SwimlaneView from '@/components/dashboard/SwimlaneView';
import ProcessFlowView from '@/components/dashboard/ProcessFlowView';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  // 视图状态管理
  const [activeView, setActiveView] = useState<ViewType>(ViewType.PANORAMA);

  // 当前阶段：权限列表为空，返回所有模块
  const userPermissions: string[] = [];

  // 根据权限过滤模块并排序
  const visibleModules = useMemo(() => {
    const filtered = filterModulesByPermission(BUSINESS_MODULES, userPermissions);
    return filtered.sort((a, b) => a.order - b.order);
  }, [userPermissions]);

  // 恢复视图状态（从 sessionStorage）
  useEffect(() => {
    const savedState = loadViewState();
    if (savedState?.activeView) {
      setActiveView(savedState.activeView);
    }
  }, []);

  // 视图切换处理
  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    saveViewState({ activeView: view });
  };

  return (
    <div style={{ 
      width: '100%', 
      background: '#fff', 
      borderRadius: 24, 
      border: '1px solid #e8e8e8',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: '#fff',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            background: '#1890ff',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(24,144,255,0.4)',
          }}>
            <ApartmentOutlined style={{ fontSize: 22 }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 700 }}>
              业务全景中台服务地图
            </Title>
            <Typography.Text style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>
              {activeView === ViewType.PANORAMA ? 'Swimlane-Based Architecture' : 'Sequential Value Chain Workflow'}
            </Typography.Text>
          </div>
        </div>
        
        {/* 视图切换器 */}
        <ViewSwitcher activeView={activeView} onViewChange={handleViewChange} />
      </div>

      {/* 视图内容区域 */}
      {activeView === ViewType.PANORAMA ? (
        <SwimlaneView />
      ) : (
        <ProcessFlowView />
      )}

      {/* Footer */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderTop: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#94a3b8',
      }}>
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            <ThunderboltFilled style={{ fontSize: 14, color: '#fbbf24' }} />
            <span>核心服务单元：{visibleModules.length}/{BUSINESS_MODULES.length} 在线</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            <ApartmentOutlined style={{ fontSize: 14, color: '#60a5fa' }} />
            <span>架构模式：{activeView === ViewType.PANORAMA ? '泳道设计 (Swimlane)' : '流程链条 (Process Flow)'}</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: '#64748b' }}>
          © 2025 Cinema Business Center Platform
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
