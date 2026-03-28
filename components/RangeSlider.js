import { useState, useRef, useCallback, useEffect } from 'react'
import styles from './RangeSlider.module.css'

const MIN = 1000
const MAX = 50000

function snap(val) {
  return Math.round(val / 500) * 500
}

function clamp(val, lo, hi) {
  return Math.max(lo, Math.min(hi, val))
}

function toPercent(val) {
  return ((val - MIN) / (MAX - MIN)) * 100
}

function fromPercent(pct) {
  return MIN + (pct / 100) * (MAX - MIN)
}

export default function RangeSlider({ value = [3000, 10000], onChange }) {
  const [minVal, setMinVal] = useState(value[0])
  const [maxVal, setMaxVal] = useState(value[1])
  const [dragging, setDragging] = useState(null)
  const trackRef = useRef(null)

  useEffect(() => {
    setMinVal(value[0])
    setMaxVal(value[1])
  }, [])

  const getValFromEvent = useCallback((e) => {
    const track = trackRef.current
    if (!track) return null
    const rect = track.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const pct = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)
    return snap(fromPercent(pct))
  }, [])

  const handleMouseDown = useCallback((handle) => (e) => {
    e.preventDefault()
    setDragging(handle)
  }, [])

  const handleMove = useCallback((e) => {
    if (!dragging) return
    const val = getValFromEvent(e)
    if (val === null) return

    if (dragging === 'min') {
      const newMin = clamp(val, MIN, maxVal - 500)
      setMinVal(newMin)
      onChange?.([newMin, maxVal])
    } else {
      const newMax = clamp(val, minVal + 500, MAX)
      setMaxVal(newMax)
      onChange?.([minVal, newMax])
    }
  }, [dragging, minVal, maxVal, getValFromEvent, onChange])

  const handleUp = useCallback(() => setDragging(null), [])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      window.addEventListener('touchmove', handleMove)
      window.addEventListener('touchend', handleUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [dragging, handleMove, handleUp])

  const minPct = toPercent(minVal)
  const maxPct = toPercent(maxVal)

  return (
    <div className={styles.wrap}>
      <div className={styles.display}>
        <div className={styles.displayVal}>
          <div className={styles.displayLabel}>Min</div>
          <div className={styles.displayNum}>£{minVal.toLocaleString()}</div>
        </div>
        <div className={styles.displayDash}>—</div>
        <div className={styles.displayVal}>
          <div className={styles.displayLabel}>Max</div>
          <div className={styles.displayNum}>£{maxVal.toLocaleString()}</div>
        </div>
      </div>

      <div className={styles.trackWrap} ref={trackRef}>
        <div className={styles.track} />
        <div
          className={styles.range}
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
        <div
          className={`${styles.thumb} ${dragging === 'min' ? styles.active : ''}`}
          style={{ left: `${minPct}%` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleMouseDown('min')}
        />
        <div
          className={`${styles.thumb} ${dragging === 'max' ? styles.active : ''}`}
          style={{ left: `${maxPct}%` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleMouseDown('max')}
        />
      </div>

      <div className={styles.bounds}>
        <span>£1,000</span>
        <span>£50,000</span>
      </div>
    </div>
  )
}
