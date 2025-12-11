#!/bin/bash

# Cinema Business Center Platform - Test Runner Script
# This script helps run Playwright tests and view results

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Cinema Business Center Platform${NC}"
echo -e "${BLUE}Playwright Test Runner${NC}"
echo -e "${BLUE}================================${NC}\n"

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Check if Playwright browsers are installed
if [ ! -d "node_modules/.cache/ms-playwright" ]; then
    echo -e "${YELLOW}⚠️  Playwright browsers not installed. Installing...${NC}"
    npm run test:install
fi

# Check if dev server is running
echo -e "${BLUE}Checking if dev server is running on port 3000...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Dev server is running${NC}\n"
else
    echo -e "${RED}❌ Dev server is NOT running${NC}"
    echo -e "${YELLOW}Please start the dev server first:${NC}"
    echo -e "  cd frontend"
    echo -e "  npm run dev\n"
    echo -e "${YELLOW}Then run this script again.${NC}"
    exit 1
fi

# Show menu
echo -e "${BLUE}Select test mode:${NC}"
echo "1) Run all tests (headless)"
echo "2) Run tests with UI mode (interactive)"
echo "3) Run tests in headed mode (see browser)"
echo "4) Run tests in debug mode"
echo "5) Show test report (previous run)"
echo "6) Run specific test file"
echo "7) Exit"
echo ""
read -p "Enter your choice [1-7]: " choice

case $choice in
    1)
        echo -e "\n${BLUE}Running all tests in headless mode...${NC}\n"
        npm test
        ;;
    2)
        echo -e "\n${BLUE}Opening Playwright UI mode...${NC}\n"
        npm run test:ui
        ;;
    3)
        echo -e "\n${BLUE}Running tests in headed mode...${NC}\n"
        npm run test:headed
        ;;
    4)
        echo -e "\n${BLUE}Running tests in debug mode...${NC}\n"
        npm run test:debug
        ;;
    5)
        echo -e "\n${BLUE}Opening test report...${NC}\n"
        npm run test:report
        ;;
    6)
        echo -e "\n${BLUE}Available test files:${NC}"
        echo "1) basic.spec.ts"
        echo "2) product-management.spec.ts"
        echo "3) product-creation.spec.ts"
        echo "4) price-management.spec.ts"
        echo "5) review-process.spec.ts"
        echo "6) inventory-trace.spec.ts"
        echo ""
        read -p "Select test file [1-6]: " file_choice
        
        case $file_choice in
            1) TEST_FILE="basic.spec.ts" ;;
            2) TEST_FILE="product-management.spec.ts" ;;
            3) TEST_FILE="product-creation.spec.ts" ;;
            4) TEST_FILE="price-management.spec.ts" ;;
            5) TEST_FILE="review-process.spec.ts" ;;
            6) TEST_FILE="inventory-trace.spec.ts" ;;
            *) echo -e "${RED}Invalid choice${NC}"; exit 1 ;;
        esac
        
        echo -e "\n${BLUE}Running $TEST_FILE...${NC}\n"
        npx playwright test "tests/e2e/$TEST_FILE"
        ;;
    7)
        echo -e "${BLUE}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Show summary
echo -e "\n${BLUE}================================${NC}"
echo -e "${GREEN}✅ Test execution completed${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${YELLOW}To view the test report:${NC}"
echo -e "  npm run test:report\n"

echo -e "${YELLOW}Test results are saved in:${NC}"
echo -e "  - HTML Report: frontend/playwright-report/"
echo -e "  - JSON Results: frontend/test-results.json"
echo -e "  - Screenshots/Videos: frontend/test-results/\n"
