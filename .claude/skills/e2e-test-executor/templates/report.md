# {{ spec_id }} {{ spec_name }} 验收报告

**执行时间**: {{ execution_time }}
**验证文档**: {{ verification_doc_path }}
**执行耗时**: {{ duration }}

---

## 📊 验收概览

| 类别 | 通过 | 失败 | 跳过 | 通过率 |
|------|------|------|------|--------|
| API 验证 | {{ api_pass }} | {{ api_fail }} | {{ api_skip }} | {{ api_rate }}% |
| UI 验证 | {{ ui_pass }} | {{ ui_fail }} | {{ ui_skip }} | {{ ui_rate }}% |
| **总计** | **{{ total_pass }}** | **{{ total_fail }}** | **{{ total_skip }}** | **{{ total_rate }}%** |

---

## ✅ 通过的验证项

### API 验证

{% for item in api_passed %}
- [x] {{ item.name }}: {{ item.criterion }}
{% endfor %}

### UI 验证

{% for item in ui_passed %}
- [x] {{ item.step }}: {{ item.criterion }}
{% endfor %}

---

## ❌ 失败的验证项

{% for item in failed_items %}
### {{ loop.index }}. {{ item.criterion }}

**位置**: {{ item.category }} > {{ item.step }}
**预期**: {{ item.expected_value }}
**实际**: {{ item.actual_value }}

{% if item.error %}
**错误信息**: {{ item.error }}
{% endif %}

{% if item.response_data %}
**响应数据**:
```json
{{ item.response_data }}
```
{% endif %}

**建议**: {{ item.suggestion }}

{% endfor %}

---

## 📸 截图证据

| 截图 | 说明 |
|------|------|
{% for screenshot in screenshots %}
| ![{{ screenshot.name }}]({{ screenshot.path }}) | {{ screenshot.description }} |
{% endfor %}

---

## 📝 详细执行日志

### API 验证详情

{% for api_test in api_tests %}
#### {{ api_test.name }}

- **请求**: `{{ api_test.curl_command }}`
- **状态**: {{ api_test.status_code }} ({{ api_test.response_time_ms }}ms)
- **结果**: {{ api_test.pass_count }}/{{ api_test.total_count }} 通过

| 验收标准 | 结果 | 说明 |
|---------|------|------|
{% for v in api_test.verifications %}
| {{ v.criterion }} | {{ "✅" if v.passed else "❌" }} | {{ v.actual_value or "-" }} |
{% endfor %}

{% endfor %}

### UI 验证详情

{% for ui_test in ui_tests %}
#### {{ ui_test.name }}

- **URL**: {{ ui_test.base_url }}
- **耗时**: {{ ui_test.duration_ms }}ms
- **结果**: {{ ui_test.pass_count }}/{{ ui_test.total_count }} 通过

| 步骤 | 验证项 | 结果 |
|------|--------|------|
{% for v in ui_test.verifications %}
| {{ v.step }} | {{ v.criterion }} | {{ "✅" if v.passed else "❌" }} |
{% endfor %}

{% endfor %}

---

## ✅ 验收结论

{% if total_fail == 0 %}
- [x] **通过验收** - 所有核心功能正常，可进入下一阶段
{% elif critical_fail == 0 %}
- [x] **部分通过** - 存在 {{ total_fail }} 个次要问题，不影响主流程
{% else %}
- [ ] **未通过** - 存在 {{ critical_fail }} 个严重问题，需要修复后重新验证
{% endif %}

**签字确认**:
- 验证人: Claude Code (自动化执行)
- 执行时间: {{ execution_time }}

---

## 📝 备注

- 本报告由 e2e-test-executor 自动生成
- 验证文档: `{{ verification_doc_path }}`
- 相关规格: `{{ spec_path }}`
