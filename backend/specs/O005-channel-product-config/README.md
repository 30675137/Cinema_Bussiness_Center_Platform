# O005 渠道商品配置 E2E 测试文档

**@spec O005-channel-product-config**

本目录包含渠道商品配置模块的所有 E2E 测试场景和相关文档。

## 📁 文件清单

| 文件 | 说明 |
|-----|------|
| `E2E-CHANNEL-PRODUCT-001.yaml` | 列表展示测试 |
| `E2E-CHANNEL-PRODUCT-002.yaml` | 数据转换边界测试 |
| `E2E-CHANNEL-PRODUCT-003.yaml` | SKU 加载和价格转换测试 |
| `E2E-CHANNEL-PRODUCT-004.yaml` | CRUD 完整流程测试（含数据清理） |
| `TEST-CHECKLIST.md` | 测试清单和执行指南 |
| `QUICK-TEST-GUIDE.md` | 5分钟快速验证指南 |
| `cleanup-e2e-data.sql` | E2E 测试数据清理脚本 |

## 🎯 测试覆盖

### 后端测试
- ✅ SKU 信息加载（transient 字段）
- ✅ 价格转换（元→分）
- ✅ 图片 URL 来源验证
- ✅ API 响应格式（snake_case）

### 前端测试
- ✅ 数据转换（snake_case → camelCase）
- ✅ 数据结构适配（content → items）
- ✅ SKU 信息显示（编码、名称）
- ✅ 商品图片加载

## 🚀 快速开始

1. **快速验证**（5分钟）：
   ```bash
   # 参考 QUICK-TEST-GUIDE.md
   curl -s 'http://localhost:8080/api/channel-products?channelType=MINI_PROGRAM&page=1&size=1' | python3 -m json.tool
   ```

2. **完整测试**（50分钟）：
   ```bash
   # 按顺序执行 E2E-CHANNEL-PRODUCT-001 到 004
   # 参考 TEST-CHECKLIST.md
   ```

## ⚠️ 重要提示

- E2E-CHANNEL-PRODUCT-004 包含**删除操作**，仅在开发环境执行
- 测试完成后使用 `cleanup-e2e-data.sql` 清理数据
- 所有测试场景均基于 2026-01-01 的代码修改

## 📝 代码修改参考

本测试覆盖以下代码修改：

**后端** (backend/src/main/java/com/cinema/):
- `channelproduct/domain/ChannelProductConfig.java` - SKU info DTO
- `channelproduct/service/ChannelProductService.java` - loadSkuInfo()

**前端** (frontend/src/features/channel-product-config/):
- `services/channelProductService.ts` - toCamelCase()
- `pages/ChannelProductListPage.tsx` - items 访问
- `components/ChannelProductTable.tsx` - SKU 显示

---

**最后更新**: 2026-01-01
