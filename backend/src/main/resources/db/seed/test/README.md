# Test Seed Data

**@spec T003-flyway-migration**

此目录存放测试环境专用的种子数据脚本。

## 特点

- 仅在 `spring.profiles.active=test` 时加载
- 包含测试用例所需的固定数据
- 可包含极端测试数据（边界值、异常情况）

## 命名规范

```
R__test_01_sample_orders.sql
R__test_02_mock_users.sql
```

建议使用 `test_` 前缀区分。
