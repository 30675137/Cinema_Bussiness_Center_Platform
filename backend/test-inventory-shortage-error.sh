#!/bin/bash
# @spec P005-bom-inventory-deduction
# Test script to verify InsufficientInventoryException returns detailed shortage information

echo "=========================================="
echo "P005 库存不足错误详情测试"
echo "=========================================="
echo ""

API_BASE="http://localhost:8080"

echo "1. 测试库存预占 - 库存不足场景"
echo "   请求: 预占 2杯 威士忌可乐鸡尾酒 (库存只够1杯)"
echo ""

curl -X POST "${API_BASE}/api/inventory/reservations" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "99999999-0000-0000-0000-000000000001",
    "storeId": "00000000-0000-0000-0000-000000000099",
    "items": {
      "22222222-0000-0000-0000-000000000001": 2.0
    }
  }' | jq '.'

echo ""
echo "=========================================="
echo "期望响应格式:"
echo "{"
echo '  "success": false,'
echo '  "error": "INV_BIZ_001",'
echo '  "message": "Insufficient inventory for order",'
echo '  "details": {'
echo '    "shortages": ['
echo '      {'
echo '        "skuId": "11111111-0000-0000-0000-000000000001",'
echo '        "skuName": "威士忌",'
echo '        "available": 955.0,'
echo '        "required": 90.0,'
echo '        "shortage": -865.0,'
echo '        "unit": "ml"'
echo '      }'
echo '    ]'
echo '  },'
echo '  "timestamp": "2025-12-29T..."'
echo "}"
echo "=========================================="
