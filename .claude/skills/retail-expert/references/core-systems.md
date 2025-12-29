# 零售/电商核心系统设计参考

## 目录
- [会员系统](#会员系统)
- [订单系统](#订单系统)
- [库存系统](#库存系统)
- [促销系统](#促销系统)
- [支付系统](#支付系统)
- [商品系统](#商品系统)

---

## 会员系统

### 核心功能模块
1. **会员注册/登录**：多渠道注册（手机、微信、支付宝）、第三方授权登录
2. **会员等级体系**：成长值计算、等级晋升/保级规则、等级权益配置
3. **积分体系**：积分获取规则、积分消耗、积分有效期、积分商城
4. **会员标签**：自动标签（RFM模型）、手动标签、标签圈人
5. **会员画像**：基础属性、消费行为、偏好分析

### 数据模型核心实体
```
Member（会员主表）
├── member_id (主键)
├── mobile, email, nickname
├── level_id (等级)
├── points (积分)
├── growth_value (成长值)
├── register_channel (注册渠道)
├── register_time, last_login_time

MemberLevel（等级配置）
├── level_id, level_name
├── min_growth, max_growth
├── discount_rate (折扣率)
├── point_rate (积分倍率)

MemberPoints（积分流水）
├── member_id, points, type (获取/消耗)
├── source (来源), expire_time
```

### 关键接口
- `POST /member/register` - 会员注册
- `POST /member/login` - 会员登录
- `GET /member/info` - 获取会员信息
- `POST /member/points/add` - 积分发放
- `POST /member/points/consume` - 积分消耗

---

## 订单系统

### 核心功能模块
1. **购物车**：加购、改数量、选规格、凑单提示
2. **下单流程**：地址选择、优惠计算、支付方式、订单拆分
3. **订单状态机**：待支付→已支付→待发货→已发货→已完成→已取消
4. **售后服务**：退款、退货退款、换货、维修
5. **订单查询**：订单列表、订单详情、物流追踪

### 订单状态机
```
┌─────────┐  支付成功  ┌─────────┐   发货    ┌─────────┐  确认收货 ┌─────────┐
│ 待支付  │ ────────► │ 待发货  │ ────────► │ 已发货  │ ────────►│ 已完成  │
└─────────┘           └─────────┘           └─────────┘          └─────────┘
     │                     │                     │
     │ 超时/取消           │ 退款                │ 退货
     ▼                     ▼                     ▼
┌─────────┐           ┌─────────┐           ┌─────────┐
│ 已取消  │           │ 已退款  │           │ 售后中  │
└─────────┘           └─────────┘           └─────────┘
```

### 数据模型核心实体
```
Order（订单主表）
├── order_id, order_no
├── member_id, shop_id
├── total_amount, discount_amount, pay_amount
├── status, pay_status, deliver_status
├── address_info (收货地址JSON)
├── create_time, pay_time, deliver_time

OrderItem（订单明细）
├── item_id, order_id
├── sku_id, sku_name, sku_image
├── quantity, unit_price, total_price
├── promotion_info (优惠信息JSON)

OrderStatusLog（状态变更日志）
├── order_id, from_status, to_status
├── operator, operate_time, remark
```

### 关键接口
- `POST /order/create` - 创建订单
- `POST /order/pay` - 订单支付
- `POST /order/cancel` - 取消订单
- `GET /order/detail` - 订单详情
- `POST /order/deliver` - 订单发货

---

## 库存系统

### 核心功能模块
1. **库存管理**：实物库存、可用库存、锁定库存、在途库存
2. **库存操作**：入库、出库、调拨、盘点
3. **库存预警**：安全库存、补货提醒、滞销预警
4. **库存分配**：渠道库存分配、门店库存共享

### 库存类型说明
```
实物库存 = 仓库实际存放数量
可用库存 = 实物库存 - 锁定库存 - 不可售库存
锁定库存 = 订单占用但未出库的数量
在途库存 = 采购已发货但未入库的数量
```

### 库存操作流程
```
下单锁定库存 → 支付确认 → 出库扣减实物库存 → 发货
         ↓
     取消订单 → 释放锁定库存
```

### 数据模型核心实体
```
Inventory（库存主表）
├── sku_id, warehouse_id
├── total_qty (实物库存)
├── available_qty (可用库存)
├── locked_qty (锁定库存)

InventoryLog（库存流水）
├── sku_id, warehouse_id
├── operate_type (入库/出库/锁定/释放)
├── quantity, before_qty, after_qty
├── order_id (关联订单)
```

---

## 促销系统

### 促销类型
1. **单品促销**：直降、折扣、秒杀、限时特价
2. **订单促销**：满减、满折、满赠
3. **组合促销**：套装、捆绑销售
4. **优惠券**：代金券、折扣券、运费券
5. **会员专享**：会员价、会员日、专属券

### 促销优先级和叠加规则
```
计算顺序：
1. 单品促销（直降/折扣）
2. 优惠券
3. 订单级促销（满减/满折）
4. 积分抵扣
5. 运费优惠

叠加规则：
- 单品促销一般互斥
- 优惠券可与订单促销叠加
- 积分抵扣独立计算
```

### 数据模型核心实体
```
Promotion（促销活动）
├── promo_id, promo_name, promo_type
├── start_time, end_time
├── rule_config (规则配置JSON)
├── applicable_scope (适用范围)
├── status, priority

Coupon（优惠券）
├── coupon_id, coupon_type
├── face_value (面值/折扣)
├── threshold (使用门槛)
├── valid_start, valid_end
├── applicable_products (适用商品)

MemberCoupon（用户优惠券）
├── member_id, coupon_id
├── status (未使用/已使用/已过期)
├── use_time, use_order_id
```

---

## 支付系统

### 支付方式
1. **在线支付**：微信支付、支付宝、银联、Apple Pay
2. **货到付款**：POS刷卡、现金
3. **组合支付**：余额+在线支付、积分+在线支付
4. **分期支付**：花呗分期、信用卡分期

### 支付流程
```
创建支付单 → 调用支付渠道 → 等待支付结果
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
               支付成功              支付失败
                    ↓                   ↓
              更新订单状态          允许重试/取消
```

### 关键接口
- `POST /pay/create` - 创建支付
- `POST /pay/notify/{channel}` - 支付回调
- `GET /pay/query` - 支付查询
- `POST /refund/create` - 发起退款

---

## 商品系统

### 核心概念
- **SPU**：标准产品单元，如"iPhone 15 Pro"
- **SKU**：库存量单位，如"iPhone 15 Pro 256GB 黑色"
- **类目**：商品分类树，支持多级
- **属性**：关键属性（构成SKU）、销售属性、筛选属性

### 数据模型核心实体
```
Category（类目）
├── category_id, parent_id
├── category_name, level, sort

SPU（商品）
├── spu_id, spu_name
├── category_id, brand_id
├── main_image, detail_images
├── description, status

SKU（规格）
├── sku_id, spu_id
├── sku_name, sku_code
├── spec_values (规格值JSON)
├── price, market_price
├── stock, status
```
