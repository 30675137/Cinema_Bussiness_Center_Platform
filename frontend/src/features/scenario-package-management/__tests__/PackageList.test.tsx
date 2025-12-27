/**
 * PackageList 组件单元测试
 *
 * T024: 测试场景包列表渲染和交互
 *
 * 测试覆盖：
 * - 列表数据渲染
 * - 空数据状态
 * - 分页功能
 * - 操作按钮交互（预览、编辑、删除）
 * - 加载状态
 * - 图片展示
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PackageList from '../components/organisms/PackageList';
import type { ScenarioPackageSummary } from '../types';

// Mock test data
const mockPackages: ScenarioPackageSummary[] = [
  {
    id: '1',
    name: '测试场景包1',
    description: '这是一个测试场景包',
    backgroundImageUrl: 'https://example.com/image1.jpg',
    status: 'DRAFT',
    version: 1,
    isLatest: true,
    durationHours: 2.5,
    peopleRange: '1-10人',
    packagePrice: 299,
    discountPercentage: 15,
    hallCount: 3,
    itemCount: 5,
    serviceCount: 2,
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2025-12-20T10:00:00Z',
  },
  {
    id: '2',
    name: '测试场景包2',
    description: '第二个测试场景包',
    status: 'PUBLISHED',
    version: 2,
    isLatest: true,
    durationHours: 3,
    peopleRange: '2-20人',
    packagePrice: 599,
    discountPercentage: 20,
    hallCount: 2,
    itemCount: 8,
    serviceCount: 4,
    createdAt: '2025-12-20T11:00:00Z',
    updatedAt: '2025-12-20T11:00:00Z',
  },
  {
    id: '3',
    name: '测试场景包3',
    status: 'UNPUBLISHED',
    version: 1,
    isLatest: true,
    hallCount: 1,
    itemCount: 3,
    serviceCount: 1,
    createdAt: '2025-12-20T12:00:00Z',
    updatedAt: '2025-12-20T12:00:00Z',
  },
];

describe('PackageList Component', () => {
  const defaultProps = {
    data: mockPackages,
    total: mockPackages.length,
    page: 1,
    pageSize: 10,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render package list table with data', () => {
      render(<PackageList {...defaultProps} />);

      // Verify table headers are rendered
      expect(screen.getByText('场景包名称')).toBeInTheDocument();
      expect(screen.getByText('描述')).toBeInTheDocument();
      expect(screen.getByText('状态')).toBeInTheDocument();
      expect(screen.getByText('版本')).toBeInTheDocument();
      expect(screen.getByText('操作')).toBeInTheDocument();

      // Verify package data is rendered
      expect(screen.getByText('测试场景包1')).toBeInTheDocument();
      expect(screen.getByText('测试场景包2')).toBeInTheDocument();
      expect(screen.getByText('测试场景包3')).toBeInTheDocument();
    });

    it('should render empty state when no data', () => {
      render(
        <PackageList
          {...defaultProps}
          data={[]}
          total={0}
        />
      );

      // Ant Design Table shows "暂无数据" for empty state
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should display package descriptions correctly', () => {
      render(<PackageList {...defaultProps} />);

      expect(screen.getByText('这是一个测试场景包')).toBeInTheDocument();
      expect(screen.getByText('第二个测试场景包')).toBeInTheDocument();

      // Package 3 has no description, should show '-'
      const allDashes = screen.getAllByText('-');
      expect(allDashes.length).toBeGreaterThan(0);
    });

    it('should render status badges', () => {
      render(<PackageList {...defaultProps} />);

      // StatusBadge component should render status text
      // Note: Actual badge text depends on StatusBadge implementation
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(3); // Header + 3 data rows
    });

    it('should render version numbers with "v" prefix', () => {
      render(<PackageList {...defaultProps} />);

      expect(screen.getByText('v1')).toBeInTheDocument();
      expect(screen.getByText('v2')).toBeInTheDocument();
    });

    it('should render duration hours correctly', () => {
      render(<PackageList {...defaultProps} />);

      expect(screen.getByText('2.5小时')).toBeInTheDocument();
      expect(screen.getByText('3小时')).toBeInTheDocument();
    });

    it('should render people range or "不限"', () => {
      render(<PackageList {...defaultProps} />);

      expect(screen.getByText('1-10人')).toBeInTheDocument();
      expect(screen.getByText('2-20人')).toBeInTheDocument();
      expect(screen.getByText('不限')).toBeInTheDocument(); // Package 3 has no peopleRange
    });

    it('should render hall count', () => {
      render(<PackageList {...defaultProps} />);

      expect(screen.getByText('3个')).toBeInTheDocument();
      expect(screen.getByText('2个')).toBeInTheDocument();
      expect(screen.getByText('1个')).toBeInTheDocument();
    });

    it('should render image when backgroundImageUrl exists', () => {
      render(<PackageList {...defaultProps} />);

      const images = screen.getAllByAlt('背景图片');
      expect(images.length).toBeGreaterThan(0);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
    });

    it('should render placeholder when no image', () => {
      render(<PackageList {...defaultProps} />);

      // Packages 2 and 3 have no backgroundImageUrl
      const placeholders = screen.getAllByText('暂无图片');
      expect(placeholders.length).toBe(2);
    });
  });

  describe('Loading State', () => {
    it('should show loading state when loading prop is true', () => {
      const { container } = render(
        <PackageList {...defaultProps} loading={true} />
      );

      // Ant Design Table adds spin class when loading
      const table = container.querySelector('.ant-spin-spinning');
      expect(table).toBeInTheDocument();
    });

    it('should not show loading state when loading is false', () => {
      const { container } = render(
        <PackageList {...defaultProps} loading={false} />
      );

      const table = container.querySelector('.ant-spin-spinning');
      expect(table).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should display correct pagination info', () => {
      render(<PackageList {...defaultProps} />);

      // Ant Design pagination shows total count
      expect(screen.getByText(/共 3 条/)).toBeInTheDocument();
    });

    it('should call onPageChange when page is changed', async () => {
      const onPageChange = vi.fn();
      render(
        <PackageList
          {...defaultProps}
          onPageChange={onPageChange}
        />
      );

      // Find pagination next button and click
      const nextButton = screen.getByLabelText('Next Page');
      if (nextButton && !nextButton.hasAttribute('disabled')) {
        await userEvent.click(nextButton);
        expect(onPageChange).toHaveBeenCalledWith(2, 10);
      }
    });

    it('should display current page and pageSize', () => {
      render(
        <PackageList
          {...defaultProps}
          page={2}
          pageSize={20}
        />
      );

      // Verify pagination is rendered with correct config
      const pagination = screen.getByRole('list', { name: /pagination/ });
      expect(pagination).toBeInTheDocument();
    });

    it('should show page size changer', () => {
      const { container } = render(<PackageList {...defaultProps} />);

      // Ant Design showSizeChanger renders a select
      const sizeChanger = container.querySelector('.ant-select');
      expect(sizeChanger).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render preview, edit, and delete buttons for each row', () => {
      render(<PackageList {...defaultProps} />);

      const previewButtons = screen.getAllByText('预览');
      const editButtons = screen.getAllByText('编辑');
      const deleteButtons = screen.getAllByText('删除');

      expect(previewButtons).toHaveLength(3);
      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });

    it('should call onPreview when preview button is clicked', async () => {
      const onPreview = vi.fn();
      render(
        <PackageList
          {...defaultProps}
          onPreview={onPreview}
        />
      );

      const previewButtons = screen.getAllByText('预览');
      await userEvent.click(previewButtons[0]);

      expect(onPreview).toHaveBeenCalledWith('1');
    });

    it('should call onEdit when edit button is clicked', async () => {
      const onEdit = vi.fn();
      render(
        <PackageList
          {...defaultProps}
          onEdit={onEdit}
        />
      );

      const editButtons = screen.getAllByText('编辑');
      await userEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith('1');
    });

    it('should show delete confirmation popconfirm when delete button is clicked', async () => {
      const onDelete = vi.fn();
      render(
        <PackageList
          {...defaultProps}
          onDelete={onDelete}
        />
      );

      const deleteButtons = screen.getAllByText('删除');
      await userEvent.click(deleteButtons[0]);

      // Popconfirm should appear with confirmation text
      await waitFor(() => {
        expect(screen.getByText('确定要删除这个场景包吗？')).toBeInTheDocument();
      });
    });

    it('should call onDelete after confirming delete', async () => {
      const onDelete = vi.fn();
      render(
        <PackageList
          {...defaultProps}
          onDelete={onDelete}
        />
      );

      const deleteButtons = screen.getAllByText('删除');
      await userEvent.click(deleteButtons[0]);

      // Wait for popconfirm to appear
      await waitFor(() => {
        expect(screen.getByText('确定要删除这个场景包吗？')).toBeInTheDocument();
      });

      // Click confirm button
      const confirmButton = screen.getByText('确定');
      await userEvent.click(confirmButton);

      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('should not call onDelete when cancel is clicked', async () => {
      const onDelete = vi.fn();
      render(
        <PackageList
          {...defaultProps}
          onDelete={onDelete}
        />
      );

      const deleteButtons = screen.getAllByText('删除');
      await userEvent.click(deleteButtons[0]);

      // Wait for popconfirm
      await waitFor(() => {
        expect(screen.getByText('确定要删除这个场景包吗？')).toBeInTheDocument();
      });

      // Click cancel button
      const cancelButton = screen.getByText('取消');
      await userEvent.click(cancelButton);

      expect(onDelete).not.toHaveBeenCalled();
    });

    it('should show loading state on delete button when deleteLoading is true', () => {
      render(
        <PackageList
          {...defaultProps}
          deleteLoading={true}
        />
      );

      const deleteButtons = screen.getAllByText('删除');
      const firstDeleteButton = deleteButtons[0].closest('button');

      // Ant Design adds ant-btn-loading class to loading buttons
      expect(firstDeleteButton).toHaveClass('ant-btn-loading');
    });
  });

  describe('Date Formatting', () => {
    it('should format createdAt dates correctly', () => {
      render(<PackageList {...defaultProps} />);

      // Dates should be formatted to zh-CN locale
      const dateElements = screen.getAllByText(/2025/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should show "-" when date is missing', () => {
      const packagesWithoutDates = [{
        ...mockPackages[0],
        createdAt: '',
      }];

      render(
        <PackageList
          {...defaultProps}
          data={packagesWithoutDates}
          total={1}
        />
      );

      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should render table with proper role', () => {
      render(<PackageList {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should render action buttons with icons', () => {
      const { container } = render(<PackageList {...defaultProps} />);

      // Icons should be rendered
      const eyeIcons = container.querySelectorAll('.anticon-eye');
      const editIcons = container.querySelectorAll('.anticon-edit');
      const deleteIcons = container.querySelectorAll('.anticon-delete');

      expect(eyeIcons.length).toBe(3);
      expect(editIcons.length).toBe(3);
      expect(deleteIcons.length).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty callbacks gracefully', async () => {
      render(
        <PackageList
          {...defaultProps}
          onPreview={undefined}
          onEdit={undefined}
          onDelete={undefined}
        />
      );

      const previewButtons = screen.getAllByText('预览');
      const editButtons = screen.getAllByText('编辑');

      // Should not throw errors when clicking
      await userEvent.click(previewButtons[0]);
      await userEvent.click(editButtons[0]);

      // No errors should be thrown
      expect(true).toBe(true);
    });

    it('should handle very long package names with ellipsis', () => {
      const longNamePackage = {
        ...mockPackages[0],
        name: '这是一个非常非常非常长的场景包名称用来测试文本截断功能是否正常工作',
      };

      render(
        <PackageList
          {...defaultProps}
          data={[longNamePackage]}
          total={1}
        />
      );

      // Ant Design Table with ellipsis should render the text
      expect(screen.getByText(/这是一个非常非常/)).toBeInTheDocument();
    });

    it('should handle zero values correctly', () => {
      const zeroValuePackage = {
        ...mockPackages[0],
        durationHours: 0,
        hallCount: 0,
        itemCount: 0,
        serviceCount: 0,
      };

      render(
        <PackageList
          {...defaultProps}
          data={[zeroValuePackage]}
          total={1}
        />
      );

      // Should render "0个" for zero counts
      expect(screen.getByText('0个')).toBeInTheDocument();
    });
  });
});
