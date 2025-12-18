import React, { useState } from 'react';
import { Card, List, Empty, Spin, Alert, Space } from 'antd';
import { useHallsByStoreQuery, useStoresListQuery, useAllHallsQuery } from './hooks/useScheduleQueries';
import HallCard from './components/atoms/HallCard';
import StoreSelector from './components/StoreSelector';

const HallResources: React.FC = () => {
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(undefined);

  // Fetch stores for the selector
  const storesQuery = useStoresListQuery();
  const stores = storesQuery.data || [];

  // Fetch halls based on selected store
  // If no store selected, fetch all halls; otherwise fetch halls by store
  const hallsByStoreQuery = useHallsByStoreQuery(
    selectedStoreId,
    undefined,
    { enabled: !!selectedStoreId }
  );
  const allHallsQuery = useAllHallsQuery(
    undefined,
    { enabled: !selectedStoreId }
  );

  // Use the appropriate query based on selection
  const hallsQuery = selectedStoreId ? hallsByStoreQuery : allHallsQuery;

  const isLoading = hallsQuery.isLoading || storesQuery.isLoading;
  const isError = hallsQuery.isError;
  const halls = hallsQuery.data || [];

  // Handle store selection change
  const handleStoreChange = (storeId: string | undefined) => {
    setSelectedStoreId(storeId);
  };

  return (
    <Card
      title="影厅资源管理"
      bordered={false}
      extra={
        <StoreSelector
          stores={stores}
          value={selectedStoreId}
          onChange={handleStoreChange}
          loading={storesQuery.isLoading}
        />
      }
    >
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      )}

      {isError && (
        <Alert type="error" message="加载影厅资源失败" description={String(hallsQuery.error)} />
      )}

      {!isLoading && !isError && halls.length === 0 && (
        <Empty description={selectedStoreId ? "该门店暂无影厅资源" : "暂无影厅资源数据"} />
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
