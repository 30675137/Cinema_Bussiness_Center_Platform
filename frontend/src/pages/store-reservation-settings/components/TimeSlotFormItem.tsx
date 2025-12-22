/**
 * TimeSlotFormItem Component
 * 
 * Simplified time slot configuration with default time and special rules.
 * Default: 8:00 - 22:00 for all days
 * Special rules can override specific days.
 * 
 * @feature 016-store-reservation-settings
 * @updated 简化为默认时段+特殊规则模式
 */

import React, { useState, useEffect } from 'react';
import { Form, TimePicker, Button, Space, Typography, Card, Select, Empty, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Control, FieldErrors } from 'react-hook-form';
import dayjs from 'dayjs';
import type { DayOfWeek, TimeSlot } from '../types/reservation-settings.types';
import { getDayOfWeekName } from '../types/reservation-settings.types';

const { Text } = Typography;

// 默认时段配置
const DEFAULT_START_TIME = '08:00';
const DEFAULT_END_TIME = '22:00';

interface TimeSlotFormGroupProps {
  control: Control<any>;
  errors?: FieldErrors;
  disabled?: boolean;
  /** 设置表单字段值的函数 */
  setValue: (name: string, value: any) => void;
}

/**
 * 特殊规则类型
 */
interface SpecialRule {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

/**
 * TimeSlotFormGroup Component
 * 简化版时间段配置：默认时段 + 特殊规则
 */
export const TimeSlotFormGroup: React.FC<TimeSlotFormGroupProps> = ({ 
  control, 
  errors, 
  disabled,
  setValue,
}) => {
  // 特殊规则状态（本地管理，与表单数据同步）
  const [specialRules, setSpecialRules] = useState<SpecialRule[]>([]);
  const [addingRule, setAddingRule] = useState(false);
  const [newRuleDay, setNewRuleDay] = useState<DayOfWeek>(6); // 默认周六
  const [newRuleStartTime, setNewRuleStartTime] = useState(DEFAULT_START_TIME);
  const [newRuleEndTime, setNewRuleEndTime] = useState(DEFAULT_END_TIME);

  // 同步 timeSlots 数据到表单
  useEffect(() => {
    const slots: TimeSlot[] = ([1, 2, 3, 4, 5, 6, 7] as DayOfWeek[]).map((day) => {
      const rule = specialRules.find((r) => r.dayOfWeek === day);
      return {
        dayOfWeek: day,
        startTime: rule?.startTime || DEFAULT_START_TIME,
        endTime: rule?.endTime || DEFAULT_END_TIME,
      };
    });
    setValue('timeSlots', slots);
  }, [specialRules, setValue]);

  // 获取未被规则覆盖的星期选项
  const availableDays: DayOfWeek[] = ([1, 2, 3, 4, 5, 6, 7] as DayOfWeek[]).filter(
    (day) => !specialRules.some((rule) => rule.dayOfWeek === day)
  );

  // 添加特殊规则
  const handleAddRule = () => {
    if (availableDays.length === 0) return;
    
    const newRule: SpecialRule = {
      dayOfWeek: newRuleDay,
      startTime: newRuleStartTime,
      endTime: newRuleEndTime,
    };
    
    setSpecialRules([...specialRules, newRule]);
    setAddingRule(false);
    
    // 重置新规则表单
    const nextAvailableDay = availableDays.find(d => d !== newRuleDay);
    if (nextAvailableDay) {
      setNewRuleDay(nextAvailableDay);
    }
    setNewRuleStartTime(DEFAULT_START_TIME);
    setNewRuleEndTime(DEFAULT_END_TIME);
  };

  // 删除特殊规则
  const handleDeleteRule = (dayOfWeek: DayOfWeek) => {
    setSpecialRules(specialRules.filter((rule) => rule.dayOfWeek !== dayOfWeek));
  };

  // 获取某天的显示时段
  const getTimeSlotDisplay = (dayOfWeek: DayOfWeek) => {
    const rule = specialRules.find((r) => r.dayOfWeek === dayOfWeek);
    if (rule) {
      return `${rule.startTime} - ${rule.endTime}`;
    }
    return `${DEFAULT_START_TIME} - ${DEFAULT_END_TIME}`;
  };

  // 是否有特殊规则
  const hasSpecialRule = (dayOfWeek: DayOfWeek) => {
    return specialRules.some((r) => r.dayOfWeek === dayOfWeek);
  };

  return (
    <div className="time-slot-form-group">
      {/* 默认时段说明 */}
      <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>默认可预约时段</Text>
            <Tag color="blue">{DEFAULT_START_TIME} - {DEFAULT_END_TIME}</Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            所有星期默认使用此时段，如需设置特殊时段请添加规则
          </Text>
        </Space>
      </Card>

      {/* 时段预览 */}
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>时段预览：</Text>
        <Space wrap>
          {([1, 2, 3, 4, 5, 6, 7] as DayOfWeek[]).map((day) => (
            <Tag 
              key={day} 
              color={hasSpecialRule(day) ? 'orange' : 'default'}
              style={{ margin: '2px' }}
            >
              {getDayOfWeekName(day)}: {getTimeSlotDisplay(day)}
            </Tag>
          ))}
        </Space>
      </div>

      {/* 特殊规则列表 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>特殊时段规则</Text>
          {!addingRule && availableDays.length > 0 && (
            <Button 
              type="dashed" 
              size="small" 
              icon={<PlusOutlined />}
              onClick={() => {
                setNewRuleDay(availableDays[0] || 6);
                setAddingRule(true);
              }}
              disabled={disabled}
            >
              添加规则
            </Button>
          )}
        </div>

        {specialRules.length === 0 && !addingRule && (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="暂无特殊规则，所有日期使用默认时段" 
            style={{ padding: '16px 0' }}
          />
        )}

        {/* 已添加的规则 */}
        {specialRules.map((rule) => (
          <Card 
            key={rule.dayOfWeek} 
            size="small" 
            style={{ marginBottom: 8 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Tag color="orange">{getDayOfWeekName(rule.dayOfWeek)}</Tag>
                <Text>{rule.startTime} - {rule.endTime}</Text>
              </Space>
              <Popconfirm
                title="确定删除这条规则吗？"
                onConfirm={() => handleDeleteRule(rule.dayOfWeek)}
                okText="删除"
                cancelText="取消"
              >
                <Button 
                  type="text" 
                  danger 
                  size="small" 
                  icon={<DeleteOutlined />}
                  disabled={disabled}
                />
              </Popconfirm>
            </div>
          </Card>
        ))}

        {/* 添加新规则表单 */}
        {addingRule && (
          <Card size="small" style={{ marginBottom: 8, borderStyle: 'dashed' }}>
            <Space wrap style={{ width: '100%' }}>
              <Select
                value={newRuleDay}
                onChange={setNewRuleDay}
                style={{ width: 100 }}
                disabled={disabled}
              >
                {availableDays.map((day) => (
                  <Select.Option key={day} value={day}>
                    {getDayOfWeekName(day)}
                  </Select.Option>
                ))}
              </Select>
              <TimePicker
                value={dayjs(newRuleStartTime, 'HH:mm')}
                onChange={(time) => setNewRuleStartTime(time?.format('HH:mm') || DEFAULT_START_TIME)}
                format="HH:mm"
                minuteStep={30}
                disabled={disabled}
                placeholder="开始"
              />
              <Text type="secondary">至</Text>
              <TimePicker
                value={dayjs(newRuleEndTime, 'HH:mm')}
                onChange={(time) => setNewRuleEndTime(time?.format('HH:mm') || DEFAULT_END_TIME)}
                format="HH:mm"
                minuteStep={30}
                disabled={disabled}
                placeholder="结束"
              />
              <Button type="primary" size="small" onClick={handleAddRule} disabled={disabled}>
                确定
              </Button>
              <Button size="small" onClick={() => setAddingRule(false)}>
                取消
              </Button>
            </Space>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TimeSlotFormGroup;
