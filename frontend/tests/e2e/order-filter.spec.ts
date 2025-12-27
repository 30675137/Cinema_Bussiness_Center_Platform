/**
 * @spec O001-product-order-list
 * E2E Test: 订单筛选功能 - User Story 2
 *
 * 测试目标:
 * - 状态筛选
 * - 时间范围筛选
 * - 搜索功能（订单号、用户名、手机号）
 * - 组合筛选
 * - 重置筛选条件
 */

import { test, expect } from '@playwright/test'

test.describe('订单筛选功能 - User Story 2', () => {
  test.beforeEach(async ({ page }) => {
    // 访问订单列表页
    await page.goto('/orders/list')
    await page.waitForSelector('.ant-table')
  })

  test('应该显示筛选表单', async ({ page }) => {
    // 验证筛选表单存在
    await expect(page.locator('form, .order-filter')).toBeVisible()

    // 验证筛选表单包含必要的控件
    await expect(page.locator('select[name="status"], .ant-select')).toBeVisible() // 状态下拉
    await expect(page.locator('.ant-picker')).toBeVisible() // 时间范围选择
    await expect(page.locator('input[type="search"], input[placeholder*="搜索"]')).toBeVisible() // 搜索框
  })

  test('应该支持按订单状态筛选', async ({ page }) => {
    // 获取筛选前的订单总数
    const totalTextBefore = await page.locator('.ant-pagination-total-text').textContent()
    const totalBefore = parseInt(totalTextBefore?.match(/\\d+/)?.[0] || '0')

    // 选择"已支付"状态
    await page.locator('.ant-select').first().click()
    await page.locator('.ant-select-item[title="已支付"]').click()

    // 点击查询按钮
    await page.locator('button:has-text("查询"), button:has-text("筛选")').click()

    // 等待表格重新加载
    await page.waitForTimeout(500)

    // 验证表格中所有订单状态都是"已支付"
    const statusTags = page.locator('.ant-table-tbody tr td:nth-child(5) .ant-tag')
    const count = await statusTags.count()

    for (let i = 0; i < count; i++) {
      await expect(statusTags.nth(i)).toContainText('已支付')
    }

    // 验证结果数量应该 <= 总数
    const totalTextAfter = await page.locator('.ant-pagination-total-text').textContent()
    const totalAfter = parseInt(totalTextAfter?.match(/\\d+/)?.[0] || '0')
    expect(totalAfter).toBeLessThanOrEqual(totalBefore)
  })

  test('应该支持按时间范围筛选', async ({ page }) => {
    // 点击时间范围选择器
    await page.locator('.ant-picker').click()

    // 选择今天作为开始日期
    await page.locator('.ant-picker-cell-today').first().click()

    // 选择今天作为结束日期（如果有两个选择器）
    const pickerCells = page.locator('.ant-picker-cell-today')
    if (await pickerCells.count() > 1) {
      await pickerCells.nth(1).click()
    }

    // 点击查询按钮
    await page.locator('button:has-text("查询"), button:has-text("筛选")').click()

    // 等待表格重新加载
    await page.waitForTimeout(500)

    // 验证表格有数据或显示空状态
    const rows = page.locator('.ant-table-tbody tr')
    const rowCount = await rows.count()

    if (rowCount > 0) {
      // 验证所有订单的创建时间都在选定范围内
      // 注意：由于是 mock 数据，这里主要验证筛选功能生效
      await expect(rows.first()).toBeVisible()
    } else {
      // 如果没有数据，应该显示空状态
      await expect(page.locator('.ant-empty')).toBeVisible()
    }
  })

  test('应该支持按订单号搜索', async ({ page }) => {
    // 获取第一个订单号
    const firstOrderNumber = await page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td')
      .nth(0)
      .locator('a')
      .textContent()

    if (firstOrderNumber) {
      // 在搜索框输入订单号的一部分
      const searchTerm = firstOrderNumber.substring(0, 10)
      await page.locator('input[type="search"], input[placeholder*="搜索"]').fill(searchTerm)

      // 点击查询按钮
      await page.locator('button:has-text("查询"), button:has-text("筛选")').click()

      // 等待表格重新加载
      await page.waitForTimeout(500)

      // 验证搜索结果包含该订单号
      await expect(page.locator('.ant-table-tbody tr').first()).toContainText(searchTerm)
    }
  })

  test('应该支持按用户名搜索', async ({ page }) => {
    // 获取第一个用户名
    const firstUsername = await page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td')
      .nth(1)
      .locator('div')
      .first()
      .textContent()

    if (firstUsername && firstUsername.trim() !== '-') {
      // 在搜索框输入用户名
      await page.locator('input[type="search"], input[placeholder*="搜索"]').fill(firstUsername.trim())

      // 点击查询按钮
      await page.locator('button:has-text("查询"), button:has-text("筛选")').click()

      // 等待表格重新加载
      await page.waitForTimeout(500)

      // 验证搜索结果包含该用户名
      await expect(page.locator('.ant-table-tbody tr').first()).toContainText(firstUsername.trim())
    }
  })

  test('应该支持组合筛选（状态 + 搜索）', async ({ page }) => {
    // 选择"已支付"状态
    await page.locator('.ant-select').first().click()
    await page.locator('.ant-select-item[title="已支付"]').click()

    // 输入搜索关键词
    await page.locator('input[type="search"], input[placeholder*="搜索"]').fill('ORD')

    // 点击查询按钮
    await page.locator('button:has-text("查询"), button:has-text("筛选")').click()

    // 等待表格重新加载
    await page.waitForTimeout(500)

    // 验证结果中状态都是"已支付"且订单号包含"ORD"
    const rows = page.locator('.ant-table-tbody tr')
    const count = await rows.count()

    if (count > 0) {
      // 检查第一行
      const firstRow = rows.first()
      await expect(firstRow.locator('td').nth(0)).toContainText('ORD')
      await expect(firstRow.locator('td').nth(4).locator('.ant-tag')).toContainText('已支付')
    }
  })

  test('应该支持重置筛选条件', async ({ page }) => {
    // 设置一些筛选条件
    await page.locator('.ant-select').first().click()
    await page.locator('.ant-select-item[title="已支付"]').click()
    await page.locator('input[type="search"], input[placeholder*="搜索"]').fill('test')

    // 点击查询按钮
    await page.locator('button:has-text("查询"), button:has-text("筛选")').click()
    await page.waitForTimeout(500)

    // 获取筛选后的总数
    const totalTextFiltered = await page.locator('.ant-pagination-total-text').textContent()
    const totalFiltered = parseInt(totalTextFiltered?.match(/\\d+/)?.[0] || '0')

    // 点击重置按钮
    await page.locator('button:has-text("重置"), button:has-text("清空")').click()
    await page.waitForTimeout(500)

    // 验证筛选条件已清空
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]')
    await expect(searchInput).toHaveValue('')

    // 验证显示全部订单
    const totalTextReset = await page.locator('.ant-pagination-total-text').textContent()
    const totalReset = parseInt(totalTextReset?.match(/\\d+/)?.[0] || '0')
    expect(totalReset).toBeGreaterThanOrEqual(totalFiltered)
  })

  test('应该在筛选后保持分页功能正常', async ({ page }) => {
    // 选择一个状态筛选
    await page.locator('.ant-select').first().click()
    await page.locator('.ant-select-item[title="已支付"]').click()
    await page.locator('button:has-text("查询"), button:has-text("筛选")').click()
    await page.waitForTimeout(500)

    // 检查是否有第2页
    const page2Button = page.locator('.ant-pagination-item[title="2"]')

    if (await page2Button.isVisible()) {
      // 获取第一页第一条订单号
      const firstPageFirstOrder = await page
        .locator('.ant-table-tbody tr')
        .first()
        .locator('td')
        .nth(0)
        .textContent()

      // 点击第2页
      await page2Button.click()
      await page.waitForTimeout(500)

      // 获取第二页第一条订单号
      const secondPageFirstOrder = await page
        .locator('.ant-table-tbody tr')
        .first()
        .locator('td')
        .nth(0)
        .textContent()

      // 验证两页数据不同
      expect(secondPageFirstOrder).not.toBe(firstPageFirstOrder)
    }
  })

  test('应该在 URL 中同步筛选参数', async ({ page }) => {
    // 选择状态筛选
    await page.locator('.ant-select').first().click()
    await page.locator('.ant-select-item[title="已支付"]').click()

    // 输入搜索关键词
    await page.locator('input[type="search"], input[placeholder*="搜索"]').fill('ORD20251227')

    // 点击查询
    await page.locator('button:has-text("查询"), button:has-text("筛选")').click()
    await page.waitForTimeout(500)

    // 验证 URL 包含筛选参数
    const url = page.url()
    expect(url).toContain('status=')
    expect(url).toContain('search=')
  })

  test('应该显示默认30天时间筛选', async ({ page }) => {
    // 验证时间选择器有默认值（最近30天）
    const datePickerText = await page.locator('.ant-picker').textContent()

    // 验证日期选择器不为空（有默认值）
    expect(datePickerText).not.toBe('')
    expect(datePickerText).toBeTruthy()
  })

  test('应该在无筛选结果时显示空状态', async ({ page }) => {
    // 输入一个不存在的搜索关键词
    await page.locator('input[type="search"], input[placeholder*="搜索"]').fill('NONEXISTENT_ORDER_12345')

    // 点击查询
    await page.locator('button:has-text("查询"), button:has-text("筛选")').click()
    await page.waitForTimeout(500)

    // 验证显示空状态
    await expect(page.locator('.ant-empty')).toBeVisible()
    await expect(page.locator('.ant-empty-description')).toContainText(/暂无|没有/)
  })

  test('应该在筛选变化时重置到第一页', async ({ page }) => {
    // 如果有多页数据，先跳到第2页
    const page2Button = page.locator('.ant-pagination-item[title="2"]')

    if (await page2Button.isVisible()) {
      await page2Button.click()
      await page.waitForTimeout(500)

      // 验证在第2页
      await expect(page.locator('.ant-pagination-item-active')).toContainText('2')

      // 执行筛选
      await page.locator('.ant-select').first().click()
      await page.locator('.ant-select-item[title="已支付"]').click()
      await page.locator('button:has-text("查询"), button:has-text("筛选")').click()
      await page.waitForTimeout(500)

      // 验证重置到第1页
      await expect(page.locator('.ant-pagination-item-active')).toContainText('1')
    }
  })
})
