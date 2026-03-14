import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { useTrackSearch } from '../../hooks/useTrackSearch'
import { AutocompleteList } from './AutocompleteList'

export function SearchBar() {
  const { query, setQuery, results, loading, error, clearResults } = useTrackSearch()
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleChange = (v: string) => {
    setQuery(v)
    setOpen(true)
  }

  const handleClose = () => {
    clearResults()
    setOpen(false)
    inputRef.current?.blur()
  }

  // Click-outside to close
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        clearResults()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open, clearResults])

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md border border-[#ff6b00]/30 focus-within:border-[#ff6b00]/70 focus-within:shadow-[0_0_12px_rgba(255,107,0,0.2)] px-3 py-2 transition-all">
        <MagnifyingGlass size={14} className="text-[#ff6b00]/60 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Search for a track"
          aria-expanded={open && (results.length > 0 || loading)}
          aria-controls="track-search-listbox"
          aria-autocomplete="list"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (results.length) setOpen(true) }}
          onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }}
          placeholder="Search for a track..."
          className="flex-1 bg-transparent text-white text-sm placeholder-white/50 outline-none"
        />
        {query && (
          <button type="button" onClick={handleClose} aria-label="Clear search" className="text-white/30 hover:text-white/60 transition-colors">
            <X size={12} />
          </button>
        )}
      </div>
      {open && (
        <AutocompleteList
          results={results}
          loading={loading}
          error={error}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
