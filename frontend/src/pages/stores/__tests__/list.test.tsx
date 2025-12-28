/**
 * Store List - addressSummary Display Tests
 *
 * @since 020-store-address
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StoreTable from '../components/StoreTable';
import type { Store } from '../types/store.types';

// Mock stores with various address configurations
const mockStores: Store[] = [
  {
    id: 'store-1',
    code: 'STORE001',
    name: '北京朝阳店',
    region: '',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    address: '建国路88号',
    phone: '13800138000',
    addressSummary: '北京市 朝阳区',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'store-2',
    code: 'STORE002',
    name: '上海浦东店',
    region: '华东区',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    address: '',
    phone: '',
    addressSummary: '上海市 浦东新区',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'store-3',
    code: 'STORE003',
    name: '深圳南山店',
    region: '',
    province: '',
    city: '',
    district: '',
    address: '',
    phone: '',
    addressSummary: '',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('StoreTable - addressSummary 显示', () => {
  describe('区域列显示', () => {
    it('当 region 有值时应该显示 region', () => {
      render(<StoreTable stores={[mockStores[1]]} />);
      expect(screen.getByText('华东区')).toBeInTheDocument();
    });

    it('当 region 为空但 city 有值时应该显示 city', () => {
      render(<StoreTable stores={[mockStores[0]]} />);
      expect(screen.getByText('北京市')).toBeInTheDocument();
    });

    it('当 region 和 city 都为空时应该显示 "-"', () => {
      render(<StoreTable stores={[mockStores[2]]} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('地址列显示', () => {
    it('应该显示完整地址信息', () => {
      render(<StoreTable stores={[mockStores[0]]} />);
      // 应该显示 城市 区县 详细地址
      expect(screen.getByText(/北京市/)).toBeInTheDocument();
      expect(screen.getByText(/朝阳区/)).toBeInTheDocument();
    });

    it('没有详细地址时只显示城市区县', () => {
      render(<StoreTable stores={[mockStores[1]]} />);
      expect(screen.getByText(/上海市/)).toBeInTheDocument();
      expect(screen.getByText(/浦东新区/)).toBeInTheDocument();
    });

    it('无地址信息时应该显示"未配置"', () => {
      render(<StoreTable stores={[mockStores[2]]} />);
      expect(screen.getByText('未配置')).toBeInTheDocument();
    });
  });

  describe('操作列', () => {
    it('应该显示地址编辑按钮', () => {
      render(<StoreTable stores={[mockStores[0]]} />);
      expect(screen.getByText('地址')).toBeInTheDocument();
    });

    it('点击地址按钮应该触发 onEdit 回调', () => {
      const onEdit = vi.fn();
      render(<StoreTable stores={[mockStores[0]]} onEdit={onEdit} />);
      
      const editButton = screen.getByRole('button', { name: /编辑.*地址/i });
      editButton.click();
      
      expect(onEdit).toHaveBeenCalledWith(mockStores[0]);
    });
  });

  describe('表格渲染', () => {
    it('应该正确渲染门店列表', () => {
      render(<StoreTable stores={mockStores} />);
      
      expect(screen.getByText('北京朝阳店')).toBeInTheDocument();
      expect(screen.getByText('上海浦东店')).toBeInTheDocument();
      expect(screen.getByText('深圳南山店')).toBeInTheDocument();
    });

    it('空数据时应该显示空状态', () => {
      render(<StoreTable stores={[]} />);
      expect(screen.getByText('暂无门店数据')).toBeInTheDocument();
    });

    it('加载状态应该正确显示', () => {
      render(<StoreTable stores={[]} loading={true} />);
      // Ant Design Table 的加载状态会显示 spin
      // 这里只验证表格渲染不报错
    });
  });

  describe('门店编码显示', () => {
    it('门店名称下方应该显示门店编码', () => {
      render(<StoreTable stores={[mockStores[0]]} />);
      expect(screen.getByText('STORE001')).toBeInTheDocument();
    });
  });

  describe('门店状态显示', () => {
    it('启用状态应该显示绿色标签', () => {
      render(<StoreTable stores={[mockStores[0]]} />);
      expect(screen.getByText('启用')).toBeInTheDocument();
    });
  });
});
