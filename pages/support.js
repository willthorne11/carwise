import { useState } from 'react'
import Nav from '../components/Nav'
import styles from '../styles/Support.module.css'

export default function Support() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !message) { setError('Please fill in all required fields.'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSent(true)
    } catch (e) {
      setError('Something went wrong. Please email us directly at help@carwise.site')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2>Message sent</h2>
          <p>We'll get back to you at <strong>{email}</strong> as soon as possible — usually within a few hours.</p>
          <a href="/" className="btn-primary" style={{display:'block',textAlign:'center',marginTop:'1.5rem'}}>Back to Carwise</a>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.header}>
          <p className="label">Support</p>
          <h2>Get in touch</h2>
          <p className={styles.sub}>Got a question or something not working? Fill in the form and we'll get back to you.</p>
        </div>

        <div className={styles.card}>
          <form onSubmit={handleSubmit}>
            <div className="row2">
              <div className="field">
                <label>Your name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Smith" />
              </div>
              <div className="field">
                <label>Email address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>

            <div className="field">
              <label>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="">Select a topic</option>
                <option value="review-issue">Issue with a review</option>
                <option value="shortlist-issue">Issue with a shortlist</option>
                <option value="payment">Payment or billing</option>
                <option value="account">Account issue</option>
                <option value="feedback">General feedback</option>
                <option value="other">Something else</option>
              </select>
            </div>

            <div className="field">
              <label>Message *</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell us what's going on and we'll sort it..."
                style={{minHeight: '140px'}}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send message →'}
            </button>
          </form>
        </div>

        <div className={styles.directEmail}>
          Or email us directly at <a href="mailto:help@carwise.site">help@carwise.site</a>
        </div>
      </div>
    </div>
  )
}
