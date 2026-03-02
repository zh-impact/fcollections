# FCollections - Project Memory

> This file contains project context for Claude Code AI assistant.

## Project Overview

**FCollections** is a Cloudflare Workers + Hono web application with a React frontend built via Vite.

### Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Cloudflare Workers |
| Backend Framework | Hono v4 |
| Frontend Framework | React 19 + Vite 7 |
| Language | TypeScript |
| Package Manager | pnpm |
| Deployment | Wrangler |

### Project Structure

```
fcollections/
├── src/
│   ├── index.ts          # Hono API routes
│   └── client/           # React frontend
│       ├── main.tsx      # React entry point
│       ├── App.tsx       # Main app component
│       └── index.css     # Global styles
├── public/               # Static assets and build output
│   ├── index.html        # HTML entry point
│   ├── assets/           # Built JS/CSS (from Vite)
│   ├── cover.png
│   └── vite.svg
├── wrangler.jsonc        # Cloudflare Workers config
├── vite.config.ts        # Vite configuration
├── eslint.config.js      # ESLint flat config
├── .prettierrc.js        # Prettier configuration
└── package.json
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
| `pnpm dev` | Start Cloudflare Workers dev server (port 8787) |
| `pnpm dev:client` | Start Vite dev server (port 5173) |
| `pnpm build` | Build frontend with Vite (outputs to public/) |
| `pnpm deploy` | Build and deploy to Cloudflare Workers |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint issues automatically |
| `pnpm format` | Format code with Prettier |
| `pnpm cf-typegen` | Generate CloudflareBindings types |

### Development Workflow

1. **Backend Development**: `pnpm dev` - Wrangler serves both API and static assets
2. **Frontend Development**: `pnpm dev:client` - Vite dev server with HMR and API proxy
3. **Production Build**: `pnpm build` - Vite builds to public/assets
4. **Deploy**: `pnpm deploy` - Builds and deploys to Cloudflare

### Architecture Decisions

#### Frontend Architecture (Implemented)

**Vite + Hono Hybrid**

- **Frontend**: React 19 with TypeScript, built via Vite
- **Development**: Separate Vite dev server (localhost:5173) with HMR and API proxy to Workers
- **Production**: Vite builds to `public/assets/`, served by Workers Assets binding
- **API Integration**: Frontend calls backend endpoints directly on same domain
- **SPA Fallback**: Hono serves index.html for all non-API routes

#### Why This Architecture?

1. **Developer Experience**: Vite provides instant HMR during development
2. **Simple Deployment**: Single deploy command builds frontend and deploys Workers
3. **Fast Performance**: Static assets served from Cloudflare's edge network
4. **Easy Migration**: Frontend can be extracted to separate service if needed

### Important Notes

1. **No npm**: Use `pnpm` for package management
2. **Workers Environment**: Code runs in Cloudflare Workers runtime (not Node.js)
3. **Static Assets**: Use `c.env.ASSETS.fetch()` to serve files from `public/`
4. **Cache**: Using LRU in-memory cache for Unsplash API responses

### External Dependencies

**Backend**:
- **hono**: Web framework
- **lru-cache**: In-memory caching for Unsplash API
- **unsplash-js**: Unsplash API client (installed but may not be actively used)

**Frontend**:
- **react**: UI framework
- **react-dom**: React DOM renderer
- **vite**: Build tool and dev server
- **@vitejs/plugin-react**: Vite React plugin

---

*Last updated: 2025-03-02*
