# Production Seed Data

**@spec T003-flyway-migration**

此目录存放生产环境专用的种子数据脚本。

## 特点

- 仅在 `spring.profiles.active=prod` 时加载
- 包含生产环境必需的基础数据
- 数据经过严格审核

## 命名规范

```
R__prod_01_system_config.sql
R__prod_02_default_settings.sql
```

建议使用 `prod_` 前缀区分。

## 注意事项

- 生产数据脚本必须经过 Code Review
- 禁止包含测试数据或敏感信息
- 执行前必须备份数据库
