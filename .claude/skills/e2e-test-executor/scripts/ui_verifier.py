#!/usr/bin/env python3
"""
UI 验证器 - 使用 Playwright 执行前端 UI 验证
"""

import os
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright, Page, Browser
except ImportError:
    print("请安装 playwright: pip install playwright && playwright install chromium")
    raise


@dataclass
class UIVerificationResult:
    """UI 验证结果"""
    step: str
    criterion: str
    passed: bool
    screenshot_path: Optional[str] = None
    actual_value: Any = None
    expected_value: Any = None
    error: Optional[str] = None


@dataclass
class UITestResult:
    """UI 测试结果"""
    name: str
    base_url: str
    verifications: List[UIVerificationResult] = field(default_factory=list)
    screenshots: List[str] = field(default_factory=list)
    start_time: datetime = field(default_factory=datetime.now)
    end_time: Optional[datetime] = None

    @property
    def passed(self) -> bool:
        return all(v.passed for v in self.verifications)

    @property
    def pass_count(self) -> int:
        return sum(1 for v in self.verifications if v.passed)

    @property
    def fail_count(self) -> int:
        return sum(1 for v in self.verifications if not v.passed)

    @property
    def duration_ms(self) -> float:
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds() * 1000
        return 0


class UIVerifier:
    """UI 验证器"""

    def __init__(
        self,
        base_url: str,
        screenshot_dir: str = "reports/screenshots",
        headless: bool = True,
        slow_mo: int = 100
    ):
        self.base_url = base_url
        self.screenshot_dir = Path(screenshot_dir)
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        self.headless = headless
        self.slow_mo = slow_mo
        self.page: Optional[Page] = None
        self.browser: Optional[Browser] = None
        self.screenshot_count = 0

    def __enter__(self):
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(
            headless=self.headless,
            slow_mo=self.slow_mo
        )
        self.page = self.browser.new_page()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()

    def take_screenshot(self, name: str) -> str:
        """截取屏幕截图"""
        self.screenshot_count += 1
        filename = f"{self.screenshot_count:02d}-{name}.png"
        filepath = self.screenshot_dir / filename
        self.page.screenshot(path=str(filepath), full_page=True)
        return str(filepath)

    def navigate(self, url: str = None):
        """导航到页面"""
        target_url = url or self.base_url
        self.page.goto(target_url)
        self.page.wait_for_load_state('networkidle')

    def verify_element_exists(
        self,
        selector: str,
        description: str
    ) -> UIVerificationResult:
        """验证元素存在"""
        try:
            locator = self.page.locator(selector)
            exists = locator.count() > 0
            return UIVerificationResult(
                step="元素存在验证",
                criterion=description,
                passed=exists,
                actual_value=f"找到 {locator.count()} 个元素" if exists else "未找到元素",
                expected_value=f"元素 {selector} 存在"
            )
        except Exception as e:
            return UIVerificationResult(
                step="元素存在验证",
                criterion=description,
                passed=False,
                error=str(e)
            )

    def verify_text_content(
        self,
        selector: str,
        expected_text: str,
        description: str
    ) -> UIVerificationResult:
        """验证元素文本内容"""
        try:
            locator = self.page.locator(selector).first
            actual_text = locator.text_content()
            passed = expected_text in actual_text if actual_text else False
            return UIVerificationResult(
                step="文本内容验证",
                criterion=description,
                passed=passed,
                actual_value=actual_text,
                expected_value=expected_text
            )
        except Exception as e:
            return UIVerificationResult(
                step="文本内容验证",
                criterion=description,
                passed=False,
                error=str(e)
            )

    def verify_element_count(
        self,
        selector: str,
        min_count: int,
        description: str
    ) -> UIVerificationResult:
        """验证元素数量"""
        try:
            locator = self.page.locator(selector)
            count = locator.count()
            passed = count >= min_count
            return UIVerificationResult(
                step="元素数量验证",
                criterion=description,
                passed=passed,
                actual_value=f"{count} 个元素",
                expected_value=f">= {min_count} 个元素"
            )
        except Exception as e:
            return UIVerificationResult(
                step="元素数量验证",
                criterion=description,
                passed=False,
                error=str(e)
            )

    def verify_element_visible(
        self,
        selector: str,
        description: str
    ) -> UIVerificationResult:
        """验证元素可见"""
        try:
            locator = self.page.locator(selector).first
            is_visible = locator.is_visible()
            return UIVerificationResult(
                step="元素可见性验证",
                criterion=description,
                passed=is_visible,
                actual_value="可见" if is_visible else "不可见",
                expected_value="可见"
            )
        except Exception as e:
            return UIVerificationResult(
                step="元素可见性验证",
                criterion=description,
                passed=False,
                error=str(e)
            )

    def verify_element_has_class(
        self,
        selector: str,
        class_name: str,
        description: str
    ) -> UIVerificationResult:
        """验证元素包含指定 class"""
        try:
            locator = self.page.locator(selector).first
            classes = locator.get_attribute('class') or ''
            passed = class_name in classes
            return UIVerificationResult(
                step="元素样式验证",
                criterion=description,
                passed=passed,
                actual_value=classes,
                expected_value=f"包含 class: {class_name}"
            )
        except Exception as e:
            return UIVerificationResult(
                step="元素样式验证",
                criterion=description,
                passed=False,
                error=str(e)
            )

    def click_element(self, selector: str, description: str) -> UIVerificationResult:
        """点击元素"""
        try:
            locator = self.page.locator(selector).first
            locator.click()
            self.page.wait_for_load_state('networkidle')
            return UIVerificationResult(
                step="点击操作",
                criterion=description,
                passed=True,
                actual_value="点击成功"
            )
        except Exception as e:
            return UIVerificationResult(
                step="点击操作",
                criterion=description,
                passed=False,
                error=str(e)
            )

    def verify_price_format(
        self,
        selector: str,
        description: str
    ) -> UIVerificationResult:
        """验证价格格式（¥XX.XX）"""
        try:
            locator = self.page.locator(selector).first
            price_text = locator.text_content()
            # 匹配 ¥XX.XX 或 ￥XX.XX 格式
            pattern = r'[¥￥]\s*\d+\.?\d*'
            passed = bool(re.search(pattern, price_text)) if price_text else False
            return UIVerificationResult(
                step="价格格式验证",
                criterion=description,
                passed=passed,
                actual_value=price_text,
                expected_value="¥XX.XX 格式"
            )
        except Exception as e:
            return UIVerificationResult(
                step="价格格式验证",
                criterion=description,
                passed=False,
                error=str(e)
            )

    def verify_list_filtered(
        self,
        list_selector: str,
        filter_text: str,
        description: str
    ) -> UIVerificationResult:
        """验证列表已过滤"""
        try:
            items = self.page.locator(list_selector).all()
            # 检查所有项是否包含过滤文本
            all_contain = all(
                filter_text.lower() in (item.text_content() or '').lower()
                for item in items
            )
            return UIVerificationResult(
                step="列表过滤验证",
                criterion=description,
                passed=all_contain or len(items) == 0,
                actual_value=f"{len(items)} 个项目",
                expected_value=f"只包含 '{filter_text}' 相关项"
            )
        except Exception as e:
            return UIVerificationResult(
                step="列表过滤验证",
                criterion=description,
                passed=False,
                error=str(e)
            )


def run_ui_test(
    name: str,
    base_url: str,
    steps: List[Dict[str, Any]],
    screenshot_dir: str = "reports/screenshots",
    headless: bool = True
) -> UITestResult:
    """
    执行 UI 测试

    Args:
        name: 测试名称
        base_url: 基础 URL
        steps: 验证步骤列表
        screenshot_dir: 截图保存目录
        headless: 是否无头模式

    Returns:
        UITestResult
    """
    result = UITestResult(name=name, base_url=base_url)

    with UIVerifier(base_url, screenshot_dir, headless) as verifier:
        verifier.navigate()

        for step in steps:
            action = step.get('action')
            params = step.get('params', {})

            if action == 'screenshot':
                screenshot_path = verifier.take_screenshot(params.get('name', 'screenshot'))
                result.screenshots.append(screenshot_path)

            elif action == 'verify_exists':
                verification = verifier.verify_element_exists(
                    params['selector'],
                    params['description']
                )
                result.verifications.append(verification)

            elif action == 'verify_text':
                verification = verifier.verify_text_content(
                    params['selector'],
                    params['expected'],
                    params['description']
                )
                result.verifications.append(verification)

            elif action == 'verify_count':
                verification = verifier.verify_element_count(
                    params['selector'],
                    params['min_count'],
                    params['description']
                )
                result.verifications.append(verification)

            elif action == 'verify_visible':
                verification = verifier.verify_element_visible(
                    params['selector'],
                    params['description']
                )
                result.verifications.append(verification)

            elif action == 'verify_class':
                verification = verifier.verify_element_has_class(
                    params['selector'],
                    params['class_name'],
                    params['description']
                )
                result.verifications.append(verification)

            elif action == 'click':
                verification = verifier.click_element(
                    params['selector'],
                    params['description']
                )
                result.verifications.append(verification)

            elif action == 'verify_price':
                verification = verifier.verify_price_format(
                    params['selector'],
                    params['description']
                )
                result.verifications.append(verification)

    result.end_time = datetime.now()
    return result


def format_result(result: UITestResult) -> str:
    """格式化测试结果输出"""
    lines = [
        f"🖥️ 执行 UI 验证: {result.name}",
        "",
        f"URL: {result.base_url}",
        f"耗时: {result.duration_ms:.0f}ms",
        "",
        "验证步骤:"
    ]

    for v in result.verifications:
        status = '✅' if v.passed else '❌'
        line = f"  {status} {v.criterion}"
        if v.actual_value and not v.passed:
            line += f" (实际: {v.actual_value})"
        if v.error:
            line += f" - {v.error}"
        lines.append(line)

    if result.screenshots:
        lines.append("")
        lines.append("📸 截图:")
        for s in result.screenshots:
            lines.append(f"  - {s}")

    lines.append("")
    lines.append(f"结果: {result.pass_count}/{len(result.verifications)} 通过")

    return '\n'.join(lines)


if __name__ == '__main__':
    # 示例用法
    steps = [
        {'action': 'screenshot', 'params': {'name': 'initial-load'}},
        {
            'action': 'verify_exists',
            'params': {
                'selector': '.category-tabs, [class*="category"], [class*="tab"]',
                'description': '页面顶部显示分类标签栏'
            }
        },
        {
            'action': 'verify_text',
            'params': {
                'selector': '.category-tabs, [class*="category"]',
                'expected': '全部',
                'description': '分类标签包含"全部"选项'
            }
        },
        {'action': 'screenshot', 'params': {'name': 'category-tabs'}},
        {
            'action': 'verify_count',
            'params': {
                'selector': '.product-card, [class*="product"], [class*="item"]',
                'min_count': 1,
                'description': '商品列表有数据显示'
            }
        },
        {'action': 'screenshot', 'params': {'name': 'product-list'}},
    ]

    result = run_ui_test(
        name="小程序前端集成验证",
        base_url="http://localhost:10086",
        steps=steps,
        headless=True
    )

    print(format_result(result))
