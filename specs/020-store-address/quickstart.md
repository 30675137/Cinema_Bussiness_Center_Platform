# Quickstart: 门店地址信息管理

**Feature**: 020-store-address
**Date**: 2025-12-22

## Prerequisites

### 环境要求

- Node.js 18+
- Java 21+
- Supabase 账户（已配置）
- 微信开发者工具（C端测试）

### 项目依赖

确保已安装项目依赖：

```bash
# B端前端
cd frontend && npm install

# 后端
cd backend && ./mvnw clean compile

# C端 Taro
cd hall-reserve-taro && npm install
```

---

## Database Setup

### 1. 执行数据库迁移

在 Supabase SQL Editor 或通过 Migration 文件执行：

```sql
-- V6__add_store_address_fields.sql
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS province VARCHAR(50),
ADD COLUMN IF NOT EXISTS city VARCHAR(50),
ADD COLUMN IF NOT EXISTS district VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_stores_province ON stores(province);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
```

### 2. 验证迁移

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'stores'
ORDER BY ordinal_position;
```

预期看到新增列: province, city, district, address, phone

---

## Backend Development

### 1. 启动后端服务

```bash
cd backend
./mvnw spring-boot:run
```

服务启动后访问: http://localhost:8080

### 2. 验证 API

```bash
# 获取门店列表
curl http://localhost:8080/api/stores

# 获取门店详情
curl http://localhost:8080/api/stores/{storeId}

# 更新门店地址
curl -X PUT http://localhost:8080/api/stores/{storeId} \
  -H "Content-Type: application/json" \
  -d '{
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "address": "建国路88号",
    "phone": "010-12345678"
  }'
```

---

## B端 Frontend Development

### 1. 启动开发服务器

```bash
cd frontend
npm run dev
```

访问: http://localhost:5173

### 2. 门店管理入口

- 导航至: 资源管理 → 门店管理
- 点击门店行进入编辑
- 新增"地址信息"表单区域

### 3. 关键文件

| 文件 | 说明 |
|------|------|
| `src/types/store.ts` | Store 类型定义（更新） |
| `src/pages/stores/edit.tsx` | 门店编辑页（添加地址表单） |
| `src/features/store-management/components/` | 地址表单组件 |

---

## C端 Taro Development

### 1. 启动 H5 开发

```bash
cd hall-reserve-taro
npm run dev:h5
```

访问: http://localhost:10087

### 2. 启动微信小程序开发

```bash
npm run dev:weapp
```

然后用微信开发者工具打开 `hall-reserve-taro/dist` 目录

### 3. 关键文件

| 文件 | 说明 |
|------|------|
| `src/types/store.ts` | Store 类型定义（新建） |
| `src/pages/store-detail/index.tsx` | 门店详情页（新建） |
| `src/utils/phone.ts` | 拨号工具函数 |

### 4. C端功能测试

- 复制地址: 长按地址文本
- 拨打电话: 点击电话号码

---

## Testing

### 单元测试

```bash
# B端前端
cd frontend && npm run test

# 后端
cd backend && ./mvnw test
```

### E2E 测试

```bash
cd frontend && npm run test:e2e
```

### 手动验证清单

- [ ] B端门店列表显示地址摘要
- [ ] B端门店编辑页可输入/修改地址信息
- [ ] B端电话格式校验生效（错误格式提示）
- [ ] 后端 API 返回完整地址字段
- [ ] C端门店详情页显示完整地址
- [ ] C端复制地址功能正常
- [ ] C端拨打电话功能正常
- [ ] 停用门店在C端不可见

---

## Common Issues

### 1. 数据库迁移失败

**问题**: Column already exists

**解决**: 使用 `ADD COLUMN IF NOT EXISTS` 语法，或先检查列是否存在

### 2. 电话格式校验失败

**问题**: 400热线格式被拒绝

**解决**: 确保正则包含 `400-?\d{3}-?\d{4}` 模式

### 3. C端拨号无反应

**问题**: H5 环境下 `Taro.makePhoneCall` 不生效

**解决**: H5 使用 `window.location.href = 'tel:xxx'` 兜底

```typescript
export function makePhoneCall(phone: string) {
  if (process.env.TARO_ENV === 'h5') {
    window.location.href = `tel:${phone}`;
  } else {
    Taro.makePhoneCall({ phoneNumber: phone });
  }
}
```

---

## API Reference

详见 `contracts/api.yaml`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/stores | 获取门店列表（含地址摘要） |
| GET | /api/stores/{id} | 获取门店详情（含完整地址） |
| PUT | /api/stores/{id} | 更新门店信息（含地址字段） |

---

## Next Steps

1. 完成数据库迁移
2. 更新后端 Store 模型和 DTO
3. 更新 B端门店编辑页面
4. 创建 C端门店详情页
5. 添加测试用例
6. 运行完整测试套件
