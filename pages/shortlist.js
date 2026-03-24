import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import { canUseShortlist, incrementShortlist, getRemainingShortlists } from '../lib/usage'
import styles from '../styles/Shortlist.module.css'

const USES = [
  { val: 'commuting', title: 'Daily commuting', sub: 'Motorway or city driving' },
  { val: 'family', title: 'Family car', sub: 'Kids, space, practicality' },
  { val: 'weekend', title: 'Weekend / fun', sub: 'Enjoyable to drive' },
  { val: 'firstcar', title: 'First car', sub: 'Easy, cheap to insure' },
]

const PRIORITIES = ['Reliability', 'Low running costs', 'Cheap insurance', 'Looks good', 'Boot space', 'Fuel economy', 'Performance', 'Comfort']

export default function Shortlist() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [budget, setBudget] = useState(8000)
  const [uses, setUses] = useState([])
  const [priorities, setPriorities] = useState([])
  const [postcode, setPostcode] = useState('')
  const [fuel, setFuel] = useState('')
  const [transmission, setTransmission] = useState('')
  const [size, setSize] = useState(5)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState(1)

  useEffect(() => { setRemaining(getRemainingShortlists()) }, [])

  const toggleUse = (val) => {
    setUses(prev => prev.includes(val) ? prev.filter(u => u !== val) : [...prev, val])
  }

  const togglePriority = (val) => {
    if (priorities.includes(val)) {
      setPriorities(prev => prev.filter(p => p !== val))
    } else if (priorities.length < 3) {
      setPriorities(prev => [...prev, val])
    }
  }

  const runShortlist = async () => {
    if (!canUseShortlist()) {
      router.push('/unlock')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'shortlist',
          data: { budget, uses, priorities, postcode, fuel, transmission, size }
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      incrementShortlist()
      setRemaining(getRemainingShortlists())
      setResults(data)
      setStep('results')
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reviewCar = (car) => {
    const params = new URLSearchParams({
      make: car.make,
      model: car.model,
      year: car.years.split('–')[0],
      price: car.price_midpoint
    })
    router.push(`/review?${params}`)
  }

  if (loading) return (
    <div>
      <Nav />
      <div className={styles.loadingWrap}>
        <div className="spinner"></div>
        <p>Finding your perfect cars...</p>
      </div>
    </div>
  )

  if (step === 'results' && results) return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.resultsHeader}>
          <p className="label">Your shortlist</p>
          <h2>Top {size} cars for you</h2>
          <p className={styles.resultsSub}>Budget up to £{budget.toLocaleString()} · {postcode ? postcode.toUpperCase() : 'UK wide'}</p>
        </div>
        {results.map(car => (
          <div key={car.rank} className={styles.carCard}>
            <div className={styles.carTop}>
              <div className={styles.carRank}>{car.rank}</div>
              <div className={styles.carInfo}>
                <div className={styles.carName}>{car.make} {car.model}</div>
                <div className={styles.carMeta}>{car.years} · Typical price {car.typical_price}</div>
              </div>
              <div className={styles.carScore}>{car.overall_score}</div>
            </div>
            <div className={styles.carReason}>{car.reason}</div>
            <div className={styles.carTags}>
              {car.tags_good?.map(t => <span key={t} className="chip chip-good">{t}</span>)}
              {car.tags_warn?.map(t => <span key={t} className="chip chip-warn">{t}</span>)}
            </div>
            <button className={styles.reviewBtn} onClick={() => reviewCar(car)}>
              Review this car →
            </button>
          </div>
        ))}
        {remaining <= 0 && (
          <div className={styles.usedUp}>
            <p>You've used your free shortlist.</p>
            <button className="btn-primary" onClick={() => router.push('/unlock')}>
              Unlock unlimited for £7.99 →
            </button>
          </div>
        )}
        <button className="btn-ghost" style={{marginTop: '1rem'}} onClick={() => { setStep(1); setResults(null) }}>
          ← New search
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.progress}>
          {[1,2,3,4,5].map(n => (
            <div key={n} className={`${styles.pStep} ${step === n ? styles.active : step > n ? styles.done : ''}`}>{n}</div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <p className="label">Step 1 of 5</p>
            <h2>What's your budget?</h2>
            <p className={styles.sub}>Drag to set your maximum spend on a used car.</p>
            <div className={styles.budgetDisplay}>£{budget.toLocaleString()}</div>
            <input type="range" min="1000" max="30000" step="500" value={budget}
              onChange={e => setBudget(parseInt(e.target.value))} className={styles.slider} />
            <div className={styles.sliderLabels}><span>£1,000</span><span>£30,000</span></div>
            <button className="btn-primary" onClick={() => setStep(2)}>Next →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="label">Step 2 of 5</p>
            <h2>How do you use your car?</h2>
            <p className={styles.sub}>Pick everything that applies.</p>
            <div className={styles.optGrid}>
              {USES.map(u => (
                <button key={u.val} className={`${styles.opt} ${uses.includes(u.val) ? styles.selected : ''}`}
                  onClick={() => toggleUse(u.val)}>
                  <div className={styles.optTitle}>{u.title}</div>
                  <div className={styles.optSub}>{u.sub}</div>
                </button>
              ))}
            </div>
            <div className={styles.nav}>
              <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(3)} disabled={uses.length === 0}>Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="label">Step 3 of 5</p>
            <h2>What matters most?</h2>
            <p className={styles.sub}>Pick up to 3 priorities.</p>
            <div className={styles.chips}>
              {PRIORITIES.map(p => (
                <button key={p} className={`${styles.chip} ${priorities.includes(p) ? styles.chipSelected : ''}`}
                  onClick={() => togglePriority(p)}>{p}</button>
              ))}
            </div>
            <div className={styles.nav}>
              <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(4)} disabled={priorities.length === 0}>Next →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="label">Step 4 of 5</p>
            <h2>A few more details</h2>
            <p className={styles.sub}>Optional but helps us narrow it down.</p>
            <div className="field">
              <label>Your postcode (first part only)</label>
              <input type="text" placeholder="e.g. TN30" value={postcode}
                onChange={e => setPostcode(e.target.value)} maxLength={5} />
            </div>
            <div className="row2">
              <div className="field">
                <label>Fuel preference</label>
                <select value={fuel} onChange={e => setFuel(e.target.value)}>
                  <option value="">No preference</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div className="field">
                <label>Transmission</label>
                <select value={transmission} onChange={e => setTransmission(e.target.value)}>
                  <option value="">No preference</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>
            </div>
            <div className={styles.nav}>
              <button className="btn-ghost" onClick={() => setStep(3)}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(5)}>Next →</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="label">Step 5 of 5</p>
            <h2>How many cars do you want?</h2>
            <p className={styles.sub}>We'll rank them best to worst for your situation.</p>
            <div className={styles.sizeOpts}>
              {[3, 5, 10].map(n => (
                <div key={n} className={`${styles.sizeOpt} ${size === n ? styles.sizeSelected : ''}`}
                  onClick={() => setSize(n)}>
                  <div className={styles.sizeNum}>{n}</div>
                  <div className={styles.sizeLabel}>{n === 3 ? 'Quick pick' : n === 5 ? 'Recommended' : 'Full list'}</div>
                </div>
              ))}
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.nav}>
              <button className="btn-ghost" onClick={() => setStep(4)}>← Back</button>
              <button className="btn-primary" onClick={runShortlist}>Build my shortlist →</button>
            </div>
            <p className={styles.searchesLeft}>
              {remaining > 0 ? `${remaining} free shortlist remaining` : 'No free shortlists left'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
