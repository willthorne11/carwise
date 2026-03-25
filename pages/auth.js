import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/auth'
import Nav from '../components/Nav'
import styles from '../styles/Auth.module.css'

export default function AuthPage() {
  const router = useRouter()
  const { user, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // If already signed in, redirect
  useEffect(() => {
    if (user) {
      const next = router.query.next || '/dashboard'
      router.push(next)
    }
  }, [user])

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
        setSuccess('Account created! Check your email to confirm, then sign in.')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        const next = router.query.next || '/dashboard'
        router.push(next)
      }
    }
    setLoading(false)
  }

  return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.card}>

          {router.query.next === '/unlock' && (
            <div className={styles.preAuthNote}>
              Create a free account first — your payment will be linked to it so you never lose access.
            </div>
          )}

          <div className={styles.tabs}>
            <button className={`${styles.tab} ${mode === 'signin' ? styles.active : ''}`}
              onClick={() => { setMode('signin'); setError(''); setSuccess('') }}>Sign in</button>
            <button className={`${styles.tab} ${mode === 'signup' ? styles.active : ''}`}
              onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>Create account</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters" required />
            </div>
            {mode === 'signup' && (
              <div className="field">
                <label>Confirm password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password" required />
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <p className={styles.hint}>
            {mode === 'signin'
              ? <span>No account? <button onClick={() => setMode('signup')} className={styles.link}>Create one free</button></span>
              : 'By creating an account you agree to our terms. Your searches will be saved to your account.'
            }
          </p>
        </div>

        <div className={styles.perks}>
          <div className={styles.perk}><div className={styles.perkDot}></div>Your shortlists and reviews saved forever</div>
          <div className={styles.perk}><div className={styles.perkDot}></div>Access from any device</div>
          <div className={styles.perk}><div className={styles.perkDot}></div>Payment linked to your account permanently</div>
        </div>
      </div>
    </div>
  )
}
