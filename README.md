# FCollections

> A Cloudflare Workers + Hono web application with React frontend.

## Features

- ⚡ **Cloudflare Workers** - Edge computing platform
- 🔥 **Hono** - Fast, lightweight web framework
- ⚛️ **React** - Modern UI library
- 📦 **Vite** - Fast build tool with HMR
- 🎨 **Unsplash Integration** - Random image API with caching
- 🔧 **TypeScript** - Type-safe development
- ✨ **Code Quality** - ESLint + Prettier configured

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) package manager
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI

### Installation

```bash
pnpm install
```

### Development

```bash
# Terminal 1: Start Cloudflare Workers (API)
pnpm dev

# Terminal 2: Start Vite dev server (Frontend with HMR)
pnpm dev:client
```

Visit `http://localhost:5173` for the frontend or `http://localhost:8787` for the Workers API.

### Deployment

```bash
pnpm deploy
```

## Project Structure

```
fcollections/
├── src/
│   ├── index.ts          # Hono API routes
│   └── client/           # React frontend
│       ├── main.tsx      # Entry point
│       ├── App.tsx       # Main component
│       └── index.css     # Styles
├── static/               # Static assets (copied to public/ on build)
│   ├── cover.png
│   └── vite.svg
├── public/               # Build output
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
└── wrangler.jsonc        # Cloudflare Workers config
```

## API Endpoints

All API endpoints use `/api` prefix:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/message` | GET | Returns greeting message |
| `/api/cover` | GET | Serves cover image |
| `/api/random/picture` | GET | Fetches random picture from Unsplash |

### Example: Get Random Picture

```bash
curl https://your-worker.workers.dev/api/random/picture --output image.jpg
```

## Configuration

### Environment Variables

Set your Unsplash access token:

```bash
# Via .env file (local development)
UNSPLASH_TOKEN=your_access_token_here

# Via Wrangler secrets (production)
wrangler secret put UNSPLASH_TOKEN
```

### Generate Types

```bash
pnpm cf-typegen
```

## Code Quality

```bash
pnpm lint          # Check code with ESLint
pnpm lint:fix      # Fix ESLint issues
pnpm format        # Format code with Prettier
pnpm format:check  # Check formatting
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Cloudflare Workers |
| Backend | [Hono](https://hono.dev/) |
| Frontend | [React](https://react.dev/) + [Vite](https://vitejs.dev/) |
| Language | TypeScript |
| Package Manager | pnpm |

## License

MIT
