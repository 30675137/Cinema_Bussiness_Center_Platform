#!/usr/bin/env python3
"""
@spec P005-bom-inventory-deduction
Setup P005 test data via backend HTTP API

Usage: python3 scripts/setup-test-data-python.py
"""

import requests
import json
import sys

API_BASE_URL = "http://localhost:8080"

# Test data IDs
TEST_STORE_ID = "00000000-0000-0000-0000-000000000099"
TEST_WHISKEY_SKU_ID = "11111111-0000-0000-0000-000000000001"
TEST_COLA_SKU_ID = "11111111-0000-0000-0000-000000000002"
TEST_CUP_SKU_ID = "11111111-0000-0000-0000-000000000003"
TEST_STRAW_SKU_ID = "11111111-0000-0000-0000-000000000004"
TEST_COCKTAIL_SKU_ID = "22222222-0000-0000-0000-000000000001"
TEST_COMBO_SKU_ID = "22222222-0000-0000-0000-000000000002"

def create_store():
    """Create test store"""
    print("📦 Step 1: Creating test store...")
    payload = {
        "id": TEST_STORE_ID,
        "name": "Test Store P005",
        "status": "ACTIVE",
        "province": "北京市",
        "city": "北京市",
        "district": "朝阳区",
        "address": "测试地址123号",
        "phone": "13800138000"
    }

    try:
        response = requests.post(f"{API_BASE_URL}/api/stores", json=payload)
        if response.status_code in [200, 201]:
            print(f"  ✅ Store created: {payload['name']}")
            return True
        else:
            print(f"  ⚠️  Store creation failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def create_skus():
    """Create test SKUs"""
    print("\n📦 Step 2: Creating SKUs...")

    skus = [
        {"id": TEST_WHISKEY_SKU_ID, "name": "威士忌", "type": "RAW_MATERIAL", "unit": "ml"},
        {"id": TEST_COLA_SKU_ID, "name": "可乐", "type": "RAW_MATERIAL", "unit": "ml"},
        {"id": TEST_CUP_SKU_ID, "name": "杯子", "type": "RAW_MATERIAL", "unit": "个"},
        {"id": TEST_STRAW_SKU_ID, "name": "吸管", "type": "RAW_MATERIAL", "unit": "根"},
        {"id": TEST_COCKTAIL_SKU_ID, "name": "威士忌可乐鸡尾酒", "type": "FINISHED_PRODUCT", "unit": "杯"},
        {"id": TEST_COMBO_SKU_ID, "name": "观影套餐", "type": "FINISHED_PRODUCT", "unit": "份"},
    ]

    success_count = 0
    for sku in skus:
        sku["status"] = "ACTIVE"
        try:
            response = requests.post(f"{API_BASE_URL}/api/skus", json=sku)
            if response.status_code in [200, 201]:
                print(f"  ✅ SKU created: {sku['name']} ({sku['type']})")
                success_count += 1
            else:
                print(f"  ⚠️  SKU creation failed: {sku['name']} - {response.status_code}")
        except Exception as e:
            print(f"  ❌ Error creating {sku['name']}: {e}")

    return success_count == len(skus)

def create_inventory():
    """Create inventory records"""
    print("\n📦 Step 3: Creating inventory...")

    inventories = [
        {"store_id": TEST_STORE_ID, "sku_id": TEST_WHISKEY_SKU_ID, "on_hand_qty": 1000.0, "reserved_qty": 0.0},
        {"store_id": TEST_STORE_ID, "sku_id": TEST_COLA_SKU_ID, "on_hand_qty": 5000.0, "reserved_qty": 0.0},
        {"store_id": TEST_STORE_ID, "sku_id": TEST_CUP_SKU_ID, "on_hand_qty": 100.0, "reserved_qty": 0.0},
        {"store_id": TEST_STORE_ID, "sku_id": TEST_STRAW_SKU_ID, "on_hand_qty": 200.0, "reserved_qty": 0.0},
    ]

    success_count = 0
    for inv in inventories:
        try:
            response = requests.post(f"{API_BASE_URL}/api/inventory", json=inv)
            if response.status_code in [200, 201]:
                print(f"  ✅ Inventory created for SKU: {inv['sku_id']}")
                success_count += 1
            else:
                print(f"  ⚠️  Inventory creation failed: {inv['sku_id']} - {response.status_code}")
        except Exception as e:
            print(f"  ❌ Error: {e}")

    return success_count == len(inventories)

def create_bom_components():
    """Create BOM components"""
    print("\n📦 Step 4: Creating BOM components...")

    boms = [
        # 威士忌可乐鸡尾酒配方
        {"finished_product_id": TEST_COCKTAIL_SKU_ID, "component_id": TEST_WHISKEY_SKU_ID, "quantity": 45.0, "wastage_rate": 0.0},
        {"finished_product_id": TEST_COCKTAIL_SKU_ID, "component_id": TEST_COLA_SKU_ID, "quantity": 150.0, "wastage_rate": 0.0},
        {"finished_product_id": TEST_COCKTAIL_SKU_ID, "component_id": TEST_CUP_SKU_ID, "quantity": 1.0, "wastage_rate": 0.0},
        {"finished_product_id": TEST_COCKTAIL_SKU_ID, "component_id": TEST_STRAW_SKU_ID, "quantity": 1.0, "wastage_rate": 0.0},
        # 观影套餐配方 (多层级)
        {"finished_product_id": TEST_COMBO_SKU_ID, "component_id": TEST_COCKTAIL_SKU_ID, "quantity": 1.0, "wastage_rate": 0.0},
    ]

    success_count = 0
    for bom in boms:
        try:
            response = requests.post(f"{API_BASE_URL}/api/bom-components", json=bom)
            if response.status_code in [200, 201]:
                print(f"  ✅ BOM component created: {bom['finished_product_id']} -> {bom['component_id']}")
                success_count += 1
            else:
                print(f"  ⚠️  BOM creation failed: {response.status_code} - {response.text[:200]}")
        except Exception as e:
            print(f"  ❌ Error: {e}")

    return success_count == len(boms)

def verify_data():
    """Verify test data exists"""
    print("\n📊 Verification...")

    # Check SKU
    try:
        response = requests.get(f"{API_BASE_URL}/api/skus/{TEST_COCKTAIL_SKU_ID}")
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ SKU verified: {data.get('name', 'Unknown')}")
        else:
            print(f"  ❌ SKU not found: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Error verifying SKU: {e}")
        return False

    # Check inventory
    try:
        response = requests.get(f"{API_BASE_URL}/api/inventory/{TEST_STORE_ID}/{TEST_WHISKEY_SKU_ID}")
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Inventory verified: on_hand={data.get('on_hand_qty')}, reserved={data.get('reserved_qty')}")
        else:
            print(f"  ⚠️  Inventory check failed: {response.status_code}")
    except Exception as e:
        print(f"  ⚠️  Error verifying inventory: {e}")

    return True

def main():
    print("🚀 Starting P005 test data setup via backend API...")
    print(f"   API: {API_BASE_URL}")
    print()

    # Execute setup steps
    success = True

    if not create_store():
        print("\n⚠️  Store creation failed, but continuing...")

    if not create_skus():
        print("\n❌ SKU creation failed")
        success = False

    if not create_inventory():
        print("\n❌ Inventory creation failed")
        success = False

    if not create_bom_components():
        print("\n❌ BOM component creation failed")
        success = False

    # Verify
    if not verify_data():
        success = False

    if success:
        print("\n✅ Test data setup completed successfully!")
        print("\n📝 Next steps:")
        print("   1. Run E2E tests: npm run test:e2e")
        print("   2. Or: NODE_OPTIONS='--experimental-vm-modules' npx jest tests/e2e/p005-bom-inventory-simplified.test.ts")
        return 0
    else:
        print("\n⚠️  Test data setup completed with warnings")
        print("   Some operations failed. Please check the logs above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
