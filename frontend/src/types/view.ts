/**
 * @spec D002-process-flow-map
 * 视图类型定义
 */

export enum ViewType {
  PANORAMA = 'panorama',
  PROCESS = 'process',
}

export interface ViewState {
  activeView: ViewType;
  collapsedLanes: Set<string>;
  collapsedStages: Set<string>;
  scrollPosition: {
    panorama: number;
    process: number;
  };
}

export interface ProcessStage {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  moduleIds: string[];
  color?: string;
  collapsible: boolean;
  defaultCollapsed: boolean;
}

export const DEFAULT_VIEW_STATE: ViewState = {
  activeView: ViewType.PANORAMA,
  collapsedLanes: new Set(),
  collapsedStages: new Set(),
  scrollPosition: { panorama: 0, process: 0 },
};
