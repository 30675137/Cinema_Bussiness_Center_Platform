import React, { createContext, useContext, useEffect, useRef } from 'react';
import PerformanceMonitor from './PerformanceMonitor';

interface PerformanceContextType {
  monitor: PerformanceMonitor;
  recordAPICall: (endpoint: string, duration: number, status: number) => void;
  recordComponentRender: (componentName: string, renderTime: number, mountTime: number) => void;
  recordMemoryUsage: () => void;
  getMetrics: () => any;
  getAlerts: () => any[];
  getWebVitals: () => any;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const monitorRef = useRef<PerformanceMonitor>(PerformanceMonitor.getInstance());

  useEffect(() => {
    const monitor = monitorRef.current;

    // 定期记录内存使用情况
    const memoryInterval = setInterval(() => {
      monitor.recordMemoryUsage();
    }, 10000); // 每10秒记录一次

    // 页面卸载时清理
    const handleBeforeUnload = () => {
      monitor.destroy();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(memoryInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const contextValue: PerformanceContextType = {
    monitor: monitorRef.current,
    recordAPICall: (endpoint: string, duration: number, status: number) => {
      monitorRef.current.recordAPICall(endpoint, duration, status);
    },
    recordComponentRender: (componentName: string, renderTime: number, mountTime: number) => {
      monitorRef.current.recordComponentRender(componentName, renderTime, mountTime);
    },
    recordMemoryUsage: () => {
      monitorRef.current.recordMemoryUsage();
    },
    getMetrics: () => monitorRef.current.getMetrics(),
    getAlerts: () => monitorRef.current.getAlerts(),
    getWebVitals: () => monitorRef.current.getWebVitals(),
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};