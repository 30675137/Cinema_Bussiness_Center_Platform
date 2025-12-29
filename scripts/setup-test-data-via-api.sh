#!/bin/bash
# @spec P005-bom-inventory-deduction
# Setup P005 test data via Supabase REST API
#
# Usage: ./scripts/setup-test-data-via-api.sh

set -e  # Exit on error

SUPABASE_URL="https://fxhgyxceqrmnpezluaht.supabase.co"
# Use service_role_key for full database access (bypasses RLS)
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aGd5eGNlcXJtbnBlemx1YWh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDcyNTc5MCwiZXhwIjoyMDUwMzAxNzkwfQ.yj2XKDXY7yAHcxJE9VJNTqVaMMCPPBVB3RXFmLtDFIk"
SUPABASE_ANON_KEY="${SUPABASE_SERVICE_KEY}"

echo "🚀 Starting P005 test data setup via Supabase API..."
echo ""

# Test UUIDs
TEST_STORE_ID="00000000-0000-0000-0000-000000000099"
TEST_WHISKEY_SKU_ID="11111111-0000-0000-0000-000000000001"
TEST_COLA_SKU_ID="11111111-0000-0000-0000-000000000002"
TEST_CUP_SKU_ID="11111111-0000-0000-0000-000000000003"
TEST_STRAW_SKU_ID="11111111-0000-0000-0000-000000000004"
TEST_COCKTAIL_SKU_ID="22222222-0000-0000-0000-000000000001"
TEST_COMBO_SKU_ID="22222222-0000-0000-0000-000000000002"

# Function to make Supabase API request
supabase_api() {
    local table=$1
    local data=$2
    local method=${3:-POST}

    curl -s -X "$method" \
        "${SUPABASE_URL}/rest/v1/${table}" \
        -H "apikey: ${SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=representation" \
        -d "$data"
}

echo "📦 Step 1: Insert test store..."
supabase_api "stores" '{
    "id": "'"$TEST_STORE_ID"'",
    "name": "Test Store P005",
    "status": "ACTIVE",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "address": "测试地址123号",
    "phone": "13800138000"
}' | jq '.' || echo "⚠️  Store may already exist"

echo ""
echo "📦 Step 2: Insert SKUs (raw materials)..."

# 威士忌
supabase_api "skus" '{
    "id": "'"$TEST_WHISKEY_SKU_ID"'",
    "name": "威士忌",
    "type": "RAW_MATERIAL",
    "unit": "ml",
    "status": "ACTIVE"
}' | jq '.' || echo "⚠️  Whiskey SKU may already exist"

# 可乐
supabase_api "skus" '{
    "id": "'"$TEST_COLA_SKU_ID"'",
    "name": "可乐",
    "type": "RAW_MATERIAL",
    "unit": "ml",
    "status": "ACTIVE"
}' | jq '.' || echo "⚠️  Cola SKU may already exist"

# 杯子
supabase_api "skus" '{
    "id": "'"$TEST_CUP_SKU_ID"'",
    "name": "杯子",
    "type": "RAW_MATERIAL",
    "unit": "个",
    "status": "ACTIVE"
}' | jq '.' || echo "⚠️  Cup SKU may already exist"

# 吸管
supabase_api "skus" '{
    "id": "'"$TEST_STRAW_SKU_ID"'",
    "name": "吸管",
    "type": "RAW_MATERIAL",
    "unit": "根",
    "status": "ACTIVE"
}' | jq '.' || echo "⚠️  Straw SKU may already exist"

echo ""
echo "📦 Step 3: Insert SKUs (finished products)..."

# 威士忌可乐鸡尾酒
supabase_api "skus" '{
    "id": "'"$TEST_COCKTAIL_SKU_ID"'",
    "name": "威士忌可乐鸡尾酒",
    "type": "FINISHED_PRODUCT",
    "unit": "杯",
    "status": "ACTIVE"
}' | jq '.' || echo "⚠️  Cocktail SKU may already exist"

# 套餐
supabase_api "skus" '{
    "id": "'"$TEST_COMBO_SKU_ID"'",
    "name": "观影套餐",
    "type": "FINISHED_PRODUCT",
    "unit": "份",
    "status": "ACTIVE"
}' | jq '.' || echo "⚠️  Combo SKU may already exist"

echo ""
echo "📦 Step 4: Insert inventory..."

# 威士忌库存
supabase_api "inventory" '{
    "store_id": "'"$TEST_STORE_ID"'",
    "sku_id": "'"$TEST_WHISKEY_SKU_ID"'",
    "on_hand_qty": 1000,
    "reserved_qty": 0
}' | jq '.' || echo "⚠️  Whiskey inventory may already exist"

# 可乐库存
supabase_api "inventory" '{
    "store_id": "'"$TEST_STORE_ID"'",
    "sku_id": "'"$TEST_COLA_SKU_ID"'",
    "on_hand_qty": 5000,
    "reserved_qty": 0
}' | jq '.' || echo "⚠️  Cola inventory may already exist"

# 杯子库存
supabase_api "inventory" '{
    "store_id": "'"$TEST_STORE_ID"'",
    "sku_id": "'"$TEST_CUP_SKU_ID"'",
    "on_hand_qty": 100,
    "reserved_qty": 0
}' | jq '.' || echo "⚠️  Cup inventory may already exist"

# 吸管库存
supabase_api "inventory" '{
    "store_id": "'"$TEST_STORE_ID"'",
    "sku_id": "'"$TEST_STRAW_SKU_ID"'",
    "on_hand_qty": 200,
    "reserved_qty": 0
}' | jq '.' || echo "⚠️  Straw inventory may already exist"

echo ""
echo "📦 Step 5: Insert BOM components..."

# 鸡尾酒 BOM 配方
supabase_api "bom_components" '{
    "finished_product_id": "'"$TEST_COCKTAIL_SKU_ID"'",
    "component_id": "'"$TEST_WHISKEY_SKU_ID"'",
    "quantity": 45,
    "wastage_rate": 0.0
}' | jq '.' || echo "⚠️  Cocktail-Whiskey BOM may already exist"

supabase_api "bom_components" '{
    "finished_product_id": "'"$TEST_COCKTAIL_SKU_ID"'",
    "component_id": "'"$TEST_COLA_SKU_ID"'",
    "quantity": 150,
    "wastage_rate": 0.0
}' | jq '.' || echo "⚠️  Cocktail-Cola BOM may already exist"

supabase_api "bom_components" '{
    "finished_product_id": "'"$TEST_COCKTAIL_SKU_ID"'",
    "component_id": "'"$TEST_CUP_SKU_ID"'",
    "quantity": 1,
    "wastage_rate": 0.0
}' | jq '.' || echo "⚠️  Cocktail-Cup BOM may already exist"

supabase_api "bom_components" '{
    "finished_product_id": "'"$TEST_COCKTAIL_SKU_ID"'",
    "component_id": "'"$TEST_STRAW_SKU_ID"'",
    "quantity": 1,
    "wastage_rate": 0.0
}' | jq '.' || echo "⚠️  Cocktail-Straw BOM may already exist"

# 套餐 BOM 配方 (多层级)
supabase_api "bom_components" '{
    "finished_product_id": "'"$TEST_COMBO_SKU_ID"'",
    "component_id": "'"$TEST_COCKTAIL_SKU_ID"'",
    "quantity": 1,
    "wastage_rate": 0.0
}' | jq '.' || echo "⚠️  Combo-Cocktail BOM may already exist"

echo ""
echo "✅ Test data setup completed!"
echo ""
echo "📊 Verification..."
echo "Run the following commands to verify:"
echo ""
echo "# Check stores"
echo "curl -s '${SUPABASE_URL}/rest/v1/stores?id=eq.${TEST_STORE_ID}' \\"
echo "  -H 'apikey: ${SUPABASE_ANON_KEY}' | jq '.'"
echo ""
echo "# Check SKUs"
echo "curl -s '${SUPABASE_URL}/rest/v1/skus?id=in.(${TEST_WHISKEY_SKU_ID},${TEST_COCKTAIL_SKU_ID})' \\"
echo "  -H 'apikey: ${SUPABASE_ANON_KEY}' | jq '.'"
echo ""
echo "# Check inventory"
echo "curl -s '${SUPABASE_URL}/rest/v1/inventory?store_id=eq.${TEST_STORE_ID}' \\"
echo "  -H 'apikey: ${SUPABASE_ANON_KEY}' | jq '.'"
echo ""
echo "# Check BOM components"
echo "curl -s '${SUPABASE_URL}/rest/v1/bom_components?finished_product_id=eq.${TEST_COCKTAIL_SKU_ID}' \\"
echo "  -H 'apikey: ${SUPABASE_ANON_KEY}' | jq '.'"
