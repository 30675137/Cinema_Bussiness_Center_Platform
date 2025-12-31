import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Breadcrumb,
  Row,
  Col,
  message,
  Tabs,
  Statistic,
} from 'antd';
import {
  ImportOutlined,
  ExportOutlined,
  DownloadOutlined,
  SettingOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DataExport from '@/components/Export/DataExport';
import DataImport from '@/components/Import/DataImport';
import { Breadcrumb as CustomBreadcrumb } from '@/components/common';
import { exportService } from '@/services/exportService';
import { importService } from '@/services/importService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface ImportExportManagementProps {}

const ImportExportManagementPage: React.FC<ImportExportManagementProps> = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('import');
  const [exportStats, setExportStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    totalRecords: 0,
    successCount: 0,
    errorCount: 0,
  });
  const [importStats, setImportStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    totalRows: 0,
    successCount: 0,
    errorCount: 0,
  });

  // 面包屑导航
  const breadcrumbItems = [
    { title: '首页', path: '/dashboard' },
    { title: '系统管理', path: '/system' },
    { title: '数据导入导出' },
  ];

  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true);
      const [exportStatsData, importStatsData] = await Promise.all([
        exportService.getExportStats(),
        importService.getImportStats(),
      ]);

      setExportStats(exportStatsData);
      setImportStats(importStatsData);
    } catch (error) {
      console.error('Load stats error:', error);
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 处理导出完成
  const handleExportComplete = () => {
    message.success('导出任务已创建');
    loadStats();
  };

  // 处理导入完成
  const handleImportComplete = () => {
    message.success('导入任务已创建');
    loadStats();
  };

  // 处理刷新
  const handleRefresh = () => {
    loadStats();
  };

  // 处理返回
  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题和导航 */}
      <div style={{ marginBottom: 24 }}>
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>

      {/* 页面标题和操作按钮 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <DatabaseOutlined /> 数据导入导出
          </Title>
          <div style={{ fontSize: '14px', color: '#666', marginTop: 8 }}>
            批量数据处理和管理功能
          </div>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
          <Button onClick={handleBack}>返回</Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* 导出统计 */}
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="导出任务数"
              value={exportStats.totalTasks}
              prefix={<ExportOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="导出成功数"
              value={exportStats.completedTasks}
              prefix={<FileExcelOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="导出记录数"
              value={exportStats.totalRecords}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="导入任务数"
              value={importStats.totalTasks}
              prefix={<ImportOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* 导入统计 */}
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="导入成功数"
              value={importStats.completedTasks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="导入记录数"
              value={importStats.totalRows}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="导入成功记录"
              value={importStats.successCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="导入失败记录"
              value={importStats.errorCount}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane
            tab={
              <span>
                <ImportOutlined />
                数据导入
              </span>
            }
            key="import"
          >
            <div style={{ padding: '16px 0' }}>
              <DataImport onImportComplete={handleImportComplete} />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ExportOutlined />
                数据导出
              </span>
            }
            key="export"
          >
            <div style={{ padding: '16px 0' }}>
              <DataExport onExportComplete={handleExportComplete} />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                帮用模板
              </span>
            }
            key="templates"
          >
            <div style={{ padding: '32px' }}>
              <Title level={4}>导入模板下载</Title>
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <Card title="SPU商品模板" size="small">
                    <div style={{ padding: '24px 0' }}>
                      <div style={{ marginBottom: 16 }}>
                        <Text>包含SPU商品的基础字段，适用于商品数据批量导入。</Text>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>包含字段：</Text>
                        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                          <li>商品编码（必填）</li>
                          <li>商品名称（必填）</li>
                          <li>商品简称</li>
                          <li>品牌编码</li>
                          <li>分类编码</li>
                          <li>商品状态</li>
                        </ul>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => importService.downloadTemplate('spu')}
                        >
                          下载SPU模板
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="商品分类模板" size="small">
                    <div style={{ padding: '24px 0' }}>
                      <div style={{ marginBottom: 16 }}>
                        <Text>包含分类的基础字段，适用于分类数据批量导入。</Text>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>包含字段：</Text>
                        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                          <li>分类编码（必填）</li>
                          <li>分类名称（必填）</li>
                          <li>分类级别</li>
                          <li>状态</li>
                        </ul>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => importService.downloadTemplate('category')}
                        >
                          下载分类模板
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="商品品牌模板" size="small">
                    <div style={{ padding: '24px 0' }}>
                      <div style={{ marginBottom: 16 }}>
                        <Text>包含品牌的基础字段和联系方式，适用于品牌数据批量导入。</Text>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>包含字段：</Text>
                        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                          <li>品牌编码（必填）</li>
                          <li>品牌名称（必填）</li>
                          <li>联系人</li>
                          <li>联系电话</li>
                          <li>邮箱地址</li>
                          <li>官方网站</li>
                          <li>状态</li>
                        </ul>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => importService.downloadTemplate('brand')}
                        >
                          下载品牌模板
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="属性模板模板" size="small">
                    <div style={{ padding: '24px 0' }}>
                      <div style={{ marginBottom: 16 }}>
                        <Text>包含属性模板的基础字段，适用于属性模板数据批量导入。</Text>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>包含字段：</Text>
                        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                          <li>模板编码（必填）</li>
                          <li>模板名称（必填）</li>
                          <li>模板描述</li>
                          <li>状态</li>
                        </ul>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => importService.downloadTemplate('attribute_template')}
                        >
                          下载属性模板
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <div style={{ marginTop: 32 }}>
                <Title level={5}>使用说明</Title>
                <Card size="small">
                  <div style={{ padding: '16px' }}>
                    <Title level={5}>导入步骤：</Title>
                    <ol style={{ paddingLeft: 20 }}>
                      <li>
                        <Text>选择数据类型并下载对应的模板</Text>
                      </li>
                      <li>
                        <Text>按照模板格式整理您的数据</Text>
                      </li>
                      <Text>支持格式：Excel (.xlsx, .xls) 和 CSV (.csv)</Text>
                      <li>
                        <Text>在"数据导入"标签页上传文件并按照向导完成导入</Text>
                      </li>
                      <li>
                        <Text>系统会自动验证数据格式并进行导入</Text>
                      </li>
                      <li>
                        <Text>您可以在导入历史中查看处理结果</Text>
                      </li>
                    </ol>

                    <Divider />

                    <Title level={5}>导出步骤：</Title>
                    <ol style={{ paddingLeft: 20 }}>
                      <li>
                        <Text>在"数据导出"标签页选择要导出的数据类型</Text>
                      </li>
                      <li>
                        <Text>选择导出格式（支持Excel、CSV、JSON）</Text>
                      </li>
                      <li>
                        <Text>选择要导出的字段（支持筛选和高级选项）</Text>
                      </li>
                      <li>
                        <Text>点击"开始导出"创建导出任务</Text>
                      </li>
                      <li>
                        <Text>系统会在后台处理导出，完成后自动下载文件</Text>
                      </li>
                      <li>
                        <Text>您可以在导出历史中查看所有导出任务</Text>
                      </li>
                    </ol>

                    <Divider />

                    <Title level={5}>注意事项：</Title>
                    <ul style={{ paddingLeft: 20 }}>
                      <li>
                        <Text>文件大小限制：最大 10MB</Text>
                      </li>
                      <li>
                        <Text>批量处理：大数据量会分批处理</Text>
                      </li>
                      <li>
                        <Text>数据验证：系统会自动验证数据格式和必填项</Text>
                      </li>
                      <Text>唯一性检查：编码字段会进行唯一性验证</Text>
                      <li>
                        <Text>建议先使用小数据量测试，确保数据格式正确后再进行大批量导入</Text>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ImportExportManagementPage;
