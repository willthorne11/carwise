import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './RangeSlider.module.css'

export default function RangeSlider({ min = 1000, max = 50000, step = 500, value, onChange }) {
  const [minVal, setMinVal] = useState(value?.[0] ?? min)
  const [maxVal, setMaxVal] = useState(value?.[1] ?? max)
  const minRef = useRef(minVal)
  const maxRef = useRef(maxVal)
  const rangeRef = useRef(null)

  const getPercent = useCallback(val => Math.round(((val - min) / (max - min)) * 100), [min, max])

  useEffect(() => {
    if (rangeRef.current) {
      const minPercent = getPercent(minVal)
      const maxPercent = getPercent(maxRef.current)
      rangeRef.current.style.left = `${minPercent}%`
      rangeRef.current.style.width = `${maxPercent - minPercent}%`
    }
  }, [minVal, getPercent])

  useEffect(() => {
    if (rangeRef.current) {
      const minPercent = getPercent(minRef.current)
      const maxPercent = getPercent(maxVal)
      rangeRef.current.style.left = `${minPercent}%`
      rangeRef.current.style.width = `${maxPercent - minPercent}%`
    }
  }, [maxVal, getPercent])

  return (
    <div className={styles.container}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={e => {
          const val = Math.min(Number(e.target.value), maxVal - step)
          setMinVal(val)
          minRef.current = val
          onChange?.([val, maxVal])
        }}
        className={`${styles.thumb} ${styles.thumbLeft}`}
        style={{zIndex: minVal > max - 100 ? 5 : 3}}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={e => {
          const val = Math.max(Number(e.target.value), minVal + step)
          setMaxVal(val)
          maxRef.current = val
          onChange?.([minVal, val])
        }}
        className={`${styles.thumb} ${styles.thumbRight}`}
      />
      <div className={styles.slider}>
        <div className={styles.track}></div>
        <div ref={rangeRef} className={styles.range}></div>
        <div className={styles.labels}>
          <span>£{minVal.toLocaleString()}</span>
          <span>£{maxVal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
