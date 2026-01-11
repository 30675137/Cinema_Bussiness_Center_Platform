#!/usr/bin/env bash

set -e

JSON_MODE=false
SHORT_NAME=""
BRANCH_NUMBER=""
MODULE_PREFIX=""
ARGS=()
i=1
while [ $i -le $# ]; do
    arg="${!i}"
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --short-name)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --short-name requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            # Check if the next argument is another option (starts with --)
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --short-name requires a value' >&2
                exit 1
            fi
            SHORT_NAME="$next_arg"
            ;;
        --number)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --number requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --number requires a value' >&2
                exit 1
            fi
            BRANCH_NUMBER="$next_arg"
            ;;
        --module)
            if [ $((i + 1)) -gt $# ]; then
                echo 'Error: --module requires a value' >&2
                exit 1
            fi
            i=$((i + 1))
            next_arg="${!i}"
            if [[ "$next_arg" == --* ]]; then
                echo 'Error: --module requires a value' >&2
                exit 1
            fi
            MODULE_PREFIX="$next_arg"
            ;;
        --help|-h)
            echo "Usage: $0 [--json] [--short-name <name>] [--module <X>] [--number N] <feature_description>"
            echo ""
            echo "Options:"
            echo "  --json              Output in JSON format"
            echo "  --short-name <name> Provide a custom short name (2-4 words) for the branch"
            echo "  --module <X>        Module prefix (S/P/B/A/U/O/T/F). Interactive prompt if not provided."
            echo "  --number N          Specify module-specific branch number manually (overrides auto-detection)"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Module Prefixes:"
            echo "  S = 门店/影厅管理 (Store/Hall Management)"
            echo "  P = 商品/库存管理 (Product/Inventory Management)"
            echo "  B = 品牌/分类管理 (Brand/Category Management)"
            echo "  A = 活动/场景包管理 (Activity/Scenario Package Management)"
            echo "  U = 用户/预订管理 (User/Reservation Management)"
            echo "  O = 订单管理 (Order Management - 商品订单)"
            echo "  T = 工具/基础设施 (Tool/Infrastructure)"
            echo "  F = 前端基础 (Frontend Infrastructure)"
            echo ""
            echo "Examples:"
            echo "  $0 'Add store CRUD functionality' --module S"
            echo "  $0 'Implement OAuth2 integration for API' --module T --number 5"
            echo "  $0 'Product inventory management' --short-name 'inventory' --module P"
            exit 0
            ;;
        *)
            ARGS+=("$arg")
            ;;
    esac
    i=$((i + 1))
done

FEATURE_DESCRIPTION="${ARGS[*]}"
if [ -z "$FEATURE_DESCRIPTION" ]; then
    echo "Usage: $0 [--json] [--short-name <name>] [--module <X>] [--number N] <feature_description>" >&2
    exit 1
fi

# Function to find the repository root by searching for existing project markers
find_repo_root() {
    local dir="$1"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.git" ] || [ -d "$dir/.specify" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

# Function to get highest number from specs directory for a specific module
get_highest_from_specs() {
    local specs_dir="$1"
    local module="$2"
    local highest=0

    if [ -d "$specs_dir" ]; then
        for dir in "$specs_dir"/*; do
            [ -d "$dir" ] || continue
            dirname=$(basename "$dir")

            # Match both old format (###-*) and new format (X###-*)
            if echo "$dirname" | grep -q "^${module}[0-9]\{3\}-"; then
                # New format: X###-*
                number=$(echo "$dirname" | grep -o "^${module}[0-9]\{3\}" | grep -o '[0-9]\{3\}' || echo "0")
                number=$((10#$number))
                if [ "$number" -gt "$highest" ]; then
                    highest=$number
                fi
            elif [ -z "$module" ] && echo "$dirname" | grep -q '^[0-9]\{3\}-'; then
                # Old format: ###-* (for backward compatibility)
                number=$(echo "$dirname" | grep -o '^[0-9]\{3\}' || echo "0")
                number=$((10#$number))
                if [ "$number" -gt "$highest" ]; then
                    highest=$number
                fi
            fi
        done
    fi

    echo "$highest"
}

# Function to get highest number from git branches for a specific module
get_highest_from_branches() {
    local module="$1"
    local highest=0

    # Get all branches (local and remote)
    branches=$(git branch -a 2>/dev/null || echo "")

    if [ -n "$branches" ]; then
        while IFS= read -r branch; do
            # Clean branch name: remove leading markers and remote prefixes
            clean_branch=$(echo "$branch" | sed 's/^[* ]*//; s|^remotes/[^/]*/||')

            # Match both old format (###-*) and new format (X###-*)
            if echo "$clean_branch" | grep -q "^${module}[0-9]\{3\}-"; then
                # New format: X###-*
                number=$(echo "$clean_branch" | grep -o "^${module}[0-9]\{3\}" | grep -o '[0-9]\{3\}' || echo "0")
                number=$((10#$number))
                if [ "$number" -gt "$highest" ]; then
                    highest=$number
                fi
            elif [ -z "$module" ] && echo "$clean_branch" | grep -q '^[0-9]\{3\}-'; then
                # Old format: ###-* (for backward compatibility)
                number=$(echo "$clean_branch" | grep -o '^[0-9]\{3\}' || echo "0")
                number=$((10#$number))
                if [ "$number" -gt "$highest" ]; then
                    highest=$number
                fi
            fi
        done <<< "$branches"
    fi

    echo "$highest"
}

# Function to check existing branches (local and remote) and return next available number for module
check_existing_branches() {
    local specs_dir="$1"
    local module="$2"

    # Fetch all remotes to get latest branch info (suppress errors if no remotes)
    git fetch --all --prune 2>/dev/null || true

    # Get highest number from branches with this module prefix
    local highest_branch=$(get_highest_from_branches "$module")

    # Get highest number from specs with this module prefix
    local highest_spec=$(get_highest_from_specs "$specs_dir" "$module")

    # Take the maximum of both
    local max_num=$highest_branch
    if [ "$highest_spec" -gt "$max_num" ]; then
        max_num=$highest_spec
    fi

    # Return next number
    echo $((max_num + 1))
}

# Function to clean and format a branch name
clean_branch_name() {
    local name="$1"
    echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//'
}

# Resolve repository root. Prefer git information when available, but fall back
# to searching for repository markers so the workflow still functions in repositories that
# were initialised with --no-git.
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if git rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT=$(git rev-parse --show-toplevel)
    HAS_GIT=true
else
    REPO_ROOT="$(find_repo_root "$SCRIPT_DIR")"
    if [ -z "$REPO_ROOT" ]; then
        echo "Error: Could not determine repository root. Please run this script from within the repository." >&2
        exit 1
    fi
    HAS_GIT=false
fi

cd "$REPO_ROOT"

SPECS_DIR="$REPO_ROOT/specs"
mkdir -p "$SPECS_DIR"

# Function to generate branch name with stop word filtering and length filtering
generate_branch_name() {
    local description="$1"

    # Common stop words to filter out
    local stop_words="^(i|a|an|the|to|for|of|in|on|at|by|with|from|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|can|may|might|must|shall|this|that|these|those|my|your|our|their|want|need|add|get|set)$"

    # Convert to lowercase and split into words
    local clean_name=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/ /g')

    # Filter words: remove stop words and words shorter than 3 chars (unless they're uppercase acronyms in original)
    local meaningful_words=()
    for word in $clean_name; do
        # Skip empty words
        [ -z "$word" ] && continue

        # Keep words that are NOT stop words AND (length >= 3 OR are potential acronyms)
        if ! echo "$word" | grep -qiE "$stop_words"; then
            if [ ${#word} -ge 3 ]; then
                meaningful_words+=("$word")
            elif echo "$description" | grep -q "\b${word^^}\b"; then
                # Keep short words if they appear as uppercase in original (likely acronyms)
                meaningful_words+=("$word")
            fi
        fi
    done

    # If we have meaningful words, use first 3-4 of them
    if [ ${#meaningful_words[@]} -gt 0 ]; then
        local max_words=3
        if [ ${#meaningful_words[@]} -eq 4 ]; then max_words=4; fi

        local result=""
        local count=0
        for word in "${meaningful_words[@]}"; do
            if [ $count -ge $max_words ]; then break; fi
            if [ -n "$result" ]; then result="$result-"; fi
            result="$result$word"
            count=$((count + 1))
        done
        echo "$result"
    else
        # Fallback to original logic if no meaningful words found
        local cleaned=$(clean_branch_name "$description")
        echo "$cleaned" | tr '-' '\n' | grep -v '^$' | head -3 | tr '\n' '-' | sed 's/-$//'
    fi
}

# Function to validate module prefix
validate_module() {
    local module="$1"
    case "$module" in
        S|P|B|A|U|O|T|F|I|M|N|R|C|D|E|Y)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Prompt for module if not provided
if [ -z "$MODULE_PREFIX" ]; then
    if [ "$JSON_MODE" = true ]; then
        echo "Error: --module is required in JSON mode" >&2
        exit 1
    fi

    echo "请选择功能模块 (Please select module):"
    echo "  S = 门店/影厅管理 (Store/Hall Management)"
    echo "  P = 商品/库存管理 (Product/Inventory Management)"
    echo "  B = 品牌/分类管理 (Brand/Category Management)"
    echo "  A = 活动/场景包管理 (Activity/Scenario Package Management)"
    echo "  U = 用户/预订管理 (User/Reservation Management)"
    echo "  O = 订单管理 (Order Management - 商品订单)"
    echo "  T = 工具/基础设施 (Tool/Infrastructure)"
    echo "  F = 前端基础 (Frontend Infrastructure)"
    echo ""
    read -p "输入模块字母 (Enter module letter): " MODULE_PREFIX
    MODULE_PREFIX=$(echo "$MODULE_PREFIX" | tr '[:lower:]' '[:upper:]')
fi

# Validate module prefix
if ! validate_module "$MODULE_PREFIX"; then
    echo "Error: Invalid module prefix '$MODULE_PREFIX'. Must be one of: S, P, B, A, U, O, T, F, I, M, N, R, C, D, E, Y" >&2
    exit 1
fi

# Generate branch name
if [ -n "$SHORT_NAME" ]; then
    # Use provided short name, just clean it up
    BRANCH_SUFFIX=$(clean_branch_name "$SHORT_NAME")
else
    # Generate from description with smart filtering
    BRANCH_SUFFIX=$(generate_branch_name "$FEATURE_DESCRIPTION")
fi

# Determine branch number for this module
if [ -z "$BRANCH_NUMBER" ]; then
    if [ "$HAS_GIT" = true ]; then
        # Check existing branches on remotes for this module
        BRANCH_NUMBER=$(check_existing_branches "$SPECS_DIR" "$MODULE_PREFIX")
    else
        # Fall back to local directory check for this module
        HIGHEST=$(get_highest_from_specs "$SPECS_DIR" "$MODULE_PREFIX")
        BRANCH_NUMBER=$((HIGHEST + 1))
    fi
fi

# Force base-10 interpretation to prevent octal conversion (e.g., 010 → 8 in octal, but should be 10 in decimal)
FEATURE_NUM=$(printf "%s%03d" "$MODULE_PREFIX" "$((10#$BRANCH_NUMBER))")
BRANCH_NAME="${FEATURE_NUM}-${BRANCH_SUFFIX}"

# GitHub enforces a 244-byte limit on branch names
# Validate and truncate if necessary
MAX_BRANCH_LENGTH=244
if [ ${#BRANCH_NAME} -gt $MAX_BRANCH_LENGTH ]; then
    # Calculate how much we need to trim from suffix
    # Account for: module letter (1) + feature number (3) + hyphen (1) = 5 chars
    MAX_SUFFIX_LENGTH=$((MAX_BRANCH_LENGTH - 5))

    # Truncate suffix at word boundary if possible
    TRUNCATED_SUFFIX=$(echo "$BRANCH_SUFFIX" | cut -c1-$MAX_SUFFIX_LENGTH)
    # Remove trailing hyphen if truncation created one
    TRUNCATED_SUFFIX=$(echo "$TRUNCATED_SUFFIX" | sed 's/-$//')

    ORIGINAL_BRANCH_NAME="$BRANCH_NAME"
    BRANCH_NAME="${FEATURE_NUM}-${TRUNCATED_SUFFIX}"

    >&2 echo "[specify] Warning: Branch name exceeded GitHub's 244-byte limit"
    >&2 echo "[specify] Original: $ORIGINAL_BRANCH_NAME (${#ORIGINAL_BRANCH_NAME} bytes)"
    >&2 echo "[specify] Truncated to: $BRANCH_NAME (${#BRANCH_NAME} bytes)"
fi

if [ "$HAS_GIT" = true ]; then
    git checkout -b "$BRANCH_NAME"
else
    >&2 echo "[specify] Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME"
fi

FEATURE_DIR="$SPECS_DIR/$BRANCH_NAME"
mkdir -p "$FEATURE_DIR"

TEMPLATE="$REPO_ROOT/.specify/templates/spec-template.md"
SPEC_FILE="$FEATURE_DIR/spec.md"
if [ -f "$TEMPLATE" ]; then cp "$TEMPLATE" "$SPEC_FILE"; else touch "$SPEC_FILE"; fi

# Set the SPECIFY_FEATURE environment variable for the current session
export SPECIFY_FEATURE="$BRANCH_NAME"

if $JSON_MODE; then
    printf '{"BRANCH_NAME":"%s","SPEC_FILE":"%s","FEATURE_NUM":"%s","MODULE":"%s"}\n' "$BRANCH_NAME" "$SPEC_FILE" "$FEATURE_NUM" "$MODULE_PREFIX"
else
    echo "BRANCH_NAME: $BRANCH_NAME"
    echo "SPEC_FILE: $SPEC_FILE"
    echo "FEATURE_NUM: $FEATURE_NUM"
    echo "MODULE: $MODULE_PREFIX"
    echo "SPECIFY_FEATURE environment variable set to: $BRANCH_NAME"
fi
