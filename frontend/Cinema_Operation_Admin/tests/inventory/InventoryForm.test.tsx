/**
 * 库存表单组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import InventoryForm from '@/components/inventory/InventoryForm';
import { useInventoryStore } from '@/stores/inventoryStore';
import { InventoryItem, InventoryStatus, Location } from '@/types/inventory';

// Mock the store
vi.mock('@/stores/inventoryStore');

// Mock message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  };
});

const mockInventoryStore = vi.mocked(useInventoryStore);

describe('InventoryForm', () => {
  const mockEditingRecord: InventoryItem = {
    id: '1',
    productId: 'PRD001',
    productCode: 'PRD001',
    productName: '测试商品',
    productCategory: '食品',
    productSpec: '500g/包',
    unit: '个',
    locationId: 'LOC001',
    locationName: '仓库A-货架1',
    currentStock: 100,
    minStock: 20,
    maxStock: 500,
    safeStock: 30,
    averageCost: 15.50,
    totalValue: 1550,
    status: InventoryStatus.IN_STOCK,
    lastInboundDate: '2024-01-01',
    lastOutboundDate: '2024-01-05',
    lastUpdated: '2024-01-10T10:00:00Z',
  };

  const mockLocations: Location[] = [
    {
      id: 'LOC001',
      name: '仓库A-货架1',
      code: 'WH-A-S1',
      type: 'shelf',
      capacity: 1000,
      description: '主要存储区',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'LOC002',
      name: '仓库B-货架2',
      code: 'WH-B-S2',
      type: 'shelf',
      capacity: 800,
      description: '饮料存储区',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockInventoryStore.mockReturnValue({
      createInventoryItem: vi.fn(),
      updateInventoryItem: vi.fn(),
      fetchLocations: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      visible: true,
      onCancel: vi.fn(),
      onSuccess: vi.fn(),
      editingRecord: null,
    };

    return render(
      <ConfigProvider locale={zhCN}>
        <InventoryForm {...defaultProps} {...props} />
      </ConfigProvider>
    );
  };

  describe('新建模式', () => {
    it('应该正确渲染新建表单', () => {
      renderComponent();

      expect(screen.getByText('新建库存项')).toBeInTheDocument();
      expect(screen.getByLabelText('商品ID')).toBeInTheDocument();
      expect(screen.getByLabelText('存储位置')).toBeInTheDocument();
      expect(screen.getByLabelText('当前库存')).toBeInTheDocument();
      expect(screen.getByLabelText('最小库存')).toBeInTheDocument();
      expect(screen.getByLabelText('最大库存')).toBeInTheDocument();
      expect(screen.getByLabelText('安全库存')).toBeInTheDocument();
      expect(screen.getByLabelText('平均成本')).toBeInTheDocument();
    });

    it('应该显示正确的表单标题', () => {
      renderComponent();

      expect(screen.getByText('新建库存项')).toBeInTheDocument();
    });

    it('应该重置表单字段', () => {
      renderComponent();

      expect(screen.getByLabelText('商品ID')).toHaveValue('');
      expect(screen.getByLabelText('当前库存')).toHaveValue(null);
      expect(screen.getByLabelText('最小库存')).toHaveValue(null);
      expect(screen.getByLabelText('最大库存')).toHaveValue(null);
      expect(screen.getByLabelText('安全库存')).toHaveValue(null);
      expect(screen.getByLabelText('平均成本')).toHaveValue(null);
    });

    it('应该能够提交新建表单', async () => {
      const { createInventoryItem } = mockInventoryStore();
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      createInventoryItem.mockResolvedValue(mockEditingRecord);

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      // 填写表单
      const productIdInput = screen.getByLabelText('商品ID');
      const locationSelect = screen.getByLabelText('存储位置');
      const currentStockInput = screen.getByLabelText('当前库存');
      const minStockInput = screen.getByLabelText('最小库存');
      const maxStockInput = screen.getByLabelText('最大库存');
      const safeStockInput = screen.getByLabelText('安全库存');
      const averageCostInput = screen.getByLabelText('平均成本');

      await userEvent.type(productIdInput, 'PRD001');
      await userEvent.type(currentStockInput, '100');
      await userEvent.type(minStockInput, '20');
      await userEvent.type(maxStockInput, '500');
      await userEvent.type(safeStockInput, '30');
      await userEvent.type(averageCostInput, '15.5');

      // 选择位置
      await userEvent.click(locationSelect);
      const locationOption = screen.getByText('仓库A-货架1');
      await userEvent.click(locationOption);

      // 提交表单
      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      expect(createInventoryItem).toHaveBeenCalledWith({
        productId: 'PRD001',
        locationId: 'LOC001',
        initialStock: 100,
        minStock: 20,
        maxStock: 500,
        safeStock: 30,
        averageCost: 15.5,
        remark: '',
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('应该在成功创建后显示成功消息', async () => {
      const { createInventoryItem } = mockInventoryStore();
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      createInventoryItem.mockResolvedValue(mockEditingRecord);

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      // 填写并提交表单
      const productIdInput = screen.getByLabelText('商品ID');
      await userEvent.type(productIdInput, 'PRD001');

      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      expect(message.success).toHaveBeenCalledWith('库存项创建成功');
    });
  });

  describe('编辑模式', () => {
    it('应该正确渲染编辑表单', () => {
      renderComponent({ editingRecord: mockEditingRecord });

      expect(screen.getByText('编辑库存项')).toBeInTheDocument();
      expect(screen.getByText('商品编码: PRD001')).toBeInTheDocument();
      expect(screen.getByLabelText('商品ID')).toHaveValue('PRD001');
      expect(screen.getByLabelText('最小库存')).toHaveValue(20);
      expect(screen.getByLabelText('最大库存')).toHaveValue(500);
      expect(screen.getByLabelText('安全库存')).toHaveValue(30);
      expect(screen.getByLabelText('平均成本')).toHaveValue(15.5);
    });

    it('应该显示正确的编辑标题', () => {
      renderComponent({ editingRecord: mockEditingRecord });

      expect(screen.getByText('编辑库存项')).toBeInTheDocument();
    });

    it('应该能够提交编辑表单', async () => {
      const { updateInventoryItem } = mockInventoryStore();
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      updateInventoryItem.mockResolvedValue(mockEditingRecord);

      renderComponent({
        editingRecord: mockEditingRecord,
        onSuccess: mockOnSuccess,
        onCancel: mockOnCancel
      });

      // 修改表单字段
      const minStockInput = screen.getByLabelText('最小库存');
      const maxStockInput = screen.getByLabelText('最大库存');
      const safeStockInput = screen.getByLabelText('安全库存');
      const averageCostInput = screen.getByLabelText('平均成本');

      await userEvent.clear(minStockInput);
      await userEvent.type(minStockInput, '25');

      await userEvent.clear(maxStockInput);
      await userEvent.type(maxStockInput, '600');

      await userEvent.clear(safeStockInput);
      await userEvent.type(safeStockInput, '35');

      await userEvent.clear(averageCostInput);
      await userEvent.type(averageCostInput, '16');

      // 提交表单
      const submitButton = screen.getByText('更新');
      await userEvent.click(submitButton);

      expect(updateInventoryItem).toHaveBeenCalledWith('1', {
        minStock: 25,
        maxStock: 600,
        safeStock: 35,
        averageCost: 16,
        remark: '',
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('应该在成功更新后显示成功消息', async () => {
      const { updateInventoryItem } = mockInventoryStore();
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      updateInventoryItem.mockResolvedValue(mockEditingRecord);

      renderComponent({
        editingRecord: mockEditingRecord,
        onSuccess: mockOnSuccess,
        onCancel: mockOnCancel
      });

      const submitButton = screen.getByText('更新');
      await userEvent.click(submitButton);

      expect(message.success).toHaveBeenCalledWith('库存项更新成功');
    });
  });

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      // 验证错误消息
      expect(screen.getByText(/请输入商品ID/)).toBeInTheDocument();
      expect(screen.getByText(/请选择存储位置/)).toBeInTheDocument();
      expect(screen.getByText(/请输入当前库存/)).toBeInTheDocument();
      expect(screen.getByText(/请输入最小库存/)).toBeInTheDocument();
      expect(screen.getByText(/请输入最大库存/)).toBeInTheDocument();
      expect(screen.getByText(/请输入安全库存/)).toBeInTheDocument();
      expect(screen.getByText(/请输入平均成本/)).toBeInTheDocument();
    });

    it('应该验证商品ID格式', async () => {
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      const productIdInput = screen.getByLabelText('商品ID');
      await userEvent.type(productIdInput, 'invalid-format');

      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      expect(screen.getByText(/商品ID格式不正确/)).toBeInTheDocument();
    });

    it('应该验证库存范围为正数', async () => {
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      const currentStockInput = screen.getByLabelText('当前库存');
      await userEvent.type(currentStockInput, '-10');

      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      expect(screen.getByText(/库存不能为负数/)).toBeInTheDocument();
    });

    it('应该验证库存范围逻辑', async () => {
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      // 设置最小库存大于最大库存
      const minStockInput = screen.getByLabelText('最小库存');
      const maxStockInput = screen.getByLabelText('最大库存');
      const currentStockInput = screen.getByLabelText('当前库存');

      await userEvent.type(minStockInput, '100');
      await userEvent.type(maxStockInput, '50');
      await userEvent.type(currentStockInput, '75');

      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      expect(screen.getByText(/最小库存不能大于最大库存/)).toBeInTheDocument();
    });

    it('应该验证当前库存不能小于最小库存', async () => {
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      const minStockInput = screen.getByLabelText('最小库存');
      const maxStockInput = screen.getByLabelText('最大库存');
      const currentStockInput = screen.getByLabelText('当前库存');

      await userEvent.type(minStockInput, '50');
      await userEvent.type(maxStockInput, '100');
      await userEvent.type(currentStockInput, '30');

      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      expect(screen.getByText(/当前库存不能小于最小库存/)).toBeInTheDocument();
    });

    it('应该验证当前库存不能大于最大库存', async () => {
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      const minStockInput = screen.getByLabelText('最小库存');
      const maxStockInput = screen.getByLabelText('最大库存');
      const currentStockInput = screen.getByLabelText('当前库存');

      await userEvent.type(minStockInput, '20');
      await userEvent.type(maxStockInput, '50');
      await userEvent.type(currentStockInput, '75');

      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      expect(screen.getByText(/当前库存不能大于最大库存/)).toBeInTheDocument();
    });

    it('应该验证安全库存不能小于最小库存', async () => {
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      const minStockInput = screen.getByLabelText('最小库存');
      const safeStockInput = screen.getByLabelText('安全库存');

      await userEvent.type(minStockInput, '50');
      await userEvent.type(safeStockInput, '30');

      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      expect(screen.getByText(/安全库存不能小于最小库存/)).toBeInTheDocument();
    });

    it('应该验证成本不能为负数', async () => {
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      const averageCostInput = screen.getByLabelText('平均成本');
      await userEvent.type(averageCostInput, '-10');

      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      expect(screen.getByText(/成本不能为负数/)).toBeInTheDocument();
    });
  });

  describe('库存状态显示', () => {
    it('应该实时显示库存状态', async () => {
      renderComponent();

      const minStockInput = screen.getByLabelText('最小库存');
      const maxStockInput = screen.getByLabelText('最大库存');
      const currentStockInput = screen.getByLabelText('当前库存');

      await userEvent.type(minStockInput, '20');
      await userEvent.type(maxStockInput, '100');
      await userEvent.type(currentStockInput, '10');

      // 应该显示库存不足状态
      expect(screen.getByText(/库存不足/)).toBeInTheDocument();
      expect(screen.getByText(/当前库存已低于警戒线/)).toBeInTheDocument();
    });

    it('应该显示库存正常状态', async () => {
      renderComponent();

      const minStockInput = screen.getByLabelText('最小库存');
      const maxStockInput = screen.getByLabelText('最大库存');
      const currentStockInput = screen.getByLabelText('当前库存');

      await userEvent.type(minStockInput, '20');
      await userEvent.type(maxStockInput, '100');
      await userEvent.type(currentStockInput, '50');

      // 应该显示库存健康状态
      expect(screen.getByText(/库存健康/)).toBeInTheDocument();
    });

    it('应该显示库存过量状态', async () => {
      renderComponent();

      const minStockInput = screen.getByLabelText('最小库存');
      const maxStockInput = screen.getByLabelText('最大库存');
      const currentStockInput = screen.getByLabelText('当前库存');

      await userEvent.type(minStockInput, '20');
      await userEvent.type(maxStockInput, '100');
      await userEvent.type(currentStockInput, '100');

      // 应该显示库存过量状态
      expect(screen.getByText(/库存过量/)).toBeInTheDocument();
      expect(screen.getByText(/当前库存已超过最大容量/)).toBeInTheDocument();
    });
  });

  describe('位置选择', () => {
    it('应该显示可用位置列表', async () => {
      const { fetchLocations } = mockInventoryStore();
      fetchLocations.mockResolvedValue(mockLocations);

      renderComponent();

      const locationSelect = screen.getByLabelText('存储位置');
      await userEvent.click(locationSelect);

      expect(screen.getByText('仓库A-货架1')).toBeInTheDocument();
      expect(screen.getByText('仓库B-货架2')).toBeInTheDocument();
      expect(screen.getByText('(WH-A-S1)')).toBeInTheDocument();
      expect(screen.getByText('(WH-B-S2)')).toBeInTheDocument();
    });

    it('应该显示位置状态标签', async () => {
      const { fetchLocations } = mockInventoryStore();
      fetchLocations.mockResolvedValue(mockLocations);

      renderComponent();

      const locationSelect = screen.getByLabelText('存储位置');
      await userEvent.click(locationSelect);

      const locationOption = screen.getByText('仓库A-货架1').closest('.ant-select-option');
      expect(locationOption).toContainHTML('启用');
    });
  });

  describe('取消操作', () => {
    it('应该能够取消表单', async () => {
      const mockOnCancel = vi.fn();

      renderComponent({ onCancel: mockOnCancel });

      const cancelButton = screen.getByText('取消');
      await userEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('应该在取消时重置表单', async () => {
      const mockOnCancel = vi.fn();

      renderComponent({ onCancel: mockOnCancel });

      // 填写一些数据
      const productIdInput = screen.getByLabelText('商品ID');
      await userEvent.type(productIdInput, 'PRD001');

      // 取消表单
      const cancelButton = screen.getByText('取消');
      await userEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理创建失败', async () => {
      const { createInventoryItem } = mockInventoryStore();
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      createInventoryItem.mockRejectedValue(new Error('创建失败'));

      renderComponent({ onSuccess: mockOnSuccess, onCancel: mockOnCancel });

      // 填写表单
      const productIdInput = screen.getByLabelText('商品ID');
      await userEvent.type(productIdInput, 'PRD001');

      const submitButton = screen.getByText('创建');
      await userEvent.click(submitButton);

      expect(message.error).toHaveBeenCalledWith('创建失败');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('应该处理更新失败', async () => {
      const { updateInventoryItem } = mockInventoryStore();
      const mockOnSuccess = vi.fn();
      const mockOnCancel = vi.fn();

      updateInventoryItem.mockRejectedValue(new Error('更新失败'));

      renderComponent({
        editingRecord: mockEditingRecord,
        onSuccess: mockOnSuccess,
        onCancel: mockOnCancel
      });

      const submitButton = screen.getByText('更新');
      await userEvent.click(submitButton);

      expect(message.error).toHaveBeenCalledWith('更新失败');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('应该处理位置加载失败', async () => {
      const { fetchLocations } = mockInventoryStore();
      fetchLocations.mockRejectedValue(new Error('加载位置失败'));

      renderComponent();

      expect(message.error).toHaveBeenCalledWith('获取位置数据失败');
    });
  });

  describe('字段提示', () => {
    it('应该显示商品ID提示', () => {
      renderComponent();

      const productIdInput = screen.getByLabelText('商品ID');
      const infoIcon = productIdInput.parentElement?.querySelector('.anticon-info-circle');

      if (infoIcon) {
        userEvent.hover(infoIcon);
        expect(screen.getByText(/商品唯一标识/)).toBeInTheDocument();
      }
    });

    it('应该显示最小库存提示', () => {
      renderComponent();

      const minStockInput = screen.getByLabelText('最小库存');
      expect(screen.getByText(/低于此值将触发库存预警/)).toBeInTheDocument();
    });

    it('应该显示最大库存提示', () => {
      renderComponent();

      const maxStockInput = screen.getByLabelText('最大库存');
      expect(screen.getByText(/库存容量上限/)).toBeInTheDocument();
    });

    it('应该显示安全库存提示', () => {
      renderComponent();

      const safeStockInput = screen.getByLabelText('安全库存');
      expect(screen.getByText(/建议保持的最低安全库存水平/)).toBeInTheDocument();
    });

    it('应该显示平均成本提示', () => {
      renderComponent();

      const averageCostInput = screen.getByLabelText('平均成本');
      expect(screen.getByText(/商品的平均采购成本，用于库存价值计算/)).toBeInTheDocument();
    });
  });

  describe('备注字段', () => {
    it('应该能够输入备注', async () => {
      renderComponent();

      const remarkTextarea = screen.getByLabelText('备注');
      await userEvent.type(remarkTextarea, '测试备注信息');

      expect(remarkTextarea).toHaveValue('测试备注信息');
    });

    it('应该显示备注提示', () => {
      renderComponent();

      expect(screen.getByText(/可填写特殊说明、管理要求等信息/)).toBeInTheDocument();
    });

    it('应该显示备注字数限制', () => {
      renderComponent();

      const remarkTextarea = screen.getByLabelText('备注');
      const charCount = screen.getByText(/500/);
      expect(charCount).toBeInTheDocument();
    });
  });

  describe('库存管理建议', () => {
    it('应该显示库存管理建议', () => {
      renderComponent();

      expect(screen.getByText('库存管理建议')).toBeInTheDocument();
      expect(screen.getByText('最小库存')).toBeInTheDocument();
      expect(screen.getByText('最大库存')).toBeInTheDocument();
      expect(screen.getByText('安全库存')).toBeInTheDocument();
      expect(screen.getByText('定期盘点')).toBeInTheDocument();
    });
  });

  describe('可见性控制', () => {
    it('应该在不可见时不渲染表单', () => {
      const { container } = renderComponent({ visible: false });

      expect(container.firstChild).toBeNull();
    });

    it('应该从编辑模式切换到新建模式', async () => {
      const { rerender } = renderComponent({ editingRecord: mockEditingRecord });

      // 验证编辑模式
      expect(screen.getByText('编辑库存项')).toBeInTheDocument();

      // 切换到新建模式
      rerender({ editingRecord: null });

      // 验证新建模式
      expect(screen.getByText('新建库存项')).toBeInTheDocument();
    });
  });
});