import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { visualizerEngine } from '../../visualizer/VisualizerEngine'

export function VisualizerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioStarted = useAppStore((s) => s.audioStarted)
  const currentTrack = useAppStore((s) => s.currentTrack)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    visualizerEngine.mount(canvas)
    return () => visualizerEngine.unmount()
  }, [])

  useEffect(() => {
    visualizerEngine.setActive(audioStarted || currentTrack !== null)
  }, [audioStarted, currentTrack])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Audio visualizer"
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, background: '#000' }}
    />
  )
}
