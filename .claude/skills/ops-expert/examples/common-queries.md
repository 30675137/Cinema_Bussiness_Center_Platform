# 常见查询和操作示例

本文档提供运营专家技能的常见使用示例，供参考学习。

---

## 查询类示例

### 场景包查询

#### 查看所有已发布的场景包

**用户输入**: "查看所有已发布的场景包"

**执行 SQL**:
```sql
SELECT id, name, price, status, created_at
FROM scenario_packages
WHERE status = 'PUBLISHED'
ORDER BY created_at DESC
LIMIT 100;
```

**返回格式**:
```
找到 5 条记录：

| 名称        | 价格   | 状态      | 创建时间            |
|------------|--------|----------|---------------------|
| VIP派对套餐 | 3500   | PUBLISHED | 2025-01-01 10:00:00 |
| 生日派对    | 2000   | PUBLISHED | 2025-01-01 09:00:00 |
| ...        | ...    | ...       | ...                 |

提示：可以说 "查看场景包'VIP派对套餐'详情" 获取更多信息
```

#### 搜索场景包

**用户输入**: "搜索包含'派对'的场景包"

**执行 SQL**:
```sql
SELECT id, name, status, price
FROM scenario_packages
WHERE name ILIKE '%派对%'
ORDER BY created_at DESC;
```

#### 查看场景包详情

**用户输入**: "查看场景包'VIP派对套餐'的详情"

**执行 SQL**:
```sql
SELECT
    id, name, description, status, price, original_price,
    hard_benefits, soft_benefits, service_items,
    applicable_halls, valid_from, valid_to,
    created_at, updated_at
FROM scenario_packages
WHERE name = 'VIP派对套餐';
```

---

### 门店查询

#### 查看所有门店

**用户输入**: "显示门店列表"

**执行 SQL**:
```sql
SELECT id, name, code, city, status, phone
FROM stores
ORDER BY created_at DESC
LIMIT 100;
```

#### 按城市查询门店

**用户输入**: "查看北京的门店"

**执行 SQL**:
```sql
SELECT id, name, code, address, phone, status
FROM stores
WHERE city = '北京'
ORDER BY name;
```

#### 查看门店预约设置

**用户输入**: "查看旗舰店的预约设置"

**执行 SQL**:
```sql
SELECT
    s.name as store_name,
    rs.weekday_start_time, rs.weekday_end_time,
    rs.weekend_start_time, rs.weekend_end_time,
    rs.duration_unit, rs.min_advance_hours, rs.max_advance_days,
    rs.deposit_required, rs.deposit_amount
FROM stores s
LEFT JOIN store_reservation_settings rs ON s.id = rs.store_id
WHERE s.name = '旗舰店';
```

---

### 影厅查询

#### 查看门店的影厅

**用户输入**: "显示旗舰店的影厅"

**执行 SQL**:
```sql
SELECT h.id, h.name, h.code, h.type, h.capacity, h.status
FROM halls h
JOIN stores s ON h.store_id = s.id
WHERE s.name = '旗舰店'
ORDER BY h.name;
```

#### 按类型查询影厅

**用户输入**: "查看所有VIP厅"

**执行 SQL**:
```sql
SELECT
    h.id, h.name, h.capacity, h.status,
    s.name as store_name
FROM halls h
JOIN stores s ON h.store_id = s.id
WHERE h.type = 'VIP'
ORDER BY s.name, h.name;
```

---

### 预约查询

#### 查看今日预约

**用户输入**: "显示今天的预约订单"

**执行 SQL**:
```sql
SELECT
    r.order_no, r.start_time, r.end_time, r.status,
    r.contact_name, r.contact_phone,
    s.name as store_name, h.name as hall_name
FROM reservations r
LEFT JOIN stores s ON r.store_id = s.id
LEFT JOIN halls h ON r.hall_id = h.id
WHERE r.reservation_date = CURRENT_DATE
ORDER BY r.start_time;
```

#### 查看本周预约

**用户输入**: "本周有多少预约订单"

**执行 SQL**:
```sql
SELECT
    status,
    COUNT(*) as count,
    SUM(total_amount) as total_amount
FROM reservations
WHERE reservation_date >= DATE_TRUNC('week', CURRENT_DATE)
  AND reservation_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
GROUP BY status;
```

#### 查看待确认订单

**用户输入**: "有哪些待确认的预约"

**执行 SQL**:
```sql
SELECT
    r.order_no, r.reservation_date, r.start_time,
    r.contact_name, r.contact_phone, r.created_at,
    s.name as store_name
FROM reservations r
JOIN stores s ON r.store_id = s.id
WHERE r.status = 'PENDING'
ORDER BY r.created_at;
```

---

### 统计查询

#### 场景包状态统计

**用户输入**: "统计场景包数量"

**执行 SQL**:
```sql
SELECT
    status,
    COUNT(*) as count
FROM scenario_packages
GROUP BY status;
```

**返回格式**:
```
场景包统计：

| 状态      | 数量 |
|----------|------|
| DRAFT    | 3    |
| PUBLISHED| 5    |
| ARCHIVED | 2    |

共 10 个场景包
```

#### 门店预约统计

**用户输入**: "统计各门店本月预约情况"

**执行 SQL**:
```sql
SELECT
    s.name as store_name,
    COUNT(r.id) as order_count,
    SUM(r.total_amount) as total_revenue
FROM stores s
LEFT JOIN reservations r ON s.id = r.store_id
    AND r.reservation_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND r.status IN ('CONFIRMED', 'COMPLETED')
GROUP BY s.id, s.name
ORDER BY total_revenue DESC;
```

---

## 操作类示例

### 场景包操作

#### 发布场景包

**用户输入**: "发布场景包'测试套餐'"

**执行流程**:
1. 查询场景包是否存在
2. 检查发布条件
3. 显示确认信息
4. 执行发布

**确认信息**:
```
即将执行: 发布场景包
目标: 测试套餐 (ID: xxx)
当前状态: DRAFT → PUBLISHED

是否继续？请回复 "是" 或 "确认" 继续执行。
```

#### 下架场景包

**用户输入**: "将场景包'过期套餐'下架"

**执行流程**:
1. 查询场景包
2. 检查关联预约
3. 显示影响范围
4. 执行下架

**确认信息**:
```
即将执行: 下架场景包
目标: 过期套餐 (ID: xxx)
当前状态: PUBLISHED → ARCHIVED
关联预约: 0 个待履约订单

是否继续？请回复 "是" 或 "确认" 继续执行。
```

---

### 门店设置操作

#### 修改预约时段

**用户输入**: "将旗舰店的周末预约时间改为 8:00-24:00"

**执行流程**:
1. 查询门店
2. 显示当前设置
3. 显示修改内容
4. 执行更新

**确认信息**:
```
即将执行: 修改预约时段
目标: 旗舰店

当前设置:
- 周末开始: 09:00
- 周末结束: 23:00

修改为:
- 周末开始: 08:00
- 周末结束: 24:00

是否继续？请回复 "是" 或 "确认" 继续执行。
```

#### 修改时长单位

**用户输入**: "把所有门店的预约时长单位改为2小时"

**执行流程**:
1. 统计受影响门店数量
2. 显示影响范围
3. 要求确认（批量操作）
4. 执行更新

**确认信息**:
```
即将执行: 批量修改预约时长单位
目标: 所有门店
影响范围: 8 家门店

修改内容: duration_unit 60 → 120 (分钟)

⚠️ 此操作将影响多家门店，请输入 "确认执行" 以继续。
```

---

## 帮助类示例

#### 如何发布场景包

**用户输入**: "如何发布一个场景包"

**返回**:
```
## 发布场景包步骤

### 1. 确认发布条件
场景包发布前必须满足以下条件：
- 名称不为空
- 设置了价格（price > 0）
- 选择了适用影厅
- 包含至少一项内容（硬权益/软权益/服务项目）

### 2. 检查场景包状态
只有状态为 DRAFT（草稿）的场景包可以发布。

### 3. 执行发布
说 "发布场景包'XXX'" 即可发布指定场景包。

### 注意事项
- 发布后场景包对所有用户可见
- 发布后只能修改部分字段
- 如需下架，说 "下架场景包'XXX'"
```

#### 什么是预约提前量

**用户输入**: "预约提前量是什么意思"

**返回**:
```
## 预约提前量说明

预约提前量是门店预约设置中的时间限制，包括两个参数：

### 最小提前时间 (min_advance_hours)
用户必须至少提前多少小时预约。

**示例**: 设置为 24 小时
- 今天是 1月1日 10:00
- 用户不能预约 1月2日 10:00 之前的时段

### 最大提前天数 (max_advance_days)
用户最多可以提前多少天预约。

**示例**: 设置为 30 天
- 今天是 1月1日
- 用户不能预约 1月31日 之后的时段

### 修改方法
说 "修改旗舰店的最小提前时间为12小时" 即可修改。
```

---

## 返回格式参考

### 成功结果

```
✅ 操作成功

操作: 发布场景包
目标: VIP派对套餐
结果: 状态已更新为 PUBLISHED

下一步建议: 可以说 "查看场景包'VIP派对套餐'详情" 确认发布结果
```

### 错误结果

```
❌ 操作失败

操作: 发布场景包
目标: 测试套餐
错误: 未满足发布条件

详情:
- 缺少价格设置
- 未选择适用影厅

建议: 请先完善场景包信息后再发布
```

### 列表结果

```
找到 10 条记录：

| 名称   | 状态      | 价格   |
|--------|----------|--------|
| 套餐A  | PUBLISHED | 2000  |
| 套餐B  | DRAFT     | 1500  |
| ...    | ...       | ...   |

提示：可以说 "查看套餐A详情" 获取更多信息
```

---

## 单位换算示例

### 换算计算

#### 基础换算

**用户输入**: "45ml威士忌等于多少瓶"

**执行命令**:
```bash
python calculate_conversion.py 45 ml 瓶
```

**返回格式**:
```
✅ 45ml = 0.1瓶
   换算路径: ml → 瓶
   换算率: 1ml = 0.001333瓶
   舍入: 0.06 → 0.1 (体积类)
```

#### 换算链计算

**用户输入**: "1瓶威士忌等于多少升"

**执行命令**:
```bash
python calculate_conversion.py 1 瓶 L
```

**返回格式**:
```
✅ 1瓶 = 0.8L
   换算路径: 瓶 → ml → L
   换算率: 1瓶 = 0.75L
   舍入: 0.75 → 0.8 (体积类)
```

#### 反向换算

**用户输入**: "750ml等于多少瓶"

**执行命令**:
```bash
python calculate_conversion.py 750 ml 瓶
```

**返回格式**:
```
✅ 750ml = 1瓶
   换算路径: ml → 瓶
   换算率: 1ml = 0.001333瓶
```

---

### 换算规则查询

#### 查看所有规则

**用户输入**: "查看所有换算规则"

**执行命令**:
```bash
python query_conversions.py
```

**返回格式**:
```
📋 找到 8 条换算规则:

【体积类】
  • 1ml = 0.001L (体积)  [ID: abc123...]
  • 1瓶 = 750ml (体积)  [ID: def456...]

【重量类】
  • 1g = 0.001kg (重量)  [ID: ghi789...]

【计数类】
  • 1箱 = 12瓶 (计数)  [ID: jkl012...]
```

#### 按类别筛选

**用户输入**: "查看体积类换算规则"

**执行命令**:
```bash
python query_conversions.py --category volume
```

#### 搜索单位

**用户输入**: "搜索包含'瓶'的换算规则"

**执行命令**:
```bash
python query_conversions.py --search 瓶
```

#### 统计规则

**用户输入**: "统计换算规则数量"

**执行命令**:
```bash
python query_conversions.py --stats
```

**返回格式**:
```
📊 换算规则统计:

  • 体积类 (volume):   4 条
  • 重量类 (weight):   2 条
  • 计数类 (quantity): 2 条
  ─────────────────────
  • 总计:              8 条
```

---

### 换算规则配置

#### 添加规则

**用户输入**: "添加换算规则：1箱=12瓶"

**执行流程**:
1. 解析输入（源单位=箱, 目标单位=瓶, 换算率=12）
2. 确认单位类别（计数类）
3. 检测循环依赖
4. 创建规则

**执行命令**:
```bash
python create_conversion.py 箱 瓶 12 quantity
```

**确认信息**:
```
即将创建换算规则:
  • 源单位: 箱
  • 目标单位: 瓶
  • 换算率: 1箱 = 12瓶
  • 类别: 计数类

是否继续？请回复 "是" 或 "确认" 继续执行。
```

**成功返回**:
```
✅ 已创建换算规则: 1箱 = 12瓶 (计数类)
```

#### 修改规则

**用户输入**: "将瓶→ml的换算率改为700"

**执行流程**:
1. 查询现有规则
2. 显示修改内容
3. 检测循环依赖
4. 执行更新

**确认信息**:
```
即将修改换算规则:
  • 规则: 1瓶 = ?ml
  • 原值: 750
  • 新值: 700

是否继续？请回复 "是" 或 "确认" 继续执行。
```

#### 删除规则

**用户输入**: "删除换算规则：箱→瓶"

**执行流程**:
1. 查询规则
2. 检查 BOM 引用
3. 检查换算路径依赖
4. 执行删除

**执行命令**:
```bash
python delete_conversion.py <规则ID>
```

**确认信息**:
```
即将删除换算规则:
  • 规则: 1箱 = 12瓶 (计数类)
  • ID: abc123...

⚠️ 删除后将无法通过 箱→瓶 进行换算。

是否继续？请回复 "是" 或 "确认" 继续执行。
```

---

### 换算路径查询

#### 检查换算路径

**用户输入**: "瓶和升之间能换算吗"

**执行命令**:
```bash
python calculate_conversion.py 1 瓶 L
```

**返回格式**:
```
✅ 可以换算
   换算路径: 瓶 → ml → L
   换算率: 1瓶 = 0.75L
```

**无路径时返回**:
```
❌ 无法找到从 '瓶' 到 'kg' 的换算路径
   建议: 请先配置相关换算规则
   示例: /ops 添加换算规则：1瓶=750ml
```

---

### 循环依赖检测

#### 检测循环

**用户输入**: "添加换算规则：ml→瓶"（假设已存在 瓶→ml）

**执行命令**:
```bash
python validate_cycle.py ml 瓶
```

**返回格式**:
```
⚠️ 检测到循环依赖!
   循环路径: ml → 瓶 → ml

   建议: 系统已自动支持反向换算，无需重复添加。
```

---

### 错误处理示例

#### 换算路径不存在

**用户输入**: "45瓶等于多少千克"

**返回**:
```
❌ 无法找到从 '瓶' 到 'kg' 的换算路径

   原因: 瓶(体积类) 和 kg(重量类) 属于不同类别，无法直接换算。

   建议:
   - 检查单位名称是否正确
   - 使用 "查看换算规则" 确认可用的换算关系
   - 如需添加换算规则，说 "添加换算规则：1瓶=?kg"
```

#### 无效换算数量

**用户输入**: "-45ml等于多少瓶"

**返回**:
```
❌ 换算数量必须为正数

   您输入的数量: -45
   建议: 请使用正数进行换算
```

#### 规则已存在

**用户输入**: "添加换算规则：1ml=0.001L"（规则已存在）

**返回**:
```
❌ 规则已存在: 1ml = 0.001L

   如需修改换算率，请说 "修改换算规则：ml→L 换算率改为 ?"
```
