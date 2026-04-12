import { useState } from 'react'
import { useAuth } from '../lib/auth'
import Nav from '../components/Nav'

export default function TestSave() {
  const { user } = useAuth()
  const [log, setLog] = useState([])
  const [running, setRunning] = useState(false)

  const add = (msg, ok = true) => setLog(prev => [...prev, { msg, ok }])

  const run = async () => {
    setLog([])
    setRunning(true)
    if (!user) { add('Not signed in', false); setRunning(false); return }
    add(`Signed in as ${user.email}`)
    add(`User ID: ${user.id}`)
    try {
      const res = await fetch('/api/save-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type: 'shortlist', input: { test: true }, result: [{ rank: 1, make: 'Ford', model: 'Fiesta' }] })
      })
      add(`Status: ${res.status}`, res.ok)
      const data = await res.json()
      add(`Response: ${JSON.stringify(data)}`, !data.error)
      if (data.success) add('SUCCESS — check your dashboard now')
      else add(`FAILED: ${data.error}`, false)
    } catch (e) {
      add(`Error: ${e.message}`, false)
    }
    setRunning(false)
  }

  return (
    <div>
      <Nav />
      <div style={{maxWidth:'560px',margin:'2rem auto',padding:'0 1.5rem'}}>
        <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'20px',fontWeight:700,marginBottom:'1rem'}}>Save test</h2>
        {!user && <p style={{color:'var(--danger)',fontSize:'14px',marginBottom:'1rem'}}>Sign in first — <a href="/auth" style={{color:'var(--accent)'}}>sign in here</a></p>}
        <button className="btn-primary" onClick={run} disabled={running || !user}>{running ? 'Testing...' : 'Run test →'}</button>
        {log.length > 0 && (
          <div style={{marginTop:'1.5rem',background:'var(--surface)',border:'0.5px solid var(--border2)',borderRadius:'8px',overflow:'hidden'}}>
            {log.map((e, i) => (
              <div key={i} style={{padding:'0.65rem 1rem',borderBottom:'0.5px solid var(--border)',display:'flex',gap:'10px',fontSize:'13px'}}>
                <span style={{color:e.ok?'var(--success)':'var(--danger)',flexShrink:0}}>{e.ok?'✓':'✗'}</span>
                <span style={{color:'var(--muted)',wordBreak:'break-all'}}>{e.msg}</span>
              </div>
            ))}
          </div>
        )}
        {log.some(e => e.msg.includes('SUCCESS')) && (
          <a href="/dashboard" className="btn-primary" style={{display:'block',textAlign:'center',marginTop:'1rem'}}>Check dashboard →</a>
        )}
      </div>
    </div>
  )
}
