#!/bin/bash
set -euo pipefail

# Constants
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DOCKER_IMAGE_NAME="eureka-chats-front"
DOCKER_IMAGE_TAG="prod"

# Functions
log_error() {
    echo "[ERROR] $1" >&2
}

log_info() {
    echo "[INFO] $1"
}

show_usage() {
    echo "Usage: $0 [environment]"
    echo ""
    echo "Arguments:"
    echo "  environment    Optional deployment environment (dev or prod)"
    echo "                 If not provided, uses environment from .env.docker file"
    echo ""
    echo "Examples:"
    echo "  $0             Deploy using environment from .env.docker"
    echo "  $0 dev         Deploy to development environment"
    echo "  $0 prod        Deploy to production environment"
}

validate_arguments() {
    if [ $# -gt 1 ]; then
        log_error "Too many arguments provided"
        show_usage
        exit 1
    fi

    if [ $# -eq 1 ]; then
        local deploy_env="$1"
        if [[ "$deploy_env" != "dev" && "$deploy_env" != "prod" ]]; then
            log_error "Invalid environment: $deploy_env"
            log_error "Valid environments: dev, prod"
            exit 1
        fi
    fi
}

get_env_file() {
    local deploy_env="${1:-}"

    if [ -n "$deploy_env" ]; then
        echo "${PROJECT_ROOT}/.env.docker.${deploy_env}"
    else
        echo "${PROJECT_ROOT}/.env.docker"
    fi
}

validate_env_file() {
    local env_file="$1"

    if [ ! -f "${env_file}" ]; then
        log_error "Environment file ${env_file} not found"
        if [[ "$env_file" == *".env.docker.dev" ]] || [[ "$env_file" == *".env.docker.prod" ]]; then
            log_error "Create ${env_file} or use default .env.docker"
        else
            log_error "Copy from .env.docker.example"
        fi
        exit 1
    fi
}

load_env_variables() {
    local env_file="$1"
    log_info "Loading environment variables from ${env_file}"
    # shellcheck disable=SC2046
    export $(grep -v '^#' "${env_file}" | xargs)
}

validate_required_vars() {
    local deploy_env="${1:-}"

    # Override AWS_DEPLOY_TARGET if environment is specified
    if [ -n "$deploy_env" ]; then
        export AWS_DEPLOY_TARGET="$deploy_env"
        log_info "Override AWS_DEPLOY_TARGET to: $deploy_env"
    fi

    # If no environment specified and no AWS_DEPLOY_TARGET, deploy to root
    if [ -z "${AWS_DEPLOY_TARGET:-}" ]; then
        export AWS_DEPLOY_TARGET=""
        log_info "No environment specified - deploying to root bucket"
    fi

    local required_vars=(
        "AWS_BUCKET_NAME"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "APP_NAME"
        "VITE_ENV"
        "VITE_PROJECT"
        "VITE_HOST"
        "VITE_OAUTH_ENDPOINT"
        "VITE_SOCKET_ENDPOINT"
        "VITE_CHAT_API_ENDPOINT"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable ${var} is not set"
            exit 1
        fi
    done

    # CloudFront distribution ID is optional
    if [ -n "${AWS_DISTRIBUTION_ID:-}" ]; then
        log_info "CloudFront invalidation will be performed"
    else
        log_info "AWS_DISTRIBUTION_ID not set - CloudFront invalidation will be skipped"
    fi
}

print_deployment_info() {
    log_info "================================"
    log_info "Docker Deployment Configuration"
    log_info "================================"
    if [ -n "${AWS_DEPLOY_TARGET}" ]; then
        log_info "Environment: ${AWS_DEPLOY_TARGET}"
        log_info "S3 Target: s3://${AWS_BUCKET_NAME}/${AWS_DEPLOY_TARGET}"
    else
        log_info "Environment: root (no environment)"
        log_info "S3 Target: s3://${AWS_BUCKET_NAME}/"
    fi
    if [ -n "${AWS_DISTRIBUTION_ID:-}" ]; then
        log_info "CloudFront: ${AWS_DISTRIBUTION_ID}"
    else
        log_info "CloudFront: Not configured (will skip invalidation)"
    fi
    log_info "Docker Image: ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
    log_info "================================"
}

clean_build_artifacts() {
    log_info "Cleaning build artifacts..."
    rm -rf "${PROJECT_ROOT}/node_modules/.vite" "${PROJECT_ROOT}/node_modules/.cache" || true
    rm -rf "${PROJECT_ROOT}/.nx" || true
    rm -rf "${PROJECT_ROOT}/dist/apps/web" || true
}

build_docker_image() {
    local deploy_env="${1:-}"
    local build_env

    # Determine build environment
    if [ -n "$deploy_env" ]; then
        build_env="$deploy_env"
        log_info "Building Docker image for environment: ${deploy_env}..."
    else
        build_env="dev"
        log_info "Building Docker image for root deployment (using dev build)..."
    fi

    if ! docker build \
    --build-arg BUILD_ENV="$build_env" \
    --build-arg VITE_ENV="$VITE_ENV" \
    --build-arg VITE_PROJECT="$VITE_PROJECT" \
    --build-arg VITE_HOST="$VITE_HOST" \
    --build-arg VITE_OAUTH_ENDPOINT="$VITE_OAUTH_ENDPOINT" \
    --build-arg VITE_SOCIAL_OAUTH_ENDPOINT="$VITE_SOCIAL_OAUTH_ENDPOINT" \
    --build-arg VITE_IMAGE_API_ENDPOINT="$VITE_IMAGE_API_ENDPOINT" \
    --build-arg VITE_SOCKET_ENDPOINT="$VITE_SOCKET_ENDPOINT" \
    --build-arg VITE_CHAT_API_ENDPOINT="$VITE_CHAT_API_ENDPOINT" \
    -t "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" \
    -f "${PROJECT_ROOT}/docker/web/Dockerfile" \
    "${PROJECT_ROOT}"; then
        log_error "Docker build failed"
        exit 1
    fi

    log_info "Docker image built successfully"
}

deploy_with_docker() {
    log_info "Running deployment in Docker container..."

    # Build Docker run command with required environment variables
    local docker_cmd=(
        "docker" "run" "--rm"
        "-e" "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
        "-e" "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY"
        "-e" "AWS_REGION=$AWS_REGION"
        "-e" "AWS_BUCKET_NAME=$AWS_BUCKET_NAME"
        "-e" "AWS_DEPLOY_TARGET=$AWS_DEPLOY_TARGET"
        "-e" "APP_NAME=$APP_NAME"
    )

    # Add CloudFront distribution ID only if it's set
    if [ -n "${AWS_DISTRIBUTION_ID:-}" ]; then
        docker_cmd+=("-e" "AWS_DISTRIBUTION_ID=$AWS_DISTRIBUTION_ID")
    fi

    # Add image and command
    docker_cmd+=("${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" "/app/scripts/docker-entrypoint-deploy.sh")

    if ! "${docker_cmd[@]}"; then
        log_error "Docker deployment failed"
        exit 1
    fi

    log_info "Deployment completed successfully"
}

# Main execution
main() {
    local deploy_env="${1:-}"
    local env_file

    # Validate arguments and get environment file
    validate_arguments "$@"
    env_file=$(get_env_file "$deploy_env")

    # Setup and validation
    validate_env_file "$env_file"
    load_env_variables "$env_file"
    validate_required_vars "$deploy_env"
    print_deployment_info

    # Build and deploy
    clean_build_artifacts
    build_docker_image "$deploy_env"
    deploy_with_docker
}

main "$@"
