import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Tag,
  DatePicker,
  Modal,
  Tooltip,
  Timeline,
  Badge,
  Avatar,
  Divider,
  Alert,
  Statistic,
  Progress,
  Empty,
  message,
} from 'antd';
import {
  HistoryOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined,
  UserOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';

import { usePriceHistoryQuery } from '@/stores/priceStore';
import { PriceHistory as PriceHistoryType, PriceChangeType } from '@/types/price';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface PriceHistoryProps {
  productId?: string;
  showProductFilter?: boolean;
}

const PriceHistory: React.FC<PriceHistoryProps> = ({ productId, showProductFilter = true }) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<PriceHistoryType | null>(null);
  const [compareItems, setCompareItems] = useState<PriceHistoryType[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const { data: historyData, isLoading, refetch } = usePriceHistoryQuery(productId || '');

  // 价格变动类型配置
  const changeTypeConfig = {
    create: { color: 'green', text: '新建价格', icon: <RiseOutlined /> },
    update: { color: 'blue', text: '价格调整', icon: <RiseOutlined /> },
    delete: { color: 'red', text: '删除价格', icon: <FallOutlined /> },
    batch_update: { color: 'purple', text: '批量调整', icon: <HistoryOutlined /> },
    import: { color: 'orange', text: '导入更新', icon: <DownloadOutlined /> },
    rule_applied: { color: 'cyan', text: '规则应用', icon: <InfoCircleOutlined /> },
  };

  // 表格列定义
  const columns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('YYYY-MM-DD')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).format('HH:mm:ss')}
          </Text>
        </Space>
      ),
    },
    {
      title: '商品信息',
      key: 'product',
      width: 200,
      render: (_, record: PriceHistoryType) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.productName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            编码: {record.productCode}
          </Text>
          {record.productCategory && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.productCategory}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '变动类型',
      dataIndex: 'changeType',
      key: 'changeType',
      width: 120,
      render: (type: PriceChangeType) => {
        const config = changeTypeConfig[type];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '价格变动',
      key: 'priceChange',
      width: 150,
      render: (_, record: PriceHistoryType) => (
        <Space direction="vertical" size={0}>
          <div>
            <Text delete style={{ fontSize: 12, color: '#999' }}>
              ¥{(record.oldValue || 0).toFixed(2)}
            </Text>
            <Text strong style={{ margin: '0 4px' }}>
              →
            </Text>
            <Text strong>¥{(record.newValue || 0).toFixed(2)}</Text>
          </div>
          {record.changeAmount !== undefined && (
            <Text type={record.changeAmount >= 0 ? 'success' : 'danger'} style={{ fontSize: 12 }}>
              {record.changeAmount >= 0 ? '+' : ''}¥{record.changeAmount.toFixed(2)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '变动幅度',
      key: 'changePercent',
      width: 100,
      render: (_, record: PriceHistoryType) => {
        if (record.changePercent === undefined) return '-';
        const color =
          record.changePercent > 0 ? '#52c41a' : record.changePercent < 0 ? '#ff4d4f' : '#999';
        return (
          <Text style={{ color, fontSize: 12 }}>
            {record.changePercent > 0 ? '+' : ''}
            {record.changePercent.toFixed(1)}%
          </Text>
        );
      },
    },
    {
      title: '价格类型',
      dataIndex: 'priceType',
      key: 'priceType',
      width: 100,
      render: (type: string) => {
        const typeConfig: Record<string, { color: string; text: string }> = {
          base: { color: 'blue', text: '基础价格' },
          member: { color: 'green', text: '会员价格' },
          promotion: { color: 'red', text: '促销价格' },
          special: { color: 'purple', text: '特殊价格' },
          wholesale: { color: 'orange', text: '批发价格' },
          channel: { color: 'cyan', text: '渠道价格' },
        };
        const config = typeConfig[type] || typeConfig.base;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 120,
      render: (name: string, record: PriceHistoryType) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: 12 }}>{name || '系统'}</Text>
            {record.operatorRole && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.operatorRole}
              </Text>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      render: (remark: string) => (
        <Tooltip title={remark}>
          <Text
            ellipsis
            style={{ maxWidth: 120, display: 'inline-block' }}
            type={remark ? 'default' : 'secondary'}
          >
            {remark || '-'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record: PriceHistoryType) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="加入对比">
            <Button
              type="text"
              size="small"
              icon={<SwapOutlined />}
              onClick={() => handleAddToCompare(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 查看详情
  const handleViewDetail = (record: PriceHistoryType) => {
    setSelectedHistory(record);
    setDetailModalVisible(true);
  };

  // 加入对比
  const handleAddToCompare = (record: PriceHistoryType) => {
    if (compareItems.length >= 5) {
      message.warning('最多只能对比5条记录');
      return;
    }

    const exists = compareItems.some((item) => item.id === record.id);
    if (exists) {
      message.warning('该记录已在对比列表中');
      return;
    }

    setCompareItems([...compareItems, record]);
    message.success('已加入对比列表');
  };

  // 从对比列表移除
  const handleRemoveFromCompare = (id: string) => {
    setCompareItems(compareItems.filter((item) => item.id !== id));
  };

  // 导出历史记录
  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        productId,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
        changeType: changeTypeFilter,
        format: 'excel',
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([result.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `price_history_${dayjs().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('价格历史导出成功');
    } catch (error) {
      message.error('价格历史导出失败');
    }
  };

  // 执行对比
  const handleCompare = async () => {
    if (compareItems.length < 2) {
      message.warning('至少选择2条记录进行对比');
      return;
    }

    try {
      const result = await compareMutation.mutateAsync({
        items: compareItems.map((item) => ({
          id: item.id,
          timestamp: item.createdAt,
        })),
      });

      setCompareModalVisible(true);
    } catch (error) {
      message.error('对比分析失败');
    }
  };

  // 统计数据
  const renderStatistics = () => {
    const history = historyData?.data || [];

    const totalChanges = history.length;
    const priceIncrease = history.filter((h) => h.changeAmount > 0).length;
    const priceDecrease = history.filter((h) => h.changeAmount < 0).length;
    const avgChangePercent =
      totalChanges > 0
        ? history.reduce((sum, h) => sum + (h.changePercent || 0), 0) / totalChanges
        : 0;

    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总变动次数"
              value={totalChanges}
              prefix={<HistoryOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="价格上涨"
              value={priceIncrease}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              suffix={`/ ${totalChanges}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="价格下跌"
              value={priceDecrease}
              prefix={<FallOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${totalChanges}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均变动幅度"
              value={avgChangePercent}
              precision={2}
              suffix="%"
              prefix={<InfoCircleOutlined />}
              valueStyle={{
                color: avgChangePercent > 0 ? '#ff4d4f' : avgChangePercent < 0 ? '#52c41a' : '#999',
              }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="price-history">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <HistoryOutlined style={{ marginRight: 8 }} />
              价格历史记录
            </Title>
            <Text type="secondary">查看商品价格的变动历史和趋势分析</Text>
          </Col>
          <Col>
            <Space>
              {compareItems.length > 0 && (
                <Badge count={compareItems.length}>
                  <Button icon={<SwapOutlined />} onClick={handleCompare}>
                    价格对比
                  </Button>
                </Badge>
              )}
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  // 展开筛选面板
                }}
              >
                筛选
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出记录
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          {showProductFilter && (
            <Col flex="auto">
              <Search
                placeholder="搜索商品名称、编码或备注"
                allowClear
                enterButton
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
          )}
          <Col>
            <Select
              placeholder="变动类型"
              style={{ width: 150 }}
              allowClear
              value={changeTypeFilter}
              onChange={setChangeTypeFilter}
            >
              <Option value="create">新建价格</Option>
              <Option value="update">价格调整</Option>
              <Option value="delete">删除价格</Option>
              <Option value="batch_update">批量调整</Option>
              <Option value="import">导入更新</Option>
              <Option value="rule_applied">规则应用</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
              style={{ width: 240 }}
            />
          </Col>
        </Row>
      </Card>

      {/* 统计信息 */}
      {renderStatistics()}

      {/* 对比项列表 */}
      {compareItems.length > 0 && (
        <Card
          title="对比列表"
          size="small"
          style={{ marginBottom: 16 }}
          extra={
            <Button type="text" size="small" onClick={() => setCompareItems([])}>
              清空
            </Button>
          }
        >
          <Space wrap>
            {compareItems.map((item, index) => (
              <Tag
                key={item.id}
                closable
                onClose={() => handleRemoveFromCompare(item.id)}
                color="blue"
              >
                {item.productName} ({dayjs(item.createdAt).format('MM-DD HH:mm')})
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* 操作提示 */}
      <Alert
        message="历史记录说明"
        description="系统自动记录所有价格变动，包括手动调整、批量操作、规则应用等。支持导出Excel格式的历史数据。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 历史记录表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={historyData?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            defaultPageSize: 20,
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: <Empty description="暂无价格历史记录" />,
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="价格变动详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedHistory && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>商品信息：</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{selectedHistory.productName}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    编码: {selectedHistory.productCode}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>变动时间：</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{dayjs(selectedHistory.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                </div>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>价格变动：</Text>
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 16, margin: '8px 0' }}>
                    <Text delete style={{ color: '#999' }}>
                      ¥{(selectedHistory.oldValue || 0).toFixed(2)}
                    </Text>
                    <Text strong style={{ margin: '0 8px' }}>
                      →
                    </Text>
                    <Text strong style={{ color: '#1890ff' }}>
                      ¥{(selectedHistory.newValue || 0).toFixed(2)}
                    </Text>
                  </div>
                  {selectedHistory.changeAmount !== undefined && (
                    <div>
                      <Text type={selectedHistory.changeAmount >= 0 ? 'success' : 'danger'}>
                        变动金额: {selectedHistory.changeAmount >= 0 ? '+' : ''}¥
                        {selectedHistory.changeAmount.toFixed(2)}
                      </Text>
                      <br />
                      {selectedHistory.changePercent !== undefined && (
                        <Text type={selectedHistory.changePercent >= 0 ? 'success' : 'danger'}>
                          变动幅度: {selectedHistory.changePercent >= 0 ? '+' : ''}
                          {selectedHistory.changePercent.toFixed(1)}%
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <Text strong>操作信息：</Text>
                <div style={{ marginTop: 4 }}>
                  <div>
                    <Text>操作人: {selectedHistory.operatorName || '系统'}</Text>
                  </div>
                  {selectedHistory.operatorRole && (
                    <div>
                      <Text type="secondary">角色: {selectedHistory.operatorRole}</Text>
                    </div>
                  )}
                  <div>
                    <Tag color={changeTypeConfig[selectedHistory.changeType].color}>
                      {changeTypeConfig[selectedHistory.changeType].text}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>

            {selectedHistory.remark && (
              <>
                <Divider />
                <Text strong>备注说明：</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{selectedHistory.remark}</Text>
                </div>
              </>
            )}

            {selectedHistory.metadata && (
              <>
                <Divider />
                <Text strong>额外信息：</Text>
                <div style={{ marginTop: 4 }}>
                  <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                    {JSON.stringify(selectedHistory.metadata, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 价格对比弹窗 */}
      <Modal
        title="价格对比分析"
        open={compareModalVisible}
        onCancel={() => setCompareModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCompareModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <Timeline>
          {compareItems.map((item, index) => (
            <Timeline.Item
              key={item.id}
              color={index === 0 ? 'green' : index === compareItems.length - 1 ? 'red' : 'blue'}
            >
              <div>
                <Text strong>{item.productName}</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">
                    {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text>价格: ¥{(item.newValue || 0).toFixed(2)}</Text>
                  {item.changeAmount !== undefined && (
                    <Text
                      type={item.changeAmount >= 0 ? 'success' : 'danger'}
                      style={{ marginLeft: 8 }}
                    >
                      ({item.changeAmount >= 0 ? '+' : ''}¥{item.changeAmount.toFixed(2)})
                    </Text>
                  )}
                </div>
                {item.remark && (
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.remark}
                    </Text>
                  </div>
                )}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>

        <Divider />

        <Alert
          message="对比结果"
          description={
            <div>
              <div>对比项目: {compareItems.length} 个时间点</div>
              <div>
                价格区间: ¥{Math.min(...compareItems.map((item) => item.newValue || 0)).toFixed(2)}{' '}
                - ¥{Math.max(...compareItems.map((item) => item.newValue || 0)).toFixed(2)}
              </div>
              <div>
                总变动:{' '}
                {(
                  (compareItems[compareItems.length - 1]?.newValue || 0) -
                  (compareItems[0]?.newValue || 0)
                ).toFixed(2)}{' '}
                元
              </div>
            </div>
          }
          type="info"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default PriceHistory;
