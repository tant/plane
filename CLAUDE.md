# CLAUDE.md

This file provides guidance when working with code in this repository.

## Important Rules

- **NEVER mention AI or any AI tools as author/contributor** in code comments, commit messages, documentation, or any files
- **NEVER add Co-Authored-By lines** referencing AI in git commits
- If you find any existing references to AI authorship in the codebase, clean them up

## Commands

```bash
# Development
pnpm dev                  # Start all dev servers (web:3000, admin:3001, space:3002, live:3100)
pnpm build                # Build all packages and apps
pnpm start                # Start production servers

# Code Quality
pnpm check                # Run format, lint, and type checks
pnpm check:lint           # ESLint across all packages
pnpm check:types          # TypeScript type checking
pnpm fix                  # Auto-fix format and lint issues
pnpm fix:format           # Auto-format with Prettier
pnpm fix:lint             # Auto-fix ESLint issues

# Target specific package/app
pnpm turbo run <command> --filter=<package>
pnpm --filter=@plane/ui storybook   # Start Storybook on port 6006

# Backend (Django API)
cd apps/api && python manage.py <command>
cd apps/api && pytest               # Run all API tests
cd apps/api && pytest plane/tests/unit/  # Run unit tests only
cd apps/api && pytest -k "test_name"     # Run specific test by name
```

## Architecture

**Plane** is an open-source project management tool. The codebase is a monorepo using pnpm workspaces and Turborepo.

### Directory Structure

```
apps/
├── web/       # Main web app (React Router, port 3000)
├── admin/     # Admin UI "God Mode" (React Router, port 3001)
├── space/     # Public space viewer (React Router, port 3002)
├── live/      # Real-time collaboration server (Hocuspocus/Express, port 3100)
├── api/       # Django REST API backend
└── proxy/     # Nginx reverse proxy

packages/
├── ui/           # Shared UI components (Storybook)
├── propel/       # Secondary UI component library (Storybook)
├── editor/       # Rich text editor (Tiptap-based with Hocuspocus collab)
├── types/        # Shared TypeScript type definitions
├── services/     # API client services (Axios-based)
├── hooks/        # React hooks
├── constants/    # Shared constants
├── utils/        # Utility functions
├── shared-state/ # MobX state management utilities
├── i18n/         # Internationalization (JSON with IntlMessageFormat)
└── ...           # Config packages (tailwind, typescript, eslint)
```

### Tech Stack

- **Frontend**: React 18, React Router 7, Vite, Tailwind CSS, MobX, SWR
- **Backend**: Django REST Framework, Celery (background tasks)
- **Real-time**: Hocuspocus + Yjs (CRDT-based collaboration)
- **Database**: PostgreSQL 15, Redis (Valkey)
- **Build**: Turborepo, tsdown (libraries), pnpm workspaces

### Frontend Architecture

**App Structure** (`apps/web/`):
- `app/` - React Router 7 file-based routing with nested layouts
- `core/store/` - MobX stores (see `root.store.ts` for full store composition)
- `core/components/` - App-specific React components
- `plane-web/` - Extended/enterprise features that import core functionality

**State Management Pattern**:
- `CoreRootStore` in `apps/web/core/store/root.store.ts` composes all domain stores
- Each store (cycle, module, issue, etc.) follows MobX observable patterns
- Services in `packages/services` handle API calls; stores consume them
- SWR used for data fetching with caching

**API Services** (`packages/services/`):
- All services extend `APIService` base class (Axios wrapper with credentials)
- Domain-organized: `cycle/`, `issue/`, `workspace/`, `module/`, etc.
- Services are injected into stores, not called directly from components

### Backend Architecture (Django)

**App Structure** (`apps/api/plane/`):
- `app/` - Main REST API views and serializers
- `api/` - External API endpoints
- `db/` - Database models and migrations
- `bgtasks/` - Celery background tasks
- `authentication/` - Auth logic
- `tests/` - Unit, contract, and smoke tests with pytest

### Key Patterns

- **State Management**: MobX stores in `apps/web/core/store/` compose domain logic
- **API Integration**: Axios-based services in `packages/services` extend `APIService`
- **Components**: Build shared components in `@plane/ui` or `@plane/propel` with Storybook
- **Imports**: Use `workspace:*` for internal packages, `catalog:` for external deps in package.json
- **Path aliases**: `@/` maps to app-specific paths (e.g., `@/core/`, `@/plane-web/`)

## Code Style

- **TypeScript**: Strict mode enabled, all files must be typed
- **Formatting**: Prettier (120 char width), run `pnpm fix:format`
- **Linting**: ESLint 9 with TypeScript ESLint (type-aware)
- **Naming**: camelCase for variables/functions, PascalCase for components/types

## Local Setup

Requirements: Node.js 22.18+, Python 3.8+, Docker, 12GB RAM minimum

```bash
./setup.sh                                    # Sets up .env files
docker compose -f docker-compose-local.yml up # Start backend services
pnpm dev                                      # Start frontend apps
# Register at http://localhost:3001/god-mode/
# Access app at http://localhost:3000
```

## Coolify Deployment

- **Coolify Dashboard**: https://app.nextis.dev/
- **Production URL**: https://plane.carp.vn
- **Docker Compose**: `docker-compose.coolify.yml`
- **Proxy**: Nginx-based (`apps/proxy/Dockerfile.coolify`)

### Environment Variables (Coolify)

Key variables to configure in Coolify UI:
- `AWS_S3_ENDPOINT_URL`: Use `https://plane.carp.vn` (not internal MinIO URL) to avoid Mixed Content errors
- `MINIO_ENDPOINT_SSL`: Set to `1` when using HTTPS endpoint
- `WEB_URL`: `https://plane.carp.vn`

## Pre-Deployment Checklist

**IMPORTANT**: Local frontend development (`pnpm dev`) does NOT validate Django API code. Python import errors and Celery task issues will only appear when the API container starts in production.

Before deploying to Coolify or any production environment, run these checks:

```bash
# 1. Verify Django configuration and imports
cd apps/api && python manage.py check

# 2. Verify all Celery tasks can be imported
cd apps/api && python -c "from plane.celery import app; print('Celery config OK')"

# 3. Verify critical module imports (add new modules here as needed)
cd apps/api && python -c "
from plane.license.bgtasks.tracer import instance_traces
from plane.bgtasks.email_notification_task import stack_email_notification
print('All task imports OK')
"

# 4. Run Django migrations check
cd apps/api && python manage.py makemigrations --check --dry-run
```

### Common Issues

- **ModuleNotFoundError in API container**: Usually means a Python module referenced in `celery.py` or management commands doesn't exist. Check `apps/api/plane/celery.py` for `beat_schedule` tasks.
- **Migration conflicts**: Run `python manage.py showmigrations` to verify migration state before deploying.

## Internationalization

Translations are in `packages/i18n/src/locales/{language}/translations.json`. Uses nested JSON keys with IntlMessageFormat for variables and pluralization:

```json
{
  "items": "{count, plural, one {Work item} other {Work items}}"
}
```

When adding new translation keys, add to all language files. To add a new language:
1. Add to `TLanguage` type in `packages/i18n/src/types/language.ts`
2. Add to `SUPPORTED_LANGUAGES` in `packages/i18n/src/constants/language.ts`
3. Create `packages/i18n/src/locales/{lang}/translations.json`
4. Update import logic in the language loader
