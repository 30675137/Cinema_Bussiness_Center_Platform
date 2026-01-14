/**
 * @spec D002-process-flow-map
 * 流程视图组件 - 端到端业务流程地图
 */
import React from 'react';
import { ModuleCard } from '@/components/common/ModuleCard';
import { PROCESS_STAGES } from '@/constants/processStages';
import { BUSINESS_MODULES } from '@/constants/modules';
import { getModulesByStage } from '@/utils/viewState';
import './ProcessFlowView.css';

const ProcessFlowView: React.FC = React.memo(() => {
  // 空状态检测
  const hasModules = BUSINESS_MODULES.length > 0;
  
  if (!hasModules) {
    return (
      <div className="process-flow-view">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          color: '#8c8c8c',
        }}>
          <span style={{ fontSize: 64, marginBottom: 16 }}>📁</span>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px 0' }}>暂无业务模块可展示</h3>
          <p style={{ fontSize: 14, margin: 0 }}>No business modules available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="process-flow-view">
      <h2 className="process-title">业务端到端流程地图</h2>
      <p className="process-subtitle">SEQUENTIAL VALUE CHAIN WORKFLOW</p>
      
      {PROCESS_STAGES.map((stage, stageIndex) => {
        const modules = getModulesByStage(stage.id, BUSINESS_MODULES);
        
        return (
          <div key={stage.id} className="process-stage">
            {/* 阶段头部 */}
            <div className="stage-header" style={{ borderLeftColor: stage.color }}>
              <span className="stage-order" style={{ color: stage.color }}>{stage.order}</span>
              <div className="stage-info">
                <h4 className="stage-title">{stage.title}</h4>
                <p className="stage-subtitle">{stage.subtitle}</p>
              </div>
            </div>
            
            {/* 模块卡片 */}
            <div className="stage-modules">
              {modules.map((module, moduleIndex) => (
                <React.Fragment key={module.id}>
                  <div className="module-wrapper">
                    <ModuleCard module={module} data-testid="module-card" />
                  </div>
                  
                  {/* 模块间箭头连接 */}
                  {moduleIndex < modules.length - 1 && (
                    <div className="flow-arrow">
                      <div className="arrow-line" />
                      <div className="arrow-head" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* 阶段间连接线 */}
            {stageIndex < PROCESS_STAGES.length - 1 && (
              <div className="stage-connector">
                <div className="connector-line" style={{ backgroundColor: stage.color }} />
                <div className="connector-arrow" style={{ borderTopColor: stage.color }} />
              </div>
            )}
          </div>
        );
      })}
      
      {/* 流程结束标识 */}
      <div className="process-end">
        <span className="end-icon">🎯</span>
        <span className="end-text">END OF BUSINESS LOOP</span>
      </div>
    </div>
  );
});

ProcessFlowView.displayName = 'ProcessFlowView';

export default ProcessFlowView;
