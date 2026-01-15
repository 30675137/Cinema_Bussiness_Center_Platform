# Quickstart: E2E Postman 业务流程测试

**Branch**: T009-e2e-postman-flow-test  
**Date**: 2026-01-14

## 快速开始

本指南帮助您快速运行 E2E Postman 测试套件。

---

## 前置条件

### 1. 安装 Postman
- **桌面版**: [下载 Postman Desktop](https://www.postman.com/downloads/) (推荐)
- **CLI 版**: `npm install -g newman` (可选，用于命令行执行)

### 2. 启动后端服务
```bash
cd backend
mvn spring-boot:run
```

确保后端服务运行在 `http://localhost:8080`

### 3. 验证 Supabase 配置
确保 Supabase 项目已启动并可访问。

---

## 导入 Collection

### 方式 1: Postman Desktop
1. 打开 Postman
2. 点击 **Import** 按钮
3. 选择 `specs/T009-e2e-postman-flow-test/postman/T009-e2e-postman-flow-test.postman_collection.json`
4. 导入 Environment: `T009-local.postman_environment.json`

### 方式 2: Newman CLI
```bash
newman run specs/T009-e2e-postman-flow-test/postman/T009-e2e-postman-flow-test.postman_collection.json \
  -e specs/T009-e2e-postman-flow-test/postman/T009-local.postman_environment.json
```

---

## 配置 Environment

打开 `T009-local` Environment，配置以下变量：

| 变量名 | 值 | 说明 |
|--------|---|------|
| `api_base_url` | `http://localhost:8080` | 后端 API 地址 |
| `supabase_url` | `https://xxx.supabase.co` | Supabase 项目 URL |
| `supabase_anon_key` | `eyJhbGci...` | Supabase 匿名密钥 |
| `test_store_id` | `00000000-0000-0000-0000-000000000099` | 测试门店 ID |
| `test_category_id` | `550e8400-e29b-41d4-a716-446655440003` | 饮品分类 ID |

---

## 执行测试

### 完整测试流程

1. **Setup**: 运行 `Setup` 文件夹中的所有请求
   - 创建 SPU、SKU、BOM、初始化库存

2. **Test**: 运行测试场景
   - 场景 1: 正常下单 - 单品订单
   - 场景 2: 正常下单 - 多品订单
   - 场景 3: 库存不足
   - 场景 4: 订单取消
   - 场景 5: 边界值测试

3. **Teardown**: 运行 `Teardown` 文件夹中的所有请求
   - 清理测试数据

### 使用 Collection Runner

1. 点击 Collection 右上角的 **Run** 按钮
2. 选择 `T009-local` Environment
3. 点击 **Run T009-e2e-postman-flow-test**

---

## 验证结果

### 成功标志
- ✅ 所有请求状态码正确 (201/200/409)
- ✅ Test Scripts 全部通过
- ✅ 环境变量自动保存成功

### 查看测试报告
- Postman 会显示每个请求的测试结果
- 绿色 ✅ 表示通过
- 红色 ❌ 表示失败（查看错误信息）

---

## 常见问题

### Q1: 后端服务未启动
**症状**: Connection refused  
**解决**: 启动后端服务 `mvn spring-boot:run`

### Q2: Supabase 配置错误
**症状**: 401 Unauthorized  
**解决**: 检查 `supabase_anon_key` 是否正确

### Q3: 测试数据残留
**症状**: Duplicate key error  
**解决**: 先运行 Teardown 清理数据

---

## 下一步

- 📖 阅读 [data-model.md](./data-model.md) 了解数据模型
- 📖 阅读 [contracts/api-endpoints.md](./contracts/api-endpoints.md) 了解 API 详情
- 🚀 执行 `/speckit.tasks` 生成实施任务清单
