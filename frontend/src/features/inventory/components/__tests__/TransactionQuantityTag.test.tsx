/**
 * P004-inventory-adjustment: TransactionQuantityTag 组件单元测试
 *
 * 测试入库绿色+/出库红色-的显示逻辑。
 * 实现 T028 任务。
 *
 * @since US2 - 查看库存流水记录
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionQuantityTag } from '../TransactionQuantityTag';

describe('TransactionQuantityTag', () => {
  describe('入库显示（正数）', () => {
    it('应该显示绿色样式和+前缀', () => {
      render(<TransactionQuantityTag quantity={10} unit="个" />);

      const tag = screen.getByText(/\+10/);
      expect(tag).toBeInTheDocument();
      // Ant Design Tag 使用 className 包含颜色
      expect(tag.closest('.ant-tag')).toHaveClass('ant-tag-green');
    });

    it('应该正确显示单位', () => {
      render(<TransactionQuantityTag quantity={5} unit="箱" />);

      expect(screen.getByText(/\+5/)).toBeInTheDocument();
      expect(screen.getByText(/箱/)).toBeInTheDocument();
    });

    it('大数量应该正确显示', () => {
      render(<TransactionQuantityTag quantity={1000} unit="个" />);

      expect(screen.getByText(/\+1000/)).toBeInTheDocument();
    });
  });

  describe('出库显示（负数）', () => {
    it('应该显示红色样式和-前缀', () => {
      render(<TransactionQuantityTag quantity={-10} unit="个" />);

      const tag = screen.getByText(/-10/);
      expect(tag).toBeInTheDocument();
      expect(tag.closest('.ant-tag')).toHaveClass('ant-tag-red');
    });

    it('应该正确显示单位', () => {
      render(<TransactionQuantityTag quantity={-20} unit="瓶" />);

      expect(screen.getByText(/-20/)).toBeInTheDocument();
      expect(screen.getByText(/瓶/)).toBeInTheDocument();
    });
  });

  describe('零值显示', () => {
    it('应该显示默认样式', () => {
      render(<TransactionQuantityTag quantity={0} unit="个" />);

      const tag = screen.getByText(/0/);
      expect(tag).toBeInTheDocument();
      expect(tag.closest('.ant-tag')).toHaveClass('ant-tag-default');
    });
  });

  describe('图标显示', () => {
    it('默认应该显示图标', () => {
      render(<TransactionQuantityTag quantity={10} unit="个" showIcon />);

      // 检查是否有图标元素
      const container = screen.getByText(/\+10/).closest('.ant-tag');
      expect(container?.querySelector('.anticon')).toBeInTheDocument();
    });

    it('showIcon=false 时不显示图标', () => {
      render(<TransactionQuantityTag quantity={10} unit="个" showIcon={false} />);

      const container = screen.getByText(/\+10/).closest('.ant-tag');
      expect(container?.querySelector('.anticon')).not.toBeInTheDocument();
    });
  });

  describe('尺寸变体', () => {
    it('默认尺寸正常渲染', () => {
      render(<TransactionQuantityTag quantity={10} unit="个" size="default" />);
      expect(screen.getByText(/\+10/)).toBeInTheDocument();
    });

    it('小尺寸正常渲染', () => {
      render(<TransactionQuantityTag quantity={10} unit="个" size="small" />);
      expect(screen.getByText(/\+10/)).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('小数应该正确显示', () => {
      render(<TransactionQuantityTag quantity={3.5} unit="kg" />);
      expect(screen.getByText(/\+3\.5/)).toBeInTheDocument();
    });

    it('无单位时只显示数量', () => {
      render(<TransactionQuantityTag quantity={10} unit="" />);
      expect(screen.getByText(/\+10/)).toBeInTheDocument();
    });
  });
});
