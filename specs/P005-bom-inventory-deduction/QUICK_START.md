# P005 快速启动指南 ⚡

**目的**: 5分钟内完成数据库设置并运行E2E测试

---

## ❌ 当前问题

执行SQL时遇到错误:
```
ERROR: 42P01: relation "inventory" does not exist
```

**原因**: 数据库表结构未创建 (Flyway被禁用)

---

## ✅ 解决方案 (3步)

### 步骤1: 访问Supabase SQL Editor

打开浏览器访问:
```
https://supabase.com/dashboard/project/fxhgyxceqrmnpezluaht/sql/new
```

### 步骤2: 执行完整设置脚本

在终端复制脚本内容:
```bash
cat scripts/p005-complete-setup.sql
```

粘贴到Supabase SQL Editor,点击 "Run"

### 步骤3: 验证并运行测试

查看SQL输出,应显示:
```
=== SETUP COMPLETE ===
Stores: 1
SKUs: 6
Inventory Records: 4
BOM Components: 5
```

然后运行测试:
```bash
npm run test:e2e
```

---

## 📊 预期结果

- ✅ **测试通过**: 11/11 (100%)
- ✅ **API正常**: 不再返回500错误
- ✅ **业务验证**: 库存预占、扣减逻辑正常工作

---

## 📖 详细文档

如遇问题,查看:
- [数据库架构设置指南](./DATABASE_SCHEMA_SETUP.md) - 完整说明
- [自动化执行总结](./AUTOMATION_SUMMARY.md) - 问题诊断
- [测试数据准备指南](./TEST_DATA_SETUP_GUIDE.md) - 替代方案

---

**执行时间**: < 5分钟
**难度**: ⭐ 简单
**状态**: 等待用户执行
