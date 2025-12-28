/**
 * CalendarOverrideView 组件
 * 日历覆盖视图 - 显示特定日期的时段覆盖规则
 * Feature: 001-scenario-package-tabs
 */

import React, { useMemo } from 'react';
import { Calendar, Badge, Tooltip, Button, Empty, Typography, Card, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { TimeSlotOverride } from '../../types';

const { Text } = Typography;

interface CalendarOverrideViewProps {
  /** 时段覆盖列表 */
  overrides: TimeSlotOverride[];
  /** 是否加载中 */
  loading?: boolean;
  /** 点击日期添加覆盖 */
  onAddOverride: (date: string) => void;
  /** 编辑覆盖 */
  onEditOverride: (override: TimeSlotOverride) => void;
  /** 删除覆盖 */
  onDeleteOverride: (id: string) => void;
}

/**
 * 覆盖类型配置
 */
const OVERRIDE_TYPE_CONFIG = {
  ADD: { color: 'green', text: '新增', badgeStatus: 'success' as const },
  MODIFY: { color: 'orange', text: '修改', badgeStatus: 'warning' as const },
  CANCEL: { color: 'red', text: '取消', badgeStatus: 'error' as const },
};

/**
 * 日历覆盖视图组件
 */
export const CalendarOverrideView: React.FC<CalendarOverrideViewProps> = ({
  overrides,
  loading = false,
  onAddOverride,
  onEditOverride,
  onDeleteOverride,
}) => {
  // 按日期分组覆盖规则
  const overridesByDate = useMemo(() => {
    const map = new Map<string, TimeSlotOverride[]>();
    overrides.forEach((override) => {
      const date = override.date;
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(override);
    });
    return map;
  }, [overrides]);
  
  // 渲染日期单元格
  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayOverrides = overridesByDate.get(dateStr) || [];
    
    if (dayOverrides.length === 0) {
      return null;
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {dayOverrides.slice(0, 3).map((override) => {
          const config = OVERRIDE_TYPE_CONFIG[override.overrideType as keyof typeof OVERRIDE_TYPE_CONFIG];
          const timeDisplay = override.overrideType === 'CANCEL' 
            ? '全天取消' 
            : `${override.startTime?.substring(0, 5) || ''}-${override.endTime?.substring(0, 5) || ''}`;
          
          return (
            <Tooltip
              key={override.id}
              title={
                <div>
                  <div>{config.text}: {timeDisplay}</div>
                  {override.reason && <div>原因: {override.reason}</div>}
                </div>
              }
            >
              <Badge
                status={config.badgeStatus}
                text={
                  <Text
                    style={{ fontSize: 12, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditOverride(override);
                    }}
                  >
                    {timeDisplay}
                  </Text>
                }
              />
            </Tooltip>
          );
        })}
        {dayOverrides.length > 3 && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            +{dayOverrides.length - 3} 更多
          </Text>
        )}
      </div>
    );
  };
  
  // 点击日期
  const handleDateSelect = (date: Dayjs) => {
    // 不允许选择过去的日期
    if (date.isBefore(dayjs(), 'day')) {
      return;
    }
    onAddOverride(date.format('YYYY-MM-DD'));
  };
  
  // 渲染头部单元格（月份模式）
  const headerRender = ({ value, onChange }: { value: Dayjs; onChange: (date: Dayjs) => void }) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
        <div>
          <Button onClick={() => onChange(value.subtract(1, 'month'))}>{'<'}</Button>
          <Text strong style={{ margin: '0 16px' }}>
            {value.format('YYYY年MM月')}
          </Text>
          <Button onClick={() => onChange(value.add(1, 'month'))}>{'>'}</Button>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Tag color="green">新增时段</Tag>
          <Tag color="orange">修改时段</Tag>
          <Tag color="red">取消时段</Tag>
        </div>
      </div>
    );
  };
  
  // 禁用过去的日期
  const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(dayjs(), 'day');
  };
  
  return (
    <Card loading={loading}>
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          点击日期可添加特定日期的时段覆盖规则（新增/修改/取消）。覆盖规则优先于周模板。
        </Text>
      </div>
      
      <Calendar
        fullscreen={false}
        headerRender={headerRender}
        cellRender={(current, info) => {
          if (info.type === 'date') {
            return dateCellRender(current);
          }
          return info.originNode;
        }}
        onSelect={handleDateSelect}
        disabledDate={disabledDate}
        style={{ maxWidth: 800 }}
      />
      
      {overrides.length === 0 && (
        <Empty
          description="暂无日期覆盖规则"
          style={{ marginTop: 24 }}
        >
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => onAddOverride(dayjs().format('YYYY-MM-DD'))}
          >
            添加覆盖规则
          </Button>
        </Empty>
      )}
    </Card>
  );
};

export default CalendarOverrideView;
