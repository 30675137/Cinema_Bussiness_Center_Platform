#!/bin/bash
#
# sync-docs-to-obsidian.sh
# 同步项目文档到 Obsidian 笔记目录
#
# 用法:
#   ./scripts/sync-docs-to-obsidian.sh          # 执行同步
#   ./scripts/sync-docs-to-obsidian.sh --dry-run # 预览变化（不实际同步）
#   ./scripts/sync-docs-to-obsidian.sh --delete  # 同步并删除目标中多余的文件
#

set -e

# ============================================================
# 配置区域 - 根据需要修改
# ============================================================

# 源目录：项目 docs 目录
SOURCE_DIR="/Users/lining/qoder/Cinema_Bussiness_Center_Platform/docs"

# 目标目录：Obsidian 笔记目录
TARGET_DIR="/Users/lining/Documents/Randy的文档/obsdian_doc/商品零售中台/参考文档"

# 同步的子目录名称（在目标目录下创建）
SYNC_FOLDER_NAME="docs"

# 排除的文件/目录模式
EXCLUDES=(
    ".git"
    ".gitignore"
    ".DS_Store"
    "*.tmp"
    "*.bak"
    "*.swp"
    "*~"
    "node_modules"
    "__pycache__"
    ".pytest_cache"
)

# ============================================================
# 脚本逻辑
# ============================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 解析参数
DRY_RUN=false
DELETE_EXTRA=false

for arg in "$@"; do
    case $arg in
        --dry-run|-n)
            DRY_RUN=true
            ;;
        --delete|-d)
            DELETE_EXTRA=true
            ;;
        --help|-h)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --dry-run, -n    预览变化，不实际执行同步"
            echo "  --delete, -d     删除目标目录中源目录没有的文件"
            echo "  --help, -h       显示此帮助信息"
            echo ""
            echo "配置:"
            echo "  源目录: $SOURCE_DIR"
            echo "  目标目录: $TARGET_DIR/$SYNC_FOLDER_NAME"
            exit 0
            ;;
        *)
            log_error "未知参数: $arg"
            echo "使用 --help 查看帮助信息"
            exit 1
            ;;
    esac
done

# 检查源目录
if [ ! -d "$SOURCE_DIR" ]; then
    log_error "源目录不存在: $SOURCE_DIR"
    exit 1
fi

# 创建目标目录（如果不存在）
FULL_TARGET_DIR="$TARGET_DIR/$SYNC_FOLDER_NAME"
if [ ! -d "$FULL_TARGET_DIR" ]; then
    log_info "创建目标目录: $FULL_TARGET_DIR"
    mkdir -p "$FULL_TARGET_DIR"
fi

# 构建 rsync 排除参数
EXCLUDE_ARGS=""
for pattern in "${EXCLUDES[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude='$pattern'"
done

# 构建 rsync 命令
RSYNC_OPTS="-avh --progress"

if [ "$DRY_RUN" = true ]; then
    RSYNC_OPTS="$RSYNC_OPTS --dry-run"
    log_warn "预览模式 - 不会实际执行同步"
fi

if [ "$DELETE_EXTRA" = true ]; then
    RSYNC_OPTS="$RSYNC_OPTS --delete"
    log_warn "删除模式 - 将删除目标中多余的文件"
fi

# 显示同步信息
echo ""
log_info "=========================================="
log_info "同步项目文档到 Obsidian"
log_info "=========================================="
log_info "源目录:   $SOURCE_DIR"
log_info "目标目录: $FULL_TARGET_DIR"
log_info "选项:     $RSYNC_OPTS"
echo ""

# 执行同步
log_info "开始同步..."
echo ""

# 使用 eval 执行带排除参数的 rsync
eval rsync $RSYNC_OPTS $EXCLUDE_ARGS "$SOURCE_DIR/" "$FULL_TARGET_DIR/"

echo ""
if [ "$DRY_RUN" = true ]; then
    log_success "预览完成！使用不带 --dry-run 参数执行实际同步"
else
    log_success "同步完成！"

    # 显示统计信息
    FILE_COUNT=$(find "$FULL_TARGET_DIR" -type f | wc -l | tr -d ' ')
    DIR_COUNT=$(find "$FULL_TARGET_DIR" -type d | wc -l | tr -d ' ')
    log_info "目标目录统计: $FILE_COUNT 个文件, $DIR_COUNT 个目录"
fi

echo ""
log_info "目标路径: $FULL_TARGET_DIR"
