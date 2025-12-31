# Lark PM - 飞书项目管理工具

使用飞书多维表格管理任务、技术债、Bug、功能和测试记录。

## 快速开始

### 1. 获取飞书应用凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 创建企业自建应用
3. 进入应用详情页，在"凭证与基础信息"中获取：
   - **App ID**: 应用的唯一标识
   - **App Secret**: 应用密钥
4. 点击"权限管理"，开通以下权限：
   - `bitable:app` - 多维表格应用权限
   - `bitable:app:readonly` - 多维表格应用读权限（可选）

### 2. 获取用户访问令牌（User Access Token）

有两种方式获取用户访问令牌：

#### 方式 A：使用飞书开发者工具（推荐）
1. 在应用页面点击"开发配置"
2. 找到"安全设置" → "重定向 URL"，添加 `http://localhost:8080`
3. 使用以下 URL 在浏览器中获取授权码：
   ```
   https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=YOUR_APP_ID&redirect_uri=http://localhost:8080&scope=bitable:app
   ```
4. 授权后浏览器会跳转到 `http://localhost:8080?code=xxxxx`
5. 复制 code，使用以下命令获取 access_token：
   ```bash
   curl -X POST https://open.feishu.cn/open-apis/authen/v1/oidc/access_token \
     -H 'Content-Type: application/json' \
     -d '{
       "grant_type": "authorization_code",
       "code": "YOUR_CODE",
       "client_id": "YOUR_APP_ID",
       "client_secret": "YOUR_APP_SECRET"
     }'
   ```

#### 方式 B：使用 Tenant Access Token（简化方式）
如果只是测试，可以暂时使用 Tenant Access Token：
```bash
curl -X POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal \
  -H 'Content-Type: application/json' \
  -d '{
    "app_id": "YOUR_APP_ID",
    "app_secret": "YOUR_APP_SECRET"
  }'
```
**注意**: Tenant Access Token 有效期为 2 小时，需要定期刷新。

### 3. 配置环境变量

在 `.claude/skills/lark-pm` 目录下创建 `.env` 文件：

```bash
cd .claude/skills/lark-pm
cp .env.example .env
```

编辑 `.env` 文件：

```env
LARK_APP_ID=cli_xxxxxxxxxxxxxxxx
LARK_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LARK_USER_ACCESS_TOKEN=u-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LOG_LEVEL=info
```

### 4. 安装依赖并编译

```bash
npm install
npm run build
```

### 5. 初始化飞书 Base App

```bash
node dist/index.js init
```

这会：
- 创建一个名为"项目管理系统"的 Base App
- 自动创建 5 张数据表（任务、技术债、Bug、功能、测试记录）
- 将配置保存到 `config.json`

### 6. 开始使用

#### 查看所有任务
```bash
node dist/index.js task list
```

#### 创建任务
```bash
node dist/index.js task create \
  --title "实现用户登录功能" \
  --priority "🔴 高" \
  --spec-id "S017" \
  --tags Frontend Backend
```

#### 按条件筛选
```bash
# 查看进行中的任务
node dist/index.js task list --status "🚀 进行中"

# 查看高优先级任务
node dist/index.js task list --priority "🔴 高"

# 查看特定规格的任务
node dist/index.js task list --spec-id "S017"
```

#### 更新任务
```bash
node dist/index.js task update \
  --task-id rec1234567890 \
  --status "✅ 已完成" \
  --progress 100
```

#### 导出任务
```bash
# 导出到 Excel
node dist/index.js task export \
  --format excel \
  --output tasks.xlsx

# 导出到 CSV
node dist/index.js task export \
  --format csv \
  --output tasks.csv \
  --status "🚀 进行中"
```

## 命令参考

### 任务字段枚举值

**优先级** (`--priority`):
- `🔴 高`
- `🟡 中`
- `🟢 低`

**状态** (`--status`):
- `📝 待办`
- `🚀 进行中`
- `✅ 已完成`
- `❌ 已取消`

**标签** (`--tags`):
- `Frontend`
- `Backend`
- `Test`
- `Docs`
- `Design`
- `Infra`

### 完整命令列表

```bash
# 查看帮助
node dist/index.js --help
node dist/index.js task --help

# 初始化
node dist/index.js init

# 任务管理
node dist/index.js task list [options]
node dist/index.js task create --title <title> [options]
node dist/index.js task update --task-id <id> [options]
node dist/index.js task delete --task-id <id> --confirm
node dist/index.js task export --format <excel|csv> --output <path> [options]
```

## 故障排除

### 问题 1: "未找到配置，请先运行 init 命令"
**解决方案**: 运行 `node dist/index.js init` 初始化系统

### 问题 2: "Failed to create Base App: 权限不足"
**解决方案**: 检查应用权限，确保开通了 `bitable:app` 权限

### 问题 3: Token 过期
**解决方案**:
- User Access Token 需要重新获取
- 或使用长期有效的方式（建议设置刷新令牌机制）

### 问题 4: 编译失败
**解决方案**:
```bash
rm -rf node_modules dist
npm install
npm run build
```

## 开发

```bash
# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format

# 开发模式（监听文件变化）
npm run dev
```

## 项目结构

```
.claude/skills/lark-pm/
├── src/                 # 源代码
├── dist/                # 编译输出
├── tests/               # 测试文件
├── config.json          # 运行时配置（init 后生成）
├── .env                 # 环境变量（需手动创建）
└── package.json
```

## 后续功能

当前已实现任务管理 MVP。后续可扩展：
- 技术债管理 (Phase 4)
- Bug 跟踪 (Phase 5)
- 功能矩阵 (Phase 6)
- 测试记录 (Phase 7)
- 统计报表和批量操作 (Phase 8)
