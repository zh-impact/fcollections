# Implementation Tasks: Daily Picture Feature

## 1. Backend API Implementation

- [x] 1.1 Add `/api/daily/picture` Hono route to `src/index.ts`
- [x] 1.2 Implement Unsplash Search API integration with keyword support
- [x] 1.3 Add query parameter parsing (keywords, orientation, count)
- [x] 1.4 Implement server-side LRU cache with 5min TTL
- [x] 1.5 Add error handling for Unsplash API errors (404, 429, 500)
- [ ] 1.6 Test API endpoint locally with curl or Postman

## 2. Frontend Routing Setup

- [x] 2.1 Install `react-router-dom` dependency
- [x] 2.2 Configure router in `src/client/main.tsx` (HashRouter or BrowserRouter)
- [x] 2.3 Update `src/client/App.tsx` to use `<Routes>` and `<Route>` components
- [x] 2.4 Add route for existing home page (`/`)
- [x] 2.5 Add route for daily picture page (`/daily-picture`)
- [x] 2.6 Update navigation links to use `<Link>` component

## 3. Daily Picture Component

- [x] 3.1 Create `src/client/pages/DailyPicture.tsx` component file
- [x] 3.2 Implement search form with input field and button
- [x] 3.3 Add state management (query, pictures, loading, error)
- [x] 3.4 Implement API call to `/api/daily/picture` endpoint
- [x] 3.5 Add loading state UI (spinner/skeleton)
- [x] 3.6 Implement picture display grid layout
- [x] 3.7 Add error message display with retry button
- [x] 3.8 Implement client-side caching for search results
- [x] 3.9 Add click handler to open full-size picture
- [x] 3.10 Create responsive styles for mobile and desktop

## 4. Styling and UX

- [x] 4.1 Create `src/client/pages/DailyPicture.css` for page-specific styles
- [x] 4.2 Design search input and button layout
- [x] 4.3 Implement responsive grid for picture display
- [x] 4.4 Add loading animation styles
- [x] 4.5 Style error messages and retry button
- [x] 4.6 Test responsive design on mobile viewport

## 5. Integration and Testing

- [x] 5.1 Update home page to include link to Daily Picture feature
- [ ] 5.2 Test search functionality with various keywords
- [ ] 5.3 Test empty search (random picture)
- [ ] 5.4 Test error scenarios (invalid keywords, API errors)
- [ ] 5.5 Test browser back/forward navigation
- [ ] 5.6 Test direct URL access to `/daily-picture`

## 6. Build and Deployment

- [x] 6.1 Run `pnpm build` and verify no build errors
- [x] 6.2 Check `public/` directory contains all assets
- [x] 6.3 Run `pnpm lint` and `pnpm format` to ensure code quality
- [ ] 6.4 Deploy to Cloudflare Workers with `pnpm deploy`
- [ ] 6.5 Test production environment functionality
- [ ] 6.6 Verify API endpoint works in production
- [ ] 6.7 Test frontend page on deployed URL

## 7. Documentation

- [x] 7.1 Update README.md with new feature description
- [x] 7.2 Add `/api/daily/picture` to API endpoints section
- [x] 7.3 Document query parameters (keywords, orientation, count)
- [x] 7.4 Update CLAUDE.md with new project structure
- [x] 7.5 Add usage examples for Daily Picture feature
