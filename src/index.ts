import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { LRUCache } from 'lru-cache'

type Random = {
  id: string
  created_at: string
  updated_at: string
  urls: {
    full: string
    raw: string
    regular: string
    small: string
    thumb: string
  }
}

type SearchResult = {
  id: string
  description: string | null
  urls: {
    full: string
    raw: string
    regular: string
    small: string
    thumb: string
  }
  user: {
    name: string
    username: string
  }
}

const options = {
  max: 500,
  ttl: 1000 * 60 * 5,
}

const lruCache = new LRUCache(options)

type Bindings = CloudflareBindings & {
  UNSPLASH_TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(prettyJSON())

// API routes with /api prefix
const api = new Hono<{ Bindings: Bindings }>()

api.get('/message', (c) => {
  return c.text('Hello Hono!')
})

api.get('/cover', (c) => {
  const url = new URL(c.req.url)
  console.log(c.req.url, url)
  url.pathname = '/cover.png'
  return c.env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }))
})

api.get('/random/picture', async (c) => {
  if (lruCache.has('random/picture')) {
    console.log('Cache hit')
    const data = lruCache.get('random/picture') as Random

    const targetPicture = data.urls.regular
    console.log(targetPicture)
    return fetch(targetPicture)
  }

  const api = 'https://api.unsplash.com/photos/random'
  const response = await fetch(api, {
    headers: {
      Authorization: `Client-ID ${c.env.UNSPLASH_TOKEN}`,
      'Accept-Version': 'v1',
    },
  })
  console.log(response.headers)
  const data = (await response.json()) as Random
  lruCache.set('random/picture', data as unknown)
  console.log('Cache miss', data.urls)

  const targetPicture = data.urls.regular
  console.log(targetPicture)
  return fetch(targetPicture)
})

// Daily picture search endpoint
api.get('/daily/picture', async (c) => {
  const keywords = c.req.query('keywords')
  const orientation = c.req.query('orientation')
  const countParam = c.req.query('count')
  const count = countParam
    ? Math.min(30, Math.max(1, parseInt(countParam, 10) || 1))
    : 1

  // Build cache key
  const cacheKey = `daily-picture:${keywords || 'random'}:${orientation || 'all'}:${count}`

  // Check cache
  if (lruCache.has(cacheKey)) {
    console.log('Cache hit for', cacheKey)
    const cachedData = lruCache.get(cacheKey) as SearchResult[]
    return c.json(cachedData)
  }

  try {
    // If no keywords, directly use Random Photo API
    if (!keywords) {
      console.log('No keywords provided, fetching random picture')
      const randomUrl = new URL('https://api.unsplash.com/photos/random')
      if (orientation) {
        randomUrl.searchParams.set('orientation', orientation)
      }
      randomUrl.searchParams.set('count', count.toString())

      const response = await fetch(randomUrl.toString(), {
        headers: {
          Authorization: `Client-ID ${c.env.UNSPLASH_TOKEN}`,
          'Accept-Version': 'v1',
        },
      })

      if (!response.ok) {
        console.error(
          'Unsplash API error:',
          response.status,
          response.statusText
        )
        return c.json(
          { error: `Failed to fetch pictures: ${response.statusText}` },
          500
        )
      }

      const randomData = await response.json()
      const results = Array.isArray(randomData) ? randomData : [randomData]

      // Cache the results
      lruCache.set(cacheKey, results as unknown)
      console.log('Fetched random picture and cached')

      return c.json(results)
    }

    // Build Unsplash Search API URL
    const searchUrl = new URL('https://api.unsplash.com/search/photos')
    searchUrl.searchParams.set('query', keywords)
    if (
      orientation &&
      ['landscape', 'portrait', 'squarish'].includes(orientation)
    ) {
      searchUrl.searchParams.set('orientation', orientation)
    }
    searchUrl.searchParams.set('per_page', count.toString())
    searchUrl.searchParams.set('order_by', 'relevant')

    console.log('Fetching Unsplash API:', searchUrl.toString())

    const response = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Client-ID ${c.env.UNSPLASH_TOKEN}`,
        'Accept-Version': 'v1',
      },
    })

    if (response.status === 401) {
      console.error('Unsplash authentication failed')
      return c.json(
        { error: 'Authentication failed. Please check API token.' },
        500
      )
    }

    if (response.status === 429) {
      console.error('Unsplash rate limit exceeded')
      return c.json(
        { error: 'Too many requests. Please try again later.' },
        503
      )
    }

    if (!response.ok) {
      console.error('Unsplash API error:', response.status, response.statusText)
      return c.json(
        { error: `Failed to fetch pictures: ${response.statusText}` },
        500
      )
    }

    const data = (await response.json()) as {
      results: SearchResult[]
      total: number
    }

    if (data.results.length === 0) {
      return c.json(
        {
          error: `No pictures found for "${keywords}". Try different keywords.`,
        },
        404
      )
    }

    // Cache the results
    lruCache.set(cacheKey, data.results as unknown)
    console.log(
      'Cache miss, fetched and cached',
      data.results.length,
      'pictures'
    )

    return c.json(data.results)
  } catch (error) {
    console.error('Error fetching daily picture:', error)
    return c.json({ error: 'Something went wrong. Please try again.' }, 500)
  }
})

// Mount API routes with /api prefix
app.route('/api', api)

// SPA fallback - serve index.html for all non-API routes
app.get('*', async (c) => {
  const url = new URL(c.req.url)
  // Skip API routes and assets
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/assets')) {
    return c.notFound()
  }
  // Serve index.html for SPA routes
  url.pathname = '/index.html'
  return c.env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }))
})

// Also handle root path
app.get('/', async (c) => {
  const url = new URL(c.req.url)
  url.pathname = '/index.html'
  return c.env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' }))
})

export default app
