import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { searchTracks, type TrackResult } from '../music/search'

export function useTrackSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TrackResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debouncedQuery] = useDebounce(query, 500)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const tracks = await searchTracks(q)
      setResults(tracks)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('429')) {
        setLoading(false)
        await new Promise((r) => setTimeout(r, 2000))
        setLoading(true)
        try {
          const tracks = await searchTracks(q)
          setResults(tracks)
          setError(null)
        } catch {
          setError('Rate limited. Please wait a moment.')
          setResults([])
        }
      } else {
        console.error('Search error:', msg)
        setError('Search failed. Try again.')
        setResults([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      void search(debouncedQuery)
    } else {
      setResults([])
      setError(null)
    }
  }, [debouncedQuery, search])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => { setResults([]); setQuery('') },
  }
}
