# Quick Start: 场景包场馆关联配置

**Feature**: 019-store-association
**Date**: 2025-12-21

## 概述

本文档提供 019-store-association 功能的开发快速入门指南。

## 前置条件

### 环境要求

- Node.js >= 18
- Java 21
- PostgreSQL (通过 Supabase)
- pnpm / npm

### 依赖功能

确保以下功能已实现并可用：

| 功能 | 说明 | 验证方式 |
|------|------|---------|
| 014-hall-store-backend | stores 表和 API | 访问 `/api/stores` 返回门店列表 |
| 017-scenario-package | 场景包编辑页面 | 访问 `/scenario-packages/edit/:id` 正常显示 |

## 开发步骤

### 1. 切换到功能分支

```bash
git checkout 019-store-association
```

### 2. 数据库迁移

创建关联表迁移脚本：

```bash
# 创建迁移文件
touch backend/src/main/resources/db/migration/V5__add_store_associations.sql
```

将 `data-model.md` 中的 SQL Schema 复制到迁移文件，然后执行：

```bash
# 运行迁移（通过 Spring Boot 启动自动执行，或手动执行）
cd backend
./mvnw spring-boot:run
```

### 3. 前端开发

#### 3.1 启动开发服务器

```bash
cd frontend
npm install
npm run dev
```

#### 3.2 关键文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/features/scenario-package-management/types/index.ts` | 修改 | 添加 Store 和关联类型 |
| `src/features/scenario-package-management/components/molecules/StoreSelector.tsx` | 新增 | 门店多选组件 |
| `src/pages/scenario-packages/edit.tsx` | 修改 | 添加门店关联配置区域 |
| `src/pages/scenario-packages/create.tsx` | 修改 | 添加门店关联配置区域 |

#### 3.3 组件实现参考

**StoreSelector 组件骨架**:

```tsx
// src/features/scenario-package-management/components/molecules/StoreSelector.tsx
import React, { useState, useMemo } from 'react';
import { Tag, Input, Empty, Spin, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getStores } from '@/pages/stores/services/storeService';

interface StoreSelectorProps {
  value: string[];
  onChange: (storeIds: string[]) => void;
  disabled?: boolean;
  required?: boolean;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  required = true,
}) => {
  const [searchText, setSearchText] = useState('');

  // 获取门店列表
  const { data: stores = [], isLoading, error } = useQuery({
    queryKey: ['stores', { status: 'active' }],
    queryFn: () => getStores({ status: 'active' }),
  });

  // 前端搜索过滤
  const filteredStores = useMemo(() => {
    if (!searchText) return stores;
    const lowerSearch = searchText.toLowerCase();
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(lowerSearch) ||
        store.region?.toLowerCase().includes(lowerSearch)
    );
  }, [stores, searchText]);

  // 切换选中状态
  const handleToggle = (storeId: string) => {
    if (disabled) return;
    const newValue = value.includes(storeId)
      ? value.filter((id) => id !== storeId)
      : [...value, storeId];
    onChange(newValue);
  };

  if (isLoading) return <Spin />;
  if (error) return <Alert type="error" message="加载门店列表失败" />;
  if (stores.length === 0) return <Empty description="暂无可用门店" />;

  return (
    <div>
      <Input
        placeholder="搜索门店名称或区域"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 12 }}
        allowClear
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {filteredStores.map((store) => (
          <Tag.CheckableTag
            key={store.id}
            checked={value.includes(store.id)}
            onChange={() => handleToggle(store.id)}
          >
            {store.name}
            {store.region && <span style={{ opacity: 0.6 }}> ({store.region})</span>}
          </Tag.CheckableTag>
        ))}
      </div>
      {required && value.length === 0 && (
        <div style={{ color: '#ff4d4f', marginTop: 8 }}>请至少选择一个门店</div>
      )}
    </div>
  );
};
```

### 4. 后端开发

#### 4.1 启动后端服务

```bash
cd backend
./mvnw spring-boot:run
```

#### 4.2 关键文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `model/ScenarioPackageStoreAssociation.java` | 新增 | 关联实体 |
| `repository/StoreAssociationRepository.java` | 新增 | 关联数据访问 |
| `service/ScenarioPackageService.java` | 修改 | 添加门店关联业务逻辑 |
| `controller/ScenarioPackageController.java` | 修改 | 扩展 API 响应包含门店信息 |
| `dto/ScenarioPackageDTO.java` | 修改 | 添加 stores 和 storeIds 字段 |

### 5. 测试验证

#### 5.1 手动测试清单

- [ ] 访问场景包编辑页面，验证门店关联区域显示
- [ ] 验证门店列表正确加载
- [ ] 验证搜索筛选功能
- [ ] 验证多选切换功能
- [ ] 验证保存时至少选择一个门店的校验
- [ ] 验证保存后重新打开，门店选择正确回显
- [ ] 验证并发编辑冲突提示

#### 5.2 运行自动化测试

```bash
# 前端单元测试
cd frontend
npm run test

# E2E 测试
npm run test:e2e

# 后端测试
cd backend
./mvnw test
```

## API 测试

### 获取门店列表

```bash
curl -X GET "http://localhost:8080/api/stores?status=active"
```

### 创建场景包（含门店关联）

```bash
curl -X POST "http://localhost:8080/api/scenario-packages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试场景包",
    "storeIds": ["<store-uuid-1>", "<store-uuid-2>"],
    "hallTypeIds": ["VIP"]
  }'
```

### 获取场景包详情

```bash
curl -X GET "http://localhost:8080/api/scenario-packages/<package-id>"
```

## 常见问题

### Q: 门店列表为空

检查 stores 表是否有 `status='active'` 的记录：

```sql
SELECT * FROM stores WHERE status = 'active';
```

### Q: 保存时提示版本冲突

这是乐观锁机制正常工作。请刷新页面获取最新数据后重试。

### Q: 前端报 CORS 错误

确保后端 CORS 配置正确，或通过 Vite 代理配置绕过。

## 相关文档

- [功能规格](./spec.md)
- [实现计划](./plan.md)
- [技术调研](./research.md)
- [数据模型](./data-model.md)
- [API 契约](./contracts/api.yaml)
