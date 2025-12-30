#!/usr/bin/env python3
# @spec T002-e2e-test-generator
"""
Manual test script to verify E2E test generation functionality
"""

import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent / "scripts"))

import generate_playwright

def main():
    """Run manual tests for test generation"""

    print("🧪 Manual Test: E2E Test Generation")
    print("=" * 60)

    # Test 1: Generate from E2E-INVENTORY-001
    scenario_path = "/Users/lining/qoder/Cinema_Bussiness_Center_Platform/scenarios/inventory/E2E-INVENTORY-001.yaml"
    output_path = "/tmp/E2E-INVENTORY-001.spec.ts"

    try:
        print("\n📝 Test 1: Generate Playwright test from E2E-INVENTORY-001")
        print(f"   Input:  {scenario_path}")
        print(f"   Output: {output_path}")

        result = generate_playwright.save_playwright_test(
            scenario_path,
            output_path,
            force=True
        )

        print(f"\n✅ Generation successful!")
        print(f"   Status: {result['status']}")
        print(f"   File:   {result['filepath']}")
        print(f"   Message: {result.get('message', 'N/A')}")

        # Read and display first 40 lines
        with open(output_path, 'r') as f:
            lines = f.readlines()
            print(f"\n📄 Generated file ({len(lines)} lines):")
            print("   First 40 lines:")
            for i, line in enumerate(lines[:40], 1):
                print(f"   {i:3d}: {line.rstrip()}")

        # Verify key features
        content = ''.join(lines)
        print(f"\n🔍 Feature Verification:")
        print(f"   ✓ Has @spec attribution: {'@spec T002' in content}")
        print(f"   ✓ Has testdata imports: {'inventoryTestData' in content}")
        print(f"   ✓ Has beforeEach hook: {'test.beforeEach' in content}")
        print(f"   ✓ Has TODO comments: {'TODO' in content}")
        print(f"   ✓ Has page object imports: {'LoginPage' in content}")

        return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
