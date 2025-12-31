/**
 * TimeSlotsTab 组件
 * 时段模板配置标签页 - 支持周视图和日历覆盖视图
 * Feature: 001-scenario-package-tabs
 */

import React, { useState, useCallback } from 'react';
import { Tabs, message, Modal, Checkbox, Space, Typography } from 'antd';
import { CalendarOutlined, ScheduleOutlined } from '@ant-design/icons';
import { EditableCard } from '../';
import { useScenarioPackageStore } from '../../stores/useScenarioPackageStore';
import {
  useTimeSlotTemplates,
  useCreateTimeSlotTemplate,
  useUpdateTimeSlotTemplate,
  useDeleteTimeSlotTemplate,
} from '../../hooks/useScenarioPackageQueries';
import {
  DAY_OF_WEEK_LABELS,
  type TimeSlotTemplate,
  type TimeSlotOverride,
  type DayOfWeek,
} from '../../types';
import { WeekTemplateView } from '../time-slots/WeekTemplateView';
import { CalendarOverrideView } from '../time-slots/CalendarOverrideView';
import {
  TimeSlotTemplateForm,
  type TimeSlotTemplateFormValues,
} from '../forms/TimeSlotTemplateForm';
import { DateOverrideForm, type DateOverrideFormValues } from '../forms/DateOverrideForm';

const { Text } = Typography;

interface TimeSlotsTabProps {
  /** 场景包ID */
  packageId: string;
  /** 是否加载中 */
  loading?: boolean;
}

/**
 * 时段模板配置标签页
 */
const TimeSlotsTab: React.FC<TimeSlotsTabProps> = ({
  packageId,
  loading: parentLoading = false,
}) => {
  const isDirty = useScenarioPackageStore((state) => state.dirtyTabs.timeslots);
  const setTabDirty = useScenarioPackageStore((state) => state.setTabDirty);

  // 子标签页状态
  const [activeTab, setActiveTab] = useState('week');

  // 时段模板表单状态
  const [templateFormVisible, setTemplateFormVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TimeSlotTemplate | undefined>();
  const [defaultDayOfWeek, setDefaultDayOfWeek] = useState<DayOfWeek>(1);

  // 日期覆盖表单状态
  const [overrideFormVisible, setOverrideFormVisible] = useState(false);
  const [editingOverride, setEditingOverride] = useState<TimeSlotOverride | undefined>();
  const [defaultOverrideDate, setDefaultOverrideDate] = useState<string | undefined>();

  // 复制到其他天 Modal 状态
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [templateToCopy, setTemplateToCopy] = useState<TimeSlotTemplate | undefined>();
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);

  // 查询时段模板数据
  const { data: templates = [], isLoading: templatesLoading } = useTimeSlotTemplates(packageId);
  const createMutation = useCreateTimeSlotTemplate(packageId);
  const updateMutation = useUpdateTimeSlotTemplate(packageId);
  const deleteMutation = useDeleteTimeSlotTemplate(packageId);

  // 日期覆盖数据（暂时使用空数组，后续可接入后端API）
  const overrides: TimeSlotOverride[] = [];

  const loading = parentLoading || templatesLoading;

  // === 时段模板操作 ===

  // 添加时段
  const handleAddTemplate = useCallback((dayOfWeek: DayOfWeek) => {
    setDefaultDayOfWeek(dayOfWeek);
    setEditingTemplate(undefined);
    setTemplateFormVisible(true);
  }, []);

  // 编辑时段
  const handleEditTemplate = useCallback((template: TimeSlotTemplate) => {
    setEditingTemplate(template);
    setTemplateFormVisible(true);
  }, []);

  // 删除时段
  const handleDeleteTemplate = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        message.success('已删除');
        setTabDirty('timeslots', true);
      } catch (error) {
        message.error('删除失败');
      }
    },
    [deleteMutation, setTabDirty]
  );

  // 切换启用状态
  const handleToggleEnabled = useCallback(
    async (id: string, enabled: boolean) => {
      try {
        await updateMutation.mutateAsync({
          templateId: id,
          data: { isEnabled: enabled },
        });
        message.success(enabled ? '已启用' : '已禁用');
        setTabDirty('timeslots', true);
      } catch (error) {
        message.error('操作失败');
      }
    },
    [updateMutation, setTabDirty]
  );

  // 提交时段模板表单
  const handleSubmitTemplate = useCallback(
    async (values: TimeSlotTemplateFormValues) => {
      try {
        const priceAdjustment =
          values.priceAdjustmentType !== 'none' && values.priceAdjustmentValue !== undefined
            ? { type: values.priceAdjustmentType, value: values.priceAdjustmentValue }
            : undefined;

        if (editingTemplate) {
          // 更新
          await updateMutation.mutateAsync({
            templateId: editingTemplate.id,
            data: {
              startTime: values.startTime,
              endTime: values.endTime,
              capacity: values.capacity,
              priceAdjustment,
              isEnabled: values.isEnabled,
            },
          });
          message.success('已更新');
        } else {
          // 创建
          await createMutation.mutateAsync({
            dayOfWeek: values.dayOfWeek,
            startTime: values.startTime,
            endTime: values.endTime,
            capacity: values.capacity,
            priceAdjustment,
            isEnabled: values.isEnabled,
          });
          message.success('已添加');
        }
        setTabDirty('timeslots', true);
        setTemplateFormVisible(false);
      } catch (error) {
        message.error(editingTemplate ? '更新失败' : '添加失败');
        throw error;
      }
    },
    [editingTemplate, createMutation, updateMutation, setTabDirty]
  );

  // 复制到其他天
  const handleCopyToOtherDays = useCallback((template: TimeSlotTemplate) => {
    setTemplateToCopy(template);
    setSelectedDays([]);
    setCopyModalVisible(true);
  }, []);

  // 执行复制
  const handleConfirmCopy = useCallback(async () => {
    if (!templateToCopy || selectedDays.length === 0) return;

    try {
      for (const day of selectedDays) {
        await createMutation.mutateAsync({
          dayOfWeek: day,
          startTime: templateToCopy.startTime,
          endTime: templateToCopy.endTime,
          capacity: templateToCopy.capacity,
          priceAdjustment: templateToCopy.priceAdjustment,
          isEnabled: templateToCopy.isEnabled,
        });
      }
      message.success(`已复制到 ${selectedDays.length} 天`);
      setTabDirty('timeslots', true);
      setCopyModalVisible(false);
    } catch (error) {
      message.error('复制失败');
    }
  }, [templateToCopy, selectedDays, createMutation, setTabDirty]);

  // === 日期覆盖操作 ===

  const handleAddOverride = useCallback((date: string) => {
    setDefaultOverrideDate(date);
    setEditingOverride(undefined);
    setOverrideFormVisible(true);
  }, []);

  const handleEditOverride = useCallback((override: TimeSlotOverride) => {
    setEditingOverride(override);
    setOverrideFormVisible(true);
  }, []);

  const handleDeleteOverride = useCallback(async (id: string) => {
    // TODO: 接入后端 API
    message.info('日期覆盖功能即将上线');
  }, []);

  const handleSubmitOverride = useCallback(async (values: DateOverrideFormValues) => {
    // TODO: 接入后端 API
    message.info('日期覆盖功能即将上线');
    setOverrideFormVisible(false);
  }, []);

  // 可选天列表（排除当前模板所在天）
  const availableDays = templateToCopy
    ? ([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).filter((d) => d !== templateToCopy.dayOfWeek)
    : [];

  return (
    <>
      <EditableCard title="时段配置" description="配置场景包的可预订时段规则" isDirty={isDirty}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'week',
              label: (
                <span>
                  <ScheduleOutlined />
                  周模板
                </span>
              ),
              children: (
                <WeekTemplateView
                  templates={templates}
                  loading={loading}
                  onAdd={handleAddTemplate}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onToggleEnabled={handleToggleEnabled}
                  onCopyToOtherDays={handleCopyToOtherDays}
                />
              ),
            },
            {
              key: 'calendar',
              label: (
                <span>
                  <CalendarOutlined />
                  日期覆盖
                </span>
              ),
              children: (
                <CalendarOverrideView
                  overrides={overrides}
                  loading={loading}
                  onAddOverride={handleAddOverride}
                  onEditOverride={handleEditOverride}
                  onDeleteOverride={handleDeleteOverride}
                />
              ),
            },
          ]}
        />
      </EditableCard>

      {/* 时段模板表单 */}
      <TimeSlotTemplateForm
        visible={templateFormVisible}
        onClose={() => setTemplateFormVisible(false)}
        onSubmit={handleSubmitTemplate}
        initialData={editingTemplate}
        defaultDayOfWeek={defaultDayOfWeek}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* 日期覆盖表单 */}
      <DateOverrideForm
        visible={overrideFormVisible}
        onClose={() => setOverrideFormVisible(false)}
        onSubmit={handleSubmitOverride}
        initialData={editingOverride}
        defaultDate={defaultOverrideDate}
        loading={false}
      />

      {/* 复制到其他天 Modal */}
      <Modal
        title="复制到其他天"
        open={copyModalVisible}
        onCancel={() => setCopyModalVisible(false)}
        onOk={handleConfirmCopy}
        confirmLoading={createMutation.isPending}
        okButtonProps={{ disabled: selectedDays.length === 0 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>
            将时段{' '}
            <Text strong>
              {templateToCopy?.startTime?.substring(0, 5)} -{' '}
              {templateToCopy?.endTime?.substring(0, 5)}
            </Text>{' '}
            复制到：
          </Text>
        </div>
        <Checkbox.Group
          value={selectedDays}
          onChange={(values) => setSelectedDays(values as DayOfWeek[])}
        >
          <Space direction="vertical">
            {availableDays.map((day) => (
              <Checkbox key={day} value={day}>
                {DAY_OF_WEEK_LABELS[day]}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </Modal>
    </>
  );
};

export default TimeSlotsTab;
