# Docker Build and Deploy Guide

This guide explains the Docker-based build and deployment process for the Eureka Chats Frontend web application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Docker Build Process](#docker-build-process)
5. [Deployment Methods](#deployment-methods)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

## 🔍 Overview

### System Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Source Code   │ -> │ Docker Build  │ -> │   AWS S3 Deploy │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │
                              ↓
                       ┌──────────────┐
                       │ CloudFront   │
                       │ Invalidation │
                       └──────────────┘
```

### Key Components

-   **Multi-stage Dockerfile**: Efficient container setup with separate build and deploy stages
-   **Automated Deploy Scripts**: AWS S3 upload and CloudFront invalidation automation
-   **Environment-specific Configuration**: Independent build and deploy for dev/prod environments

### Project Structure

```
eureka-chats-front/
├── .env.docker.example        # Environment configuration template
├── docker/
│   └── web/
│       ├── Dockerfile         # Multi-stage Docker build file
│       └── README.md          # This file
├── scripts/
│   ├── deploy-web.sh          # Direct S3 deployment script
│   ├── docker-deploy.sh       # Docker-based deployment script
│   └── docker-entrypoint-deploy.sh  # Container entrypoint script
└── apps/
    └── web/                   # Web application source
```

## 🛠 Prerequisites

### Required Tools

-   Docker (20.10 or higher)
-   AWS CLI (for deployment)
-   yarn (for local development)
-   Node.js (20.11.1 or compatible)

### Permission Setup

```bash
# AWS CLI configuration (local development)
aws configure --profile lemon
```

### Required AWS Permissions

-   S3: `s3:PutObject`, `s3:PutObjectAcl`, `s3:GetObject`, `s3:DeleteObject`
-   CloudFront (optional): `cloudfront:CreateInvalidation`

## ⚙️ Environment Setup

### 1. Environment File Configuration

Create environment file from template in project root:

```bash
# Copy template and configure
cp .env.docker.example .env.docker

# Or for environment-specific configuration
cp .env.docker.example .env.docker.dev
cp .env.docker.example .env.docker.prod
```

### 2. Environment Variables Explanation

Edit the `.env.docker` file with your configuration:

```bash
# Application Configuration
APP_NAME=web

# AWS Configuration
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_BUCKET_NAME=your-bucket-name
AWS_DEPLOY_TARGET=dev  # dev, prod, or empty (root)

# CloudFront (Optional)
# Comment out or leave empty to skip CloudFront invalidation
AWS_DISTRIBUTION_ID=your-cloudfront-id

# Vite Build Configuration
VITE_PROJECT=EUREKA_CHATS_FRONT
VITE_ENV=DEV  # DEV or PROD
VITE_HOST=https://your-domain.example.com
VITE_OAUTH_ENDPOINT=https://api.example.com/oauth
VITE_SOCIAL_OAUTH_ENDPOINT=https://oauth.example.com
VITE_IMAGE_API_ENDPOINT=https://image.example.com
VITE_CHAT_API_ENDPOINT=https://api.example.com/chat
VITE_SOCKET_ENDPOINT=wss://websocket.example.com
```

## 🔨 Docker Build Process

### 1. Dockerfile Structure

The `docker/web/Dockerfile` uses a multi-stage build approach:

```dockerfile
# Stage 1: Builder (Build Environment)
FROM node:20.11.1-alpine AS builder
# - Install build dependencies
# - Copy and install node modules
# - Build the application

# Stage 2: Deploy (Deployment Environment)
FROM node:20.11.1-alpine AS deploy
# - Install AWS CLI
# - Copy build artifacts from builder
# - Set up deployment scripts
# - Configure non-root user for security
```

### 2. Build Steps Explanation

**Step 1: Dependencies Installation**

-   Copy package files for better Docker layer caching
-   Install dependencies with frozen lockfile to ensure exact versions
-   Network timeout configured for stability

**Step 2: Application Build**

-   Pass environment variables through Docker build arguments
-   Create environment-specific `.env` file inside container
-   Execute build command for specified environment (dev/prod)

**Step 3: Deployment Image Preparation**

-   Copy only the built artifacts from builder stage
-   Include deployment script for S3/CloudFront operations
-   Set up non-root user for security best practices

### 3. Build Commands

From project root directory:

```bash
# Using npm script (recommended)
yarn web:docker:build

# Or direct Docker command
docker build \
  --build-arg BUILD_ENV=dev \
  --build-arg VITE_ENV=DEV \
  --build-arg VITE_PROJECT=EUREKA_CHATS_FRONT \
  --build-arg VITE_HOST=https://your-domain.com \
  --build-arg VITE_OAUTH_ENDPOINT=https://api.example.com/oauth \
  --build-arg VITE_SOCIAL_OAUTH_ENDPOINT=https://oauth.example.com \
  --build-arg VITE_IMAGE_API_ENDPOINT=https://image.example.com \
  --build-arg VITE_SOCKET_ENDPOINT=wss://socket.example.com \
  --build-arg VITE_CHAT_API_ENDPOINT=https://api.example.com/chat \
  -t eureka-chats-front:prod \
  -f docker/web/Dockerfile .
```

## 🚀 Deployment Methods

### 1. Automated Deployment via Scripts

**Simple Method** (from project root):

```bash
# Using npm script
yarn web:docker:deploy

# Or run deployment script directly
./scripts/docker-deploy.sh        # Uses .env.docker
./scripts/docker-deploy.sh dev    # Uses .env.docker.dev if exists
./scripts/docker-deploy.sh prod   # Uses .env.docker.prod if exists
```

### 2. Deployment Process Details

The deployment script (`scripts/docker-deploy.sh`) performs:

1. **Environment Validation**

    - Checks for required environment file
    - Validates AWS credentials and configuration
    - Verifies all required environment variables

2. **Docker Image Build**

    - Cleans previous build artifacts
    - Builds Docker image with environment-specific configuration
    - Tags image appropriately

3. **Container-based Deployment**
    - Runs deployment container with AWS credentials
    - Executes S3 sync and CloudFront invalidation
    - Provides deployment status and logs

### 3. Deployment Steps in Detail

The deployment process (`scripts/docker-entrypoint-deploy.sh`) includes:

**A. Static Assets Synchronization**

-   Uploads images, fonts, and other static files to S3
-   Excludes HTML, CSS, JS for separate handling

**B. CSS/JS Files Synchronization**

-   Processes CSS and JavaScript files with appropriate caching
-   Optimizes for browser caching strategies

**C. Asset Files Synchronization**

-   Handles files in assets/ directory
-   Includes images, icons, and other resources

**D. Locale Files Synchronization**

-   Uploads translation files from locales/ directory
-   Applies special no-cache headers for dynamic content

**E. index.html Upload**

-   Uploads SPA entry point with cache prevention headers
-   Ensures latest version is always served

**F. CloudFront Invalidation** (if configured)

-   Creates invalidation for all paths (`/*`)
-   Ensures CDN serves latest content

### 4. Deployment Targets

```bash
# Root deployment (default)
./scripts/docker-deploy.sh
# Result: s3://bucket-name/

# Development environment
./scripts/docker-deploy.sh dev
# Result: s3://bucket-name/dev/

# Production environment
./scripts/docker-deploy.sh prod
# Result: s3://bucket-name/prod/
```

## 🔧 Troubleshooting

### Common Issues and Solutions

**1. Docker Build Failures**

```bash
# Clear Docker cache and rebuild
docker system prune -a
docker build --no-cache -f docker/web/Dockerfile .

# Network timeout issues
# Increase --network-timeout value in Dockerfile
```

**2. Environment Variable Issues**

```bash
# Verify environment file
cat .env.docker
grep -v '^#' .env.docker | grep -v '^$'

# Check AWS credentials
aws sts get-caller-identity --profile lemon
```

**3. Deployment Failures**

```bash
# S3 permission issues
# Ensure IAM user has required S3 permissions

# CloudFront invalidation failures
# Verify CloudFront distribution ID and permissions
```

**4. Build Verification**

```bash
# Check built files
ls -la dist/apps/web/

# Inspect Docker image
docker run -it --rm eureka-chats-front:prod /bin/bash
```

### Logging and Debugging

```bash
# Enable detailed logging
./scripts/docker-deploy.sh dev 2>&1 | tee deploy.log

# AWS CLI debug mode
export AWS_DEBUG=true
aws s3 ls s3://your-bucket-name/ --debug

# Docker build with progress
docker build --progress=plain -f docker/web/Dockerfile .
```

## ❓ FAQ

### Q1: How to reduce build time?

```bash
# Use Docker build cache
docker build --cache-from eureka-chats-front:prod -f docker/web/Dockerfile .

# Optimize .dockerignore
echo "node_modules" >> .dockerignore
echo ".git" >> .dockerignore
echo "dist" >> .dockerignore
```

### Q2: How to deploy to a custom environment?

```bash
# Create environment-specific config
cp .env.docker.example .env.docker.staging

# Deploy with custom target
AWS_DEPLOY_TARGET=staging ./scripts/docker-deploy.sh
```

### Q3: How to test build without deployment?

```bash
# Build only
docker build --target builder -t eureka-chats-test -f docker/web/Dockerfile .

# Extract build artifacts
docker run --rm -v $(pwd)/test-dist:/output eureka-chats-test \
  cp -r /app/dist /output/
```

### Q4: How to skip CloudFront invalidation?

```bash
# In .env.docker, comment out or remove:
# AWS_DISTRIBUTION_ID=

# The deployment will automatically skip CloudFront steps
```

### Q5: How to verify deployment?

```bash
# Check S3 contents
aws s3 ls s3://your-bucket-name/dev/ --recursive --profile lemon

# Test website access
curl -I https://your-bucket-name.s3.amazonaws.com/dev/index.html

# Check CloudFront distribution (if applicable)
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID --profile lemon
```

## 📚 Additional Resources

-   [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/s3/latest/userguide/WebsiteHosting.html)
-   [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/#use-multi-stage-builds)
-   [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
-   [CloudFront Invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)

---

**For questions or improvements, please report through the project issue tracker.**
