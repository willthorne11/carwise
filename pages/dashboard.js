import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'
import styles from '../styles/Dashboard.module.css'

export default function Dashboard() {
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const [searches, setSearches] = useState([])
  const [fetching, setFetching] = useState(true)
  const [tab, setTab] = useState('all')
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    if (!loading && !user) { router.push('/auth'); return }
    if (user) fetchSearches()
  }, [user, loading])

  const fetchSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) { setFetchError(error.message); setSearches([]) }
      else setSearches(data || [])
    } catch (e) {
      setFetchError(e.message)
      setSearches([])
    } finally {
      setFetching(false)
    }
  }

  const handleSignOut = async () => { await signOut(); router.push('/') }

  const deleteSearch = async (id) => {
    try {
      await supabase.from('searches').delete().eq('id', id)
      setSearches(prev => prev.filter(s => s.id !== id))
    } catch (e) { console.error('Delete error:', e) }
  }

  const filtered = tab === 'all' ? searches : searches.filter(s => s.type === tab)

  if (loading || fetching) return (
    <div><Nav /><div className={styles.loadingWrap}><p style={{color:'var(--muted)',fontSize:'14px'}}>Loading...</p></div></div>
  )

  return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div>
            <p className="label">Your account</p>
            <h2>{user?.email}</h2>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.mfaBtn} onClick={() => router.push('/mfa-setup')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              2FA
            </button>
            <button className={styles.signOutBtn} onClick={handleSignOut}>Sign out</button>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statNum}>{searches.filter(s => s.type === 'shortlist').length}</div>
            <div className={styles.statLabel}>Shortlists</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{searches.filter(s => s.type === 'review').length}</div>
            <div className={styles.statLabel}>Reviews</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{searches.length}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className="btn-primary" style={{flex:1}} onClick={() => router.push('/review')}>Review a car →</button>
          <button className="btn-ghost" style={{flex:1}} onClick={() => router.push('/shortlist')}>Build a shortlist</button>
        </div>

        {fetchError && (
          <div style={{background:'rgba(248,113,113,0.1)',border:'0.5px solid rgba(248,113,113,0.3)',color:'var(--danger)',padding:'0.75rem 1rem',borderRadius:'8px',marginBottom:'1rem',fontSize:'13px'}}>
            Could not load searches: {fetchError}
          </div>
        )}

        <div className={styles.tabs}>
          {['all','shortlist','review'].map(t => (
            <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : t === 'shortlist' ? 'Shortlists' : 'Reviews'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>{fetchError ? 'Could not load your searches.' : `No ${tab === 'all' ? 'searches' : tab + 's'} yet.`}</p>
            <button className="btn-primary" style={{marginTop:'1rem',maxWidth:'200px',margin:'1rem auto 0'}}
              onClick={() => router.push(tab === 'review' ? '/review' : '/shortlist')}>
              {tab === 'review' ? 'Review a car →' : 'Build a shortlist →'}
            </button>
          </div>
        ) : (
          <div className={styles.searchList}>
            {filtered.map(s => {
              let input = {}, result = {}
              try { input = typeof s.input === 'string' ? JSON.parse(s.input) : (s.input || {}) } catch (e) {}
              try { result = typeof s.result === 'string' ? JSON.parse(s.result) : (s.result || {}) } catch (e) {}

              const date = new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              const resultArr = Array.isArray(result) ? result : []

              return (
                <div key={s.id} className={styles.searchCard}>
                  <div className={styles.searchTop}>
                    <div>
                      <div className={styles.searchType}>{s.type === 'shortlist' ? 'Shortlist' : 'Review'}</div>
                      <div className={styles.searchTitle}>
                        {s.type === 'review'
                          ? `${input.year || ''} ${input.make || ''} ${input.model || ''}`.trim() || 'Car review'
                          : `£${parseInt(input.minBudget || 0).toLocaleString()}–£${parseInt(input.maxBudget || 0).toLocaleString()} · ${input.size || 5} cars`
                        }
                      </div>
                      <div className={styles.searchDate}>{date}</div>
                    </div>
                    <div className={styles.searchActions}>
                      {s.type === 'review' && result.overall_score && (
                        <div className={styles.score}>{result.overall_score}</div>
                      )}
                      <button className={styles.deleteBtn} onClick={() => deleteSearch(s.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>

                  {s.type === 'review' && result.verdict_label && (
                    <div className={`${styles.verdictPill} ${styles[result.verdict]}`}>
                      {result.verdict_label}
                    </div>
                  )}

                  {s.type === 'shortlist' && resultArr.length > 0 && (
                    <div className={styles.shortlistPreview}>
                      {resultArr.slice(0, 3).map((car, i) => (
                        <span key={i} className={styles.carPill}>{car.make} {car.model}</span>
                      ))}
                      {resultArr.length > 3 && <span className={styles.morePill}>+{resultArr.length - 3} more</span>}
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <button className={styles.viewBtn} onClick={() => router.push(`/results?id=${s.id}`)}>
                      View results →
                    </button>
                    <button className={styles.rerunBtn} onClick={() => router.push(s.type === 'review' ? `/review?make=${input.make || ''}&model=${input.model || ''}&year=${input.year || ''}` : '/shortlist')}>
                      Run again
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
