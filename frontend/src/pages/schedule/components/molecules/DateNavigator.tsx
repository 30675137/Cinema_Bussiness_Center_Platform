import React, { useMemo } from 'react';
import { Button, Space, Typography } from 'antd';
import { LeftOutlined, RightOutlined, AimOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface DateNavigatorProps {
  date: string; // YYYY-MM-DD
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ date, onPrev, onNext, onToday }) => {
  const display = useMemo(() => {
    const d = dayjs(date);
    return d.format('YYYY年MM月DD日 (ddd)');
  }, [date]);

  return (
    <Space>
      <Button icon={<LeftOutlined />} onClick={onPrev}>
        前一天
      </Button>
      <Typography.Text strong>{display}</Typography.Text>
      <Button icon={<RightOutlined />} onClick={onNext}>
        后一天
      </Button>
      <Button icon={<AimOutlined />} type="primary" onClick={onToday}>
        回到今天
      </Button>
    </Space>
  );
};

export default DateNavigator;
