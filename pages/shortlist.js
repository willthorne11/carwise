import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import RangeSlider from '../components/RangeSlider'
import { useAuth } from '../lib/auth'
import styles from '../styles/Shortlist.module.css'

const USES = [
  { val: 'commuting', title: 'Daily commuting', sub: 'Motorway or city driving' },
  { val: 'family', title: 'Family car', sub: 'Kids, space, practicality' },
  { val: 'weekend', title: 'Weekend / fun', sub: 'Enjoyable to drive' },
  { val: 'firstcar', title: 'First car', sub: 'Easy, cheap to insure' },
  { val: 'custom', title: 'Other...', sub: 'Type your own' },
]

const PRIORITIES = ['Reliability', 'Low running costs', 'Cheap insurance', 'Looks good', 'Boot space', 'Fuel economy', 'Performance', 'Comfort']

const LOADING_MSGS = [
  'Scanning the used car market...',
  'Checking reliability records...',
  'Analysing pricing data...',
  'Matching cars to your priorities...',
  'Ranking your best options...',
  'Almost there...'
]

const SESSION_KEY = 'cw_shortlist_results'
const SESSION_INPUT_KEY = 'cw_shortlist_input'

export default function Shortlist() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [budget, setBudget] = useState([0, 10000])
  const [uses, setUses] = useState([])
  const [customUse, setCustomUse] = useState('')
  const [priorities, setPriorities] = useState([])
  const [customPriority, setCustomPriority] = useState('')
  const [postcode, setPostcode] = useState('')
  const [fuel, setFuel] = useState('')
  const [customFuel, setCustomFuel] = useState('')
  const [transmission, setTransmission] = useState('')
  const [size, setSize] = useState(5)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0])
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [showSignupNudge, setShowSignupNudge] = useState(false)
  const [savedToAccount, setSavedToAccount] = useState(false)
  const loadingRef = useRef(null)

  // Restore results if returning from sign in
  useEffect(() => {
    const savedResults = sessionStorage.getItem(SESSION_KEY)
    const savedInput = sessionStorage.getItem(SESSION_INPUT_KEY)
    if (savedResults && savedInput) {
      try {
        const parsedResults = JSON.parse(savedResults)
        const parsedInput = JSON.parse(savedInput)
        setResults(parsedResults)
        setBudget([parsedInput.minBudget || 0, parsedInput.maxBudget || 10000])
        setPostcode(parsedInput.postcode || '')
        setSize(parsedInput.size || 5)
        setStep('results')
        if (user) {
          saveToAccount(user.id, parsedInput, parsedResults)
          sessionStorage.removeItem(SESSION_KEY)
          sessionStorage.removeItem(SESSION_INPUT_KEY)
          setSavedToAccount(true)
        } else {
          setTimeout(() => setShowSignupNudge(true), 2000)
        }
      } catch (e) {
        sessionStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(SESSION_INPUT_KEY)
      }
    }
  }, [user])

  useEffect(() => {
    if (loading) {
      let i = 0
      loadingRef.current = setInterval(() => {
        i = (i + 1) % LOADING_MSGS.length
        setLoadingMsg(LOADING_MSGS[i])
      }, 1800)
    } else {
      clearInterval(loadingRef.current)
    }
    return () => clearInterval(loadingRef.current)
  }, [loading])

  const saveToAccount = async (userId, input, data) => {
    try {
      await fetch('/api/save-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'shortlist', input, result: data })
      })
    } catch (e) { console.error('Save failed', e) }
  }

  const toggleUse = (val) => {
    if (val === 'custom') {
      setUses(prev => prev.includes('custom') ? prev.filter(u => u !== 'custom') : [...prev, 'custom'])
      return
    }
    setUses(prev => prev.includes(val) ? prev.filter(u => u !== val) : [...prev, val])
  }

  const togglePriority = (val) => {
    if (priorities.includes(val)) {
      setPriorities(prev => prev.filter(p => p !== val))
    } else if (priorities.length < 3) {
      setPriorities(prev => [...prev, val])
    }
  }

  const getFinalUses = () => {
    const list = uses.filter(u => u !== 'custom')
    if (uses.includes('custom') && customUse.trim()) list.push(customUse.trim())
    return list
  }

  const getFinalPriorities = () => {
    const list = [...priorities]
    if (customPriority.trim() && list.length < 3) list.push(customPriority.trim())
    return list
  }

  const getFinalFuel = () => {
    if (fuel === 'custom') return customFuel.trim() || 'no preference'
    return fuel || 'no preference'
  }

  const runShortlist = async () => {
    setLoading(true)
    setError('')

    const finalUses = getFinalUses()
    const finalPriorities = getFinalPriorities()
    const finalFuel = getFinalFuel()

    const input = {
      minBudget: budget[0],
      maxBudget: budget[1],
      uses: finalUses,
      priorities: finalPriorities,
      postcode,
      fuel: finalFuel,
      transmission,
      size
    }

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'shortlist', data: input })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
      sessionStorage.setItem(SESSION_INPUT_KEY, JSON.stringify(input))

      if (user) {
        await saveToAccount(user.id, input, data)
        setSavedToAccount(true)
        sessionStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(SESSION_INPUT_KEY)
      }

      setResults(data)
      setStep('results')

      if (!user) setTimeout(() => setShowSignupNudge(true), 3000)
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const buildAutoTraderUrl = (car) => {
    const make = encodeURIComponent(car.make)
    const model = encodeURIComponent(car.model)
    const pc = postcode || ''
    return `https://www.autotrader.co.uk/car-search?make=${make}&model=${model}&price-from=${budget[0]}&price-to=${budget[1]}&postcode=${pc}&radius=50&sort=relevance`
  }

  if (loading) return (
    <div>
      <Nav />
      <div className={styles.loadingWrap}>
        <div className={styles.loadingInner}>
          <div className={styles.spinnerWrap}>
            <svg className={styles.spinner} viewBox="0 0 50 50">
              <circle className={styles.spinnerTrack} cx="25" cy="25" r="20" fill="none" strokeWidth="4"/>
              <circle className={styles.spinnerArc} cx="25" cy="25" r="20" fill="none" strokeWidth="4"/>
            </svg>
          </div>
          <p className={styles.loadingMsg}>{loadingMsg}</p>
        </div>
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
          <p className={styles.resultsSub}>Budget {budget[0] === 0 ? 'Any' : `£${budget[0].toLocaleString()}`}–£{budget[1].toLocaleString()} · {postcode ? postcode.toUpperCase() : 'UK wide'}</p>
        </div>

        {savedToAccount && (
          <div className={styles.savedBanner}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            Shortlist saved to your account
          </div>
        )}

        {showSignupNudge && !user && (
          <div className={styles.signupNudge}>
            <div className={styles.nudgeText}>
              <strong>Save your shortlist</strong>
              <span>Sign in to save these results to your account.</span>
            </div>
            <button className={styles.nudgeBtn} onClick={() => router.push('/auth?next=/shortlist')}>Save →</button>
            <button className={styles.nudgeDismiss} onClick={() => setShowSignupNudge(false)}>✕</button>
          </div>
        )}

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
            <div className={styles.carActions}>
              <button className={styles.reviewBtn} onClick={() => {
                const params = new URLSearchParams({ make: car.make, model: car.model, year: car.years?.split('–')[0] || '', price: car.price_midpoint || '' })
                router.push(`/review?${params}`)
              }}>Review this car →</button>
              <a href={buildAutoTraderUrl(car)} target="_blank" rel="noreferrer" className={styles.atBtn}>Find on AutoTrader →</a>
            </div>
          </div>
        ))}

        <button className="btn-ghost" style={{marginTop:'1rem'}} onClick={() => {
          setStep(1); setResults(null); setShowSignupNudge(false); setSavedToAccount(false)
          sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_INPUT_KEY)
        }}>← New search</button>
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
            <p className={styles.sub}>Drag both handles to set your min and max spend.</p>
            <RangeSlider min={0} max={50000} step={500} value={budget} onChange={setBudget} />
            <button className="btn-primary" onClick={() => setStep(2)} style={{marginTop:'0.5rem'}}>Next →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="label">Step 2 of 5</p>
            <h2>How do you use your car?</h2>
            <p className={styles.sub}>Pick everything that applies.</p>
            <div className={styles.optGrid}>
              {USES.map(u => (
                <button key={u.val} className={`${styles.opt} ${uses.includes(u.val) ? styles.selected : ''}`} onClick={() => toggleUse(u.val)}>
                  <div className={styles.optTitle}>{u.title}</div>
                  <div className={styles.optSub}>{u.sub}</div>
                </button>
              ))}
            </div>
            {uses.includes('custom') && (
              <div className="field">
                <input type="text" value={customUse} onChange={e => setCustomUse(e.target.value)} placeholder="Describe how you use your car..." />
              </div>
            )}
            <div className={styles.nav}>
              <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(3)} disabled={getFinalUses().length === 0}>Next →</button>
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
                <button key={p} className={`${styles.chip} ${priorities.includes(p) ? styles.chipSelected : ''}`} onClick={() => togglePriority(p)}>{p}</button>
              ))}
            </div>
            <div className="field" style={{marginTop:'0.5rem'}}>
              <input type="text" value={customPriority} onChange={e => setCustomPriority(e.target.value)} placeholder="Add your own priority (optional)..." disabled={priorities.length >= 3} />
            </div>
            <div className={styles.nav}>
              <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(4)} disabled={getFinalPriorities().length === 0}>Next →</button>
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
              <input type="text" placeholder="e.g. TN30" value={postcode} onChange={e => setPostcode(e.target.value)} maxLength={5} />
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
                  <option value="custom">Other...</option>
                </select>
                {fuel === 'custom' && (
                  <input type="text" value={customFuel} onChange={e => setCustomFuel(e.target.value)} placeholder="e.g. Mild hybrid, LPG..." style={{marginTop:'6px'}} />
                )}
              </div>
              <div className="field">
                <label>Transmission</label>
                <select value={transmission} onChange={e => setTransmission(e.target.value)}>
                  <option value="">No preference</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="semi-automatic">Semi-automatic</option>
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
                <div key={n} className={`${styles.sizeOpt} ${size === n ? styles.sizeSelected : ''}`} onClick={() => setSize(n)}>
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
          </div>
        )}
      </div>
    </div>
  )
}
