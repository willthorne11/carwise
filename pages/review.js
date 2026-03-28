import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import CarSearch from '../components/CarSearch'
import { useAuth } from '../lib/auth'
import { canUseReview, incrementReview, getRemaining } from '../lib/usage'
import styles from '../styles/Review.module.css'

const LOADING_MSGS = [
  'Pulling market prices...',
  'Checking reliability records...',
  'Scanning for red flags...',
  'Calculating your offer price...',
  'Comparing alternatives...',
  'Building your verdict...'
]

const YEARS = Array.from({length: 26}, (_, i) => (2025 - i).toString())

export default function Review() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedCar, setSelectedCar] = useState(null)
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')
  const [price, setPrice] = useState('')
  const [fuel, setFuel] = useState('')
  const [concerns, setConcerns] = useState('')
  const [step, setStep] = useState('input')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [tracked, setTracked] = useState(false)
  const [openDrops, setOpenDrops] = useState({})
  const [checked, setChecked] = useState({})
  const loadingRef = useRef(null)

  useEffect(() => {
    const { make, model, year: qy, price: qp } = router.query
    if (make && model) setSelectedCar({ make, model, full: `${make} ${model}` })
    if (qy) setYear(qy)
    if (qp) setPrice(qp)
  }, [router.query])

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

  const toggleDrop = (id) => setOpenDrops(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleCheck = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  const runReview = async () => {
    if (!user) { router.push('/auth?next=/review'); return }
    if (!selectedCar) { setError('Please search for and select a car first.'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'review',
          data: { make: selectedCar.make, model: selectedCar.model, year, mileage, price, fuel, concerns }
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      await fetch('/api/save-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'review',
          input: { make: selectedCar.make, model: selectedCar.model, year, mileage, price, fuel },
          result: data
        })
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

    const buildATUrl = () => {
      const make = encodeURIComponent(selectedCar.make)
      const model = encodeURIComponent(selectedCar.model)
      return `https://www.autotrader.co.uk/car-search?make=${make}&model=${model}&year-from=${parseInt(year) - 1}&year-to=${parseInt(year) + 1}&price-to=${askNum + 1000}&radius=50`
    }

    return (
      <div>
        <Nav />
        <div className={styles.wrap}>
          <div className={styles.carHeader}>
            <h2>{year} {selectedCar?.full} · {mileage ? parseInt(mileage).toLocaleString() + ' miles' : '—'}</h2>
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

          {askNum > 0 && (
            <a href={buildATUrl()} target="_blank" rel="noreferrer" className={styles.atLink}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
              Search for this car on AutoTrader
            </a>
          )}

          {[
            { id: 'mot', title: 'MOT history', badge: 'Check gov.uk', badgeType: 'good', content: (
              <p className={styles.dropNote}>Enter the reg on <a href="https://www.check-mot.service.gov.uk" target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>gov.uk/check-mot-history</a> — free and shows every test, advisory and failure.</p>
            )},
            { id: 'ins', title: 'Insurance estimate', badge: `Group ${result.insurance_group_number}`, badgeType: 'good', content: (
              <div>
                <div className={styles.insGrid}>
                  {result.insurance_groups && Object.entries({'Age 17–21': result.insurance_groups['17_21'], 'Age 22–25': result.insurance_groups['22_25'], 'Age 26–35': result.insurance_groups['26_35'], 'Age 35+': result.insurance_groups['35_plus']}).map(([label, val]) => (
                    <div key={label} className={styles.insCard}><div className={styles.insLabel}>{label}</div><div className={styles.insVal}>{val}</div></div>
                  ))}
                </div>
                <p className={styles.dropNote}>Always get actual quotes from Compare the Market or Go Compare.</p>
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
                    <div className={styles.checkSectionTitle} style={{marginTop:'0.75rem'}}>{selectedCar?.full} specific</div>
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
                  <span className={`${styles.badge} ${styles['badge-' + drop.badgeType]}`}>{drop.badge}</span>
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
                  router.push(`/review?make=${parts[0]}&model=${parts.slice(1).join(' ')}&price=${alt.price.replace(/[^0-9]/g,'')}`)
                }}>Review →</button>
              </div>
            </div>
          ))}

          <button className="btn-ghost" style={{marginTop:'1.5rem'}} onClick={() => { setStep('input'); setResult(null); setSaved(false); setTracked(false); setChecked({}) }}>
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
        <p className={styles.sub}>Search for the car you're considering — we'll tell you if it's worth it.</p>

        <div className="field">
          <label>Search for a car</label>
          <CarSearch
            onSelect={setSelectedCar}
            selected={selectedCar?.full}
          />
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
        <button className="btn-primary" onClick={runReview} disabled={!selectedCar}>
          Get my verdict →
        </button>
        {!selectedCar && <p style={{fontSize:'12px',color:'var(--muted)',textAlign:'center',marginTop:'0.5rem'}}>Select a car above to continue</p>}
      </div>
    </div>
  )
}
