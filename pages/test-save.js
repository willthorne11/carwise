import { useState } from 'react'
import { useAuth } from '../lib/auth'
import Nav from '../components/Nav'

export default function TestSave() {
  const { user } = useAuth()
  const [log, setLog] = useState([])
  const [running, setRunning] = useState(false)

  const add = (msg, ok = true) => setLog(prev => [...prev, { msg, ok, time: new Date().toLocaleTimeString() }])

  const runTest = async () => {
    setLog([])
    setRunning(true)

    if (!user) { add('Not signed in — sign in first', false); setRunning(false); return }
    add(`Signed in as ${user.email}`)
    add(`User ID: ${user.id}`)

    try {
      const res = await fetch('/api/save-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'shortlist',
          input: { minBudget: 3000, maxBudget: 8000 },
          result: [{ rank: 1, make: 'Ford', model: 'Fiesta', test: true }]
        })
      })

      add(`API responded with status: ${res.status}`, res.ok)
      const data = await res.json()
      add(`Response: ${JSON.stringify(data)}`, !data.error)

      if (data.success) {
        add(`✓ Saved successfully with ID: ${data.id}`)
        add('Now check your dashboard — you should see a new shortlist there')
      } else {
        add(`✗ Save failed: ${data.error}`, false)
        if (data.code) add(`Error code: ${data.code}`, false)
        if (data.details) add(`Details: ${data.details}`, false)
      }
    } catch (e) {
      add(`Fetch error: ${e.message}`, false)
    }

    setRunning(false)
  }

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: '560px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard save test</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '1.5rem' }}>This tests whether shortlists save to your dashboard correctly.</p>

        {!user && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '0.5px solid rgba(248,113,113,0.3)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
            You need to sign in first — <a href="/auth" style={{ color: 'var(--accent)' }}>sign in here</a>
          </div>
        )}

        <button className="btn-primary" onClick={runTest} disabled={running || !user}>
          {running ? 'Testing...' : 'Run save test →'}
        </button>

        {log.length > 0 && (
          <div style={{ marginTop: '1.5rem', background: 'var(--surface)', border: '0.5px solid var(--border2)', borderRadius: '8px', overflow: 'hidden' }}>
            {log.map((entry, i) => (
              <div key={i} style={{ padding: '0.65rem 1rem', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12px', color: entry.ok ? 'var(--success)' : 'var(--danger)', flexShrink: 0, marginTop: '1px' }}>{entry.ok ? '✓' : '✗'}</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)', wordBreak: 'break-all' }}>{entry.msg}</span>
              </div>
            ))}
          </div>
        )}

        {log.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <a href="/dashboard" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
              Check dashboard →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
