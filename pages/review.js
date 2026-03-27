import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import { useAuth } from '../lib/auth'
import { canUseReview, incrementReview, getRemaining } from '../lib/usage'
import { CAR_MAKES, CAR_MODELS, YEARS } from '../lib/carData'
import styles from '../styles/Review.module.css'

const LOADING_MSGS = [
  'Pulling market prices...',
  'Checking reliability records...',
  'Scanning for red flags...',
  'Calculating your offer price...',
  'Comparing alternatives...',
  'Building your verdict...'
]

export default function Review() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState('input')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')
  const [price, setPrice] = useState('')
  const [fuel, setFuel] = useState('')
  const [concerns, setConcerns] = useState('')
  const [makeSearch, setMakeSearch] = useState('')
  const [showMakeDropdown, setShowMakeDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState({ shortlists: 1, reviews: 5, unlimited: false })
  const [saved, setSaved] = useState(false)
  const [tracked, setTracked] = useState(false)
  const [openDrops, setOpenDrops] = useState({})
  const [checked, setChecked] = useState({})
  const loadingRef = useRef(null)
  const makeRef = useRef(null)

  useEffect(() => {
    if (user) getRemaining(user.id).then(setRemaining)
    const { make: qm, model: qmod, year: qy, price: qp } = router.query
    if (qm) { setMake(qm); setMakeSearch(qm) }
    if (qmod) setModel(qmod)
    if (qy) setYear(qy)
    if (qp) setPrice(qp)
  }, [user, router.query])

  useEffect(() => {
    if (loading) {
      let i = 0
      loadingRef.current = setInterval(() => {
        i = (i + 1) % LOADING_MSGS.length
        setLoadingMsg(LOADING_MSGS[i])
      }, 1600)
    } else {
      clearInterval(loadingRef.current)
    }
    return () => clearInterval(loadingRef.current)
  }, [loading])

  useEffect(() => {
    const handleClick = (e) => {
      if (makeRef.current && !makeRef.current.contains(e.target)) setShowMakeDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredMakes = CAR_MAKES.filter(m => m.toLowerCase().includes(makeSearch.toLowerCase()))
  const availableModels = make && CAR_MODELS[make] ? CAR_MODELS[make] : []

  const selectMake = (m) => {
    setMake(m)
    setMakeSearch(m)
    setModel('')
    setShowMakeDropdown(false)
  }

  const toggleDrop = (id) => setOpenDrops(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleCheck = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  const runReview = async () => {
    if (!user) { router.push('/auth?next=/review'); return }
    if (!make || !model) { setError('Please select the make and model.'); return }
    const can = await canUseReview(user.id)
    if (!can) { router.push('/unlock'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'review', data: { make, model, year, mileage, price, fuel, concerns } })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      await incrementReview(user.id)
      const rem = await getRemaining(user.id)
      setRemaining(rem)

      await fetch('/api/save-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type: 'review', input: { make, model, year, mileage, price, fuel }, result: data })
      })

      setResult(data)
      setStep('results')
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (n) => n >= 7.5 ? styles.good : n >= 5.5 ? styles.mid : styles.bad

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
          <p className={styles.loadingHint}>Powered by Claude AI</p>
        </div>
      </div>
    </div>
  )

  if (step === 'results' && result) {
    const askNum = parseInt(price) || 0
    const offerNum = result.suggested_offer || Math.round(askNum * 0.93 / 100) * 100
    const saving = askNum - offerNum
    const dep2 = result.depreciation_2yr || Math.round(askNum * 0.64 / 100) * 100
    const dep4 = result.depreciation_4yr || Math.round(askNum * 0.45 / 100) * 100
    const totalChecks = (result.checklist_specific?.length || 0) + 9
    const doneCount = Object.values(checked).filter(Boolean).length

    return (
      <div>
        <Nav />
        <div className={styles.wrap}>
          <div className={styles.carHeader}>
            <h2>{year} {make} {model} · {mileage ? parseInt(mileage).toLocaleString() + ' miles' : '—'}</h2>
            <div className={styles.asking}>Asking: <strong>£{askNum.toLocaleString()}</strong></div>
          </div>

          <div className={`${styles.verdict} ${styles[result.verdict]}`}>
            <div>
              <div className={styles.verdictLabel}>{result.verdict_label}</div>
              <div className={styles.verdictText}>{result.verdict_text}</div>
            </div>
            <div className={styles.verdictScore}>
              <div className={styles.bigScore}>{result.overall_score}</div>
              <div className={styles.outOf}>out of 10</div>
            </div>
          </div>

          <div className={styles.scoresGrid}>
            {[
              { label: 'Reliability', val: result.reliability_score },
              { label: 'Value for money', val: result.value_score },
              { label: 'Running costs', val: result.running_costs_score },
              { label: 'Insurance', val: result.insurance_score },
            ].map(s => (
              <div key={s.label} className={styles.sc}>
                <div className={`${styles.scNum} ${scoreColor(s.val)}`}>{s.val}</div>
                <div className={styles.scLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {askNum > 0 && (
            <div className={styles.offerBox}>
              <div>
                <div className={styles.offerLabel}>Suggested offer</div>
                <div className={styles.offerPrice}>£{offerNum.toLocaleString()}</div>
                <div className={styles.offerSaving}>Save £{saving.toLocaleString()} on asking price</div>
              </div>
              <div className={styles.offerTip}>{result.offer_reason}</div>
            </div>
          )}

          <div className={styles.trackRow}>
            <button className={`${styles.trackBtn} ${saved ? styles.trackOn : ''}`} onClick={() => setSaved(!saved)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
              {saved ? 'Saved' : 'Save this car'}
            </button>
            <button className={`${styles.trackBtn} ${tracked ? styles.trackOn : ''}`} onClick={() => setTracked(!tracked)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              {tracked ? 'Tracking' : 'Track price drops'}
            </button>
          </div>

          <div className={styles.flags}>
            {result.flags?.map((f, i) => <span key={i} className={`chip chip-${f.type}`}>{f.text}</span>)}
          </div>

          {[
            { id: 'mot', title: 'MOT history', badge: 'Check gov.uk', badgeType: 'good', content: (
              <p className={styles.dropNote}>Enter the reg on <a href="https://www.check-mot.service.gov.uk" target="_blank" rel="noreferrer" style={{color: 'var(--accent)'}}>gov.uk/check-mot-history</a> for the full official MOT record — free and shows every test, advisory and failure.</p>
            )},
            { id: 'ins', title: 'Insurance estimate', badge: `Group ${result.insurance_group_number}`, badgeType: 'good', content: (
              <div>
                <div className={styles.insGrid}>
                  {result.insurance_groups && Object.entries({'Age 17–21': result.insurance_groups['17_21'], 'Age 22–25': result.insurance_groups['22_25'], 'Age 26–35': result.insurance_groups['26_35'], 'Age 35+': result.insurance_groups['35_plus']}).map(([label, val]) => (
                    <div key={label} className={styles.insCard}><div className={styles.insLabel}>{label}</div><div className={styles.insVal}>{val}</div></div>
                  ))}
                </div>
                <p className={styles.dropNote}>Always get actual quotes from Compare the Market or Go Compare before committing.</p>
              </div>
            )},
            { id: 'tax', title: 'Road tax', badge: `£${result.road_tax_annual}/yr`, badgeType: 'good', content: (
              <div className={styles.taxRow}>
                <div className={styles.taxAmount}>£{result.road_tax_annual}</div>
                <div className={styles.taxPer}>per year · or £{result.road_tax_6month} for 6 months</div>
              </div>
            )},
            { id: 'owners', title: 'What owners say', badge: `${result.owner_rating} / 5`, badgeType: 'good', content: (
              <div>
                <div className={styles.ownerSummary}>
                  <div className={styles.ownerScore}>{result.owner_rating}</div>
                  <div className={styles.ownerMeta}>out of 5 · ~{result.owner_review_count} owner reviews</div>
                </div>
                {[{label:'Reliability',val:result.owner_reliability},{label:'Running costs',val:result.owner_running_costs},{label:'Comfort',val:result.owner_comfort},{label:'Practicality',val:result.owner_practicality}].map(b => (
                  <div key={b.label} className={styles.barRow}>
                    <div className={styles.barLabel}><span>{b.label}</span><span>{b.val}</span></div>
                    <div className={styles.barTrack}><div className={styles.barFill} style={{width:`${(b.val/5)*100}%`}}></div></div>
                  </div>
                ))}
                <div className={styles.reviewsDivider}></div>
                {result.owner_reviews?.map((r, i) => (
                  <div key={i} className={styles.reviewItem}>
                    <div className={styles.reviewTop}>
                      <span className={styles.reviewer}>{r.tenure}</span>
                      <div className={styles.stars}>{[1,2,3,4,5].map(s => <div key={s} className={`${styles.star} ${s <= r.stars ? styles.starOn : ''}`}></div>)}</div>
                    </div>
                    <div className={styles.reviewText}>{r.text}</div>
                  </div>
                ))}
              </div>
            )},
            { id: 'dep', title: 'Depreciation', badge: '~20%/yr', badgeType: 'warn', content: (
              <div>
                <div className={styles.depGrid}>
                  <div className={styles.depCard}><div className={styles.depYear}>Today</div><div className={styles.depVal}>£{askNum.toLocaleString()}</div></div>
                  <div className={styles.depCard}><div className={styles.depYear}>In 2 years</div><div className={styles.depVal}>~£{dep2.toLocaleString()}</div><div className={styles.depDrop}>-£{(askNum-dep2).toLocaleString()}</div></div>
                  <div className={styles.depCard}><div className={styles.depYear}>In 4 years</div><div className={styles.depVal}>~£{dep4.toLocaleString()}</div><div className={styles.depDrop}>-£{(askNum-dep4).toLocaleString()}</div></div>
                </div>
                <p className={styles.dropNote}>{result.depreciation_note}</p>
              </div>
            )},
            { id: 'check', title: 'Viewing checklist', badge: `${doneCount} of ${totalChecks} done`, badgeType: doneCount === totalChecks ? 'good' : 'neutral', content: (
              <div>
                <div className={styles.checkSectionTitle}>General checks</div>
                {[
                  {id:'g1',text:'Only view in daylight — never at night or in the rain',warn:'Common tactic to hide bodywork damage'},
                  {id:'g2',text:'Cold start the engine — listen for rattles or hesitation',warn:null},
                  {id:'g3',text:'Check all four tyres for tread and uneven wear',warn:null},
                  {id:'g4',text:'Look under the car for rust, oil leaks or damage',warn:null},
                  {id:'g5',text:'Check panel gaps are even — inconsistency suggests accident repair',warn:null},
                  {id:'g6',text:'Test all electrics — windows, mirrors, lights, AC',warn:null},
                  {id:'g7',text:'Ask for and inspect the service history stamps or receipts',warn:null},
                  {id:'g8',text:'Test brakes firmly at low speed — any pulling or grinding?',warn:null},
                  {id:'g9',text:'Check no warning lights on after the engine warms up',warn:null},
                ].map(item => (
                  <div key={item.id} className={`${styles.checkItem} ${checked[item.id] ? styles.checkDone : ''}`} onClick={() => toggleCheck(item.id)}>
                    <div className={`${styles.checkBox} ${checked[item.id] ? styles.checkBoxOn : ''}`}>
                      {checked[item.id] && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#000" strokeWidth="2"><path d="M2 6l3 3 5-5"/></svg>}
                    </div>
                    <div><div className={styles.checkText}>{item.text}</div>{item.warn && <div className={styles.checkWarn}>{item.warn}</div>}</div>
                  </div>
                ))}
                {result.checklist_specific?.length > 0 && (
                  <>
                    <div className={styles.checkSectionTitle} style={{marginTop:'0.75rem'}}>{make} {model} specific</div>
                    {result.checklist_specific.map((item, i) => {
                      const id = `s${i}`
                      return (
                        <div key={id} className={`${styles.checkItem} ${checked[id] ? styles.checkDone : ''}`} onClick={() => toggleCheck(id)}>
                          <div className={`${styles.checkBox} ${checked[id] ? styles.checkBoxOn : ''}`}>
                            {checked[id] && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#000" strokeWidth="2"><path d="M2 6l3 3 5-5"/></svg>}
                          </div>
                          <div><div className={styles.checkText}>{item.text}</div>{item.warn && <div className={styles.checkWarn}>{item.warn}</div>}</div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )},
          ].map(drop => (
            <div key={drop.id} className={styles.drop}>
              <div className={styles.dropHeader} onClick={() => toggleDrop(drop.id)}>
                <div className={styles.dropLeft}>
                  <span className={styles.dropTitle}>{drop.title}</span>
                  <span className={`${styles.badge} ${styles['badge-'+drop.badgeType]}`}>{drop.badge}</span>
                </div>
                <svg className={`${styles.arrow} ${openDrops[drop.id] ? styles.arrowOpen : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
              {openDrops[drop.id] && <div className={styles.dropBody}>{drop.content}</div>}
            </div>
          ))}

          <div className={styles.divider}></div>

          <p className={styles.altLabel}>Better alternatives at this price</p>
          {result.alternatives?.map((alt, i) => (
            <div key={i} className={styles.altCard}>
              <div><div className={styles.altName}>{alt.name}</div><div className={styles.altWhy}>{alt.why}</div></div>
              <div className={styles.altRight}>
                <div className={styles.altPrice}>{alt.price}</div>
                <button className={styles.altBtn} onClick={() => {
                  const parts = alt.name.split(' ')
                  router.push(`/review?make=${parts[0]}&model=${parts[1] || ''}&price=${alt.price.replace(/[^0-9]/g,'')}`)
                }}>Review →</button>
              </div>
            </div>
          ))}

          <p className={styles.searchesLeft}>
            {remaining.unlimited ? 'Unlimited reviews' : `${remaining.reviews} free reviews remaining`}
          </p>
          <button className="btn-ghost" style={{marginTop:'1rem'}} onClick={() => { setStep('input'); setResult(null); setSaved(false); setTracked(false); setChecked({}) }}>
            ← Review another car
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <h2>Review a car</h2>
        <p className={styles.sub}>Enter what you know — we'll tell you if it's worth it.</p>

        <div className="field" ref={makeRef} style={{position:'relative'}}>
          <label>Make</label>
          <input
            type="text"
            value={makeSearch}
            onChange={e => { setMakeSearch(e.target.value); setMake(''); setShowMakeDropdown(true) }}
            onFocus={() => setShowMakeDropdown(true)}
            placeholder="Search make e.g. Ford"
            autoComplete="off"
          />
          {showMakeDropdown && filteredMakes.length > 0 && (
            <div className={styles.dropdown}>
              {filteredMakes.slice(0,8).map(m => (
                <div key={m} className={styles.dropdownItem} onClick={() => selectMake(m)}>{m}</div>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <label>Model</label>
          {availableModels.length > 0 ? (
            <select value={model} onChange={e => setModel(e.target.value)}>
              <option value="">Select model</option>
              {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          ) : (
            <input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. Fiesta" />
          )}
        </div>

        <div className="row2">
          <div className="field">
            <label>Year</label>
            <select value={year} onChange={e => setYear(e.target.value)}>
              <option value="">Select year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Mileage</label>
            <input type="number" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="e.g. 45000" />
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label>Asking price (£)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 8500" />
          </div>
          <div className="field">
            <label>Fuel type</label>
            <select value={fuel} onChange={e => setFuel(e.target.value)}>
              <option value="">Not sure</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Anything you noticed? (optional)</label>
          <textarea value={concerns} onChange={e => setConcerns(e.target.value)} placeholder="e.g. Incomplete service history, scratch on bumper..." />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <button className="btn-primary" onClick={runReview}>Get my verdict →</button>
        <p className={styles.searchesLeft} style={{marginTop:'0.75rem'}}>
          {!user ? <span>Sign in to save your reviews — <a href="/auth" style={{color:'var(--accent)'}}>create free account</a></span>
            : remaining.unlimited ? 'Unlimited reviews'
            : remaining.reviews > 0 ? `${remaining.reviews} free reviews remaining`
            : <span>No free reviews left — <a href="/unlock" style={{color:'var(--accent)'}}>unlock for £7.99</a></span>
          }
        </p>
      </div>
    </div>
  )
}
