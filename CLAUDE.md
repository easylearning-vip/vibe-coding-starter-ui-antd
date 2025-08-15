# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Vibe Coding Starter Antd UI** - a production-ready React frontend template built with Ant Design Pro. It's a complete enterprise-level application template featuring a dictionary management system, user authentication, and role-based access control.

**Tech Stack**: React 19 + TypeScript 5.x + Ant Design Pro 5.x + UmiJS Max

## Common Development Commands

### Development Environment
```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Start with specific environment
pnpm start:dev     # Development environment
pnpm start:test    # Test environment  
pnpm start:pre     # Pre-production environment

# Start without mock data
pnpm start:no-mock
```

### Build and Deployment
```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Docker build and run
docker build -t vibe-coding-starter-ui .
docker run -p 3000:3000 vibe-coding-starter-ui

# Kubernetes deployment (k3d)
cd deploy/k8s && ./deploy.sh
```

### Code Quality
```bash
# Run linting (Biome + TypeScript)
pnpm lint

# Run Biome formatter/linter only
pnpm biome:lint

# TypeScript type checking
pnpm tsc
```


## Architecture Overview

### Core Architecture Patterns
- **Function Components + Hooks**: Modern React pattern with strict TypeScript
- **Dictionary-Driven UI**: Centralized configuration management through dictionary system
- **Service Layer Architecture**: Separated API services with TypeScript types
- **Component Composition**: Reusable components with prop interfaces
- **Internationalization**: Built-in i18n support with UmiJS

### Key Architectural Components

#### 1. Dictionary System (`src/services/dict/`, `src/hooks/useDict.ts`)
Centralized configuration management with caching and real-time updates.

**Core Components**:
- `DictProvider`: Global dictionary state management with preloading
- `useDict`: Main hook for dictionary operations with caching
- `useDictItems`: Hook for specific dictionary categories
- `DictSelect/DictTag`: UI components for dictionary integration

**Dictionary Categories**:
- `user_role`, `user_status`: User management
- `article_status`: Content management
- `comment_status`: Comment system
- `storage_type`: File storage configuration

#### 2. Service Layer (`src/services/`)
Structured API services with TypeScript type safety.

**Service Structure**:
```typescript
// API service pattern
export async function getUserList(params: GetUserParams): Promise<API.Response<User[]>> {
  return request('/api/v1/users', {
    method: 'GET',
    params,
  });
}
```

**Available Services**:
- `user/`: Authentication and user management
- `article/`: Content management
- `dict/`: Dictionary operations
- `swagger/`: API documentation integration

#### 3. Component Architecture (`src/components/`)
Reusable components with TypeScript interfaces and composition patterns.

**Key Components**:
- `DictProvider/`: Global dictionary state
- `DictSelect/`: Dictionary-driven dropdown
- `DictTag/`: Dictionary value display
- `LoggerControl/`: Frontend logging management
- `RightContent/`: Header with user menu

#### 4. Page Structure (`src/pages/`)
Feature-based page organization with consistent patterns.

**Page Structure**:
- `user/login/`, `user/register/`: Authentication
- `admin/users/`, `admin/articles/`, `admin/dict/`: Admin panel
- `articles/`: Content management for users
- `Welcome.tsx`: Landing page

## Configuration Management

### Environment Configuration
- **Development**: `REACT_APP_ENV=dev` with local mock data
- **Test**: `REACT_APP_ENV=test` for testing environments  
- **Pre-production**: `REACT_APP_ENV=pre` for staging
- Configuration in `config/config.ts` and `config/proxy.ts`

### Build Configuration
- **UmiJS Max**: Enterprise-grade build tool with optimizations
- **TypeScript**: Strict mode with comprehensive type checking
- **Biome**: Code formatting and linting (replacement for ESLint/Prettier)
- **Proxy**: API proxy configuration for different environments


## Dictionary System Architecture

The dictionary system is the core architectural pattern that drives the application's configuration and UI behavior.

### Data Flow
1. **Initialization**: `DictProvider` preloads common dictionaries on app start
2. **Caching**: In-memory caching with `Map` for performance
3. **Access**: Components use `useDict` hooks to access dictionary data
4. **UI Integration**: `DictSelect` and `DictTag` components provide UI bindings

### Dictionary Categories
```typescript
// Predefined categories in src/services/dict/api.ts
export const DICT_CATEGORIES = {
  ARTICLE_STATUS: 'article_status',
  USER_ROLE: 'user_role', 
  USER_STATUS: 'user_status',
  COMMENT_STATUS: 'comment_status',
  STORAGE_TYPE: 'storage_type',
} as const;
```

### Usage Patterns
```typescript
// Component usage
const { options } = useDictItems(DICT_CATEGORIES.USER_ROLE);
const { getLabel } = useDictItems(DICT_CATEGORIES.USER_STATUS);

// Direct dictionary access
const { fetchDictItems } = useDict();
const items = await fetchDictItems('user_role');
```


## Development Workflow

### Adding New Features
1. **Type Definitions**: Create TypeScript interfaces in `types/` or service files
2. **API Services**: Add service methods in appropriate `src/services/` directory
3. **Components**: Create reusable components with proper TypeScript interfaces
4. **Dictionary Integration**: Use existing dictionary categories or create new ones

### Code Standards
- **TypeScript**: Strict mode, explicit typing, avoid `any`
- **Components**: Function components with `React.FC` and proper prop interfaces
- **Hooks**: Custom hooks for reusable logic with proper dependency management
- **Styling**: Less with CSS Modules, following Ant Design theming
- **Internationalization**: Use `useIntl` hook for all user-facing text

### Dictionary-Driven Development
1. **Define Dictionary**: Create dictionary category for configurable values
2. **Implement Service**: Add API methods for dictionary management
3. **Build Components**: Use `DictSelect`/`DictTag` for UI integration
4. **Cache Management**: Leverage built-in caching in `useDict` hooks

## Deployment Configuration

### Docker Deployment
- **Multi-stage build**: Optimized production builds
- **Nginx**: Static file serving with proper caching
- **Security**: Non-root user execution, secure headers

### Kubernetes Deployment
- **Location**: `deploy/k8s/` directory
- **Features**: ConfigMap, Service, Deployment, Ingress
- **Environment**: k3d development cluster support
- **Script**: Automated deployment with `deploy.sh`

### Environment-Specific Builds
- **Development**: Hot reload, mock data, local API proxy
- **Production**: Optimized builds, real API integration

## File Structure Conventions

```
src/
├── components/          # Reusable components
│   ├── DictProvider/   # Dictionary state management
│   ├── DictSelect/     # Dictionary dropdown
│   └── DictTag/        # Dictionary display
├── hooks/              # Custom React hooks
│   └── useDict.ts      # Dictionary system hooks
├── pages/              # Page components
│   ├── admin/          # Admin panel pages
│   ├── user/           # Authentication pages
│   └── articles/       # Content management
├── services/           # API service layer
│   ├── dict/           # Dictionary APIs
│   ├── user/           # User management APIs
│   └── article/        # Content APIs
├── utils/              # Utility functions
├── locales/            # Internationalization files
└── config/             # Application configuration
```

## Performance Optimizations

### Dictionary Caching
- **In-memory Cache**: `Map`-based caching for dictionary data
- **Preloading**: Critical dictionaries loaded on app start
- **Cache Invalidation**: Manual cache clearing for data updates

### Build Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image and resource optimization

### Runtime Optimizations
- **Component Memoization**: Strategic use of `React.memo`
- **Hook Optimization**: Proper dependency management in hooks
- **Request Optimization**: Debounced API calls and caching

## Security Considerations

### Authentication & Authorization
- **JWT-based**: Token-based authentication system
- **Role-based Access**: Dictionary-driven user roles and permissions
- **Route Guards**: Protected routes with authentication checks

### Data Security
- **Input Validation**: TypeScript interfaces and runtime validation
- **XSS Protection**: Built-in React protections
- **API Security**: Proper error handling and response validation

### Deployment Security
- **Container Security**: Non-root user, minimal attack surface
- **Environment Variables**: Secure configuration management
- **HTTPS Support**: SSL/TLS configuration ready