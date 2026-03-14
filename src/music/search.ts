import type { TrackInfo } from '../audio/types'

const cache = new Map<string, TrackResult[]>()

export interface TrackResult {
  id: string
  name: string
  artists: string
  album: string
  artworkUrl: string
  durationMs: number
  previewUrl: string | null
}

interface iTunesTrack {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  artworkUrl100: string
  trackTimeMillis: number
  previewUrl?: string
  wrapperType: string
  kind: string
}

export async function searchTracks(query: string): Promise<TrackResult[]> {
  if (!query.trim()) return []

  const cacheKey = query.toLowerCase().trim()
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  const params = new URLSearchParams({
    term: query,
    media: 'music',
    entity: 'song',
    limit: '10',
  })

  const res = await fetch(`/api/search?${params}`)

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`)
  }

  const data = await res.json() as { results: iTunesTrack[] }

  const items: TrackResult[] = data.results
    .filter((item) => item.wrapperType === 'track' && item.kind === 'song')
    .map((item) => ({
      id: String(item.trackId),
      name: item.trackName,
      artists: item.artistName,
      album: item.collectionName ?? '',
      artworkUrl: item.artworkUrl100?.replace('100x100', '64x64') ?? '',
      durationMs: item.trackTimeMillis ?? 0,
      previewUrl: item.previewUrl ?? null,
    }))

  cache.set(cacheKey, items)
  return items
}

export function trackResultToTrackInfo(result: TrackResult): TrackInfo {
  return {
    id: `itunes-${result.id}`,
    title: result.name,
    artist: result.artists,
    album: result.album,
    artworkUrl: result.artworkUrl,
    duration: result.durationMs / 1000,
    sourceType: 'preview',
    previewUrl: result.previewUrl ?? undefined,
  }
}
