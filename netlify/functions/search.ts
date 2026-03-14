export default async (req: Request) => {
  const url = new URL(req.url)
  const term = url.searchParams.get('term') ?? ''

  if (!term.trim()) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const params = new URLSearchParams({
    term,
    media: 'music',
    entity: 'song',
    limit: '10',
  })

  const res = await fetch(`https://itunes.apple.com/search?${params}`)
  const body = await res.text()

  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const config = { path: '/api/search' }
