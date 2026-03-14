import { MusicNote } from '@phosphor-icons/react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useAppStore } from '../../store/useAppStore'

export function FileDropZone() {
  const { loadFile } = useAudioEngine()
  const currentTrack = useAppStore((s) => s.currentTrack)

  const onDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (file) void loadFile(file)
  }, [loadFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': [] },
    multiple: false,
    noClick: !!currentTrack,
  })

  if (currentTrack && !isDragActive) return null

  return (
    <div
      {...getRootProps()}
      className={`
        fixed inset-0 flex flex-col items-center justify-center cursor-pointer
        transition-all duration-200 z-20
        ${isDragActive
          ? 'bg-black/70 border-2 border-dashed border-[#ff6b00]'
          : currentTrack ? 'pointer-events-none' : 'bg-black/80'
        }
      `}
    >
      <input {...getInputProps()} aria-label="Upload audio file" />
      {!currentTrack && (
        <div className="text-center pointer-events-none select-none">
          <div className="mb-4 flex justify-center">
            <MusicNote size={56} weight="duotone" className="text-[#ff6b00]/60" />
          </div>
          <p className="text-[#ff6b00] text-2xl font-semibold mb-2">Drop an audio file</p>
          <p className="text-white/50 text-sm">or click to browse — MP3, WAV, FLAC, OGG</p>
          <p className="text-white/30 text-sm mt-4">or search for a track above</p>
        </div>
      )}
      {isDragActive && currentTrack && (
        <div className="text-center pointer-events-none select-none">
          <p className="text-[#ff6b00] text-xl font-semibold">Drop to load new track</p>
        </div>
      )}
    </div>
  )
}
