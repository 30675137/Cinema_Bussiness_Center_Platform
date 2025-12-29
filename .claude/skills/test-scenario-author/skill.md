---
name: test-scenario-author
description: Use this skill to create, manage, and validate E2E test scenarios in YAML format for the Cinema Business Center Platform project. Supports guided scenario creation, YAML templates, scenario listing/filtering, and validation against E2EScenarioSpec rules. Trigger keywords e2e, scenario, test, E2E测试, 场景测试, 测试场景.
version: 1.0.0
---

# test-scenario-author

**@spec T001-e2e-scenario-author**

Use this skill to create, manage, and validate E2E test scenarios in YAML format for the Cinema Business Center Platform project.

## Commands

### `/test-scenario-author create`

Create a new E2E scenario through guided dialogue.

**Workflow**:

1. **Collect basic information**:
   - Ask: "What project spec is this scenario for? (e.g., P005, O003, S017)"
   - Store as `spec_ref`
   - Ask: "What is the scenario title? (1-100 characters, descriptive)"
   - Store as `title`
   - Ask: "Optionally, provide a detailed description:"
   - Store as `description` (can be empty)

2. **Determine module**:
   - Ask: "Which module does this scenario belong to? (e.g., order, inventory, store, payment, user)"
   - Store as `module`
   - Validate: module name must be lowercase letters, numbers, underscores, or hyphens only
   - Auto-generate `scenario_id` using the module (e.g., E2E-ORDER-001)
   - Inform user: "Generated scenario_id: `{scenario_id}`"

3. **Collect tags** (multi-dimensional):
   - Explain: "Tags help organize and filter scenarios. We need three required dimensions:"

   - **Module tags**:
     - Ask: "Module tags (comma-separated, e.g., order,payment,inventory):"
     - Default to `[module]` from step 2 if user presses Enter
     - Parse as array: `['order', 'payment']`

   - **Channel tags**:
     - Ask: "Channel tags (choose from: miniapp, h5, web, app - comma-separated):"
     - Parse as array

   - **Deploy tags**:
     - Ask: "Deploy tags (choose from: saas, onprem - comma-separated):"
     - Parse as array

   - **Optional tags**:
     - Ask: "Priority (p1, p2, or p3)? [default: p1]"
     - Store as `priority`
     - Ask: "Is this a smoke test? (yes/no) [default: no]"
     - Store as `smoke` (true/false)

4. **Collect preconditions**:
   - Ask: "What user role is required? (e.g., admin, normal_user, guest, manager)"
   - Store as `preconditions.role`
   - Ask: "Optionally, provide testdata reference for preconditions (e.g., storeTestData.store_001):"
   - Store as `preconditions.testdata_ref` if provided

5. **Collect steps**:
   - Explain: "Now let's define the test steps. Each step has an action and optional parameters."
   - Initialize empty `steps` array
   - Loop:
     - Ask: "Step action (e.g., login, navigate, click, input, submit, checkout, pay). Type 'done' to finish:"
     - If user types 'done', break loop
     - Store as `step.action`
     - Ask: "Parameters for this step? Use testdata_ref for data (e.g., testdata_ref: userTestData.user_001). Type 'skip' for none:"
     - If not 'skip', parse as YAML dict and store as `step.params`
     - Ask: "Optional description for this step:"
     - Store as `step.description` if provided
     - Ask: "Optional wait time in milliseconds (e.g., 1000):"
     - Store as `step.wait` if provided (convert to integer)
     - Add step to `steps` array
   - Validate: at least 1 step required

6. **Collect assertions**:
   - Explain: "Now let's define assertions to verify the scenario."
   - Initialize empty `assertions` array
   - Loop:
     - Ask: "Assertion type (ui or api). Type 'done' to finish:"
     - If user types 'done', break loop
     - Store as `assertion.type`
     - Ask: "What to check? (e.g., element_visible, response_status_is, database_field_equals):"
     - Store as `assertion.check`
     - Ask: "Parameters for this assertion (e.g., expected: 200). Type 'skip' for none:"
     - If not 'skip', parse as YAML dict and store as `assertion.params`
     - Ask: "Optional timeout in milliseconds [default: 5000]:"
     - Store as `assertion.timeout` if provided (convert to integer)
     - Add assertion to `assertions` array
   - Validate: at least 1 assertion required

7. **Generate and save scenario**:
   - Call Python script:
     ```python
     import sys
     sys.path.append('.claude/skills/test-scenario-author/scripts')
     import generate_scenario

     scenario_data = generate_scenario.generate_from_dialogue(
         spec_ref=spec_ref,
         title=title,
         module=module,
         tags={
             'module': module_tags,
             'channel': channel_tags,
             'deploy': deploy_tags,
             'priority': priority,
             'smoke': smoke
         },
         preconditions={
             'role': role,
             'testdata_ref': testdata_ref  # if provided
         },
         steps=steps,
         assertions=assertions,
         description=description  # if provided
     )

     output_path = generate_scenario.save_scenario(scenario_data)
     print(f"✅ Scenario created: {output_path}")
     ```

8. **Display result**:
   - Show success message with file path
   - Display the generated `scenario_id`
   - Suggest next steps: "You can now validate this scenario with `/test-scenario-author validate {scenario_id}`"

**Common actions reference**:
- `login` - 用户登录
- `logout` - 用户登出
- `navigate` - 页面导航
- `click` - 点击元素
- `input` - 输入文本
- `select` - 选择选项
- `submit` - 提交表单
- `browse_product` - 浏览商品
- `add_to_cart` - 添加到购物车
- `checkout` - 结账
- `pay` - 支付
- `create_order` - 创建订单
- `cancel_order` - 取消订单
- `adjust_inventory` - 调整库存
- `approve_adjustment` - 审批调整

**Common assertions reference**:
- **UI**: `element_visible`, `element_contains_text`, `page_url_matches`, `toast_message_shown`, `modal_opened`
- **API**: `response_status_is`, `response_body_contains`, `database_record_exists`, `database_field_equals`

---

### `/test-scenario-author template`

Provide a YAML template for manual editing.

**Workflow**:

1. **Display template path**:
   - Inform user: "Base scenario template available at: `.claude/skills/test-scenario-author/assets/templates/base-scenario.yaml`"

2. **Read and display template**:
   ```python
   import sys
   sys.path.append('.claude/skills/test-scenario-author/scripts')
   import yaml_utils
   from pathlib import Path

   template_path = Path('.claude/skills/test-scenario-author/assets/templates/base-scenario.yaml')
   template_content = template_path.read_text(encoding='utf-8')
   print(template_content)
   ```

3. **Provide instructions**:
   - "Copy the template above and modify it for your scenario."
   - "Key points:"
     - "Replace `E2E-MODULE-001` with unique scenario_id (format: E2E-<MODULE>-<NUMBER>)"
     - "Replace `X###` with your spec_ref (e.g., P005)"
     - "Fill in all required fields: scenario_id, spec_ref, title, tags, preconditions, steps, assertions"
     - "Use `testdata_ref` for all data - DO NOT hardcode URLs, IDs, or test data"
   - "Save your file to: `scenarios/<module>/<scenario_id>.yaml`"
   - "After saving, validate with: `/test-scenario-author validate <scenario-id>`"

4. **Reference documentation**:
   - "For detailed field descriptions, see: `.claude/skills/test-scenario-author/references/e2e-scenario-spec.md`"
   - "For schema validation rules: `.claude/skills/test-scenario-author/assets/templates/scenario-schema.json`"

---

### `/test-scenario-author list`

List and filter scenarios by module, spec_ref, or tags.

**Workflow**:

1. **Parse filter options**:
   - Check if `--module` option provided
   - Check if `--spec-ref` option provided
   - Check if `--tags` option provided

2. **Execute list script**:
   ```python
   import subprocess
   import sys

   cmd = [
       sys.executable,
       '.claude/skills/test-scenario-author/scripts/list_scenarios.py',
       '--format', 'table'
   ]

   # Add filters if provided
   if module_filter:
       cmd.extend(['--module', module_filter])
   if spec_ref_filter:
       cmd.extend(['--spec-ref', spec_ref_filter])
   if tags_filter:
       cmd.extend(['--tags', tags_filter])

   result = subprocess.run(cmd, capture_output=True, text=True)
   print(result.stdout)
   ```

3. **Display results**:
   - Show formatted table with: Scenario ID, Spec Ref, Title, Tags, File Path
   - If no scenarios match filters, display "No scenarios found."
   - Suggest commands: "To create a new scenario: `/test-scenario-author create`"

**Command variants**:
- `/test-scenario-author list` - List all scenarios
- `/test-scenario-author list --module order` - Filter by module
- `/test-scenario-author list --spec-ref P005` - Filter by spec_ref
- `/test-scenario-author list --tags module:order` - Filter by single tag
- `/test-scenario-author list --tags module:order,channel:miniapp` - Filter by multiple tags (AND logic)
- `/test-scenario-author list --module order --tags channel:miniapp` - Combine filters

**Tags query format**:
- Single tag: `module:order`
- Multiple tags (AND): `module:order,channel:miniapp,deploy:saas`
- Tag values match array elements: `module:order` matches scenarios with `module: [order]` or `module: [order, payment]`

---

### `/test-scenario-author validate <scenario-id>`

Validate a scenario file against E2EScenarioSpec rules.

**Workflow**:

1. **Parse scenario ID**:
   - Extract scenario_id from command argument
   - Example: `E2E-ORDER-001`

2. **Execute validation script**:
   ```python
   import subprocess
   import sys

   cmd = [
       sys.executable,
       '.claude/skills/test-scenario-author/scripts/validate_scenario.py',
       scenario_id
   ]

   result = subprocess.run(cmd, capture_output=True, text=True)
   print(result.stdout)
   if result.returncode != 0:
       print(result.stderr)
   ```

3. **Display validation results**:
   - If PASS: Show "✅ {scenario_id}: PASS" with any warnings
   - If FAIL: Show "❌ {scenario_id}: FAIL" with detailed errors

**Validation checks**:
1. **YAML syntax** - Valid YAML format
2. **Required fields** - scenario_id, spec_ref, title, tags, preconditions, steps, assertions
3. **JSON Schema** - Conforms to scenario-schema.json
4. **Environment decoupling** - No forbidden fields (environment, baseURL, tenant, domain)
5. **No hardcoded URLs** - No http:// or https:// in values
6. **Data decoupling** - Steps use testdata_ref (warnings if hardcoded data suspected)
7. **testdata_ref format** - Format: `<dataset>.<key>` (e.g., `storeTestData.store_001`)
8. **scenario_id format** - Format: `E2E-<MODULE>-<NUMBER>`

**Command variants**:
- `/test-scenario-author validate E2E-ORDER-001` - Validate single scenario
- `/test-scenario-author validate --all` - Validate all scenarios
- `/test-scenario-author validate --module order` - Validate all scenarios in module

**Output example (PASS)**:
```
✅ E2E-ORDER-001: PASS

Warnings:
  ⚠️  Step[2] action 'select_store' may contain hardcoded data: ['store_id']. Consider using 'testdata_ref' instead.
```

**Output example (FAIL)**:
```
❌ E2E-ORDER-001: FAIL

Errors:
  ❌ Missing required field: scenario_id
  ❌ Missing required tag dimension: channel
  ❌ Forbidden environment field found: 'baseURL' (violates environment decoupling)
  ❌ At least one step is required

Warnings:
  ⚠️  Step[0] action 'login' may contain hardcoded data: ['user_id']. Consider using 'testdata_ref' instead.
```

---

## Usage Examples

### Example 1: Create order scenario via dialogue

```
User: /test-scenario-author create
Claude: What project spec is this scenario for? (e.g., P005, O003, S017)
User: O003
Claude: What is the scenario title? (1-100 characters, descriptive)
User: User places order and completes payment
Claude: Optionally, provide a detailed description:
User: Verify the complete flow from browsing products to payment completion
Claude: Which module does this scenario belong to? (e.g., order, inventory, store, payment, user)
User: order
Claude: Generated scenario_id: E2E-ORDER-001
Claude: Tags help organize and filter scenarios. We need three required dimensions:
Claude: Module tags (comma-separated, e.g., order,payment,inventory):
User: order,payment
Claude: Channel tags (choose from: miniapp, h5, web, app - comma-separated):
User: miniapp
Claude: Deploy tags (choose from: saas, onprem - comma-separated):
User: saas
Claude: Priority (p1, p2, or p3)? [default: p1]
User: p1
Claude: Is this a smoke test? (yes/no) [default: no]
User: yes
Claude: What user role is required? (e.g., admin, normal_user, guest, manager)
User: normal_user
Claude: Optionally, provide testdata reference for preconditions (e.g., storeTestData.store_001):
User: orderTestData.user_001
Claude: Now let's define the test steps. Each step has an action and optional parameters.
Claude: Step action (e.g., login, navigate, click, input, submit, checkout, pay). Type 'done' to finish:
User: login
Claude: Parameters for this step? Use testdata_ref for data (e.g., testdata_ref: userTestData.user_001). Type 'skip' for none:
User: testdata_ref: orderTestData.user_001
Claude: Optional description for this step:
User: User logs in
Claude: Optional wait time in milliseconds (e.g., 1000):
User: skip
Claude: Step action (e.g., login, navigate, click, input, submit, checkout, pay). Type 'done' to finish:
User: browse_product
Claude: Parameters for this step? Use testdata_ref for data. Type 'skip' for none:
User: testdata_ref: orderTestData.product_popcorn
Claude: Optional description for this step:
User: skip
Claude: Optional wait time in milliseconds (e.g., 1000):
User: skip
Claude: Step action. Type 'done' to finish:
User: add_to_cart
Claude: Parameters for this step? Type 'skip' for none:
User: quantity: 2
Claude: Optional description for this step:
User: skip
Claude: Optional wait time in milliseconds:
User: skip
Claude: Step action. Type 'done' to finish:
User: checkout
Claude: Parameters. Type 'skip' for none:
User: skip
Claude: Step action. Type 'done' to finish:
User: pay
Claude: Parameters:
User: testdata_ref: orderTestData.payment_wechat
Claude: Step action. Type 'done' to finish:
User: done
Claude: Now let's define assertions to verify the scenario.
Claude: Assertion type (ui or api). Type 'done' to finish:
User: ui
Claude: What to check? (e.g., element_visible, response_status_is):
User: element_visible
Claude: Parameters (e.g., expected: 200). Type 'skip' for none:
User: element: order_success_page
Claude: Optional timeout in milliseconds [default: 5000]:
User: 3000
Claude: Assertion type. Type 'done' to finish:
User: api
Claude: What to check?:
User: database_field_equals
Claude: Parameters. Type 'skip' for none:
User: table: orders, field: status, expected: "paid"
Claude: Assertion type. Type 'done' to finish:
User: done
Claude: ✅ Scenario created: scenarios/order/E2E-ORDER-001.yaml
Claude: Generated scenario_id: E2E-ORDER-001
Claude: You can now validate this scenario with `/test-scenario-author validate E2E-ORDER-001`
```

### Example 2: Get template for manual editing

```
User: /test-scenario-author template
Claude: Base scenario template available at: `.claude/skills/test-scenario-author/assets/templates/base-scenario.yaml`
Claude: [displays template content]
Claude: Copy the template above and modify it for your scenario.
Claude: Key points:
  - Replace `E2E-MODULE-001` with unique scenario_id (format: E2E-<MODULE>-<NUMBER>)
  - Replace `X###` with your spec_ref (e.g., P005)
  - Fill in all required fields: scenario_id, spec_ref, title, tags, preconditions, steps, assertions
  - Use `testdata_ref` for all data - DO NOT hardcode URLs, IDs, or test data
Claude: Save your file to: `scenarios/<module>/<scenario_id>.yaml`
Claude: After saving, validate with: `/test-scenario-author validate <scenario-id>`
Claude: For detailed field descriptions, see: `.claude/skills/test-scenario-author/references/e2e-scenario-spec.md`
```

---

## References

- E2EScenarioSpec format: `references/e2e-scenario-spec.md`
- JSON Schema: `assets/templates/scenario-schema.json`
- Base template: `assets/templates/base-scenario.yaml`
- Project spec: `specs/T001-e2e-scenario-author/spec.md`
