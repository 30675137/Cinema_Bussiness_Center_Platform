# Bug 修复 #3: 用户 Metadata 空指针异常

## 问题描述

**错误信息**:
```
Cannot invoke "java.util.Map.size()" because "m" is null
```

**触发场景**:
- 已有用户第二次登录时
- 尝试更新 `user_metadata` 中的 `last_login_at` 字段

---

## 根本原因

在 `AuthService.java:88`，代码尝试从已存在的用户中获取 `raw_user_meta_data`：

```java
// ❌ 错误的实现
Map<String, Object> existingMetadata = (Map<String, Object>) user.get("raw_user_meta_data");
Map<String, Object> updatedMetadata = new HashMap<>(existingMetadata); // NPE!
```

### 为什么 existingMetadata 为 null？

Supabase Auth 返回的用户数据可能使用不同的字段名：
- **user_metadata**: 用户自定义元数据
- **raw_user_meta_data**: 原始元数据（可能不存在）

当使用 `getUserByMetadata()` 查询用户时，返回的 Map 中可能不包含 `raw_user_meta_data` 字段，导致:
```java
user.get("raw_user_meta_data") == null
```

传递 null 给 `new HashMap<>(null)` 会抛出 NullPointerException。

---

## 解决方案

### 修复代码

```java
// ✅ 正确的实现
Map<String, Object> existingMetadata = (Map<String, Object>) user.get("raw_user_meta_data");
Map<String, Object> updatedMetadata = new HashMap<>();

// 如果已有 metadata，先复制过来
if (existingMetadata != null) {
    updatedMetadata.putAll(existingMetadata);
}

// 添加最后登录时间
updatedMetadata.put("last_login_at", java.time.Instant.now().toString());

user = supabaseAuthClient.updateUser((String) user.get("id"), updatedMetadata);
```

### 关键改进

1. **先创建空 HashMap**: `new HashMap<>()` 永远不会失败
2. **空值检查**: `if (existingMetadata != null)` 确保安全
3. **保留原有数据**: `putAll()` 复制已有字段
4. **添加新字段**: `put("last_login_at", ...)` 更新时间

---

## 修复文件

- ✅ `backend/src/main/java/com/cinema/hallstore/auth/service/AuthService.java:87-98`

---

## 测试验证

### 场景 1: 首次登录
- 创建新用户
- ✅ 不会触发此代码路径

### 场景 2: 第二次登录
- 查找已有用户
- 尝试更新 user_metadata
- ✅ 即使 `raw_user_meta_data` 为 null，也能正常处理

### 验证命令

```bash
# 在微信小程序中:
# 1. 清除缓存
wx.clearStorage()

# 2. 第一次登录
# 3. 清除缓存
wx.clearStorage()

# 4. 第二次登录 (应该成功,不报错)
```

---

## 相关 Bug 修复

1. **Bug #1**: pages/login 404 (编译缓存问题)
2. **Bug #2**: Supabase REST API 查询 404 (使用错误的 API)
3. **Bug #3**: Supabase 创建用户 400 (缺少 email 字段)
4. **Bug #4 (本次)**: Metadata 空指针异常

---

## 最佳实践

### Java Map 操作的防御性编程

```java
// ❌ 危险
Map<String, Object> copy = new HashMap<>(source); // source 可能为 null

// ✅ 安全
Map<String, Object> copy = new HashMap<>();
if (source != null) {
    copy.putAll(source);
}

// ✅ 或使用 Optional
Map<String, Object> copy = new HashMap<>(
    Optional.ofNullable(source).orElse(Collections.emptyMap())
);
```

---

**修复日期**: 2025-12-24
**影响范围**: 用户再次登录流程
**版本**: v1.0.3
