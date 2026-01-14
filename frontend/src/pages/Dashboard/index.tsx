/**
 * @spec D001-menu-panel
 * 菜单面板页面 - 泳道架构可视化
 * 
 * 功能：
 * - 按 5 个业务泳道分组展示，支持折叠/展开
 * - 卡片式设计，悬停效果
 * - 响应式布局
 * - 支持权限过滤
 */
import React, { useState, useMemo } from 'react';
import { Typography, Badge } from 'antd';
import { 
  UpOutlined, 
  DownOutlined,
  ArrowRightOutlined,
  ThunderboltFilled,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { BUSINESS_MODULES, SWIMLANE_GROUPS } from '@/constants/modules';
import { filterModulesByPermission } from '@/utils/permission';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [collapsedLanes, setCollapsedLanes] = useState<Set<string>>(new Set());

  // 当前阶段：权限列表为空，返回所有模块
  const userPermissions: string[] = [];

  // 根据权限过滤模块并排序
  const visibleModules = useMemo(() => {
    const filtered = filterModulesByPermission(BUSINESS_MODULES, userPermissions);
    return filtered.sort((a, b) => a.order - b.order);
  }, [userPermissions]);

  // 按泳道分组
  const modulesBySwimlane = useMemo(() => {
    const grouped = new Map<string, typeof visibleModules>();
    
    SWIMLANE_GROUPS.forEach(group => {
      const modules = visibleModules.filter(m => m.swimlane === group.id);
      if (modules.length > 0) {
        grouped.set(group.id, modules);
      }
    });
    
    return grouped;
  }, [visibleModules]);

  const toggleLane = (laneId: string) => {
    const next = new Set(collapsedLanes);
    if (next.has(laneId)) {
      next.delete(laneId);
    } else {
      next.add(laneId);
    }
    setCollapsedLanes(next);
  };

  const getLaneColor = (index: number) => {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
    return colors[index % colors.length];
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
            <Text style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>
              Swimlane-Based Architecture
            </Text>
          </div>
        </div>
      </div>

      {/* Main Flow Area */}
      <div style={{ 
        maxHeight: 700, 
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#fafafa',
      }}>
        {SWIMLANE_GROUPS.map((lane, index) => {
          const modules = modulesBySwimlane.get(lane.id) || [];
          const isCollapsed = collapsedLanes.has(lane.id);
          const laneColor = getLaneColor(index);

          if (modules.length === 0) return null;

          return (
            <div 
              key={lane.id}
              style={{
                borderBottom: '1px solid #e8e8e8',
                transition: 'all 0.3s ease',
                background: isCollapsed ? '#f5f5f5' : '#fff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Lane Header */}
              <div 
                onClick={() => toggleLane(lane.id)}
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: isCollapsed ? '#f5f5f5' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                  borderBottom: isCollapsed ? 'none' : '1px solid #f0f0f0',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isCollapsed ? '#ececec' : '#fafafa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isCollapsed ? '#f5f5f5' : 'rgba(255,255,255,0.8)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${laneColor}15`,
                    color: laneColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 12,
                  }}>
                    {lane.order}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 14, color: '#262626', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {lane.name}
                    </Text>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 10, color: '#bfbfbf', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {modules.length} Nodes
                  </Text>
                  {isCollapsed ? <DownOutlined style={{ fontSize: 14, color: '#8c8c8c' }} /> : <UpOutlined style={{ fontSize: 14, color: '#8c8c8c' }} />}
                </div>
              </div>

              {/* Modules Container */}
              {!isCollapsed && (
                <div style={{
                  padding: '32px 24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 24,
                  transition: 'all 0.3s ease',
                }}>
                  {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <div 
                        key={module.id}
                        style={{
                          width: 260,
                          background: '#fff',
                          border: '1px solid #e8e8e8',
                          borderRadius: 16,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                          e.currentTarget.style.transform = 'translateY(-6px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Module Header */}
                        <div style={{
                          padding: 16,
                          borderBottom: '1px solid #f0f0f0',
                          background: 'linear-gradient(135deg, #fff 0%, #fafafa 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              background: laneColor,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 4px 12px ${laneColor}40`,
                              transition: 'transform 0.3s',
                            }}>
                              <Icon style={{ fontSize: 18 }} />
                            </div>
                            <div>
                              <Text style={{ fontSize: 10, color: '#bfbfbf', fontWeight: 900, letterSpacing: 2, display: 'block', marginBottom: 2 }}>
                                {module.id.toUpperCase().replace(/-/g, '')}
                              </Text>
                              <Text strong style={{ fontSize: 13, color: '#262626' }}>
                                {module.name}
                              </Text>
                            </div>
                          </div>
                          <ArrowRightOutlined 
                            style={{ fontSize: 14, color: '#bfbfbf' }}
                            onClick={() => navigate(module.defaultPath)}
                          />
                        </div>

                        {/* Module Items */}
                        <div style={{ padding: 12 }}>
                          {module.functionLinks.slice(0, 4).map((link, idx) => (
                            <div
                              key={idx}
                              onClick={() => navigate(link.path)}
                              style={{
                                padding: '8px 12px',
                                fontSize: 11,
                                color: '#595959',
                                borderRadius: 8,
                                marginBottom: 6,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e6f7ff';
                                e.currentTarget.style.color = '#1890ff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#595959';
                              }}
                            >
                              <span style={{ fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {link.name}
                              </span>
                              {link.badge && (
                                <Badge 
                                  count={link.badge} 
                                  style={{ 
                                    background: '#ff4d4f',
                                    fontSize: 10,
                                    height: 16,
                                    lineHeight: '16px',
                                    minWidth: 16,
                                  }} 
                                />
                              )}
                            </div>
                          ))}
                          
                          <div style={{
                            paddingTop: 12,
                            marginTop: 6,
                            borderTop: '1px solid #f0f0f0',
                            textAlign: 'center',
                          }}>
                            <Text 
                              onClick={() => navigate(module.defaultPath)}
                              style={{ 
                                fontSize: 10, 
                                color: '#bfbfbf', 
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: 2,
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#1890ff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#bfbfbf';
                              }}
                            >
                              View Details
                            </Text>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Lane Visual Accent */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 4,
                height: '100%',
                background: laneColor,
                opacity: 0.2,
              }} />
            </div>
          );
        })}
      </div>

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
            <span>架构模式：泳道设计 (Swimlane)</span>
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
