# FCollections - Project Memory

> This file contains project context for Claude Code AI assistant.

## Project Overview

**FCollections** is a Cloudflare Workers + Hono web application that provides API endpoints and serves static assets.

### Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Cloudflare Workers |
| Framework | Hono v4 |
| Language | TypeScript |
| Package Manager | pnpm |
| Deployment | Wrangler |

### Project Structure

```
fcollections/
├── src/
│   └── index.ts          # Main Hono app with API routes
├── public/               # Static assets served by Workers Assets binding
├── wrangler.jsonc        # Cloudflare Workers configuration
├── eslint.config.js      # ESLint flat config
├── .prettierrc.js        # Prettier configuration
└── package.json          # Dependencies and scripts
```

### Current API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/message` | GET | Returns "Hello Hono!" text |
| `/cover` | GET | Proxies cover.png from static assets |
| `/random/picture` | GET | Fetches random picture from Unsplash API (with LRU cache) |

### Environment Bindings

```typescript
type Bindings = CloudflareBindings & {
  UNSPLASH_TOKEN: string  // Unsplash API access token
  ASSETS: any             // Static assets binding
}
```

### Code Style

- **ESLint**: Enabled with TypeScript rules
- **Prettier**: Enabled (single quotes, no semicolons, 80 char width)
- **Run `pnpm lint`**: Check code quality
- **Run `pnpm format`**: Format code with Prettier

### Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start local development server (Wrangler) |
| `pnpm deploy` | Deploy to Cloudflare Workers |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint issues automatically |
| `pnpm format` | Format code with Prettier |
| `pnpm cf-typegen` | Generate CloudflareBindings types |

### Architecture Decisions

#### Frontend Architecture (Planned)

**Chosen**: Vite + Hono Hybrid (方案2变体)

- Frontend built with Vite (React/TSX)
- Development: Separate Vite dev server for HMR
- Production: Vite builds to `public/`, served by Workers Assets
- API calls: Frontend calls `/api/*` endpoints on same domain

#### Migration Notes

- Currently using Hono as API-only
- Frontend to be added in `src/client/` directory
- Static builds will be output to `public/` directory

### Important Notes

1. **No npm**: Use `pnpm` for package management
2. **Workers Environment**: Code runs in Cloudflare Workers runtime (not Node.js)
3. **Static Assets**: Use `c.env.ASSETS.fetch()` to serve files from `public/`
4. **Cache**: Using LRU in-memory cache for Unsplash API responses

### External Dependencies

- **hono**: Web framework
- **lru-cache**: In-memory caching
- **unsplash-js**: Unsplash API client (installed but may not be actively used)

---

*Last updated: 2025-03-02*
