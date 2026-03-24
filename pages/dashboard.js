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

  useEffect(() => {
    if (!loading && !user) { router.push('/auth'); return }
    if (user) fetchSearches()
  }, [user, loading])

  const fetchSearches = async () => {
    const { data, error } = await supabase
      .from('searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setSearches(data || [])
    setFetching(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const deleteSearch = async (id) => {
    await supabase.from('searches').delete().eq('id', id)
    setSearches(prev => prev.filter(s => s.id !== id))
  }

  const filtered = tab === 'all' ? searches : searches.filter(s => s.type === tab)

  if (loading || fetching) return (
    <div>
      <Nav />
      <div className={styles.loadingWrap}>
        <div className="spinner"></div>
      </div>
    </div>
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
              Set up 2FA
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
            <div className={styles.statLabel}>Total searches</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className="btn-primary" style={{flex: 1}} onClick={() => router.push('/shortlist')}>
            New shortlist →
          </button>
          <button className="btn-ghost" style={{flex: 1}} onClick={() => router.push('/review')}>
            Review a car
          </button>
        </div>

        <div className={styles.tabs}>
          {['all', 'shortlist', 'review'].map(t => (
            <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : t === 'shortlist' ? 'Shortlists' : 'Reviews'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>No {tab === 'all' ? 'searches' : tab + 's'} yet.</p>
            <button className="btn-primary" style={{marginTop: '1rem'}} onClick={() => router.push(tab === 'review' ? '/review' : '/shortlist')}>
              {tab === 'review' ? 'Review a car →' : 'Build a shortlist →'}
            </button>
          </div>
        ) : (
          <div className={styles.searchList}>
            {filtered.map(s => {
              const input = JSON.parse(s.input || '{}')
              const result = JSON.parse(s.result || '{}')
              const date = new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

              return (
                <div key={s.id} className={styles.searchCard}>
                  <div className={styles.searchTop}>
                    <div>
                      <div className={styles.searchType}>{s.type === 'shortlist' ? 'Shortlist' : 'Review'}</div>
                      <div className={styles.searchTitle}>
                        {s.type === 'review'
                          ? `${input.year || ''} ${input.make || ''} ${input.model || ''}`.trim() || 'Car review'
                          : `Up to £${parseInt(input.budget || 0).toLocaleString()} · ${input.size || 5} cars`
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

                  {s.type === 'shortlist' && Array.isArray(result) && (
                    <div className={styles.shortlistPreview}>
                      {result.slice(0, 3).map((car, i) => (
                        <span key={i} className={styles.carPill}>{car.make} {car.model}</span>
                      ))}
                      {result.length > 3 && <span className={styles.morePill}>+{result.length - 3} more</span>}
                    </div>
                  )}

                  <button className={styles.viewBtn} onClick={() => {
                    if (s.type === 'review') {
                      const params = new URLSearchParams({ make: input.make || '', model: input.model || '', year: input.year || '', price: input.price || '' })
                      router.push(`/review?${params}`)
                    } else {
                      router.push('/shortlist')
                    }
                  }}>
                    Run again →
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
