/**
 * @spec D002-process-flow-map
 * 视图切换组件 - 标签页式按钮组
 */
import React from 'react';
import { Button } from 'antd';
import { ViewType } from '@/types/view';
import './ViewSwitcher.css';

interface ViewSwitcherProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="view-switcher">
      <Button
        type={activeView === ViewType.PANORAMA ? 'primary' : 'default'}
        onClick={() => onViewChange(ViewType.PANORAMA)}
        className={activeView === ViewType.PANORAMA ? 'active' : ''}
        size="large"
      >
        全景视图
      </Button>
      <Button
        type={activeView === ViewType.PROCESS ? 'primary' : 'default'}
        onClick={() => onViewChange(ViewType.PROCESS)}
        className={activeView === ViewType.PROCESS ? 'active' : ''}
        size="large"
      >
        流程视图
      </Button>
    </div>
  );
};

export default ViewSwitcher;
