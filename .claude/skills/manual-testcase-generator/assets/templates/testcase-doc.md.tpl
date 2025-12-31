# {{title}}

**用例ID**: `{{testcase_id}}`
**模块**: {{module}}
**优先级**: {{priority}}
{{#if feature}}**功能点**: {{feature}}{{/if}}

---

## 前置条件

{{#if preconditions}}
| 项目 | 要求 |
|------|------|
{{#if preconditions.account}}| 账号 | {{preconditions.account}} |{{/if}}
{{#if preconditions.permissions}}| 权限 | {{preconditions.permissions}} |{{/if}}
{{#if preconditions.environment}}| 环境 | {{preconditions.environment}} |{{/if}}
{{#if preconditions.dependencies}}
{{#each preconditions.dependencies}}
| 依赖 | {{this}} |
{{/each}}
{{/if}}
{{else}}
无特殊前置条件
{{/if}}

---

## 测试数据

{{#if test_data}}
{{#if test_data.testdata_ref}}
**数据引用**: `{{test_data.testdata_ref}}`
{{/if}}

{{#each test_data}}
{{#unless (eq @key "testdata_ref")}}
- **{{@key}}**: {{this}}
{{/unless}}
{{/each}}
{{else}}
无特殊测试数据要求
{{/if}}

---

## 测试步骤

| 步骤 | 操作 | 输入 | 预期结果 |
|------|------|------|----------|
{{#each steps}}
| {{step_no}} | {{action}} | {{#if input}}{{input}}{{else}}-{{/if}} | {{expected}} |
{{/each}}

---

## 验证点

{{#if assertions}}
{{#each assertions}}
- [ ] {{this}}
{{/each}}
{{else}}
按照测试步骤中的预期结果进行验证
{{/if}}

---

## 元数据

{{#if metadata}}
- **创建时间**: {{metadata.created_at}}
- **创建人**: {{metadata.created_by}}
- **版本**: {{metadata.version}}
{{#if metadata.tags}}
- **标签**: {{#each metadata.tags}}`{{this}}` {{/each}}
{{/if}}
{{/if}}

---

*此文档由 manual-testcase-generator 自动生成，仅作为只读操作指南。*
*执行结果请记录在源 YAML 文件的 `executions` 字段中。*
*生成时间*: {{generated_at}}
*源文件*: `{{source_path}}`
