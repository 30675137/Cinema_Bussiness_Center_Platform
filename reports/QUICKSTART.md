# 测试报告历史保留 - 快速开始

## ✅ 已配置完成

历史报告保留功能已完全配置，可以开始使用。

## 🚀 使用方法

### 1. 运行测试

```bash
# 运行所有库存测试
cd frontend
npx playwright test ../scenarios/inventory/ --project=chromium

# 或运行单个测试
npx playwright test ../scenarios/inventory/E2E-INVENTORY-001.spec.ts
```

### 2. 归档测试结果

```bash
# 回到项目根目录
cd ..

# 归档当前测试报告（保留历史）
npm run test:e2e:archive
```

### 3. 查看历史报告

```bash
# 查看历史报告索引
cat reports/e2e/history/index.md

# 打开最新的 HTML 报告
open reports/e2e/html/index.html

# 打开特定历史报告
open reports/e2e/history/test-run-20251230-223000/html/index.html
```

## 📁 目录结构

```
reports/
├── README.md                           # 完整文档
├── QUICKSTART.md                       # 本文件
└── e2e/
    ├── html/                          # 最新 HTML 报告（不提交到 Git）
    ├── json/                          # 最新 JSON 报告（不提交到 Git）
    ├── junit/                         # 最新 JUnit XML（不提交到 Git）
    ├── artifacts/                     # 最新测试制品（不提交到 Git）
    └── history/                       # 历史归档（✅ 提交到 Git）
        ├── .gitkeep                   # 保持目录存在
        ├── index.md                   # 归档索引（自动生成）
        ├── test-run-20251230-223000/  # 历史归档 1
        ├── test-run-20251230-224500/  # 历史归档 2
        └── ...                        # 最多保留 10 个
```

## 🔍 什么会被保存到 Git？

### ✅ 提交到 Git
- `reports/e2e/history/` - 历史归档目录
- `reports/e2e/history/index.md` - 归档索引
- `reports/e2e/history/test-run-*/` - 每次测试运行的完整归档
- 归档的元数据（Git 分支、commit、时间戳）

### ❌ 不提交到 Git（.gitignore）
- `reports/e2e/html/` - 最新 HTML 报告
- `reports/e2e/json/results.json` - 最新 JSON 结果
- `reports/e2e/junit/results.xml` - 最新 JUnit XML
- `reports/e2e/artifacts/` - 最新测试制品

## ⚙️ 配置说明

### 保留策略

**默认**: 保留最近 **10 次**测试运行

**修改保留数量**:
```bash
# 编辑 scripts/archive-test-reports.sh
KEEP_LAST=20  # 改为保留 20 次
```

### 归档内容

每次归档包含：
- ✅ HTML 交互式报告
- ✅ JSON 机器可读结果
- ✅ JUnit XML (CI/CD 集成)
- ✅ 测试制品（截图、视频、追踪）
- ✅ 元数据（时间戳、Git 信息）

### 自动化归档

在 CI/CD 中自动归档：

```yaml
# .github/workflows/e2e-tests.yml
- name: Run E2E tests
  run: npm run test:e2e

- name: Archive test results
  if: always()
  run: npm run test:e2e:archive

- name: Commit archived reports
  run: |
    git add reports/e2e/history/
    git commit -m "chore: archive E2E test results [skip ci]"
    git push
```

## 📊 使用场景

### 场景 1: 追踪测试稳定性

```bash
# 查看最近 5 次测试的通过率
for dir in reports/e2e/history/test-run-*/; do
  echo "$(basename $dir):"
  jq '.stats' "$dir/json/results.json" 2>/dev/null || echo "  No data"
done
```

### 场景 2: 对比不同版本的测试结果

```bash
# 对比今天和昨天的测试
diff \
  <(jq '.suites' reports/e2e/json/results.json) \
  <(jq '.suites' reports/e2e/history/test-run-20251229-*/json/results.json)
```

### 场景 3: 查找回归问题

```bash
# 查看特定测试的历史结果
for dir in reports/e2e/history/test-run-*/; do
  echo "$(basename $dir):"
  jq '.suites[].specs[] | select(.title | contains("E2E-INVENTORY-001"))' \
    "$dir/json/results.json" 2>/dev/null || echo "  Not found"
done
```

## 🛠️ 故障排查

### 问题 1: 归档脚本找不到

```bash
# 解决方案：确保脚本可执行
chmod +x scripts/archive-test-reports.sh
```

### 问题 2: 没有报告可归档

```bash
# 解决方案：先运行测试
cd frontend
npx playwright test ../scenarios/inventory/
cd ..
npm run test:e2e:archive
```

### 问题 3: 归档占用空间过大

```bash
# 解决方案 1: 减少保留数量
# 编辑 scripts/archive-test-reports.sh
KEEP_LAST=5

# 解决方案 2: 禁用视频录制
# 编辑 frontend/playwright.config.ts
use: {
  video: 'off',  // 关闭视频录制
}
```

## 📚 完整文档

详细说明请查看：
- **完整文档**: `reports/README.md`
- **归档脚本**: `scripts/archive-test-reports.sh`
- **Playwright 配置**: `frontend/playwright.config.ts`
- **场景文档**: `scenarios/README.md`

## ✨ 示例工作流

```bash
# 1. 修改测试代码
vim scenarios/inventory/E2E-INVENTORY-001.yaml

# 2. 重新生成测试脚本
/e2e generate E2E-INVENTORY-001

# 3. 运行测试
cd frontend
npx playwright test ../scenarios/inventory/E2E-INVENTORY-001.spec.ts

# 4. 归档结果（保留历史）
cd ..
npm run test:e2e:archive

# 5. 查看报告
open reports/e2e/html/index.html

# 6. 提交到 Git
git add reports/e2e/history/
git commit -m "test: update E2E-INVENTORY-001 test results"
git push
```

---

**创建日期**: 2025-12-30
**维护者**: e2e-report-configurator skill (T006)
