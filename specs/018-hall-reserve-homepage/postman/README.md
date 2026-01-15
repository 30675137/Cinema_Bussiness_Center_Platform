# T025 API 测试指南

## 快速开始

### 1. 启动后端服务

```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/backend
./mvnw spring-boot:run
```

### 2. Curl 测试命令

```bash
# 健康检查
curl -s http://localhost:8080/api/health | jq

# T025 获取已发布场景包列表
curl -s -i http://localhost:8080/api/scenario-packages/published | head -20

# 仅查看响应体
curl -s http://localhost:8080/api/scenario-packages/published | jq

# 验证响应头 Cache-Control
curl -s -I http://localhost:8080/api/scenario-packages/published | grep -i cache

# 计算场景包数量
curl -s http://localhost:8080/api/scenario-packages/published | jq '.data | length'
```

### 3. Postman 导入

1. 打开 Postman
2. 点击 **Import** 按钮
3. 选择文件：
   - Collection: `018-hall-reserve-homepage.postman_collection.json`
   - Environment: `018-local-dev.postman_environment.json`
4. 选择环境 "018 本地开发环境"
5. 运行测试

## 测试用例

| 任务 | 测试名称 | 验收标准 |
|------|---------|---------|
| T025 | 获取已发布场景包列表 | 状态码 200，包含至少 3 条数据 |
| T028 | 验证响应数据结构 | 符合 JSON Schema，字段完整 |
| T029 | 验证缓存功能 | 响应头包含 Cache-Control: max-age=300 |

## 预期响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-001",
      "title": "VIP 生日派对专场",
      "category": "PARTY",
      "backgroundImageUrl": "https://storage.supabase.co/scenarios/party-001.jpg",
      "packagePrice": 1888.00,
      "rating": 4.5,
      "tags": ["生日", "派对", "VIP", "浪漫"]
    }
  ],
  "timestamp": "2025-12-21T10:00:00Z"
}
```

## 运行 Newman（命令行）

```bash
# 安装 Newman
npm install -g newman

# 运行测试
newman run 018-hall-reserve-homepage.postman_collection.json \
  -e 018-local-dev.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export test-results.json
```
