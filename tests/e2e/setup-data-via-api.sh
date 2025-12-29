#!/bin/bash
###
# @spec P005-bom-inventory-deduction
# Setup Test Data via Backend API
#
# This script uses curl to create test data through backend REST APIs
# Run this before executing E2E tests
###

API_BASE="http://localhost:8080"

echo "🚀 P005 Test Data Setup Starting..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Note: Since we disabled Flyway and tables may not exist,
# we'll use direct SQL execution through a mock endpoint
# or execute the SQL script directly

echo "✅ Recommended: Execute SQL script directly instead"
echo "   Run: psql -h <host> -U postgres -d postgres -f tests/e2e/setup-test-data-direct.sql"
echo ""
echo "   Or use Supabase SQL Editor to run: tests/e2e/setup-test-data-direct.sql"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 SQL script location: tests/e2e/setup-test-data-direct.sql"
