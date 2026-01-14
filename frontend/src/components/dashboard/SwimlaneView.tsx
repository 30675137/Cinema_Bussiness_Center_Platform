/**
 * @spec D002-process-flow-map
 * 泳道视图组件 - 从 Dashboard 拆分的泳道架构可视化
 */
import React, { useState, useMemo } from 'react';
import { Typography, Badge } from 'antd';
import { 
  UpOutlined, 
  DownOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { BUSINESS_MODULES, SWIMLANE_GROUPS } from '@/constants/modules';
import { filterModulesByPermission } from '@/utils/permission';

const { Text } = Typography;

const SwimlaneView: React.FC = React.memo(() => {
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
                        {module.functionLinks.slice(0, 4).map((link, idx) => {
                          const isDisabled = link.enabled === false;
                          return (
                            <div
                              key={idx}
                              onClick={() => !isDisabled && navigate(link.path)}
                              style={{
                                padding: '8px 12px',
                                fontSize: 11,
                                color: isDisabled ? '#d9d9d9' : '#595959',
                                fontWeight: isDisabled ? 'normal' : 500,
                                borderRadius: 8,
                                marginBottom: 6,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                textDecoration: isDisabled ? 'line-through' : 'none',
                                opacity: isDisabled ? 0.5 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (!isDisabled) {
                                  e.currentTarget.style.background = '#e6f7ff';
                                  e.currentTarget.style.color = '#1890ff';
                                  e.currentTarget.style.fontWeight = '600';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isDisabled) {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = '#595959';
                                  e.currentTarget.style.fontWeight = '500';
                                }
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflow: 'hidden' }}>
                                <span style={{ fontSize: 10 }}>{isDisabled ? '○' : '•'}</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {link.name}
                                </span>
                              </span>
                              {isDisabled && (
                                <span style={{ 
                                  fontSize: 9, 
                                  color: '#999', 
                                  background: '#f5f5f5',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  marginLeft: 4,
                                }}>
                                  未开发
                                </span>
                              )}
                              {!isDisabled && link.badge && (
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
                          );
                        })}
                        
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
  );
});

SwimlaneView.displayName = 'SwimlaneView';

export default SwimlaneView;
