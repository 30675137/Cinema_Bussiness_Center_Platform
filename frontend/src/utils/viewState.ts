/**
 * @spec D002-process-flow-map
 * 视图状态管理工具
 */
import { ViewType, ViewState } from '@/types/view';
import { PROCESS_STAGES } from '@/constants/processStages';
import type { ModuleCard } from '@/types/module';

const SESSION_KEY = 'dashboard-view-state';

export function saveViewState(state: Partial<ViewState>): void {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    const current = saved ? JSON.parse(saved) : {};
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      ...current,
      activeView: state.activeView,
      collapsedLanes: state.collapsedLanes ? Array.from(state.collapsedLanes) : current.collapsedLanes,
      collapsedStages: state.collapsedStages ? Array.from(state.collapsedStages) : current.collapsedStages,
    }));
  } catch (e) {
    console.error('Failed to save view state:', e);
  }
}

export function loadViewState(): Partial<ViewState> | null {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    return {
      activeView: parsed.activeView || ViewType.PANORAMA,
      collapsedLanes: new Set(parsed.collapsedLanes || []),
      collapsedStages: new Set(parsed.collapsedStages || []),
    };
  } catch (e) {
    console.error('Failed to load view state:', e);
    return null;
  }
}

export function getModulesByStage(stageId: string, allModules: ModuleCard[]): ModuleCard[] {
  const stage = PROCESS_STAGES.find(s => s.id === stageId);
  if (!stage) return [];
  return allModules.filter(m => stage.moduleIds.includes(m.id));
}
