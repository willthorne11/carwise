import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Nav from '../components/Nav'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import styles from '../styles/Results.module.css'

export default function Results() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading } = useAuth()
  const [search, setSearch] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [openDrops, setOpenDrops] = useState({})
  const [checked, setChecked] = useState({})

  useEffect(() => {
    if (!loading && !user) { router.push('/auth'); return }
    if (user && id) fetchSearch()
  }, [user, loading, id])

  const fetchSearch = async () => {
    const { data, error } = await supabase
      .from('searches')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) { router.push('/dashboard'); return }

    let input = {}, result = {}
    try { input = typeof data.input === 'string' ? JSON.parse(data.input) : (data.input || {}) } catch (e) {}
    try { result = typeof data.result === 'string' ? JSON.parse(data.result) : (data.result || {}) } catch (e) {}

    setSearch({ ...data, input, result })
    setFetching(false)
  }

  const toggleDrop = (id) => setOpenDrops(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleCheck = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  const scoreColor = (n) => n >= 7.5 ? styles.good : n >= 5.5 ? styles.mid : styles.bad

  if (fetching || loading) return (
    <div><Nav /><div className={styles.loadingWrap}><p style={{color:'var(--muted)',fontSize:'14px'}}>Loading...</p></div></div>
  )

  if (!search) return null

  const { input, result, type } = search

  // ─── SHORTLIST VIEW ───
  if (type === 'shortlist') {
    const results = Array.isArray(result) ? result : []
    const budget = input
    const buildATUrl = (car) => {
      const make = encodeURIComponent(car.make)
      const model = encodeURIComponent(car.model)
      return `https://www.autotrader.co.uk/car-search?make=${make}&model=${model}&price-from=${budget.minBudget || 0}&price-to=${budget.maxBudget || 50000}&radius=50&sort=relevance`
    }

    return (
      <div>
        <Nav />
        <div className={styles.wrap}>
          <button className={styles.back} onClick={() => router.push('/dashboard')}>← Back to account</button>
          <div className={styles.header}>
            <p className="label">Saved shortlist</p>
            <h2>Top {results.length} cars for you</h2>
            <p className={styles.sub}>
              Budget {budget.minBudget === 0 ? 'Any' : `£${parseInt(budget.minBudget || 0).toLocaleString()}`}–£{parseInt(budget.maxBudget || 0).toLocaleString()}
              {input.postcode ? ` · ${input.postcode.toUpperCase()}` : ' · UK wide'}
            </p>
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
              <div className={styles.carActions}>
                <button className={styles.reviewBtn} onClick={() => {
                  const params = new URLSearchParams({ make: car.make, model: car.model, year: car.years?.split('–')[0] || '', price: car.price_midpoint || '' })
                  router.push(`/review?${params}`)
                }}>Review this car →</button>
                <a href={buildATUrl(car)} target="_blank" rel="noreferrer" className={styles.atBtn}>Find on AutoTrader →</a>
              </div>
            </div>
          ))}

          <button className="btn-ghost" style={{marginTop:'1rem'}} onClick={() => router.push('/shortlist')}>
            Build a new shortlist →
          </button>
        </div>
      </div>
    )
  }

  // ─── REVIEW VIEW ───
  if (type === 'review') {
    const askNum = parseInt(input.price) || 0
    const offerNum = result.suggested_offer || Math.round(askNum * 0.93 / 100) * 100
    const saving = askNum - offerNum
    const dep2 = result.depreciation_2yr || Math.round(askNum * 0.64 / 100) * 100
    const dep4 = result.depreciation_4yr || Math.round(askNum * 0.45 / 100) * 100
    const totalChecks = (result.checklist_specific?.length || 0) + 9
    const doneCount = Object.values(checked).filter(Boolean).length

    const buildATUrl = () => {
      const make = encodeURIComponent(input.make || '')
      const model = encodeURIComponent(input.model || '')
      return `https://www.autotrader.co.uk/car-search?make=${make}&model=${model}&year-from=${parseInt(input.year)-1}&year-to=${parseInt(input.year)+1}&price-to=${askNum+1000}&radius=50`
    }

    return (
      <div>
        <Nav />
        <div className={styles.wrap}>
          <button className={styles.back} onClick={() => router.push('/dashboard')}>← Back to account</button>

          <div className={styles.carHeader}>
            <h2>{input.year} {input.make} {input.model} · {input.mileage ? parseInt(input.mileage).toLocaleString() + ' miles' : '—'}</h2>
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
            { id: 'mot', title: 'MOT history', badge: 'Check gov.uk', badgeType: 'neutral', content: (
              <p className={styles.dropNote}>Check on <a href="https://www.check-mot.service.gov.uk" target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>gov.uk/check-mot-history</a></p>
            )},
            { id: 'ins', title: 'Insurance estimate', badge: `Group ${result.insurance_group_number}`, badgeType: 'good', content: (
              <div>
                <div className={styles.insGrid}>
                  {result.insurance_groups && Object.entries({'Age 17–21': result.insurance_groups['17_21'], 'Age 22–25': result.insurance_groups['22_25'], 'Age 26–35': result.insurance_groups['26_35'], 'Age 35+': result.insurance_groups['35_plus']}).map(([label, val]) => (
                    <div key={label} className={styles.insCard}><div className={styles.insLabel}>{label}</div><div className={styles.insVal}>{val}</div></div>
                  ))}
                </div>
              </div>
            )},
            { id: 'tax', title: 'Road tax', badge: `£${result.road_tax_annual}/yr`, badgeType: 'good', content: (
              <div className={styles.taxRow}>
                <div className={styles.taxAmount}>£{result.road_tax_annual}</div>
                <div className={styles.taxPer}>per year · or £{result.road_tax_6month} for 6 months</div>
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
                {[
                  {id:'g1',text:'Only view in daylight — never at night or in the rain',warn:'Common tactic to hide bodywork damage'},
                  {id:'g2',text:'Cold start the engine — listen for rattles or hesitation',warn:null},
                  {id:'g3',text:'Check all four tyres for tread and uneven wear',warn:null},
                  {id:'g4',text:'Look under the car for rust, oil leaks or damage',warn:null},
                  {id:'g5',text:'Check panel gaps are even — inconsistency suggests accident repair',warn:null},
                  {id:'g6',text:'Test all electrics — windows, mirrors, lights, AC',warn:null},
                  {id:'g7',text:'Ask for and inspect service history stamps or receipts',warn:null},
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
                {result.checklist_specific?.map((item, i) => {
                  const cid = `s${i}`
                  return (
                    <div key={cid} className={`${styles.checkItem} ${checked[cid] ? styles.checkDone : ''}`} onClick={() => toggleCheck(cid)}>
                      <div className={`${styles.checkBox} ${checked[cid] ? styles.checkBoxOn : ''}`}>
                        {checked[cid] && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#000" strokeWidth="2"><path d="M2 6l3 3 5-5"/></svg>}
                      </div>
                      <div><div className={styles.checkText}>{item.text}</div>{item.warn && <div className={styles.checkWarn}>{item.warn}</div>}</div>
                    </div>
                  )
                })}
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
                  router.push(`/review?make=${parts[0]}&model=${parts.slice(1).join(' ')}&price=${alt.price.replace(/[^0-9]/g,'')}`)
                }}>Review →</button>
              </div>
            </div>
          ))}

          <button className="btn-ghost" style={{marginTop:'1.5rem'}} onClick={() => router.push('/dashboard')}>← Back to account</button>
        </div>
      </div>
    )
  }

  return null
}
