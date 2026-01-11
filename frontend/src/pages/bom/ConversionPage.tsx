/**
 * 单位换算管理页面
 * P002-unit-conversion
 *
 * 路由: /bom/conversion
 *
 * 键盘快捷键 (WCAG 2.1 AA):
 * - N: 新建换算规则
 * - Escape: 关闭模态框
 */

import React, { useEffect, useCallback } from 'react';
import { Card, Typography } from 'antd';
import ConversionStats from '@/features/unit-conversion/components/ConversionStats';
import ConversionList from '@/features/unit-conversion/components/ConversionList';
import ConversionForm from '@/features/unit-conversion/components/ConversionForm';
import ConversionChainGraph from '@/features/unit-conversion/components/ConversionChainGraph';
import ConversionCalculator from '@/features/unit-conversion/components/ConversionCalculator';
import ConversionErrorBoundary from '@/features/unit-conversion/components/ConversionErrorBoundary';
import { useConversionUIStore } from '@/features/unit-conversion/stores/conversionUIStore';

const { Title } = Typography;

const ConversionPage: React.FC = () => {
  const reset = useConversionUIStore((state) => state.reset);
  const openCreateModal = useConversionUIStore((state) => state.openCreateModal);
  const closeModal = useConversionUIStore((state) => state.closeModal);
  const isModalOpen = useConversionUIStore((state) => state.isModalOpen);

  // 键盘快捷键处理
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 忽略输入框内的按键
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          if (!isModalOpen && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            openCreateModal();
          }
          break;
        case 'escape':
          if (isModalOpen) {
            e.preventDefault();
            closeModal();
          }
          break;
      }
    },
    [isModalOpen, openCreateModal, closeModal]
  );

  // 注册/注销键盘事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 离开页面时重置状态
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <ConversionErrorBoundary>
      <div style={{ padding: '24px' }}>
        {/* 页面标题 */}
        <Title level={4} style={{ marginBottom: 24 }}>
          单位换算配置
        </Title>

        {/* 统计卡片 */}
        <ConversionStats />

        {/* 换算规则列表 */}
        <Card>
          <ConversionList />
        </Card>

        {/* 换算路径计算 */}
        <ConversionChainGraph title="换算路径计算" />

        {/* 单位换算计算器 */}
        <ConversionCalculator title="单位换算计算器" />

        {/* 创建/编辑表单模态框 */}
        <ConversionForm />
      </div>
    </ConversionErrorBoundary>
  );
};

export default ConversionPage;
