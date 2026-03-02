import { useState } from 'react'

function App() {
  const [message, setMessage] = useState<string>('')

  const fetchMessage = async () => {
    try {
      const res = await fetch('/api/message')
      const text = await res.text()
      setMessage(text)
    } catch {
      setMessage('Error fetching message')
    }
  }

  return (
    <div className="app">
      <header>
        <h1>FCollections</h1>
        <p>Cloudflare Workers + Hono + React</p>
      </header>

      <main>
        <section className="card">
          <h2>API Test</h2>
          <button onClick={fetchMessage}>Fetch Message</button>
          {message && <p className="message">{message}</p>}
        </section>

        <section className="card">
          <h2>Random Picture</h2>
          <a href="/api/random/picture" target="_blank" rel="noreferrer">
            Get Random Picture
          </a>
        </section>
      </main>

      <footer>
        <p>Built with Hono, Vite, and React</p>
      </footer>
    </div>
  )
}

export default App
