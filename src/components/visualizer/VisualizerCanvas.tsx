import { useEffect, useRef } from 'react'
import { visualizerEngine } from '../../visualizer/VisualizerEngine'

export function VisualizerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    visualizerEngine.mount(canvas)
    return () => visualizerEngine.unmount()
  }, [])

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
