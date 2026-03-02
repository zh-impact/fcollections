# Design: Daily Picture Feature

## Context

当前项目使用 Cloudflare Workers + Hono 后端，React 19 + Vite 前端。现有 `/api/random/picture` 端点仅提供随机图片，无法满足用户主动搜索需求。

### Current State
- 后端：Hono 路由直接调用 Unsplash Random API
- 前端：单一页面组件，无路由系统
- 缓存：使用 LRU in-memory cache 缓存随机图片结果
- 无前端路由库，所有内容在根路径展示

### Constraints
- 运行在 Cloudflare Workers 边缘环境，无数据库持久化
- Unsplash API 有速率限制（50 requests/hour for demo）
- 构建产物需要部署到 `public/` 目录
- 保持与现有 `/api/random/picture` 端点的兼容性

## Goals / Non-Goals

**Goals:**
- 实现关键词搜索 Unsplash 图片的 API 端点
- 创建独立的前端页面展示搜索界面和结果
- 添加前端路由支持多页面导航
- 优化 API 调用，减少 Unsplash 速率限制影响
- 为未来功能（收藏、历史）预留扩展接口

**Non-Goals:**
- 不实现用户认证和个性化推荐
- 不持久化搜索历史或收藏数据（留待未来）
- 不修改现有 `/api/random/picture` 端点行为
- 不实现图片编辑或高级筛选功能

## Decisions

### 1. Frontend Routing: react-router-dom

**Choice**: 使用 `react-router-dom` v6 提供客户端路由

**Rationale**:
- React 19 + Vite 生态的标准路由解决方案
- 支持 HashRouter（无需服务器配置）和 BrowserRouter（需要服务器 fallback）
- 轻量级，Tree-shakable，对 bundle size 影响小
- 与现有 Hono SPA fallback 配合良好

**Alternatives Considered**:
- `wouter`: 更轻量但生态较小，社区支持有限
- `@reach/router`: 已废弃，维护停止
- 手动实现: 增加复杂度，难以处理边缘情况

### 2. API Endpoint Design: RESTful Query Parameters

**Choice**: `GET /api/daily/picture?keywords=<query>&orientation=<orient>&count=<num>`

**Rationale**:
- GET 请求可被浏览器和 CDN 缓存
- 幂等操作，无副作用，符合 REST 规范
- 查询参数清晰表达意图
- 与现有 `/api/random/picture` 风格一致

**Alternatives Considered**:
- `POST /api/daily/picture` with body: 不适合幂等查询操作，无法利用 HTTP 缓存
- `/api/search/pictures`: 违背项目命名惯例，增加端点数量

### 3. State Management: React useState + useReducer

**Choice**: 使用原生 React hooks 管理组件状态

**Rationale**:
- 功能简单，无需全局状态管理
- React 19 hooks 性能优秀，避免额外依赖
- 易于测试和调试

**State Structure**:
```typescript
{
  query: string,           // 搜索关键词
  pictures: Picture[],     // 结果数组
  loading: boolean,        // 加载状态
  error: string | null,    // 错误信息
  cache: Map<string, Picture[]>  // 客户端缓存
}
```

**Alternatives Considered**:
- Zustand/Jotai: 过度设计，增加学习成本
- React Query: 功能强大但依赖重，对于简单搜索场景不够轻量

### 4. Caching Strategy: Two-Layer Cache

**Choice**: 服务端 LRU cache (5min TTL) + 客户端内存缓存

**Rationale**:
- **服务端缓存**: 减少 Unsplash API 调用，保护速率限制
- **客户端缓存**: 提升用户体验，避免重复请求
- 分层设计：服务端缓存保护 API，客户端缓存提升响应速度

**Cache Key Design**:
```
Server: `daily-picture:${keywords}:${orientation}:${count}`
Client: Same key format for consistency
```

**Alternatives Considered**:
- 仅服务端缓存: 用户体验不佳，每次页面切换都重新请求
- KV 存储缓存: Cloudflare Workers KV 有延迟和成本，不适合此场景
- 无缓存: 会导致频繁触发 Unsplash 速率限制

### 5. Error Handling: User-Friendly Messages

**Choice**: 统一错误处理，显示友好提示

**Error Categories**:
- `404`: 无搜索结果 → "No pictures found for '{keywords}'. Try different keywords."
- `429`: API 速率限制 → "Too many requests. Please try again later."
- `500`: 服务器错误 → "Something went wrong. Please try again."
- `Network`: 网络错误 → "Network error. Check your connection."

**Rationale**: 用户不需要看到技术细节，需要明确的行动指引

## Risks / Trade-offs

### Risk 1: Unsplash Rate Limiting
**Risk**: Demo key 仅允许 50 requests/hour，可能被快速耗尽

**Mitigation**:
- 实现激进缓存策略（5min TTL，可扩展到 30min）
- 客户端缓存减少重复请求
- 添加速率限制检测和用户提示
- 未来：引导用户使用自己的 Unsplash API key

### Risk 2: Client-Side Routing with Server Fallback
**Risk**: 直接访问 `/daily-picture` 路径在部署时可能 404

**Mitigation**:
- Hono 已配置 SPA fallback (`app.get('*')`)
- Vite 构建正确输出到 `public/`
- 文档说明使用 HashRouter 或配置服务器

### Risk 3: Bundle Size Increase
**Risk**: 添加 react-router-dom 会增加 JS bundle 大小

**Mitigation**:
- 使用动态导入（lazy loading）分离路由代码
- react-router-dom v6 支持 tree-shaking，仅引入使用部分
- 测量影响：预计增加 ~15KB gzipped

### Risk 4: No Persistent Storage
**Risk**: 刷新页面后搜索历史丢失

**Mitigation**:
- 当前阶段可接受，符合 Non-Goals
- 浏览器 localStorage 可作为未来轻量级方案
- 未来 KV/D1 数据库可实现完整持久化

## Migration Plan

### Phase 1: Backend API (10 min)
1. 添加 `/api/daily/picture` 端点到 `src/index.ts`
2. 集成 Unsplash Search API
3. 实现服务端缓存逻辑
4. 本地测试 API 端点

### Phase 2: Frontend Routing (15 min)
1. 安装 `react-router-dom`
2. 配置路由（BrowserRouter 或 HashRouter）
3. 创建 `/daily-picture` 路由
4. 更新现有链接使用 `<Link>` 组件

### Phase 3: Daily Picture Page (30 min)
1. 创建 `DailyPicture` 组件
2. 实现搜索表单和状态管理
3. 实现图片展示和错误处理
4. 添加响应式样式
5. 本地测试完整流程

### Phase 4: Build & Deploy (5 min)
1. 运行 `pnpm build` 构建
2. 验证 `public/` 输出正确
3. 部署到 Cloudflare Workers
4. 测试生产环境功能

**Rollback Strategy**:
- 保留现有 `/api/random/picture` 端点不变
- 新增路由不影响现有页面
- 如有问题，删除新组件和路由即可回退

## Open Questions

1. **路由模式**: 使用 HashRouter（#daily-picture）还是 BrowserRouter（/daily-picture）？
   - **Recommendation**: HashRouter，无需服务器配置，更简单
   - **Decision pending**: 用户对 URL 美观度的要求

2. **缓存 TTL**: 5分钟是否足够？是否需要根据结果数量动态调整？
   - **Recommendation**: 从 5min 开始，监控 Unsplash API 使用情况后调整
   - **Decision pending**: 生产环境数据支持

3. **默认图片**: 空搜索时是否显示预设图片而非随机 Unsplash 图片？
   - **Recommendation**: 随机 Unsplash 图片保持动态性
   - **Decision pending**: 用户确认
