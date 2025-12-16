import React from 'react';
import { Card, List, Empty, Spin, Alert } from 'antd';
import { useHallsListQuery } from './hooks/useScheduleQueries';
import HallCard from './components/atoms/HallCard';

const HallResources: React.FC = () => {
  const hallsQuery = useHallsListQuery();

  const isLoading = hallsQuery.isLoading;
  const isError = hallsQuery.isError;
  const halls = hallsQuery.data || [];

  return (
    <Card title="影厅资源管理" bordered={false}>
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      )}

      {isError && (
        <Alert type="error" message="加载影厅资源失败" description={String(hallsQuery.error)} />
      )}

      {!isLoading && !isError && halls.length === 0 && (
        <Empty description="暂无影厅资源数据" />
      )}

      {!isLoading && !isError && halls.length > 0 && (
        <List
          dataSource={halls}
          renderItem={(hall) => (
            <List.Item key={hall.id}>
              <HallCard hall={hall} />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default HallResources;
