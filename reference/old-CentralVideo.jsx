import { motion, useMotionTemplate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import './CentralVideo.css'

// Outer `.central-video` is fixed-positioned and stays put; inner motion div
// owns the scroll-driven transform.
export default function CentralVideo({ scale, x, y, opacity, shouldPlay }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (shouldPlay) {
      v.play().catch(() => {})
    } else {
      v.pause()
      v.currentTime = 0
    }
  }, [shouldPlay])

  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0) scale(${scale})`

  return (
    <motion.div className="central-video" style={{ opacity }}>
      <motion.div className="central-video__inner" style={{ transform }}>
        <video
          ref={videoRef}
          className="central-video__el"
          src="/bg.mp4"
          muted
          loop
          playsInline
          preload="auto"
        />
      </motion.div>
    </motion.div>
  )
}
