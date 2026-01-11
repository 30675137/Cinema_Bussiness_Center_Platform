# Quickstart: 供应商编辑功能

**@spec N003-supplier-edit**
**Date**: 2026-01-11

## 快速开始

### 1. 启动服务

```bash
# 启动后端
cd backend
./mvnw spring-boot:run

# 启动前端
cd frontend
npm run dev
```

### 2. 访问页面

打开浏览器访问: http://localhost:3000/purchase-management/suppliers

## 功能验证

### 测试场景 1: 编辑供应商

1. 在供应商列表中找到一个供应商
2. 点击"编辑"按钮
3. 修改联系人为新的名字
4. 点击"确定"
5. 验证列表中联系人已更新

**预期结果**:
- 模态框打开时显示当前供应商信息
- 编码字段为只读状态
- 保存后列表自动刷新

### 测试场景 2: 新建供应商

1. 点击"新建供应商"按钮
2. 填写表单:
   - 编码: `TEST001`
   - 名称: `测试供应商`
   - 联系人: `测试联系人`
   - 联系电话: `13800138000`
   - 状态: `启用`
3. 点击"确定"

**预期结果**:
- 新供应商出现在列表中
- 所有字段显示正确

### 测试场景 3: 验证错误处理

1. 新建供应商时使用已存在的编码
2. 点击"确定"

**预期结果**:
- 显示"供应商编码已存在"错误提示
- 模态框保持打开状态

## API 测试

### 创建供应商

```bash
curl -X POST http://localhost:8080/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "code": "S999",
    "name": "测试供应商",
    "contactName": "张三",
    "contactPhone": "13800138000",
    "status": "ACTIVE"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "code": "S999",
    "name": "测试供应商",
    "contactName": "张三",
    "contactPhone": "13800138000",
    "status": "ACTIVE"
  },
  "timestamp": "2026-01-11T10:00:00Z"
}
```

### 更新供应商

```bash
curl -X PUT http://localhost:8080/api/suppliers/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新后的名称",
    "contactName": "李四",
    "contactPhone": "13900139000",
    "status": "SUSPENDED"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "code": "S999",
    "name": "更新后的名称",
    "contactName": "李四",
    "contactPhone": "13900139000",
    "status": "SUSPENDED"
  },
  "timestamp": "2026-01-11T10:00:00Z"
}
```

## 边界条件测试

| 场景 | 操作 | 预期结果 |
|------|------|---------|
| 必填字段为空 | 提交空名称 | 显示验证错误，阻止提交 |
| 手机号格式错误 | 输入非11位手机号 | 显示"请输入正确的手机号" |
| 编码重复 | 创建已存在的编码 | 返回 409 错误 |
| 供应商不存在 | 更新不存在的 ID | 返回 404 错误 |
| 网络错误 | 断开网络后提交 | 显示错误提示，保留表单 |

## 相关文件

### 后端

- `backend/src/main/java/com/cinema/procurement/controller/SupplierController.java`
- `backend/src/main/java/com/cinema/procurement/service/SupplierService.java`
- `backend/src/main/java/com/cinema/procurement/dto/SupplierCreateRequest.java`
- `backend/src/main/java/com/cinema/procurement/dto/SupplierUpdateRequest.java`

### 前端

- `frontend/src/services/supplierApi.ts`
- `frontend/src/pages/procurement/SupplierList.tsx`
