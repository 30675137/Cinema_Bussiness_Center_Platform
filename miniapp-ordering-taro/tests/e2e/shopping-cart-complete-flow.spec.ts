/**
 * @spec O010-shopping-cart
 * E2E 测试：购物车完整流程验证
 *
 * 测试场景：E2E-O010-001-shopping-cart-complete-flow
 * 验证从商品列表添加商品、查看浮动按钮、打开购物车抽屉、修改数量、跳转结算的完整流程
 */

import { test, expect } from '@playwright/test'

test.describe('购物车完整流程验证', () => {
  test.beforeEach(async ({ page }) => {
    // 设置本地存储模拟登录状态
    await page.goto('http://localhost:10086')

    // 清空购物车状态
    await page.evaluate(() => {
      localStorage.clear()
    })
  })

  test('E2E-O010-001: 添加商品→浮动按钮→购物车抽屉→修改数量→结算', async ({ page }) => {
    // Step 1: 导航到商品列表页
    await page.goto('http://localhost:10086/pages/menu/index')
    await page.waitForLoadState('networkidle')

    // Step 2: 验证初始状态 - 购物车按钮不显示
    const floatingButton = page.locator('.floating-cart-button')
    await expect(floatingButton).not.toBeVisible()

    // Step 3: 添加第一个商品
    const firstProductAddBtn = page.locator('.product-card').nth(0).locator('.add-button')
    await firstProductAddBtn.click()
    await page.waitForTimeout(500) // 等待动画完成

    // Step 4: 验证浮动按钮出现
    await expect(floatingButton).toBeVisible()

    // Step 5: 验证角标数量为 1
    const badgeText = page.locator('.badge-text')
    await expect(badgeText).toHaveText('1')

    // Step 6: 增加商品数量到 3
    const increaseBtn = page.locator('.product-card').nth(0).locator('.btn-increase')
    await increaseBtn.click()
    await page.waitForTimeout(300)
    await increaseBtn.click()
    await page.waitForTimeout(300)

    // Step 7: 验证角标数量为 3
    await expect(badgeText).toHaveText('3')

    // Step 8: 添加第二个商品
    const secondProductAddBtn = page.locator('.product-card').nth(1).locator('.add-button')
    await secondProductAddBtn.click()
    await page.waitForTimeout(500)

    // Step 9: 验证角标数量为 4
    await expect(badgeText).toHaveText('4')

    // Step 10: 点击浮动购物车按钮
    await floatingButton.click()
    await page.waitForTimeout(350) // 等待抽屉动画

    // Step 11: 验证抽屉打开
    const cartDrawer = page.locator('.cart-drawer')
    await expect(cartDrawer).toBeVisible()

    // Step 12: 验证抽屉标题
    const drawerTitle = page.locator('.drawer-title')
    await expect(drawerTitle).toHaveText('订单汇总')

    // Step 13: 验证商品列表显示 2 个商品
    const cartItems = page.locator('.cart-item')
    await expect(cartItems).toHaveCount(2)

    // Step 14: 在抽屉中减少第一个商品数量
    const firstItemDecreaseBtn = cartItems.nth(0).locator('.btn-decrease')
    await firstItemDecreaseBtn.click()
    await page.waitForTimeout(300)

    // Step 15: 验证第一个商品数量减少
    const firstItemQuantity = cartItems.nth(0).locator('.quantity')
    await expect(firstItemQuantity).toHaveText('2')

    // Step 16: 验证总金额更新
    const totalAmount = page.locator('.total-amount')
    await expect(totalAmount).toBeVisible()

    // 验证总金额格式正确（¥XX.XX）
    const totalText = await totalAmount.textContent()
    expect(totalText).toMatch(/¥\d+\.\d{2}/)

    // Step 17: 删除第二个商品（数量减到 0）
    const secondItemDecreaseBtn = cartItems.nth(1).locator('.btn-decrease')
    await secondItemDecreaseBtn.click()
    await page.waitForTimeout(300)

    // Step 18: 验证商品列表只剩 1 个商品
    await expect(cartItems).toHaveCount(1)

    // Step 19: 点击支付按钮
    const payButton = page.locator('.pay-button')
    await payButton.click()
    await page.waitForTimeout(500)

    // Step 20: 验证跳转到订单确认页
    await expect(page).toHaveURL(/\/pages\/order-confirm\/index/)
  })

  test('E2E-O010-001-边界测试: 验证 99+ 角标显示', async ({ page }) => {
    await page.goto('http://localhost:10086/pages/menu/index')
    await page.waitForLoadState('networkidle')

    // 添加商品到数量 100
    const firstProductAddBtn = page.locator('.product-card').nth(0).locator('.add-button')
    await firstProductAddBtn.click()
    await page.waitForTimeout(500)

    // 连续点击增加按钮 99 次
    const increaseBtn = page.locator('.product-card').nth(0).locator('.btn-increase')
    for (let i = 0; i < 99; i++) {
      await increaseBtn.click()
      await page.waitForTimeout(100) // 减少等待时间以加快测试
    }

    // 验证角标显示 99+
    const badgeText = page.locator('.badge-text')
    await expect(badgeText).toHaveText('99+')
  })

  test('E2E-O010-001-空购物车: 验证空购物车提示', async ({ page }) => {
    await page.goto('http://localhost:10086/pages/menu/index')

    // 添加商品后再删除
    const firstProductAddBtn = page.locator('.product-card').nth(0).locator('.add-button')
    await firstProductAddBtn.click()
    await page.waitForTimeout(500)

    // 打开购物车抽屉
    const floatingButton = page.locator('.floating-cart-button')
    await floatingButton.click()
    await page.waitForTimeout(350)

    // 删除商品
    const decreaseBtn = page.locator('.cart-item').nth(0).locator('.btn-decrease')
    await decreaseBtn.click()
    await page.waitForTimeout(300)

    // 验证空购物车提示
    const emptyCart = page.locator('.empty-cart')
    await expect(emptyCart).toBeVisible()

    const emptyText = page.locator('.empty-text')
    await expect(emptyText).toHaveText('空空如也')

    // 验证结算区域不显示
    const checkoutSection = page.locator('.checkout-section')
    await expect(checkoutSection).not.toBeVisible()
  })
})
