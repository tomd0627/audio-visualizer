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

  // Click-outside to close (mousedown for desktop, touchstart for mobile)
  useEffect(() => {
    if (!open) return
    const onOutside = (e: MouseEvent | TouchEvent) => {
      const target = e instanceof TouchEvent ? e.touches[0]?.target : e.target
      if (containerRef.current && !containerRef.current.contains(target as Node)) {
        clearResults()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside as EventListener)
    document.addEventListener('touchstart', onOutside as EventListener, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onOutside as EventListener)
      document.removeEventListener('touchstart', onOutside as EventListener)
    }
  }, [open, clearResults])

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="flex gap-2 rounded-xl bg-black/60 backdrop-blur-md border px-3 theme-search-box">
        <MagnifyingGlass size={14} className="flex-shrink-0 self-center theme-icon" />
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
          onFocus={(e) => {
            if (results.length) setOpen(true)
            // iOS Safari calculates cursor position before layout settles on initial focus;
            // deferring setSelectionRange to the next frame forces a re-measurement.
            const el = e.currentTarget
            requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length))
          }}
          onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }}
          placeholder="Search for a track..."
          className="flex-1 py-2 bg-transparent text-white text-base sm:text-sm leading-tight placeholder-white/50 outline-none appearance-none"
          style={{ caretColor: 'var(--theme-primary)' }}
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
