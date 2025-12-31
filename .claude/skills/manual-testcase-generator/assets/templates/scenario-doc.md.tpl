# {{title}}

**场景ID**: `{{scenario_id}}`
**模块**: {{module}}
{{#if description}}**描述**: {{description}}{{/if}}

---

## 标签

{{#if tags}}
{{#each tags}}
- `{{this}}`
{{/each}}
{{else}}
无标签
{{/if}}

---

## 前置条件

{{#if preconditions}}
{{#each preconditions}}
- {{this}}
{{/each}}
{{else}}
无特殊前置条件
{{/if}}

---

## 人工验证步骤

> 以下步骤摘自自动化测试场景，供人工复核使用。
> **注意**: 技术细节（CSS 选择器、定位器等）已被过滤，仅保留人类可读的操作描述。

| 步骤 | 操作描述 |
|------|----------|
{{#each steps}}
| {{@index}} | {{description}} |
{{/each}}

---

## 验证要点

完成上述步骤后，请确认：

{{#if assertions}}
{{#each assertions}}
- [ ] {{this}}
{{/each}}
{{else}}
- [ ] 所有步骤操作成功
- [ ] 页面显示符合预期
- [ ] 无异常错误提示
{{/if}}

---

## 人工验收记录

| 验收日期 | 验收人 | 结果 | 备注 |
|----------|--------|------|------|
| | | Pass / Fail / Blocked | |

---

*此文档由 manual-testcase-generator 从自动化场景 YAML 自动生成。*
*用于自动化测试的人工复核验收。*
*生成时间*: {{generated_at}}
*源文件*: `{{source_path}}`
