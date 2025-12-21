# C端（用户端/小程序）技术栈规则

## 适用范围
- 微信小程序
- 支付宝小程序
- H5 移动端应用
- 用户端 App

## 核心规则
**所有 C端 功能必须使用 Taro 框架开发**

## 技术栈

### 核心框架
| 技术 | 版本要求 | 用途 |
|-----|---------|------|
| Taro | 3.x+ | 多端统一开发框架 |
| React | 与 Taro 兼容版本 | UI 框架 |
| TypeScript | 5.x | 类型安全 |

### UI 组件库（必须 Taro 兼容）
| 推荐组件库 | 说明 |
|-----------|------|
| Taro UI | 官方组件库 |
| NutUI | 京东出品，多端兼容 |
| @tarojs/components | 基础组件 |

### 状态管理
| 技术 | 用途 |
|-----|------|
| Zustand | 客户端状态（推荐） |
| Redux | 复杂状态场景 |
| TanStack Query | 服务器状态 |

## 规则

### R4.1 多端适配要求
- 新功能必须至少支持 **微信小程序** 和 **H5** 两端
- 使用 Taro 条件编译处理平台差异

```typescript
// 条件编译示例
if (process.env.TARO_ENV === 'weapp') {
  // 微信小程序专属逻辑
} else if (process.env.TARO_ENV === 'h5') {
  // H5 专属逻辑
}
```

### R4.2 API 请求规范
```typescript
// 统一使用 Taro.request 封装
import Taro from '@tarojs/taro'

export const request = async <T>(options: RequestOptions): Promise<T> => {
  const response = await Taro.request({
    ...options,
    header: {
      Authorization: `Bearer ${getToken()}`,
      ...options.header
    }
  })
  return response.data
}
```

### R4.3 存储 API 规范
```typescript
// 使用 Taro 统一存储 API
import Taro from '@tarojs/taro'

// 存储数据
Taro.setStorageSync('key', value)

// 获取数据
const value = Taro.getStorageSync('key')
```

### R4.4 样式规范
- 使用 `rpx` 作为主要单位（750 设计稿基准）
- 避免使用不兼容的 CSS 特性（如 `calc()` 在部分平台有限制）

```less
// 推荐
.container {
  width: 750rpx;
  padding: 32rpx;
  font-size: 28rpx;
}
```

### R4.5 项目结构
```
hall-reserve-taro/
├── config/         # Taro 配置
├── src/
│   ├── components/ # 组件
│   ├── pages/      # 页面
│   ├── services/   # API 服务
│   ├── stores/     # 状态管理
│   ├── types/      # 类型定义
│   └── utils/      # 工具函数
├── package.json
└── project.config.json
```

### R4.6 禁止行为
- ❌ 禁止在 C端 使用 Ant Design、Element UI 等非 Taro 兼容 UI 库
- ❌ 禁止直接使用浏览器 API（window、document）而不做平台判断
- ❌ 禁止绕过 Taro 框架直接编写原生小程序代码
- ❌ 禁止使用仅单一平台可用的 API

## 启动命令
```bash
# H5 开发
cd hall-reserve-taro && npm run dev:h5

# 微信小程序开发
cd hall-reserve-taro && npm run dev:weapp

# 构建
npm run build:h5
npm run build:weapp
```
