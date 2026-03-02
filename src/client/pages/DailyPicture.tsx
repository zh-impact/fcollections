import { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import './DailyPicture.css'

interface Picture {
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

function DailyPicture() {
  const [query, setQuery] = useState('')
  const [pictures, setPictures] = useState<Picture[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cache = useRef<Map<string, Picture[]>>(new Map())

  const fetchPictures = useCallback(async (searchQuery: string = '') => {
    setLoading(true)
    setError(null)

    try {
      const cacheKey = `${searchQuery || 'random'}:all:1`

      // Check client cache
      if (cache.current.has(cacheKey)) {
        const cached = cache.current.get(cacheKey)!
        setPictures(cached)
        setLoading(false)
        return
      }

      // Build URL with query params
      const url = new URL('/api/daily/picture', window.location.origin)
      if (searchQuery) {
        url.searchParams.set('keywords', searchQuery)
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorData = (await response.json()) as { error: string }
        throw new Error(errorData.error || 'Failed to fetch pictures')
      }

      const data = (await response.json()) as Picture[]

      // Cache the results
      cache.current.set(cacheKey, data)
      setPictures(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setPictures([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPictures(query)
  }

  const handleRetry = () => {
    fetchPictures(query)
  }

  const handlePictureClick = (picture: Picture) => {
    window.open(picture.urls.full, '_blank')
  }

  return (
    <div className="app">
      <header>
        <h1>Daily Picture</h1>
        <p>Search for beautiful pictures by keywords</p>
      </header>

      <main>
        <section className="card">
          <h2>Search Pictures</h2>
          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter keywords (e.g., nature, city, cats)"
              className="search-input"
              disabled={loading}
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {!query && (
            <p className="search-hint">
              Leave empty to get a random picture, or enter keywords to search.
            </p>
          )}
        </section>

        {loading && (
          <section className="card">
            <div className="loading">
              <div className="spinner" />
              <p>Searching for pictures...</p>
            </div>
          </section>
        )}

        {error && (
          <section className="card">
            <div className="error">
              <p>{error}</p>
              <button onClick={handleRetry} className="retry-button">
                Retry
              </button>
            </div>
          </section>
        )}

        {!loading && !error && pictures.length > 0 && (
          <section className="pictures-section">
            <div className="pictures-grid">
              {pictures.map((picture) => (
                <div
                  key={picture.id}
                  className="picture-card"
                  onClick={() => handlePictureClick(picture)}
                >
                  <img
                    src={picture.urls.regular}
                    alt={picture.description || 'Picture'}
                    loading="lazy"
                  />
                  {picture.description && (
                    <div className="picture-info">
                      <p className="picture-description">
                        {picture.description}
                      </p>
                      <p className="picture-author">by {picture.user.name}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && !error && pictures.length === 0 && (
          <section className="card">
            <p className="empty-state">
              No pictures yet. Enter keywords above to search!
            </p>
          </section>
        )}
      </main>

      <footer>
        <p>
          <Link to="/">← Back to Home</Link>
        </p>
        <p>Built with Hono, Vite, and React</p>
      </footer>
    </div>
  )
}

export default DailyPicture
