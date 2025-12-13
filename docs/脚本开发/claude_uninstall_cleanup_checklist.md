# Claude（Claude Code CLI）与 Claude Code Router（ccr）卸载与清理核查文档（macOS / zsh）

> ⚠️安全提醒：你在聊天里已暴露过 API Key。请尽快去对应平台**撤销/重置**该 Key，并从 shell 配置与历史记录中移除相关内容（本文已包含清理步骤）。

---

## 1. 目标与范围

本卸载文档覆盖以下内容：

- 卸载 **Claude Code CLI（`claude`）**
- 卸载 **Claude Code Router（`ccr` / `@musistudio/claude-code-router`）**
- 清理用户级配置文件（如 `~/.claude*`、`~/.claude-code-router`）
- 清理项目级残留（`.claude/`、`.mcp.json`）
- 清理 shell 环境变量与 alias（`ANTHROPIC_*`、`SILICONFLOW_*` 等）
- 提供最终核查清单，确保“确实清干净”

---

## 2. 可选：卸载前备份（建议）

```bash
mkdir -p ~/backup_claude_uninstall_$(date +%Y%m%d_%H%M%S)
cp -a ~/.claude ~/.claude.json ~/.claude-code ~/.claude-code-router \
  ~/backup_claude_uninstall_$(date +%Y%m%d_%H%M%S) 2>/dev/null
```

---

## 3. 停止 Router 相关进程（如果曾运行过）

```bash
ccr stop 2>/dev/null || true
pkill -f "claude-code-router|ccr" 2>/dev/null || true
```

---

## 4. 卸载 Claude Code Router（ccr）

### 4.1 npm 全局卸载
```bash
npm uninstall -g @musistudio/claude-code-router
hash -r
```

### 4.2 删除 Router 配置与日志目录
```bash
rm -rf ~/.claude-code-router
```

---

## 5. 卸载 Claude（Claude Code CLI）

> Claude 常见安装来源有三类：**npm / brew / native**。建议都执行一遍，没装的那种不会造成影响。

### 5.1 npm 全局卸载（你当前环境很可能命中）
```bash
npm uninstall -g @anthropic-ai/claude-code
hash -r
```

### 5.2 Homebrew 卸载（如你曾用 brew cask 安装）
```bash
brew uninstall --cask claude-code 2>/dev/null || true
```

### 5.3 Native 安装残留清理（如你曾用官方脚本安装）
```bash
rm -f ~/.local/bin/claude
rm -rf ~/.claude-code
hash -r
```

---

## 6. 清理多 Node 版本（NVM 场景强烈建议）

你之前出现过 `claude` 位于：
`~/.nvm/versions/node/<version>/bin/claude`

这意味着“每个 Node 版本可能都装过一次”。

### 6.1 检查当前 NVM 版本列表
```bash
nvm ls
```

### 6.2 对所有 NVM 版本统一清扫（推荐一键）
```bash
for v in $(nvm ls --no-colors | awk '/v[0-9]+\./{print $1}'); do
  nvm use "$v" >/dev/null
  npm uninstall -g @anthropic-ai/claude-code >/dev/null 2>&1 || true
  npm uninstall -g @musistudio/claude-code-router >/dev/null 2>&1 || true
done
hash -r
```

---

## 7. 清理 Claude 用户级配置文件

```bash
rm -rf ~/.claude
rm -f  ~/.claude.json
```

---

## 8. 清理项目级残留（每个用过 claude 的项目都可能有）

进入你常用的代码根目录（或逐个仓库），查找：

```bash
find . -maxdepth 6 -name ".claude" -o -name ".mcp.json" 2>/dev/null
```

对命中的目录执行删除：

```bash
rm -rf <项目路径>/.claude
rm -f  <项目路径>/.mcp.json
```

---

## 9. 清理环境变量与 alias（避免新开终端“复活”）

### 9.1 立即清理当前终端（临时生效）
```bash
unset ANTHROPIC_BASE_URL
unset ANTHROPIC_API_KEY
unset ANTHROPIC_AUTH_TOKEN
unset ANTHROPIC_MODEL
unset SILICONFLOW_API_KEY
```

### 9.2 从 shell 配置文件中清理（永久生效）

#### 9.2.1 定位写入位置（带行号）
```bash
grep -nE "ANTHROPIC_|SILICONFLOW_|api\.siliconflow\.cn|moonshotai|Kimi-K2|ccr activate|claude-code-router|alias .*claude|alias .*ccr" \
  ~/.zshrc ~/.zshenv ~/.bashrc ~/.bash_profile ~/.profile 2>/dev/null
```

#### 9.2.2 编辑删除/注释以下类型行
- `export ANTHROPIC_BASE_URL=...`
- `export ANTHROPIC_API_KEY=...`
- `export ANTHROPIC_AUTH_TOKEN=...`
- `export ANTHROPIC_MODEL=...`
- `export SILICONFLOW_API_KEY=...`
- `eval "$(ccr activate)"`（若存在）
- 任何把上面变量写进 alias 的命令（如 `alias cc-kimi="ANTHROPIC_BASE_URL=... ... claude"`）

编辑完成后加载配置并刷新命令缓存：

```bash
source ~/.zshrc 2>/dev/null || true
source ~/.zshenv 2>/dev/null || true
hash -r
```

---

## 10. 最终核查清单（必须通过）

### 10.1 命令不可用
```bash
command -v claude || echo "claude removed"
command -v ccr    || echo "ccr removed"
```
**期望：** 都输出 `... removed`

### 10.2 PATH 中不存在同名命令
```bash
which -a claude 2>/dev/null || echo "no claude in PATH"
which -a ccr    2>/dev/null || echo "no ccr in PATH"
type -a claude  2>/dev/null || true
type -a ccr     2>/dev/null || true
```
**期望：** `which -a` 找不到；`type -a` 不列出任何路径

### 10.3 npm 全局包无残留（当前 Node）
```bash
npm -g ls --depth=0 | grep -E "anthropic-ai/claude|claude-code-router|musistudio" || echo "no related global npm packages"
```
**期望：** 输出 `no related global npm packages`

### 10.4 用户配置目录无残留
```bash
ls -ld ~/.claude ~/.claude.json ~/.claude-code-router ~/.claude-code 2>/dev/null || echo "config cleaned"
```
**期望：** 输出 `config cleaned`

### 10.5 环境变量无残留
```bash
env | grep -E 'ANTHROPIC_|SILICONFLOW_' || echo "env cleaned"
```
**期望：** 输出 `env cleaned`

### 10.6 Router 进程/端口无残留
```bash
ps aux | grep -E "claude-code-router|ccr" | grep -v grep || echo "no router process"
lsof -nP -iTCP -sTCP:LISTEN | grep -E "3456|ccr|claude" || echo "no related listening ports"
```
**期望：** 分别输出 `no router process` 和 `no related listening ports`

---

## 11. 常见问题排查

### 11.1 `command -v claude` 仍然有路径
原因通常是：
- 另一个 Node 版本的全局包还在（执行第 6 节全版本清扫）
- 你有多个 PATH（`~/.npm-global/bin`、`~/.nvm/.../bin`、`/usr/local/bin` 等）里还残留二进制
- shell 命令缓存未刷新（执行 `hash -r`）

快速定位：

```bash
which -a claude
ls -l "$(which claude)"
```

### 11.2 新开终端环境变量又出现
原因是仍写在 `~/.zshrc` 或 `~/.zshenv` 之类文件里。

快速定位：

```bash
grep -nE "ANTHROPIC_|SILICONFLOW_|api\.siliconflow\.cn|moonshotai|Kimi-K2" \
  ~/.zshrc ~/.zshenv ~/.bashrc ~/.bash_profile ~/.profile 2>/dev/null
```

---

## 12. 建议：清理 shell 历史中的泄露 Key（可选但推荐）

> 下面是“查找历史里是否出现过 key”的方法（不会自动删除）

```bash
grep -nE "ANTHROPIC_API_KEY=|SILICONFLOW_API_KEY=|sk-[A-Za-z0-9]+" ~/.zsh_history 2>/dev/null | head
```

若确认有敏感行，建议用编辑器打开 `~/.zsh_history` 删除对应行，然后执行：

```bash
fc -R
```
