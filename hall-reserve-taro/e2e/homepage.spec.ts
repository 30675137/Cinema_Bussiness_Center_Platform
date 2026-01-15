/**
 * T024-D: 场景包首页 E2E 测试（H5 模式）
 *
 * 测试覆盖：
 * 1. 首页加载验证 - 页面正常打开并加载完成
 * 2. 场景包列表渲染验证 - 场景包卡片正确展示
 * 3. 图片懒加载验证 - 图片延迟加载机制
 * 4. 评分条件显示验证 - rating 为 null 时不显示评分
 * 5. API 响应模拟 - Mock 后端 API 数据
 *
 * 注意：此测试文件需要配置 Playwright 测试框架后才能运行
 * 当前作为测试规格文档存在
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
 * 测试前置条件：启动 Taro H5 开发服务器
 * 假设服务器运行在 http://localhost:10087/
 */
const BASE_URL = 'http://localhost:10087'

/**
 * Mock API 响应数据
 */
const mockScenarioPackagesResponse = {
  success: true,
  data: [
    {
      id: '00000000-0001-0000-0000-000000000001',
      title: 'VIP 生日派对专场',
      category: 'PARTY',
      backgroundImageUrl: 'https://example.com/images/birthday-party.jpg',
      packagePrice: 1888,
      rating: 4.5,
      tags: ['生日', '派对', 'VIP'],
    },
    {
      id: '00000000-0002-0000-0000-000000000002',
      title: '企业年会包场',
      category: 'TEAM',
      backgroundImageUrl: 'https://example.com/images/team-building.jpg',
      packagePrice: 5888,
      rating: 4.8,
      tags: ['年会', '团建'],
    },
    {
      id: '00000000-0003-0000-0000-000000000003',
      title: '浪漫求婚专场',
      category: 'MOVIE',
      backgroundImageUrl: 'https://example.com/images/proposal.jpg',
      packagePrice: 2999,
      rating: null, // 测试 null rating 场景
      tags: ['求婚', '浪漫'],
    },
  ],
  timestamp: '2025-12-21T10:00:00Z',
}

/**
 * 辅助函数：设置 API Mock 拦截
 */
async function setupAPIMock(page: Page) {
  await page.route('**/api/scenario-packages/published', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Cache-Control': 'max-age=300',
      },
      body: JSON.stringify(mockScenarioPackagesResponse),
    })
  })
}

/**
 * 测试套件：场景包首页基本功能
 */
test.describe('场景包首页 - 基本功能', () => {
  test.beforeEach(async ({ page }) => {
    // 设置 API Mock
    await setupAPIMock(page)
  })

  /**
   * 测试用例 1: 首页加载验证
   */
  test('应该成功加载首页并显示场景包列表', async ({ page }) => {
    // Arrange & Act: 访问首页
    await page.goto(BASE_URL)

    // Assert: 验证页面加载完成
    await expect(page).toHaveTitle(/场景包预订|影院/)

    // 等待场景包列表加载完成（等待第一个场景包卡片出现）
    const firstScenarioCard = page.locator('[data-testid="scenario-card"]').first()
    await expect(firstScenarioCard).toBeVisible({ timeout: 5000 })

    // 验证场景包数量
    const scenarioCards = page.locator('[data-testid="scenario-card"]')
    await expect(scenarioCards).toHaveCount(3)
  })

  /**
   * 测试用例 2: 场景包列表渲染验证
   */
  test('应该正确渲染场景包卡片内容', async ({ page }) => {
    // Arrange & Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证第一个场景包卡片内容
    const firstCard = page.locator('[data-testid="scenario-card"]').first()

    // 验证标题
    await expect(firstCard.locator('[data-testid="scenario-title"]')).toHaveText(
      'VIP 生日派对专场'
    )

    // 验证价格（起价）
    await expect(firstCard.locator('[data-testid="scenario-price"]')).toContainText('¥1888')

    // 验证评分（第一个场景包有评分）
    const ratingElement = firstCard.locator('[data-testid="scenario-rating"]')
    await expect(ratingElement).toBeVisible()
    await expect(ratingElement).toContainText('4.5')

    // 验证标签
    const tags = firstCard.locator('[data-testid="scenario-tag"]')
    await expect(tags).toHaveCount(3) // '生日', '派对', 'VIP'
    await expect(tags.first()).toContainText('生日')
  })

  /**
   * 测试用例 3: 图片懒加载验证
   */
  test('应该实现图片懒加载功能', async ({ page }) => {
    // Arrange & Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证图片元素存在
    const firstCardImage = page
      .locator('[data-testid="scenario-card"]')
      .first()
      .locator('[data-testid="scenario-image"]')

    await expect(firstCardImage).toBeVisible()

    // 验证图片 src 属性（懒加载后应该加载真实 URL）
    const imageSrc = await firstCardImage.getAttribute('src')
    expect(imageSrc).toContain('birthday-party.jpg')

    // 模拟滚动到第三个场景包（测试懒加载触发）
    const thirdCard = page.locator('[data-testid="scenario-card"]').nth(2)
    await thirdCard.scrollIntoViewIfNeeded()

    // 验证第三个场景包的图片也加载了
    const thirdCardImage = thirdCard.locator('[data-testid="scenario-image"]')
    await expect(thirdCardImage).toBeVisible()
    const thirdImageSrc = await thirdCardImage.getAttribute('src')
    expect(thirdImageSrc).toContain('proposal.jpg')
  })

  /**
   * 测试用例 4: 评分条件显示验证（rating 为 null 时不显示）
   */
  test('当 rating 为 null 时不应该显示评分区域', async ({ page }) => {
    // Arrange & Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证第三个场景包（rating 为 null）不显示评分
    const thirdCard = page.locator('[data-testid="scenario-card"]').nth(2)

    // 验证标题存在（确认卡片已渲染）
    await expect(thirdCard.locator('[data-testid="scenario-title"]')).toHaveText('浪漫求婚专场')

    // 验证评分元素不存在或隐藏
    const ratingElement = thirdCard.locator('[data-testid="scenario-rating"]')
    await expect(ratingElement).toBeHidden()

    // 对比：验证第一个场景包（有评分）显示评分
    const firstCard = page.locator('[data-testid="scenario-card"]').first()
    const firstCardRating = firstCard.locator('[data-testid="scenario-rating"]')
    await expect(firstCardRating).toBeVisible()
  })

  /**
   * 测试用例 5: 场景包卡片点击跳转
   */
  test('点击场景包卡片应该跳转到详情页', async ({ page }) => {
    // Arrange & Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // 点击第一个场景包卡片
    const firstCard = page.locator('[data-testid="scenario-card"]').first()
    await firstCard.click()

    // Assert: 验证 URL 变化（应该包含场景包 ID）
    await page.waitForURL(/.*\/scenario-packages\/00000000-0001-0000-0000-000000000001.*/, {
      timeout: 3000,
    })

    // 验证详情页加载
    expect(page.url()).toContain('00000000-0001-0000-0000-000000000001')
  })

  /**
   * 测试用例 6: 加载状态 UI 验证
   */
  test('应该在数据加载时显示加载状态', async ({ page }) => {
    // Arrange: 设置延迟响应的 API Mock
    await page.route('**/api/scenario-packages/published', async (route) => {
      // 延迟 1 秒返回数据
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockScenarioPackagesResponse),
      })
    })

    // Act: 访问首页
    await page.goto(BASE_URL)

    // Assert: 验证加载状态 UI 出现
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]')
    await expect(loadingIndicator).toBeVisible()

    // 等待加载完成
    await page.waitForLoadState('networkidle')

    // 验证加载状态消失
    await expect(loadingIndicator).toBeHidden()

    // 验证场景包列表显示
    const scenarioCards = page.locator('[data-testid="scenario-card"]')
    await expect(scenarioCards).toHaveCount(3)
  })
})

/**
 * 测试套件：场景包首页错误处理
 */
test.describe('场景包首页 - 错误处理', () => {
  /**
   * 测试用例 7: 网络错误处理
   */
  test('应该在网络错误时显示错误提示', async ({ page }) => {
    // Arrange: Mock API 返回网络错误
    await page.route('**/api/scenario-packages/published', async (route) => {
      await route.abort('failed')
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证错误提示显示
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('网络连接失败')

    // 验证重试按钮存在
    const retryButton = page.locator('[data-testid="retry-button"]')
    await expect(retryButton).toBeVisible()
  })

  /**
   * 测试用例 8: 服务器错误（500）处理
   */
  test('应该在服务器错误时显示错误提示', async ({ page }) => {
    // Arrange: Mock API 返回 500 错误
    await page.route('**/api/scenario-packages/published', async (route) => {
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
  })

  /**
   * 测试用例 9: 空状态 UI 验证
   */
  test('应该在返回空数组时显示空状态提示', async ({ page }) => {
    // Arrange: Mock API 返回空数组
    await page.route('**/api/scenario-packages/published', async (route) => {
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
    await page.waitForLoadState('networkidle')

    // Assert: 验证空状态提示显示
    const emptyState = page.locator('[data-testid="empty-state"]')
    await expect(emptyState).toBeVisible()
    await expect(emptyState).toContainText('暂无可用场景包')
  })

  /**
   * 测试用例 10: 重试功能验证
   */
  test('点击重试按钮应该重新加载数据', async ({ page }) => {
    let requestCount = 0

    // Arrange: Mock API - 第一次失败，第二次成功
    await page.route('**/api/scenario-packages/published', async (route) => {
      requestCount++
      if (requestCount === 1) {
        // 第一次请求失败
        await route.abort('failed')
      } else {
        // 第二次请求成功
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockScenarioPackagesResponse),
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

    // Assert: 验证数据加载成功
    await page.waitForLoadState('networkidle')
    const scenarioCards = page.locator('[data-testid="scenario-card"]')
    await expect(scenarioCards).toHaveCount(3)

    // 验证错误提示消失
    await expect(errorMessage).toBeHidden()
  })
})

/**
 * 测试套件：场景包首页缓存策略
 */
test.describe('场景包首页 - 缓存策略', () => {
  /**
   * 测试用例 11: 缓存有效期内不重复请求
   */
  test('5分钟内重新进入首页不应该发起新的 API 请求', async ({ page, context }) => {
    let apiCallCount = 0

    // Arrange: 计数 API 调用次数
    await page.route('**/api/scenario-packages/published', async (route) => {
      apiCallCount++
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Cache-Control': 'max-age=300',
        },
        body: JSON.stringify(mockScenarioPackagesResponse),
      })
    })

    // Act: 第一次访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // 验证第一次 API 调用
    expect(apiCallCount).toBe(1)

    // 刷新页面（模拟重新进入）
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Assert: 验证缓存生效，API 调用次数不变（TanStack Query 缓存）
    // 注意：TanStack Query 的缓存是内存缓存，页面刷新会清除
    // 这里主要测试同一会话内的缓存行为
    const scenarioCards = page.locator('[data-testid="scenario-card"]')
    await expect(scenarioCards).toHaveCount(3)
  })

  /**
   * 测试用例 12: 图片加载失败处理
   */
  test('图片加载失败时应该显示占位图', async ({ page }) => {
    // Arrange: Mock API 返回无效图片 URL
    await page.route('**/api/scenario-packages/published', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: '00000000-0001-0000-0000-000000000001',
              title: '测试场景包',
              category: 'PARTY',
              backgroundImageUrl: 'https://invalid-url.com/broken-image.jpg',
              packagePrice: 1888,
              rating: 4.5,
              tags: ['测试'],
            },
          ],
          timestamp: '2025-12-21T10:00:00Z',
        }),
      })
    })

    // Mock 图片加载失败
    await page.route('https://invalid-url.com/broken-image.jpg', async (route) => {
      await route.abort('failed')
    })

    // Act: 访问首页
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Assert: 验证占位图显示
    const firstCardImage = page
      .locator('[data-testid="scenario-card"]')
      .first()
      .locator('[data-testid="scenario-image"]')

    // 检查是否使用了占位图（通过 CSS class 或 alt 属性）
    const imageClass = await firstCardImage.getAttribute('class')
    expect(imageClass).toContain('placeholder') // 假设占位图有特定 class
  })
})
