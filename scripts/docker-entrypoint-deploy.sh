#!/bin/bash
set -euo pipefail

# Constants
DIST_DIR="/app/dist/apps/${APP_NAME}"
CACHE_CONTROL_NO_CACHE="max-age=0,no-cache,no-store,must-revalidate"
CACHE_CONTROL_LOCALES="max-age=0,s-maxage=0,no-cache,no-store,must-revalidate,proxy-revalidate"

# Functions
log_error() {
    echo "[ERROR] $1" >&2
}

log_info() {
    echo "[INFO] $1"
}

log_success() {
    echo "[SUCCESS] $1"
}

get_s3_target() {
    if [ -n "${AWS_DEPLOY_TARGET}" ]; then
        echo "s3://${AWS_BUCKET_NAME}/${AWS_DEPLOY_TARGET}"
    else
        echo "s3://${AWS_BUCKET_NAME}"
    fi
}

validate_environment() {
    local required_vars=(
        "AWS_BUCKET_NAME"
        "APP_NAME"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable ${var} is not set in container"
            exit 1
        fi
    done
    
    # AWS_DEPLOY_TARGET is optional - if not set, deploy to root
    if [ -z "${AWS_DEPLOY_TARGET:-}" ]; then
        log_info "AWS_DEPLOY_TARGET not set - deploying to root bucket"
        export AWS_DEPLOY_TARGET=""
    fi
    
    # CloudFront distribution ID is optional
    if [ -n "${AWS_DISTRIBUTION_ID:-}" ]; then
        log_info "CloudFront invalidation will be performed"
    else
        log_info "AWS_DISTRIBUTION_ID not set - CloudFront invalidation will be skipped"
    fi
    
    if [ ! -d "${DIST_DIR}" ]; then
        log_error "Build directory ${DIST_DIR} does not exist"
        exit 1
    fi
}

print_deployment_info() {
    local s3_target=$(get_s3_target)
    
    log_info "================================"
    log_info "Starting S3 Deployment"
    log_info "================================"
    if [ -n "${AWS_DEPLOY_TARGET}" ]; then
        log_info "Environment: ${AWS_DEPLOY_TARGET}"
    else
        log_info "Environment: root (no environment)"
    fi
    log_info "S3 Target: ${s3_target}"
    if [ -n "${AWS_DISTRIBUTION_ID:-}" ]; then
        log_info "CloudFront: ${AWS_DISTRIBUTION_ID}"
    else
        log_info "CloudFront: Not configured (will skip invalidation)"
    fi
    log_info "Source: ${DIST_DIR}"
    log_info "================================"
}

sync_static_assets() {
    local s3_target=$(get_s3_target)
    
    log_info "Syncing static assets (excluding HTML, CSS, JS)..."
    
    if ! aws s3 sync "${DIST_DIR}" "${s3_target}" \
        --metadata-directive REPLACE \
        --acl public-read \
        --exclude "index.html" \
        --exclude "*.css" \
        --exclude "*.js" \
        --exclude "locales/*"; then
        log_error "Failed to sync static assets"
        return 1
    fi
    
    log_success "Static assets synced"
}

sync_css_js_files() {
    local s3_target=$(get_s3_target)
    
    log_info "Syncing CSS and JavaScript files..."
    
    if ! aws s3 sync "${DIST_DIR}" "${s3_target}" \
        --metadata-directive REPLACE \
        --acl public-read \
        --exclude "*" \
        --include "*.css" \
        --include "*.js" \
        --exclude "assets/*"; then
        log_error "Failed to sync CSS/JS files"
        return 1
    fi
    
    log_success "CSS/JS files synced"
}

sync_asset_files() {
    local s3_target=$(get_s3_target)
    
    log_info "Syncing asset files..."
    
    if ! aws s3 sync "${DIST_DIR}" "${s3_target}" \
        --metadata-directive REPLACE \
        --acl public-read \
        --exclude "*" \
        --include "assets/*"; then
        log_error "Failed to sync asset files"
        return 1
    fi
    
    log_success "Asset files synced"
}

sync_locales() {
    local s3_target=$(get_s3_target)
    local locales_dir="${DIST_DIR}/locales"
    local locales_target
    
    if [ -n "${AWS_DEPLOY_TARGET}" ]; then
        locales_target="${s3_target}/locales"
    else
        locales_target="${s3_target}/locales"
    fi
    
    if [ -d "${locales_dir}" ]; then
        log_info "Syncing locale files..."
        
        if ! aws s3 sync "${locales_dir}" "${locales_target}" \
            --metadata-directive REPLACE \
            --acl public-read \
            --cache-control "${CACHE_CONTROL_LOCALES}"; then
            log_error "Failed to sync locale files"
            return 1
        fi
        
        log_success "Locale files synced"
    else
        log_info "No locales directory found, skipping..."
    fi
}

upload_index_html() {
    local s3_target=$(get_s3_target)
    local index_target
    
    if [ -n "${AWS_DEPLOY_TARGET}" ]; then
        index_target="${s3_target}/index.html"
    else
        index_target="${s3_target}/index.html"
    fi
    
    log_info "Uploading index.html with no-cache headers..."
    
    if ! aws s3 cp "${DIST_DIR}/index.html" "${index_target}" \
        --metadata-directive REPLACE \
        --cache-control "${CACHE_CONTROL_NO_CACHE}" \
        --content-type "text/html" \
        --acl public-read; then
        log_error "Failed to upload index.html"
        return 1
    fi
    
    log_success "index.html uploaded"
}

invalidate_cloudfront() {
    if [ -z "${AWS_DISTRIBUTION_ID:-}" ]; then
        log_info "Skipping CloudFront invalidation (AWS_DISTRIBUTION_ID not set)"
        return 0
    fi
    
    log_info "Creating CloudFront invalidation..."
    
    local invalidation_output
    if invalidation_output=$(aws cloudfront create-invalidation \
        --distribution-id "${AWS_DISTRIBUTION_ID}" \
        --paths '/*' \
        --no-cli-pager 2>&1); then
        log_success "CloudFront invalidation created"
        echo "${invalidation_output}" | grep -E "(Id|Status|CreateTime)" || true
    else
        log_error "Failed to create CloudFront invalidation"
        echo "${invalidation_output}" >&2
        return 1
    fi
}

# Main execution
main() {
    log_info "Docker entrypoint deploy script started"
    
    # Validate environment
    validate_environment
    print_deployment_info
    
    # Execute deployment steps
    local steps=(
        "sync_static_assets"
        "sync_css_js_files"
        "sync_asset_files"
        "sync_locales"
        "upload_index_html"
        "invalidate_cloudfront"
    )
    
    for step in "${steps[@]}"; do
        if ! ${step}; then
            log_error "Deployment failed at step: ${step}"
            exit 1
        fi
    done
    
    log_success "================================"
    log_success "Deployment completed successfully!"
    if [ -n "${AWS_DEPLOY_TARGET}" ]; then
        log_success "Environment: ${AWS_DEPLOY_TARGET}"
    else
        log_success "Environment: root (no environment)"
    fi
    log_success "================================"
}

# Run main function
main "$@"