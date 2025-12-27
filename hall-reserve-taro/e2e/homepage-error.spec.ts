/**
 * T035-C: 场景包首页 E2E 测试 - API 错误场景
 *
 * 测试覆盖：
 * 1. API 500 错误处理 - 服务器内部错误
 * 2. API 网络超时 - 请求超时场景
 * 3. API 空数组响应 - 无数据场景
 * 4. success=false 业务错误 - 后端业务逻辑错误
 * 5. 重试功能验证 - 错误恢复机制
 * 6. 错误提示 UI - 错误消息展示
 *
 * 注意：此测试文件需要配置 Playwright + MSW（Mock Service Worker）后才能运行
 * 当前作为测试规格文档存在
 *
 * MSW (Mock Service Worker) 用于在浏览器环境中拦截和模拟 API 请求
 * 比直接使用 Playwright 的 route() 更接近真实场景
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */

import { test, expect, Page } from '@playwright/test'

/**
 * 测试配置
 */
test.describe.configure({ mode: 'serial' })

/**
 * 测试基础配置
 */
const BASE_URL = 'http://localhost:10087'
const API_ENDPOINT = '**/api/scenario-packages/published'

/**
 * 辅助函数：等待加载状态消失
 */
async function waitForLoadingToFinish(page: Page) {
  const loadingIndicator = page.locator('[data-testid="loading-indicator"]')
  // 等待加载指示器消失
  await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 })
}

/**
 * 测试套件：API 错误场景处理
 */
test.describe('场景包首页 - API 错误场景', () => {
  /**
   * 测试用例 1: HTTP 500 服务器内部错误
   */
  test('应该正确处理 HTTP 500 服务器错误', async ({ page }) => {
    // Arrange: Mock API 返回 500 错误
    await page.route(API_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: '服务暂时不可用',
          timestamp: '2025-12-21T10:00:00Z',
        }),
      })
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证错误提示显示
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('服务暂时不可用')

    // 验证重试按钮存在
    const retryButton = page.locator('[data-testid="retry-button"]')
    await expect(retryButton).toBeVisible()
    await expect(retryButton).toHaveText('重试')

    // 验证场景包列表不显示
    const scenarioCards = page.locator('[data-testid="scenario-card"]')
    await expect(scenarioCards).toHaveCount(0)
  })

  /**
   * 测试用例 2: 网络请求超时
   */
  test('应该正确处理网络请求超时', async ({ page }) => {
    // Arrange: Mock API 延迟响应（超过 10 秒超时限制）
    await page.route(API_ENDPOINT, async (route) => {
      // 延迟 15 秒（超过前端 10 秒超时配置）
      await new Promise((resolve) => setTimeout(resolve, 15000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          timestamp: '2025-12-21T10:00:00Z',
        }),
      })
    })

    // Act: 访问首页
    await page.goto(BASE_URL)

    // Assert: 等待超时错误提示（应该在 10 秒左右出现）
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible({ timeout: 12000 })

    // 验证超时相关的错误消息
    await expect(errorMessage).toContainText(/超时|网络/)

    // 验证重试按钮存在
    const retryButton = page.locator('[data-testid="retry-button"]')
    await expect(retryButton).toBeVisible()
  })

  /**
   * 测试用例 3: API 返回空数组（无数据）
   */
  test('应该正确处理空数组响应（无数据场景）', async ({ page }) => {
    // Arrange: Mock API 返回空数组
    await page.route(API_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Cache-Control': 'max-age=300',
        },
        body: JSON.stringify({
          success: true,
          data: [],
          timestamp: '2025-12-21T10:00:00Z',
        }),
      })
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证空状态 UI 显示
    const emptyState = page.locator('[data-testid="empty-state"]')
    await expect(emptyState).toBeVisible()

    // 验证空状态消息
    const emptyMessage = page.locator('[data-testid="empty-message"]')
    await expect(emptyMessage).toContainText('暂无可用场景包')

    // 验证空状态图标
    const emptyIcon = page.locator('[data-testid="empty-icon"]')
    await expect(emptyIcon).toBeVisible()

    // 验证场景包列表不显示
    const scenarioCards = page.locator('[data-testid="scenario-card"]')
    await expect(scenarioCards).toHaveCount(0)

    // 验证错误提示不显示（空数据不是错误）
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeHidden()
  })

  /**
   * 测试用例 4: API 返回 success=false（业务逻辑错误）
   */
  test('应该正确处理业务逻辑错误（success=false）', async ({ page }) => {
    // Arrange: Mock API 返回 success=false
    await page.route(API_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 200, // HTTP 状态码为 200，但业务逻辑失败
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          data: [],
          message: '未授权访问，请先登录',
          timestamp: '2025-12-21T10:00:00Z',
        }),
      })
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证错误提示显示
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('未授权访问，请先登录')

    // 验证重试按钮存在
    const retryButton = page.locator('[data-testid="retry-button"]')
    await expect(retryButton).toBeVisible()
  })

  /**
   * 测试用例 5: 网络连接失败（abort）
   */
  test('应该正确处理网络连接失败', async ({ page }) => {
    // Arrange: Mock API 请求中止（模拟网络故障）
    await page.route(API_ENDPOINT, async (route) => {
      await route.abort('failed')
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证网络错误提示
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText(/网络连接失败|请检查网络/)

    // 验证重试按钮存在
    const retryButton = page.locator('[data-testid="retry-button"]')
    await expect(retryButton).toBeVisible()
  })

  /**
   * 测试用例 6: 重试功能 - 从错误恢复到成功
   */
  test('点击重试按钮应该能从错误状态恢复', async ({ page }) => {
    let requestCount = 0

    // Arrange: Mock API - 第一次失败，第二次成功
    await page.route(API_ENDPOINT, async (route) => {
      requestCount++

      if (requestCount === 1) {
        // 第一次请求：返回 500 错误
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: '服务暂时不可用',
            timestamp: '2025-12-21T10:00:00Z',
          }),
        })
      } else {
        // 第二次及之后请求：返回成功数据
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: '00000000-0001-0000-0000-000000000001',
                title: 'VIP 生日派对专场',
                category: 'PARTY',
                backgroundImageUrl: 'https://example.com/images/birthday.jpg',
                packagePrice: 1888,
                rating: 4.5,
                tags: ['生日', '派对'],
              },
            ],
            timestamp: '2025-12-21T10:00:00Z',
          }),
        })
      }
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // 验证错误提示显示
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()

    // 点击重试按钮
    const retryButton = page.locator('[data-testid="retry-button"]')
    await retryButton.click()

    // Assert: 等待加载完成
    await page.waitForLoadState('networkidle')

    // 验证错误提示消失
    await expect(errorMessage).toBeHidden()

    // 验证场景包列表显示
    const scenarioCards = page.locator('[data-testid="scenario-card"]')
    await expect(scenarioCards).toHaveCount(1)

    // 验证第一个场景包内容
    const firstCard = scenarioCards.first()
    await expect(firstCard.locator('[data-testid="scenario-title"]')).toHaveText(
      'VIP 生日派对专场'
    )
  })

  /**
   * 测试用例 7: 多次重试（持续失败）
   */
  test('多次重试失败应该持续显示错误提示', async ({ page }) => {
    // Arrange: Mock API 持续返回错误
    await page.route(API_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: '服务器维护中',
          timestamp: '2025-12-21T10:00:00Z',
        }),
      })
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // 验证错误提示显示
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()

    // 点击重试按钮 3 次
    const retryButton = page.locator('[data-testid="retry-button"]')
    for (let i = 0; i < 3; i++) {
      await retryButton.click()
      await page.waitForLoadState('networkidle')

      // Assert: 每次重试后错误提示仍然显示
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toContainText('服务器维护中')
    }

    // 验证场景包列表始终不显示
    const scenarioCards = page.locator('[data-testid="scenario-card"]')
    await expect(scenarioCards).toHaveCount(0)
  })

  /**
   * 测试用例 8: Zod 验证失败（无效数据格式）
   */
  test('应该正确处理无效的 API 响应格式', async ({ page }) => {
    // Arrange: Mock API 返回无效的数据格式
    await page.route(API_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'invalid-uuid', // 无效的 UUID 格式
              title: '测试场景包',
              // 缺少必需字段 category
              backgroundImageUrl: 'not-a-valid-url',
              packagePrice: -1000, // 负数价格
              rating: 10, // 超出 0-5 范围
              tags: 'not-an-array', // 应该是数组
            },
          ],
          timestamp: '2025-12-21T10:00:00Z',
        }),
      })
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证错误提示显示（Zod 验证失败应该抛出错误）
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()

    // 验证错误消息包含数据格式相关提示
    // 注意：实际错误消息取决于前端的错误处理逻辑
    await expect(errorMessage).toContainText(/格式|验证|数据/)

    // 验证重试按钮存在
    const retryButton = page.locator('[data-testid="retry-button"]')
    await expect(retryButton).toBeVisible()
  })

  /**
   * 测试用例 9: HTTP 404 Not Found
   */
  test('应该正确处理 HTTP 404 错误', async ({ page }) => {
    // Arrange: Mock API 返回 404
    await page.route(API_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: '请求的资源不存在',
          timestamp: '2025-12-21T10:00:00Z',
        }),
      })
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证错误提示显示
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('请求的资源不存在')
  })

  /**
   * 测试用例 10: 加载指示器在错误时消失
   */
  test('错误发生时加载指示器应该消失', async ({ page }) => {
    // Arrange: Mock API 返回错误
    await page.route(API_ENDPOINT, async (route) => {
      // 延迟 1 秒返回错误
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: '服务器错误',
          timestamp: '2025-12-21T10:00:00Z',
        }),
      })
    })

    // Act: 访问首页
    await page.goto(BASE_URL)

    // 验证加载指示器先显示
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]')
    await expect(loadingIndicator).toBeVisible()

    // 等待加载完成（或失败）
    await page.waitForLoadState('networkidle')

    // Assert: 验证加载指示器消失
    await expect(loadingIndicator).toBeHidden()

    // 验证错误提示显示
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()
  })

  /**
   * 测试用例 11: 重试时显示加载状态
   */
  test('点击重试时应该显示加载状态', async ({ page }) => {
    let requestCount = 0

    // Arrange: Mock API - 第一次失败，第二次延迟成功
    await page.route(API_ENDPOINT, async (route) => {
      requestCount++

      if (requestCount === 1) {
        // 第一次请求：立即返回错误
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: '服务器错误',
            timestamp: '2025-12-21T10:00:00Z',
          }),
        })
      } else {
        // 第二次请求：延迟 1 秒返回成功
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [],
            timestamp: '2025-12-21T10:00:00Z',
          }),
        })
      }
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // 点击重试按钮
    const retryButton = page.locator('[data-testid="retry-button"]')
    await retryButton.click()

    // Assert: 验证加载指示器显示
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]')
    await expect(loadingIndicator).toBeVisible()

    // 等待加载完成
    await page.waitForLoadState('networkidle')

    // 验证加载指示器消失
    await expect(loadingIndicator).toBeHidden()
  })
})
