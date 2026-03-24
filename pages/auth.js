import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/auth'
import Nav from '../components/Nav'
import styles from '../styles/Auth.module.css'

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    if (mode === 'signup') {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Account created! Check your email to confirm before signing in.')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${mode === 'signin' ? styles.active : ''}`} onClick={() => { setMode('signin'); setError(''); setSuccess('') }}>Sign in</button>
            <button className={`${styles.tab} ${mode === 'signup' ? styles.active : ''}`} onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>Create account</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required />
            </div>
            {mode === 'signup' && (
              <div className="field">
                <label>Confirm password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" required />
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          {mode === 'signin' && (
            <p className={styles.hint}>
              Don't have an account? <button onClick={() => setMode('signup')} className={styles.link}>Create one free</button>
            </p>
          )}

          {mode === 'signup' && (
            <p className={styles.hint}>
              By creating an account you agree to our terms. Your searches and reviews will be saved to your account.
            </p>
          )}
        </div>

        <div className={styles.perks}>
          <div className={styles.perk}>
            <div className={styles.perkDot}></div>
            Your shortlists and reviews saved forever
          </div>
          <div className={styles.perk}>
            <div className={styles.perkDot}></div>
            Access from any device
          </div>
          <div className={styles.perk}>
            <div className={styles.perkDot}></div>
            Track price drops on saved cars
          </div>
        </div>
      </div>
    </div>
  )
}
