# P005 测试数据准备指南

**生成时间**: 2025-12-29
**目的**: 为P005 BOM库存预占与扣减功能准备测试数据
**状态**: ⚠️ 需要手动执行SQL脚本

---

## 🚨 问题说明

在尝试通过自动化方式插入测试数据时遇到以下问题:

### 方法1: Supabase REST API
- ❌ **失败原因**: API密钥无效 ("Invalid API key")
- **尝试**: 使用 `anon_key` 和 `service_role_key`
- **结果**: 都返回401/403错误

### 方法2: 后端HTTP API
- ❌ **失败原因**:
  - Store API: 403 Forbidden
  - SKU API: 403 Forbidden
  - Inventory API: 500 Internal Server Error
  - BOM API: 403 Forbidden
- **原因分析**:
  1. API端点可能需要认证(JWT token)
  2. 某些端点可能未实现POST方法
  3. Spring Security配置可能限制了访问

### 方法3: 直接数据库连接
- ❌ **失败原因**: `psql` 命令不可用
- **建议**: 需要安装PostgreSQL客户端工具

---

## ✅ 推荐解决方案

### 方案A: 使用Supabase Dashboard (最简单)

1. **访问Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/fxhgyxceqrmnpezluaht
   ```

2. **进入SQL Editor**
   - 左侧菜单 → SQL Editor → New query

3. **执行测试数据脚本**
   - 复制 `backend/src/test/resources/test-data/p005-setup-test-data.sql` 内容
   - 粘贴到SQL Editor
   - 点击 "Run" 执行

4. **验证数据**
   - 查看输出结果,应该显示插入的数据
   - 检查 `stores`, `skus`, `inventory`, `bom_components` 表

---

### 方案B: 使用pgAdmin或DBeaver (推荐)

1. **安装数据库客户端**
   - [pgAdmin](https://www.pgadmin.org/) (免费)
   - [DBeaver](https://dbeaver.io/) (免费)
   - [TablePlus](https://tableplus.com/) (商业软件)

2. **连接到Supabase数据库**
   ```
   Host: aws-1-us-east-2.pooler.supabase.com
   Port: 6543
   Database: postgres
   User: postgres.fxhgyxceqrmnpezluaht
   Password: ppkZ8sGUEHB0qjFs
   ```

3. **执行SQL脚本**
   - 打开脚本文件: `backend/src/test/resources/test-data/p005-setup-test-data.sql`
   - 执行脚本
   - 查看执行结果

---

### 方案C: 安装PostgreSQL客户端并使用psql

1. **安装PostgreSQL客户端**
   ```bash
   # macOS
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql-client

   # Windows
   # 下载 PostgreSQL installer from https://www.postgresql.org/download/
   ```

2. **执行SQL脚本**
   ```bash
   export PGPASSWORD='ppkZ8sGUEHB0qjFs'
   psql -h aws-1-us-east-2.pooler.supabase.com \
        -p 6543 \
        -U postgres.fxhgyxceqrmnpezluaht \
        -d postgres \
        -f backend/src/test/resources/test-data/p005-setup-test-data.sql
   ```

3. **验证数据插入**
   ```bash
   psql -h aws-1-us-east-2.pooler.supabase.com \
        -p 6543 \
        -U postgres.fxhgyxceqrmnpezluaht \
        -d postgres \
        -c "SELECT * FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;"
   ```

---

## 📋 测试数据清单

执行SQL脚本后,将插入以下测试数据:

### 1. 测试门店
| ID | 名称 | 状态 |
|----|------|------|
| `00000000-0000-0000-0000-000000000099` | Test Store P005 | ACTIVE |

### 2. 测试SKU - 原料

| ID | 名称 | 类型 | 单位 |
|----|------|------|------|
| `11111111-0000-0000-0000-000000000001` | 威士忌 | RAW_MATERIAL | ml |
| `11111111-0000-0000-0000-000000000002` | 可乐 | RAW_MATERIAL | ml |
| `11111111-0000-0000-0000-000000000003` | 杯子 | RAW_MATERIAL | 个 |
| `11111111-0000-0000-0000-000000000004` | 吸管 | RAW_MATERIAL | 根 |

### 3. 测试SKU - 成品

| ID | 名称 | 类型 | 单位 |
|----|------|------|------|
| `22222222-0000-0000-0000-000000000001` | 威士忌可乐鸡尾酒 | FINISHED_PRODUCT | 杯 |
| `22222222-0000-0000-0000-000000000002` | 观影套餐 | FINISHED_PRODUCT | 份 |

### 4. 测试库存

| 门店ID | SKU ID | SKU名称 | 现存库存 | 预占库存 |
|--------|--------|---------|---------|---------|
| Test Store | `11111111...0001` | 威士忌 | 1000 ml | 0 ml |
| Test Store | `11111111...0002` | 可乐 | 5000 ml | 0 ml |
| Test Store | `11111111...0003` | 杯子 | 100 个 | 0 个 |
| Test Store | `11111111...0004` | 吸管 | 200 根 | 0 根 |

### 5. BOM配方

**威士忌可乐鸡尾酒配方**:
- 威士忌: 45 ml
- 可乐: 150 ml
- 杯子: 1 个
- 吸管: 1 根

**观影套餐配方** (多层级):
- 威士忌可乐鸡尾酒: 1 杯

---

## 🔍 数据验证

执行以下SQL查询验证数据插入成功:

```sql
-- 检查门店
SELECT * FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;

-- 检查SKU
SELECT * FROM skus WHERE id IN (
    '11111111-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000001'::uuid
);

-- 检查库存
SELECT i.*, s.name AS sku_name
FROM inventory i
JOIN skus s ON i.sku_id = s.id
WHERE i.store_id = '00000000-0000-0000-0000-000000000099'::uuid;

-- 检查BOM配方
SELECT bc.*,
       fp.name AS finished_product_name,
       c.name AS component_name
FROM bom_components bc
JOIN skus fp ON bc.finished_product_id = fp.id
JOIN skus c ON bc.component_id = c.id
WHERE bc.finished_product_id = '22222222-0000-0000-0000-000000000001'::uuid;
```

---

## 🧪 执行测试

数据准备完成后,重新执行E2E测试:

```bash
# 运行简化版测试
NODE_OPTIONS='--experimental-vm-modules --no-warnings' \
npx jest --config=jest.e2e.config.cjs \
tests/e2e/p005-bom-inventory-simplified.test.ts \
--runInBand

# 预期结果
# - 所有11个测试用例通过
# - API返回正常数据(不再是500错误)
# - 业务逻辑得到验证
```

---

## 📝 脚本文件位置

### SQL脚本
- **简化版**: `scripts/setup-test-data-direct.sql`
- **完整版**: `backend/src/test/resources/test-data/p005-setup-test-data.sql`

### Shell脚本 (需要修复API密钥)
- `scripts/setup-test-data-via-api.sh`

### Python脚本 (需要修复API权限)
- `scripts/setup-test-data-python.py`

---

## ⚡ 快速开始 (推荐流程)

```bash
# 1. 复制SQL脚本内容
cat backend/src/test/resources/test-data/p005-setup-test-data.sql

# 2. 访问Supabase Dashboard
open https://supabase.com/dashboard/project/fxhgyxceqrmnpezluaht/sql/new

# 3. 粘贴并执行SQL

# 4. 验证数据
# 在Supabase Dashboard的Table Editor中检查:
# - stores 表
# - skus 表
# - inventory 表
# - bom_components 表

# 5. 运行测试
npm run test:e2e
```

---

## 🔧 故障排除

### 问题: SQL执行报错 "table does not exist"
**解决**:
1. 确认数据库迁移已执行
2. 检查表名大小写(PostgreSQL区分大小写)
3. 运行 `./mvnw flyway:migrate` 创建表结构

### 问题: UUID类型转换错误
**解决**:
- 确保在UUID字符串后添加 `::uuid` 类型转换
- 例如: `'00000000-0000-0000-0000-000000000099'::uuid`

### 问题: 外键约束错误
**解决**:
- 按顺序插入: stores → skus → inventory → bom_components
- 确保父表记录存在后再插入子表

### 问题: 测试仍然返回500错误
**解决**:
1. 验证数据确实插入成功
2. 重启Spring Boot后端服务
3. 检查后端日志查看具体错误
4. 确认UUID值与测试代码中的UUID一致

---

## 📚 相关文档

- [Supabase Dashboard](https://supabase.com/dashboard)
- [PostgreSQL客户端安装](https://www.postgresql.org/download/)
- [E2E测试执行报告](./E2E_TEST_EXECUTION_REPORT.md)
- [测试覆盖分析](./TEST_COVERAGE_ANALYSIS.md)

---

**最后更新**: 2025-12-29
**维护人**: Claude (E2E Test Executor)
**状态**: ⚠️ 等待手动执行SQL脚本
