# 🚀 Docker Build & Deploy Quick Start Guide

## ⚡ Quick Deployment (Within 5 Minutes)

### 1. Environment Setup (from project root)

```bash
# Copy and modify environment file
cp .env.docker.example .env.docker
# Edit .env.docker with your AWS configuration
```

### 2. One-command Build & Deploy

```bash
# Development environment deployment
yarn web:docker:deploy

# Or specify environment
./scripts/docker-deploy.sh dev   # Development
./scripts/docker-deploy.sh prod  # Production
./scripts/docker-deploy.sh       # Root path (default)
```

---

## 📋 Essential Commands Checklist

All commands should be run from the **project root directory**.

### Environment Setup Verification

```bash
# ✅ Check environment file exists
[ -f .env.docker ] && echo "✅ Environment file exists" || echo "❌ Environment file missing"

# ✅ Verify AWS credentials (local environment)
aws sts get-caller-identity --profile lemon

# ✅ Check Docker running
docker --version && docker info
```

### Build Process

```bash
# 🔨 Manual build (if needed)
yarn web:docker:build

# 🔨 Build without cache (troubleshooting)
docker build --no-cache -t eureka-chats-front:prod -f docker/web/Dockerfile .
```

### Deploy Process

```bash
# 🚀 Automated deploy (recommended)
./scripts/docker-deploy.sh [env]

# 🚀 Step-by-step verification
./scripts/docker-deploy.sh dev 2>&1 | tee deploy.log
```

---

## 🔧 Quick Troubleshooting

### Build Failures

```bash
# Clear cache
docker system prune -a -f

# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install

# Clean build directory
yarn clean:cache
```

### Deploy Failures

```bash
# Test AWS connection
aws s3 ls --profile lemon

# Check environment variables
grep -v '^#' .env.docker | grep -v '^$'

# Verify S3 bucket access
aws s3 ls s3://your-bucket-name/ --profile lemon
```

---

## 📊 Post-deployment Verification

```bash
# Check S3 upload
aws s3 ls s3://your-bucket-name/[env]/ --recursive --profile lemon

# Test website access
curl -I https://your-bucket-name.s3.amazonaws.com/[env]/index.html

# Verify CloudFront invalidation (if configured)
aws cloudfront list-invalidations --distribution-id YOUR_ID --profile lemon
```

---

## 🏗️ Project Structure Reference

```
eureka-chats-front/              # Project root (run commands from here)
├── .env.docker.example          # Template for environment configuration
├── .env.docker                  # Your actual configuration (create this)
├── docker/
│   └── web/
│       ├── Dockerfile           # Multi-stage build configuration
│       ├── README.md            # Detailed documentation
│       └── QUICK_START.md       # This file
├── scripts/
│   ├── docker-deploy.sh         # Main deployment script
│   └── docker-entrypoint-deploy.sh  # Container entrypoint
└── dist/apps/web/               # Build output (created after build)
```

---

## 🎯 Environment-specific Deployment

| Environment | Command                           | S3 Path             | Purpose             |
| ----------- | --------------------------------- | ------------------- | ------------------- |
| Development | `./scripts/docker-deploy.sh dev`  | `s3://bucket/dev/`  | Development/Testing |
| Production  | `./scripts/docker-deploy.sh prod` | `s3://bucket/prod/` | Live Service        |
| Root        | `./scripts/docker-deploy.sh`      | `s3://bucket/`      | Default/Demo        |

---

## ⚠️ Important Notes

-   **Working Directory**: Always run commands from project root
-   **Environment File**: The `.env.docker` file should be in project root
-   **Production Deploy**: Always verify with `prod` environment flag
-   **Sensitive Data**: Never commit `.env.docker` files to Git
-   **AWS Profile**: Use `--profile lemon` for AWS commands

---

## 📞 Support

1. **Logs**: Save deployment logs with `2>&1 | tee deploy.log`
2. **Environment**: Include OS, Docker version, AWS CLI version
3. **Errors**: Record exact error messages and steps

For detailed information, refer to the full [README.md](./README.md).
