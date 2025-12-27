# 快速入门指南：环境预设命令

**工具**: cc-presets
**版本**: 1.0
**平台**: macOS
**日期**: 2025-12-13

## 概述

cc-presets 是一个轻量级的环境变量管理工具，允许您快速在不同的 API 服务配置之间切换。通过简单的命令（如 `cc-claude`），您可以立即设置完整的环境变量集合，无需手动 export 每个变量。

## 安装

### 前置要求

- macOS 操作系统
- bash 3.2+ 或 zsh 5.8+（macOS 自带）
- python3（macOS 10.15+ 自带）

### 安装步骤

1. **克隆或下载项目**:
   ```bash
   cd ~/Downloads
   # 假设项目已下载到此目录
   ```

2. **运行安装脚本**:
   ```bash
   cd cc-presets
   ./install.sh
   ```

3. **重新加载 shell 配置**:
   ```bash
   # 如果使用 zsh（macOS Catalina+）
   source ~/.zshrc

   # 如果使用 bash
   source ~/.bash_profile
   ```

4. **验证安装**:
   ```bash
   cc-preset --help
   ```

   如果看到帮助消息，安装成功！

## 第一次使用

### 创建您的第一个预设

假设您想为 Claude API 创建一个配置预设：

```bash
cc-preset add claude \
    --api-key sk-ant-your-api-key-here \
    --model claude-3-sonnet-20240229 \
    --base-url https://api.anthropic.com \
    --description "Claude API for development"
```

输出：
```
✓ Preset 'claude' created successfully
  Activate with: cc-claude
```

### 激活预设

```bash
cc-claude
```

输出：
```
✓ Activated preset 'claude'
  ANTHROPIC_API_KEY=sk-ant-****
  ANTHROPIC_MODEL=claude-3-sonnet-20240229
  ANTHROPIC_BASE_URL=https://api.anthropic.com
```

### 验证环境变量

```bash
echo $ANTHROPIC_MODEL
```

输出：
```
claude-3-sonnet-20240229
```

### 使用 API

现在您可以直接使用依赖这些环境变量的工具：

```bash
claude "Hello, how are you?"
# 或任何使用 ANTHROPIC_API_KEY 的工具
```

## 常用场景

### 场景 1：管理多个 API 提供商

创建多个预设以快速切换：

```bash
# Claude API
cc-preset add claude \
    --api-key sk-ant-xxxxx \
    --model claude-3-sonnet-20240229 \
    --base-url https://api.anthropic.com

# GLM API（通过 BigModel）
cc-preset add glm \
    --api-key f40832ea44204eb9a91ae1751f70eac6.mPvF5krl5N7wsEqq \
    --model GLM-4.6 \
    --base-url https://open.bigmodel.cn/api/anthropic \
    --env ANTHROPIC_SMALL_FAST_MODEL=GLM-4.6

# OpenAI API
cc-preset add openai \
    --api-key sk-xxxxx \
    --model gpt-4 \
    --base-url https://api.openai.com/v1
```

切换使用：

```bash
# 使用 Claude
cc-claude
# 运行您的脚本或命令...

# 切换到 GLM
cc-glm
# 现在环境变量已更新为 GLM 配置

# 切换到 OpenAI
cc-openai
# 现在环境变量已更新为 OpenAI 配置
```

### 场景 2：开发/生产环境分离

为不同环境创建不同配置：

```bash
# 开发环境 - 使用免费模型
cc-preset add claude-dev \
    --api-key sk-ant-dev-key \
    --model claude-3-haiku-20240307 \
    --base-url https://api.anthropic.com \
    --description "Development environment"

# 生产环境 - 使用高级模型
cc-preset add claude-prod \
    --api-key sk-ant-prod-key \
    --model claude-3-opus-20240229 \
    --base-url https://api.anthropic.com \
    --description "Production environment"
```

使用：

```bash
# 开发时
cc-claude-dev

# 部署前测试
cc-claude-prod
```

### 场景 3：团队协作（共享配置结构）

虽然 API 密钥应该保密，但您可以共享配置结构：

1. **导出配置模板**（手动创建）:
   ```json
   {
     "version": "1.0",
     "presets": {
       "claude": {
         "env_vars": {
           "ANTHROPIC_API_KEY": "YOUR_API_KEY_HERE",
           "ANTHROPIC_MODEL": "claude-3-sonnet-20240229",
           "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
         }
       }
     }
   }
   ```

2. **团队成员使用模板**:
   ```bash
   # 复制模板
   cp config.template.json ~/.config/cc-presets/config.json

   # 编辑替换 YOUR_API_KEY_HERE
   vim ~/.config/cc-presets/config.json

   # 设置正确权限
   chmod 600 ~/.config/cc-presets/config.json
   ```

## 管理预设

### 查看所有预设

```bash
cc-preset list
```

输出：
```
Available presets:
  * claude (active)
      ANTHROPIC_API_KEY=sk-ant-****
      ANTHROPIC_MODEL=claude-3-sonnet-20240229
      ANTHROPIC_BASE_URL=https://api.anthropic.com
      Created: 2025-12-13 10:30:00

    glm
      ANTHROPIC_AUTH_TOKEN=f408****
      ANTHROPIC_MODEL=GLM-4.6
      ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
      Created: 2025-12-13 11:00:00

Use 'cc-<name>' to activate a preset
```

### 查看详细信息（JSON 格式）

```bash
cc-preset list --json | jq
```

### 查看当前状态

```bash
cc-preset status
```

输出：
```
Current preset: claude
Active since: current shell session

Environment variables:
  ANTHROPIC_API_KEY=sk-ant-****
  ANTHROPIC_MODEL=claude-3-sonnet-20240229
  ANTHROPIC_BASE_URL=https://api.anthropic.com
```

### 编辑现有预设

```bash
# 更新模型版本
cc-preset edit claude --model claude-3-opus-20240229

# 添加额外环境变量
cc-preset edit claude --env ANTHROPIC_TIMEOUT=300

# 更新 API 密钥
cc-preset edit claude --api-key sk-ant-new-key
```

### 删除预设

```bash
cc-preset delete old-preset
```

会提示确认：
```
WARNING: This will permanently delete preset 'old-preset'
Delete preset 'old-preset'? (y/N):
```

跳过确认：
```bash
cc-preset delete old-preset --force
```

## 高级用法

### 添加自定义环境变量

除了标准的 API 配置，您可以添加任意环境变量：

```bash
cc-preset add my-service \
    --api-key xxxxx \
    --model model-name \
    --base-url https://api.example.com \
    --env CUSTOM_VAR1=value1 \
    --env CUSTOM_VAR2=value2 \
    --env TIMEOUT=600
```

### 显示完整的敏感值

默认情况下，敏感值（如 API key）会被掩码。如需查看完整值：

```bash
cc-preset list --no-mask
cc-preset status --no-mask
```

### 在脚本中使用

```bash
#!/bin/bash

# 激活特定预设
cc-claude

# 运行依赖环境变量的命令
your-cli-tool --prompt "Hello"

# 完成后可以切换到其他预设或清理
cc-glm
```

### 嵌套 Shell 会话

每个 shell 会话独立管理其环境变量：

```bash
# 终端1
cc-claude
echo $ANTHROPIC_MODEL  # claude-3-sonnet-20240229

# 终端2（新窗口）
echo $ANTHROPIC_MODEL  # 未设置（或之前的值）
cc-glm
echo $ANTHROPIC_MODEL  # GLM-4.6

# 返回终端1
echo $ANTHROPIC_MODEL  # 仍然是 claude-3-sonnet-20240229
```

## 故障排除

### 问题 1：命令未找到

**症状**:
```bash
cc-preset: command not found
```

**解决方案**:
1. 检查安装是否成功：
   ```bash
   ls -la ~/.config/cc-presets/
   ```

2. 检查 shell 配置文件是否包含加载语句：
   ```bash
   # zsh
   cat ~/.zshrc | grep cc-presets

   # bash
   cat ~/.bash_profile | grep cc-presets
   ```

3. 手动重新加载配置：
   ```bash
   source ~/.zshrc  # 或 source ~/.bash_profile
   ```

### 问题 2：环境变量未设置

**症状**:
```bash
cc-claude
✓ Activated preset 'claude'
...

echo $ANTHROPIC_API_KEY
# 输出为空
```

**解决方案**:
1. 检查是否在子 shell 中：
   ```bash
   # 错误方式（在子 shell 中执行）
   bash -c "cc-claude"  # 不会影响当前 shell

   # 正确方式
   cc-claude  # 直接在当前 shell 执行
   ```

2. 验证配置文件格式：
   ```bash
   python3 -m json.tool ~/.config/cc-presets/config.json
   ```

### 问题 3：权限错误

**症状**:
```
ERROR: Permission denied
  File: ~/.config/cc-presets/config.json
```

**解决方案**:
```bash
chmod 600 ~/.config/cc-presets/config.json
chmod 700 ~/.config/cc-presets/
```

### 问题 4：配置文件损坏

**症状**:
```
ERROR: Failed to parse configuration file
  File: ~/.config/cc-presets/config.json
  Line: 15, Column: 8
```

**解决方案**:
1. 如果有备份，恢复：
   ```bash
   cp ~/.config/cc-presets/config.json.bak ~/.config/cc-presets/config.json
   ```

2. 如果没有备份，重新创建：
   ```bash
   rm ~/.config/cc-presets/config.json
   cc-preset add first-preset --api-key xxx --model yyy --base-url zzz
   ```

## 最佳实践

### 1. 命名约定

使用清晰、描述性的预设名称：

```bash
# 好的命名
cc-preset add claude-dev ...
cc-preset add claude-prod ...
cc-preset add glm-free ...

# 避免
cc-preset add c1 ...
cc-preset add temp ...
```

### 2. 安全性

- ✅ 将配置目录加入备份
- ✅ 定期轮换 API 密钥
- ✅ 不要将包含密钥的配置文件提交到版本控制
- ✅ 使用 .gitignore:
  ```
  .config/cc-presets/config.json
  ```

### 3. 文档化

为复杂预设添加描述：

```bash
cc-preset add complex-setup \
    --api-key xxx \
    --model yyy \
    --base-url zzz \
    --env VAR1=val1 \
    --env VAR2=val2 \
    --description "Special configuration for project X with custom timeout and retry settings"
```

### 4. 定期维护

```bash
# 查看所有预设
cc-preset list

# 删除不再使用的预设
cc-preset delete unused-preset

# 更新过时的配置
cc-preset edit old-preset --model new-model-version
```

## 卸载

如需卸载工具：

```bash
# 1. 从 shell 配置文件中移除加载语句
vim ~/.zshrc  # 或 ~/.bash_profile
# 删除包含 cc-presets 的行

# 2. 删除配置目录
rm -rf ~/.config/cc-presets/

# 3. 重新加载 shell
source ~/.zshrc  # 或 source ~/.bash_profile
```

## 获取帮助

### 命令行帮助

```bash
# 主帮助
cc-preset --help

# 子命令帮助
cc-preset help add
cc-preset help edit
cc-preset help list
```

### 文档

- 完整文档：参见 `docs/` 目录
- 数据模型：[data-model.md](./data-model.md)
- CLI 接口：[contracts/cli-interface.md](./contracts/cli-interface.md)
- 技术研究：[research.md](./research.md)

## 下一步

现在您已经掌握了基础用法，可以：

1. **创建自己的预设**：为常用的 API 服务创建配置
2. **探索高级功能**：使用自定义环境变量和选项
3. **集成到工作流**：将预设命令加入您的脚本和工具链
4. **阅读完整文档**：深入了解所有功能和选项

祝使用愉快！

---

**提示**: 如果您发现问题或有功能建议，请查阅项目文档或提交 issue。
