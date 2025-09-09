# eureka-chats-front

[![Total Downloads](https://img.shields.io/github/downloads/lemoncloud-io/eureka-chats-front/total.svg)](https://github.com/lemoncloud-io/eureka-chats-front/releases)
[![License](https://img.shields.io/github/license/lemoncloud-io/eureka-chats-front.svg)](https://github.com/lemoncloud-io/eureka-chats-front/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/lemoncloud-io/eureka-chats-front.svg)](https://github.com/lemoncloud-io/eureka-chats-front/stargazers)

:star: Star us on GitHub — it motivates us a lot!

**eureka-chats-front** is a simple, real-time chat service built with modern web technologies. Users can join a single chat room with just a nickname and start chatting immediately - no authentication required!

## Table Of Content

-   [Installation](#installation)
-   [Quick Start](#quick-start)
-   [Features](#features)
-   [Screenshots](#screenshots)
-   [Architecture](#architecture)
-   [Development](#development)
-   [Deployment](#deployment)
-   [Contributing](#contributing)
-   [License](#license)
-   [Links](#links)

## Installation

### Prerequisites

| Software    | Version | Installation                        |
| ----------- | ------- | ----------------------------------- |
| **Node.js** | 20.0.0+ | [nodejs.org](https://nodejs.org/)   |
| **Yarn**    | Latest  | `npm install -g yarn`               |
| **Git**     | Latest  | [git-scm.com](https://git-scm.com/) |

### Clone and Install

```bash
git clone https://github.com/lemoncloud-io/eureka-chats-front.git
cd eureka-chats-front
yarn install
cp apps/web/.env.example apps/web/.env.local
```

### Environment Setup

```bash
# Edit .env.local with your settings:
VITE_ENV=LOCAL
VITE_PROJECT=EUREKA_CHATS_WEB
VITE_CHATS_ENDPOINT=https://api.eureka.chats/v1  # Chat API endpoint
VITE_SOCKETS_ENDPOINT=wss://sockets.eureka.chats  # WebSocket endpoint
VITE_HOST=http://localhost:5003
```

### Common Installation Issues

| Issue                       | Solution                                                  |
| --------------------------- | --------------------------------------------------------- |
| **Node version mismatch**   | `nvm install 20 && nvm use 20`                            |
| **Permission errors**       | `yarn cache clean && rm -rf node_modules && yarn install` |
| **Port 5003 in use**        | `lsof -i :5003` → kill process or use different port      |
| **Husky hooks not working** | `rm -rf .husky && yarn prepare`                           |

## Quick Start

```bash
yarn web:start  # Starts development server at http://localhost:5003
```

Open your browser and start chatting!

## Features

-   **🚀 Single Chat Room**: One shared room for all users
-   **👤 Nickname-based**: No authentication required, just enter a nickname
-   **⚡ Real-time Messaging**: WebSocket-based instant messaging
-   **📱 Mobile-friendly**: Responsive design optimized for mobile devices
-   **🔔 System Messages**: Join/leave notifications
-   **🎨 Modern UI**: Clean, intuitive interface with Tailwind CSS
-   **🔄 Auto-scroll**: Messages automatically scroll to bottom
-   **📝 Auto-resize**: Message input expands with content

## Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/18eefecf-5cf1-4629-835c-7f7913c365c9" alt="Chat Room Entry" width="400" />
  <img src="https://github.com/user-attachments/assets/fa478908-77c2-4728-96c8-02bc1c9937b9" alt="Active Chat" width="400" />
</div>

## Architecture

### Frontend Stack

-   **React 18.3** - Modern React with hooks
-   **TypeScript** - Type-safe development
-   **Vite** - Fast build tool and dev server
-   **Nx** - Monorepo management
-   **Tailwind CSS** - Utility-first styling
-   **Radix UI** - Accessible UI components
-   **TanStack Query** - Server state management

### Backend Services

-   **Chat API**: RESTful API for chat operations (join, leave, send messages)
-   **WebSocket Service**: Real-time message delivery and presence updates

### Project Structure

```
eureka-chats-front/
├── apps/web/              # Main React application
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/
│   │   │   │   └── chat/     # Chat feature components
│   │   │   └── shared/        # Shared app components
│   │   └── styles.css         # Global styles
├── libs/                  # Shared libraries (Nx workspace)
│   ├── chats/            # Chat API hooks & services
│   ├── ui-kit/           # Reusable UI components
│   ├── shared/           # Common utilities & types
│   ├── theme/            # Design system & theming
│   └── web-core/         # Core business logic
└── scripts/              # Build & deployment scripts
```

### Library Dependencies

-   **apps/web**: Can import from any library
-   **libs/ui-kit**: Imports from `shared`, `theme`
-   **libs/chats**: Imports from `shared`, handles chat API
-   **libs/web-core**: Imports from `shared`, core logic
-   **libs/shared**: No dependencies (base library)
-   **libs/theme**: Imports from `shared`

## Development

### Essential Commands

```bash
# Development
yarn web:start                  # Dev server → http://localhost:5003
yarn lint:fix                   # Auto-fix code quality issues

# Building
yarn web:build:dev              # Development build
yarn web:build:prod             # Production build
yarn test                       # Run tests

# Code Quality
yarn lint                       # Check linting
yarn clean:cache                # Clear Vite/Nx cache
```

## Code Quality

### Using Nx Generators

```bash
# Generate new component
npx nx g @nx/react:component MyComponent --project=ui-kit

# Generate new hook
npx nx g @nx/react:hook useMyHook --project=web-core
```

### Git Commit Convention

```bash
git commit -m "feat(web): add user profile component"
git commit -m "fix(ui-kit): resolve button click issue"
```

**Commit types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Pre-commit hooks** (automatic via Husky):

-   Prettier formatting
-   ESLint validation
-   Commit message validation

### Testing

```bash
npx nx test web              # Run tests
npx nx test web --watch      # Watch mode
npx nx test web --coverage   # Coverage report
```

### Using Shared Libraries

```typescript
import { Button } from '@eureka/ui-kit';
import { useChat } from '@eureka/chats';
import { formatDate } from '@eureka/shared';
import { useTheme } from '@eureka/theme';
```

### Development Tools

-   **Debugging**: React DevTools, Redux DevTools (Zustand), TanStack Query Devtools
-   **Performance**: Bundle analyzer via `npx nx build web --stats`
-   **Testing**: Jest, React Testing Library
-   **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

### Troubleshooting

| Issue                | Solution                                        |
| -------------------- | ----------------------------------------------- | -------------- |
| Port 5003 in use     | `lsof -ti:5003                                  | xargs kill -9` |
| Cache issues         | `yarn clean:cache && rm -rf node_modules/.vite` |
| TypeScript errors    | `npx nx reset`                                  |
| Dependency conflicts | `rm -rf node_modules && yarn install`           |

## Deployment

### Prerequisites

#### AWS Setup

1. **S3 bucket**: `eureka-chats-front` (or your preferred name)
2. **CloudFront distributions**: dev & prod (optional)
3. **AWS CLI**: `aws configure --profile lemon`
4. **IAM permissions**: S3 (PutObject, ListBucket) + CloudFront (CreateInvalidation)

### Configuration

#### 1. Update Scripts

Edit `scripts/deploy-web.sh`:

```bash
BUCKET_NAME=eureka-chats-front
DEV_DISTRIBUTION_ID=your-cloudfront-id      # Optional
PROD_DISTRIBUTION_ID=your-cloudfront-id     # Optional
```

#### 2. Environment Files

```bash
# Create environment-specific files
cp apps/web/.env.example apps/web/.env.dev
cp apps/web/.env.example apps/web/.env.prod

# Key variables:
VITE_ENV=DEV|PROD
VITE_HOST=https://your-domain.com
VITE_CHATS_ENDPOINT=https://api.eureka.chats/v1
VITE_SOCKETS_ENDPOINT=wss://sockets.eureka.chats
```

### Manual Deployment

#### Web Deployment

```bash
# Root bucket deployment (no specific build environment)
./scripts/deploy-web.sh

# Environment-specific deployment
./scripts/deploy-web.sh dev      # Deploy to dev environment
./scripts/deploy-web.sh prod     # Deploy to production environment
```

#### Docker Deployment

```bash
# Root bucket deployment (uses dev build, deploys to root)
./scripts/docker-deploy.sh

# Environment-specific deployment
./scripts/docker-deploy.sh dev   # Deploy to dev environment
./scripts/docker-deploy.sh prod  # Deploy to production environment
```

#### Deployment Behavior

| Command                           | Build Environment | Deploy Location     | Description                                            |
| --------------------------------- | ----------------- | ------------------- | ------------------------------------------------------ |
| `./scripts/deploy-web.sh`         | Uses .env files   | `s3://bucket/`      | Direct web build using existing .env, root deployment  |
| `./scripts/deploy-web.sh dev`     | Uses .env files   | `s3://bucket/dev/`  | Direct web build using existing .env, dev environment  |
| `./scripts/deploy-web.sh prod`    | Uses .env files   | `s3://bucket/prod/` | Direct web build using existing .env, prod environment |
| `./scripts/docker-deploy.sh`      | `dev`             | `s3://bucket/`      | Docker build with dev config, root deployment          |
| `./scripts/docker-deploy.sh dev`  | `dev`             | `s3://bucket/dev/`  | Docker build with dev config                           |
| `./scripts/docker-deploy.sh prod` | `prod`            | `s3://bucket/prod/` | Docker build with prod config                          |

#### Docker Environment Files

```bash
# For Docker deployment, create environment-specific files:
cp .env.docker.example .env.docker          # Default (for root deployment)
cp .env.docker.example .env.docker.dev      # Dev environment (optional)
cp .env.docker.example .env.docker.prod     # Prod environment (optional)
```

**Key variables in .env.docker files:**

```bash
# Required for all deployments
VITE_ENV=DEV|PROD
VITE_PROJECT=EUREKA_CHATS_WEB
VITE_HOST=https://your-domain.com
VITE_OAUTH_ENDPOINT=https://api.eureka.codes/v1
VITE_SOCIAL_OAUTH_ENDPOINT=https://oauth2.eureka.codes
VITE_IMAGE_API_ENDPOINT=https://image.lemoncloud.io
VITE_SOCKET_ENDPOINT=wss://api.eureka.codes/cht-v1
VITE_CHAT_API_ENDPOINT=https://api.eureka.codes/cht-v1

# AWS Configuration
AWS_BUCKET_NAME=your-bucket-name
AWS_DEPLOY_TARGET=your-deploy-target  # Leave empty for root deployment
```

### CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
    push:
        branches: [main, develop] # main=prod, develop=dev

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: '20'
            - run: yarn install
            - run: yarn web:build:prod
            - uses: aws-actions/configure-aws-credentials@v4
              with:
                  aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                  aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
                  aws-region: ap-northeast-2
            - run: ./scripts/deploy-web.sh prod
```

**Required GitHub Secrets**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

### AWS Infrastructure Details

### S3 Bucket Structure

```
eureka-chats-front/
├── index.html         # Root deployment (no environment)
├── assets/            # Root deployment assets
├── locales/           # Root deployment locales
├── dev/               # Development environment
│   ├── index.html     # No cache
│   ├── assets/        # Long cache (1 year)
│   └── locales/       # No cache (dynamic)
└── prod/              # Production environment
    ├── index.html     # No cache
    ├── assets/        # Long cache (1 year)
    └── locales/       # No cache (dynamic)
```

### CloudFront Configuration

-   **Origins**:
    -   Root: `bucket.s3.amazonaws.com` (no path)
    -   Dev: `bucket.s3.amazonaws.com` with path `/dev`
    -   Prod: `bucket.s3.amazonaws.com` with path `/prod`
-   **Behaviors**: HTTPS redirect, compression enabled
-   **Error Pages**: 404/403 → `/index.html` (SPA routing)

### Cache Strategy

-   **index.html**: `max-age=0, must-revalidate`
-   **JS/CSS/Assets**: `max-age=31536000` (1 year, versioned filenames)
-   **Locales**: `max-age=0` (no cache for translations)

### Deployment Troubleshooting

| Issue                              | Solution                                                       |
| ---------------------------------- | -------------------------------------------------------------- |
| **AWS CLI not configured**         | `aws configure --profile lemon`                                |
| **S3 Access Denied**               | Check IAM permissions & bucket policies                        |
| **CloudFront not updating**        | Wait 5-10 min for invalidation                                 |
| **Build failures**                 | `yarn clean:cache && rm -rf dist`                              |
| **Docker build fails**             | Check .env.docker file has all required variables              |
| **VITE_CHAT_API_ENDPOINT missing** | Ensure all VITE\_\* variables are in .env.docker               |
| **Environment not applied**        | Verify .env.docker.{env} file exists for specific environments |

### Debug Commands

```bash
# Check S3 uploads
aws s3 ls s3://eureka-chats-front/ --recursive --profile lemon          # Root deployment
aws s3 ls s3://eureka-chats-front/dev/ --recursive --profile lemon      # Dev environment
aws s3 ls s3://eureka-chats-front/prod/ --recursive --profile lemon     # Prod environment

# Test CloudFront distributions
curl -I https://your-root-domain.cloudfront.net                        # Root deployment
curl -I https://your-dev-domain.cloudfront.net                         # Dev environment
curl -I https://your-prod-domain.cloudfront.net                        # Prod environment
```

## Security & Best Practices

### Security

-   Never commit `.env` files to version control
-   Use IAM roles with minimal permissions
-   Enable CloudFront logs for monitoring
-   Implement proper CORS policies
-   Always use HTTPS in production

### Performance & Cost

-   Enable S3 lifecycle policies for old builds
-   Configure CloudFront cache TTLs properly
-   Monitor with AWS Cost Explorer
-   Enable gzip compression for assets

### Production Checklist

-   [ ] All tests passing
-   [ ] Environment variables configured
-   [ ] Build succeeds locally
-   [ ] AWS credentials configured
-   [ ] CloudFront distribution ready

## Contributing

We welcome contributions! Please see our development guidelines above for complete instructions.

### Quick Contributing Steps

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

## License

The eureka-chats-front is licensed under the terms of the MIT Open Source license and is available for free.

## Links

-   [Issue Tracker](https://github.com/lemoncloud-io/eureka-chats-front/issues)
-   [Source Code](https://github.com/lemoncloud-io/eureka-chats-front)
-   [Releases](https://github.com/lemoncloud-io/eureka-chats-front/releases)
