# O012 Postman 测试指南

## 📋 文件说明

本目录包含以下Postman测试文件：

1. **O012-setup-teardown.postman_collection.json** - 测试数据准备与清理（Setup & Teardown）
2. **O012-order-reservation.postman_collection.json** - 主API测试集合
3. **O012-data-driven.postman_collection.json** - 数据驱动测试集合
4. **O012-local.postman_environment.json** - 本地环境配置
5. **O012-test-data.csv** - 基础测试数据
6. **O012-test-data-extended.csv** - 扩展测试数据

---

## 🚀 完整测试流程

### 步骤1: 准备测试数据 (Setup)

**首次运行或数据被清理后需要执行**

1. 导入 `O012-setup-teardown.postman_collection.json`
2. 导入 `O012-local.postman_environment.json`
3. 选择 Environment: `O012-Local`
4. 打开 Collection，展开 "Setup - 准备测试数据" 文件夹
5. 点击文件夹右侧的 "Run" 按钮（或点击 Collection Runner）
6. 确认选中所有11个请求
7. 点击 "Run O012..." 开始执行
8. 等待所有请求完成（约15-20秒）
9. 查看 Console 或 Test Results，确认所有测试通过

**Setup 执行流程**（11个步骤）:

1. ✅ 创建测试SPU - "测试饮品SPU - Mojito"
2. ✅ 创建原料SKU - 朗姆酒（0.15元/ml，standardCost）
3. ✅ 创建原料SKU - 薄荷叶（0.05元/g，standardCost）
4. ✅ 创建原料SKU - 苏打水（0.01元/ml，standardCost）
5. ✅ 创建成品SKU - 莫吉托（finished_product，5%损耗率）
6. ✅ 创建成品SKU - 草莓莫吉托（finished_product，5%损耗率）
7. ✅ 配置BOM配方 - 莫吉托（使用 `componentType: "MATERIAL"` 和 `materialId`）
   - 45ml 朗姆酒 + 5g 薄荷叶 + 200ml 苏打水
   - 损耗率: 5%
8. ✅ 初始化库存 - 朗姆酒（5000ml，可制作约110杯）
9. ✅ 初始化库存 - 薄荷叶（500g，可制作约100杯）
10. ✅ 初始化库存 - 苏打水（20000ml，可制作约100杯）
11. ✅ 显示测试数据摘要（查看创建的所有ID）

**重要说明**:
- 所有创建的资源ID会自动保存到环境变量中
- 环境变量名称：
  - `test_spu_id` - 测试SPU的ID
  - `test_material_rum_id` - 朗姆酒SKU ID
  - `test_material_mint_id` - 薄荷叶SKU ID
  - `test_material_soda_id` - 苏打水SKU ID
  - `test_sku_id_1` - 莫吉托成品SKU ID
  - `test_sku_id_2` - 草莓莫吉托成品SKU ID
- 理论最多可制作：100杯莫吉托（受薄荷叶库存限制）

### 步骤2: 运行主测试

**方式A: 手动单个请求测试**
1. 打开 `O012-order-reservation.postman_collection.json`
2. 按文件夹顺序执行：
   - 1. Order Creation (预占成功)
   - 2. Order Creation (预占失败)
   - 3. Order Cancellation
   - 4. Reservation Query

**方式B: 数据驱动批量测试**
1. 打开 `O012-data-driven.postman_collection.json`
2. 点击 "Run" 按钮
3. 选择 CSV 文件: `O012-test-data.csv` 或 `O012-test-data-extended.csv`
4. 设置 Iterations = CSV行数（不含表头）
5. 设置 Delay = 1000ms
6. 运行测试

### 步骤3: 清理测试数据 (Teardown - 可选)

**测试完成后执行，清理测试产生的临时数据**

1. 打开 `O012-setup-teardown.postman_collection.json`
2. 展开 "Teardown - 清理测试数据" 文件夹
3. 点击文件夹右侧的 "Run" 按钮
4. 运行3个清理请求
5. 查看 Console 确认清理完成

**Teardown 清理内容**（3个步骤）:

1. ✅ 清理测试订单的预占记录（`inventory_reservations` 表）
2. ✅ 清理测试订单（`beverage_orders` 表）
3. ✅ 显示清理完成信息

**注意事项**:
- Teardown 只清理订单和预占记录，不删除 SKU 和库存数据
- SKU、BOM、库存记录会保留，可以继续使用
- 如需完全清理，请手动删除（参考 Console 输出的 ID 列表）
- 生产环境请谨慎使用 Teardown

---

## 🚀 CSV数据驱动测试使用方法

### 步骤1: 导入Collection和Environment

1. 打开Postman
2. Import → `O012-order-reservation.postman_collection.json`
3. Import → `O012-local.postman_environment.json`
4. 选择Environment: `O012-Local`

### 步骤2: 配置CSV数据文件

1. 打开Collection "O012 - 订单创建时库存预占"
2. 点击右上角 "..." → "Run collection"
3. 在Runner界面，点击 "Select File" 按钮
4. 选择 `O012-test-data.csv` 文件

### 步骤3: 配置Runner参数

**Data File配置**:
- File Type: `text/csv`
- Preview: 应显示CSV表格预览

**Iterations（迭代次数）**:
- 设置为 CSV文件的行数（不包括表头）
- 例如：5条测试数据，设置为 5

**Delay（请求间隔）**:
- 建议设置 `1000ms`（1秒）
- 避免并发请求导致资源竞争

### 步骤4: 运行测试

1. 点击 "Run O012..." 按钮
2. 查看测试结果面板
3. 每个请求会使用CSV中的一行数据

---

## 📊 CSV文件字段说明

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| **scenario** | String | 测试场景名称 | `正常下单-单品` |
| **store_id** | UUID | 门店ID | `00000000-0000-0000-0000-000000000099` |
| **customer_id** | UUID | 顾客ID | `00000000-0000-0000-0000-000000000001` |
| **beverage_id_1** | UUID | 第1个饮品ID | `80430c51-3fb0-4de6-be29-23bc24ac748b` |
| **quantity_1** | Integer | 第1个饮品数量 | `2` |
| **beverage_id_2** | UUID | 第2个饮品ID（可选） | `550e8400-e29b-41d4-a716-446655440026` |
| **quantity_2** | Integer | 第2个饮品数量（可选） | `1` |
| **expected_status** | Integer | 预期HTTP状态码 | `201` / `409` |
| **expected_reservation_status** | String | 预期预占状态 | `RESERVED` / `FAILED` |
| **description** | String | 测试场景描述 | `库存充足-单个饮品-预占成功` |

---

## 🎯 已包含的测试场景

### 场景1: 正常下单-单品
```csv
store_id: Test Store P005（北京朝阳）
customer_id: 测试用户
beverage_id_1: New莫吉托 x 2份
预期结果: 201 Created + RESERVED
```

### 场景2: 正常下单-多品
```csv
beverage_id_1: New莫吉托 x 2份
beverage_id_2: 奶油爆米花(大) x 1份
预期结果: 201 Created + RESERVED
```

### 场景3: 库存不足
```csv
beverage_id_1: New莫吉托 x 9999份（超大数量）
预期结果: 409 Conflict + FAILED + 返回缺货清单
```

### 场景4: 小批量订单
```csv
beverage_id_1: 奶油爆米花(大) x 1份
预期结果: 201 Created + RESERVED
```

### 场景5: 中批量订单
```csv
beverage_id_1: New莫吉托 x 5份
beverage_id_2: 奶油爆米花(大) x 3份
预期结果: 201 Created + RESERVED
```

---

## 🔧 在Collection中使用CSV变量

### 修改请求Body使用CSV变量

打开请求 "创建饮品订单 - 库存充足"，修改Body为：

```json
{
  "storeId": "{{store_id}}",
  "customerId": "{{customer_id}}",
  "items": [
    {
      "beverageId": "{{beverage_id_1}}",
      "quantity": {{quantity_1}},
      "selectedSpecs": {}
    }
    {{#beverage_id_2}}
    ,{
      "beverageId": "{{beverage_id_2}}",
      "quantity": {{quantity_2}},
      "selectedSpecs": {}
    }
    {{/beverage_id_2}}
  ],
  "customerNote": "{{description}}"
}
```

### 修改测试脚本验证预期结果

在Tests标签中添加：

```javascript
// 从CSV读取预期值
const expectedStatus = parseInt(pm.iterationData.get("expected_status"));
const expectedReservationStatus = pm.iterationData.get("expected_reservation_status");
const scenario = pm.iterationData.get("scenario");

console.log(`Testing scenario: ${scenario}`);

// 验证HTTP状态码
pm.test(`[${scenario}] Status code is ${expectedStatus}`, function () {
    pm.response.to.have.status(expectedStatus);
});

// 验证预占状态（仅成功场景）
if (expectedStatus === 201) {
    pm.test(`[${scenario}] Reservation status is ${expectedReservationStatus}`, function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.data.reservationStatus).to.eql(expectedReservationStatus);
    });
}

// 验证错误响应（失败场景）
if (expectedStatus === 409) {
    pm.test(`[${scenario}] Error code is ORD_BIZ_002`, function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.code).to.eql("ORD_BIZ_002");
    });
    
    pm.test(`[${scenario}] Shortage items list exists`, function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.details.shortageItems).to.be.an('array');
        pm.expect(jsonData.details.shortageItems.length).to.be.above(0);
    });
}
```

---

## 📈 测试结果查看

### Runner界面显示

```
┌─────────────────────────────────────────┐
│ Run Summary                              │
├─────────────────────────────────────────┤
│ Total Requests:  5                       │
│ Tests Passed:    25                      │
│ Tests Failed:    0                       │
│ Avg Response:    234ms                   │
└─────────────────────────────────────────┘

Iteration Results:
✓ [正常下单-单品] Status code is 201
✓ [正常下单-单品] Reservation status is RESERVED
✓ [正常下单-多品] Status code is 201
✓ [正常下单-多品] Reservation status is RESERVED
✓ [库存不足] Status code is 409
✓ [库存不足] Error code is ORD_BIZ_002
✓ [库存不足] Shortage items list exists
...
```

### 导出测试报告

1. 点击 "Export Results" 按钮
2. 选择格式: `JSON` 或 `HTML`
3. 保存测试报告到本地

---

## 🔄 扩展CSV测试数据

### 添加新的测试场景

在CSV文件中添加新行：

```csv
并发测试,00000000-0000-0000-0000-000000000099,00000000-0000-0000-0000-000000000001,80430c51-3fb0-4de6-be29-23bc24ac748b,10,550e8400-e29b-41d4-a716-446655440026,10,201,RESERVED,并发场景-10+10
```

### 测试不同门店

```csv
测试其他门店,123e4567-e89b-12d3-a456-426614174000,00000000-0000-0000-0000-000000000001,80430c51-3fb0-4de6-be29-23bc24ac748b,1,,,201,RESERVED,杭州测试门店
```

### 测试边界值

```csv
边界值-最大数量,00000000-0000-0000-0000-000000000099,00000000-0000-0000-0000-000000000001,80430c51-3fb0-4de6-be29-23bc24ac748b,999,,,201,RESERVED,边界值测试-最大合理数量
边界值-最小数量,00000000-0000-0000-0000-000000000099,00000000-0000-0000-0000-000000000001,80430c51-3fb0-4de6-be29-23bc24ac748b,1,,,201,RESERVED,边界值测试-最小数量
```

---

## ⚠️ 注意事项

### 1. CSV文件编码
- 必须使用 **UTF-8编码**
- 确保中文字符正确显示

### 2. 空值处理
- 可选字段留空（不要删除逗号）
- 示例: `beverage_id_2` 留空时，只创建单品订单

### 3. 数据依赖
- 确保门店ID存在于数据库
- 确保饮品ID存在且有BOM配方
- 确保门店有足够库存

### 4. 并发测试
- 不要同时运行多个Runner实例
- 可能导致数据库锁冲突

### 5. 测试数据清理
- 测试完成后，手动清理测试订单：
  ```sql
  DELETE FROM beverage_orders 
  WHERE customer_note LIKE '%测试%' 
    AND created_at > NOW() - INTERVAL '1 hour';
  ```

---

## 🎓 最佳实践

### 1. 测试隔离
```csv
# 使用不同的customer_id避免测试数据污染
场景A,store_id,customer_A,beverage_1,2,,,201,RESERVED,测试场景A
场景B,store_id,customer_B,beverage_1,2,,,201,RESERVED,测试场景B
```

### 2. 渐进式测试
```
第1轮: 只运行正常场景（验证功能正确性）
第2轮: 加入异常场景（验证错误处理）
第3轮: 加入边界值测试（验证健壮性）
```

### 3. 测试数据版本控制
```bash
# 提交CSV文件到Git
git add O012-test-data.csv
git commit -m "feat(O012): 添加Postman CSV测试数据"
```

---

## 📞 问题排查

### 问题1: CSV文件无法读取
**症状**: Runner显示 "No data file selected"
**解决**: 
1. 检查文件编码是否为UTF-8
2. 确认文件路径正确
3. 尝试重新选择文件

### 问题2: 变量未被替换
**症状**: 请求Body中显示 `{{store_id}}` 而不是实际值
**解决**:
1. 确认CSV表头与变量名完全匹配（区分大小写）
2. 检查CSV文件格式（逗号分隔）
3. 重新加载CSV文件

### 问题3: 测试全部失败
**症状**: 所有测试都返回404或500错误
**解决**:
1. 检查后端服务是否运行（`http://localhost:8080`）
2. 检查Environment中的`base_url`是否正确
3. 手动测试单个请求验证连接

---

## 📚 参考资料

- [Postman Collection Runner官方文档](https://learning.postman.com/docs/collections/running-collections/intro-to-collection-runs/)
- [CSV数据驱动测试指南](https://learning.postman.com/docs/collections/running-collections/working-with-data-files/)
- [O012功能规范](../spec.md)
- [O012 API文档](../api.yaml)

---

**最后更新**: 2026-01-14  
**维护者**: Cinema Platform Team
