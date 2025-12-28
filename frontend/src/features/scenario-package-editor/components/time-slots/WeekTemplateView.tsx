/**
 * WeekTemplateView 组件
 * 周视图 - 7列布局展示每天的时段模板
 * Feature: 001-scenario-package-tabs
 */

import React from 'react';
import { Card, Button, Empty, Tooltip, Typography, Row, Col } from 'antd';
import { PlusOutlined, CopyOutlined } from '@ant-design/icons';
import { TimeSlotTemplateItem } from './TimeSlotTemplateItem';
import { DAY_OF_WEEK_LABELS, type TimeSlotTemplate, type DayOfWeek } from '../../types';

const { Text } = Typography;

interface WeekTemplateViewProps {
  /** 时段模板列表 */
  templates: TimeSlotTemplate[];
  /** 是否加载中 */
  loading?: boolean;
  /** 添加时段回调 */
  onAdd: (dayOfWeek: DayOfWeek) => void;
  /** 编辑时段回调 */
  onEdit: (template: TimeSlotTemplate) => void;
  /** 删除时段回调 */
  onDelete: (id: string) => void;
  /** 切换启用状态回调 */
  onToggleEnabled: (id: string, enabled: boolean) => void;
  /** 复制到其他天回调 */
  onCopyToOtherDays?: (template: TimeSlotTemplate) => void;
}

/**
 * 按星期几分组时段模板
 */
const groupByDayOfWeek = (templates: TimeSlotTemplate[]): Record<DayOfWeek, TimeSlotTemplate[]> => {
  const groups: Record<DayOfWeek, TimeSlotTemplate[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
  };
  
  templates.forEach((template) => {
    const day = template.dayOfWeek as DayOfWeek;
    if (groups[day]) {
      groups[day].push(template);
    }
  });
  
  // 按开始时间排序
  Object.keys(groups).forEach((key) => {
    const dayKey = Number(key) as DayOfWeek;
    groups[dayKey].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });
  
  return groups;
};

/**
 * 周视图组件
 */
export const WeekTemplateView: React.FC<WeekTemplateViewProps> = ({
  templates,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onToggleEnabled,
  onCopyToOtherDays,
}) => {
  const groupedTemplates = groupByDayOfWeek(templates);
  
  // 星期顺序：周一到周日
  const dayOrder: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];
  
  return (
    <div className="week-template-view">
      <Row gutter={[8, 8]}>
        {dayOrder.map((dayOfWeek) => {
          const dayTemplates = groupedTemplates[dayOfWeek] || [];
          const dayLabel = DAY_OF_WEEK_LABELS[dayOfWeek];
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          return (
            <Col key={dayOfWeek} xs={24} sm={12} md={8} lg={6} xl={24 / 7}>
              <Card
                size="small"
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ color: isWeekend ? '#ff4d4f' : undefined }}>
                      {dayLabel}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayTemplates.length} 个时段
                    </Text>
                  </div>
                }
                loading={loading}
                style={{ minHeight: 200 }}
                styles={{
                  body: { padding: 8, maxHeight: 400, overflowY: 'auto' },
                }}
                extra={
                  <Tooltip title={`添加${dayLabel}时段`}>
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => onAdd(dayOfWeek)}
                    />
                  </Tooltip>
                }
              >
                {dayTemplates.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无时段"
                    style={{ margin: '20px 0' }}
                  >
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => onAdd(dayOfWeek)}
                    >
                      添加时段
                    </Button>
                  </Empty>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {dayTemplates.map((template) => (
                      <TimeSlotTemplateItem
                        key={template.id}
                        template={template}
                        onEdit={() => onEdit(template)}
                        onDelete={() => onDelete(template.id)}
                        onToggleEnabled={(enabled) => onToggleEnabled(template.id, enabled)}
                        onCopy={onCopyToOtherDays ? () => onCopyToOtherDays(template) : undefined}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
      
      <style>{`
        .week-template-view .ant-card {
          border-radius: 8px;
        }
        .week-template-view .ant-card-head {
          min-height: 36px;
          padding: 0 8px;
        }
        .week-template-view .ant-card-head-title {
          padding: 8px 0;
        }
      `}</style>
    </div>
  );
};

export default WeekTemplateView;
