#!/bin/bash
# @spec T006-e2e-report-configurator
# Archive E2E test reports to history directory with timestamp

set -e

# Configuration
REPORTS_DIR="reports/e2e"
HISTORY_DIR="${REPORTS_DIR}/history"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
ARCHIVE_NAME="test-run-${TIMESTAMP}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 E2E Test Report Archiver${NC}"
echo "Timestamp: ${TIMESTAMP}"
echo ""

# Check if reports directory exists
if [ ! -d "${REPORTS_DIR}" ]; then
  echo -e "${RED}❌ Error: Reports directory not found: ${REPORTS_DIR}${NC}"
  echo "Please run tests first to generate reports."
  exit 1
fi

# Create history directory if it doesn't exist
mkdir -p "${HISTORY_DIR}"

# Create archive directory
ARCHIVE_DIR="${HISTORY_DIR}/${ARCHIVE_NAME}"
mkdir -p "${ARCHIVE_DIR}"

echo "Archive location: ${ARCHIVE_DIR}"
echo ""

# Archive HTML report
if [ -d "${REPORTS_DIR}/html" ]; then
  echo "📄 Archiving HTML report..."
  cp -r "${REPORTS_DIR}/html" "${ARCHIVE_DIR}/"
  echo -e "${GREEN}✓${NC} HTML report archived"
else
  echo -e "${YELLOW}⚠️${NC}  HTML report not found (skipped)"
fi

# Archive JSON report
if [ -f "${REPORTS_DIR}/json/results.json" ]; then
  echo "📊 Archiving JSON report..."
  mkdir -p "${ARCHIVE_DIR}/json"
  cp "${REPORTS_DIR}/json/results.json" "${ARCHIVE_DIR}/json/"
  echo -e "${GREEN}✓${NC} JSON report archived"
else
  echo -e "${YELLOW}⚠️${NC}  JSON report not found (skipped)"
fi

# Archive JUnit report
if [ -f "${REPORTS_DIR}/junit/results.xml" ]; then
  echo "📋 Archiving JUnit report..."
  mkdir -p "${ARCHIVE_DIR}/junit"
  cp "${REPORTS_DIR}/junit/results.xml" "${ARCHIVE_DIR}/junit/"
  echo -e "${GREEN}✓${NC} JUnit report archived"
else
  echo -e "${YELLOW}⚠️${NC}  JUnit report not found (skipped)"
fi

# Archive artifacts (screenshots, videos, traces)
if [ -d "${REPORTS_DIR}/artifacts" ] && [ "$(ls -A ${REPORTS_DIR}/artifacts 2>/dev/null)" ]; then
  echo "🎬 Archiving test artifacts..."
  cp -r "${REPORTS_DIR}/artifacts" "${ARCHIVE_DIR}/"
  ARTIFACT_COUNT=$(find "${ARCHIVE_DIR}/artifacts" -type f | wc -l | xargs)
  echo -e "${GREEN}✓${NC} ${ARTIFACT_COUNT} artifacts archived"
else
  echo -e "${YELLOW}⚠️${NC}  No test artifacts found (skipped)"
fi

# Create metadata file
METADATA_FILE="${ARCHIVE_DIR}/metadata.json"
echo "📝 Creating metadata file..."
cat > "${METADATA_FILE}" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "archive_name": "${ARCHIVE_NAME}",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "git_commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "archived_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "reports": {
    "html": $([ -d "${ARCHIVE_DIR}/html" ] && echo "true" || echo "false"),
    "json": $([ -f "${ARCHIVE_DIR}/json/results.json" ] && echo "true" || echo "false"),
    "junit": $([ -f "${ARCHIVE_DIR}/junit/results.xml" ] && echo "true" || echo "false"),
    "artifacts": $([ -d "${ARCHIVE_DIR}/artifacts" ] && echo "true" || echo "false")
  }
}
EOF
echo -e "${GREEN}✓${NC} Metadata created"

# Calculate archive size
ARCHIVE_SIZE=$(du -sh "${ARCHIVE_DIR}" | cut -f1)

echo ""
echo -e "${GREEN}✅ Archive completed successfully!${NC}"
echo ""
echo "Archive details:"
echo "  Location: ${ARCHIVE_DIR}"
echo "  Size: ${ARCHIVE_SIZE}"
echo "  View HTML report: open ${ARCHIVE_DIR}/html/index.html"
echo ""

# Optional: Clean up old archives (keep last 10 runs by default)
KEEP_LAST=10
ARCHIVE_COUNT=$(ls -1d ${HISTORY_DIR}/test-run-* 2>/dev/null | wc -l | xargs)

if [ "${ARCHIVE_COUNT}" -gt "${KEEP_LAST}" ]; then
  echo -e "${YELLOW}🧹 Cleaning up old archives (keeping last ${KEEP_LAST})...${NC}"
  ls -1dt ${HISTORY_DIR}/test-run-* | tail -n +$((KEEP_LAST + 1)) | while read OLD_ARCHIVE; do
    echo "  Removing: $(basename ${OLD_ARCHIVE})"
    rm -rf "${OLD_ARCHIVE}"
  done
  echo -e "${GREEN}✓${NC} Cleanup completed"
  echo ""
fi

# Create/update index file
echo "📚 Updating history index..."
INDEX_FILE="${HISTORY_DIR}/index.md"

# Generate index header
cat > "${INDEX_FILE}" << 'EOF'
# E2E Test Reports History

This directory contains archived E2E test reports for historical tracking and comparison.

## Recent Test Runs

EOF

# List all archives
ls -1dt ${HISTORY_DIR}/test-run-* 2>/dev/null | while read ARCHIVE; do
  ARCHIVE_BASE=$(basename "${ARCHIVE}")
  METADATA="${ARCHIVE}/metadata.json"

  if [ -f "${METADATA}" ]; then
    TIMESTAMP_VALUE=$(grep -o '"timestamp": "[^"]*"' "${METADATA}" | cut -d'"' -f4)
    GIT_BRANCH=$(grep -o '"git_branch": "[^"]*"' "${METADATA}" | cut -d'"' -f4)
    GIT_COMMIT=$(grep -o '"git_commit": "[^"]*"' "${METADATA}" | cut -d'"' -f4)

    echo "- **${ARCHIVE_BASE}**" >> "${INDEX_FILE}"
    echo "  - Branch: \`${GIT_BRANCH}\`" >> "${INDEX_FILE}"
    echo "  - Commit: \`${GIT_COMMIT}\`" >> "${INDEX_FILE}"
    echo "  - [View HTML Report](${ARCHIVE_BASE}/html/index.html)" >> "${INDEX_FILE}"
    echo "" >> "${INDEX_FILE}"
  fi
done

echo -e "${GREEN}✓${NC} Index updated: ${INDEX_FILE}"
echo ""
echo -e "${GREEN}🎉 All done!${NC}"
