#!/bin/bash

# 部署脚本
# Usage: ./scripts/deploy.sh [environment] [options]

set -e

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=${1:-"staging"}
REGISTRY="ghcr.io"
IMAGE_NAME="cinema-frontend"

# 颜色输出
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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! command -v kubectl &> /dev/null; then
        log_warning "kubectl is not installed, some features may not work"
    fi

    log_success "Dependencies check completed"
}

# 构建镜像
build_image() {
    local tag=$1
    log_info "Building Docker image with tag: $tag"

    cd "$PROJECT_DIR"

    # 多阶段构建
    docker build \
        --target production \
        --tag "$REGISTRY/$IMAGE_NAME:$tag" \
        --tag "$REGISTRY/$IMAGE_NAME:latest" \
        .

    log_success "Docker image built successfully"
}

# 推送镜像
push_image() {
    local tag=$1
    log_info "Pushing Docker image: $tag"

    docker push "$REGISTRY/$IMAGE_NAME:$tag"
    docker push "$REGISTRY/$IMAGE_NAME:latest"

    log_success "Docker image pushed successfully"
}

# 部署到本地
deploy_local() {
    log_info "Deploying to local environment..."

    cd "$PROJECT_DIR"

    # 停止现有容器
    docker-compose down || true

    # 启动新容器
    docker-compose up -d

    # 等待服务启动
    sleep 10

    # 健康检查
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        log_success "Local deployment completed successfully"
    else
        log_error "Local deployment failed - health check failed"
        exit 1
    fi
}

# 部署到 Kubernetes
deploy_kubernetes() {
    local namespace=$1
    local tag=$2

    log_info "Deploying to Kubernetes namespace: $namespace"

    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi

    # 创建命名空间
    kubectl create namespace "$namespace" --dry-run=client -o yaml | kubectl apply -f -

    # 应用配置
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cinema-frontend
  namespace: $namespace
  labels:
    app: cinema-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cinema-frontend
  template:
    metadata:
      labels:
        app: cinema-frontend
    spec:
      containers:
      - name: frontend
        image: $REGISTRY/$IMAGE_NAME:$tag
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        - name: API_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: cinema-config
              key: API_BASE_URL
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: cinema-frontend-service
  namespace: $namespace
spec:
  selector:
    app: cinema-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
EOF

    log_success "Kubernetes deployment completed"
}

# 回滚部署
rollback() {
    local namespace=$1
    local revision=${2:-"1"}

    log_info "Rolling back deployment to revision: $revision"

    kubectl rollout undo deployment/cinema-frontend -n "$namespace" --to-revision="$revision"

    log_success "Rollback completed"
}

# 清理
cleanup() {
    log_info "Cleaning up..."

    # 清理未使用的 Docker 镜像
    docker image prune -f

    # 清理未使用的容器和网络
    docker system prune -f

    log_success "Cleanup completed"
}

# 显示帮助信息
show_help() {
    cat <<EOF
Usage: $0 [environment] [options]

Environments:
  staging      Deploy to staging environment
  production   Deploy to production environment
  local        Deploy to local Docker Compose

Options:
  --build-only    Build image only, don't deploy
  --push-only     Push image only, don't deploy
  --rollback N    Rollback to revision N
  --cleanup       Clean up unused resources
  --help          Show this help message

Examples:
  $0 staging                    # Deploy to staging
  $0 production                 # Deploy to production
  $0 local --build-only        # Build image for local deployment
  $0 staging --rollback 2      # Rollback staging to revision 2
  $0 --cleanup                  # Clean up resources

EOF
}

# 主函数
main() {
    local build_only=false
    local push_only=false
    local rollback_revision=""

    # 解析参数
    shift
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build-only)
                build_only=true
                shift
                ;;
            --push-only)
                push_only=true
                shift
                ;;
            --rollback)
                rollback_revision="$2"
                shift 2
                ;;
            --cleanup)
                cleanup
                exit 0
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # 检查依赖
    check_dependencies

    # 生成标签
    local tag
    case $ENVIRONMENT in
        staging)
            tag="staging-$(git rev-parse --short HEAD)"
            ;;
        production)
            tag="v$(git describe --tags --abbrev=0)"
            ;;
        local)
            tag="local-$(git rev-parse --short HEAD)"
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac

    # 构建
    if [[ "$push_only" != true ]]; then
        build_image "$tag"
    fi

    # 推送
    if [[ "$build_only" != true ]]; then
        push_image "$tag"
    fi

    # 部署
    if [[ "$rollback_revision" != "" ]]; then
        rollback "$ENVIRONMENT" "$rollback_revision"
    elif [[ "$build_only" != true && "$push_only" != true ]]; then
        case $ENVIRONMENT in
            local)
                deploy_local
                ;;
            staging|production)
                deploy_kubernetes "$ENVIRONMENT" "$tag"
                ;;
        esac
    fi

    log_success "Deployment completed successfully!"
}

# 运行主函数
main "$@"