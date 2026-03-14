import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function itunesProxy(): Plugin {
  return {
    name: 'itunes-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET' || !req.url?.startsWith('/api/search')) {
          next()
          return
        }
        const { searchParams } = new URL(req.url, 'http://localhost')
        const params = new URLSearchParams({
          term: searchParams.get('term') ?? '',
          media: 'music',
          entity: 'song',
          limit: '10',
        })
        try {
          const upstream = await fetch(`https://itunes.apple.com/search?${params}`)
          const body = await upstream.text()
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = upstream.status
          res.end(body)
        } catch {
          res.statusCode = 502
          res.end(JSON.stringify({ error: 'Proxy failed' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), itunesProxy()],
  server: {
    port: 5173,
  },
  envPrefix: 'VITE_',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          icons: ['@phosphor-icons/react'],
          dropzone: ['react-dropzone'],
        },
      },
    },
  },
})
