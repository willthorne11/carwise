import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useAuth } from '../lib/auth'
import Nav from '../components/Nav'
import styles from '../styles/Auth.module.css'
import mfaStyles from '../styles/MFA.module.css'

export default function MFASetup() {
  const router = useRouter()
  const { user, enrollMFA, verifyMFA } = useAuth()
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('setup')

  useEffect(() => {
    if (!user) { router.push('/auth'); return }
    setupMFA()
  }, [user])

  const setupMFA = async () => {
    const { data, error } = await enrollMFA()
    if (error) { setError(error.message); return }
    setQrCode(data.totp.qr_code)
    setSecret(data.totp.secret)
    setFactorId(data.id)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await verifyMFA(factorId, code)
    if (error) {
      setError('Invalid code. Please try again.')
    } else {
      setStep('success')
    }
    setLoading(false)
  }

  if (step === 'success') return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={mfaStyles.successIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 style={{fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center'}}>2FA enabled</h2>
          <p style={{fontSize: '14px', color: 'var(--muted)', textAlign: 'center', marginBottom: '1.5rem'}}>Your account is now protected with two-factor authentication.</p>
          <button className="btn-primary" onClick={() => router.push('/dashboard')}>Go to dashboard →</button>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.card}>
          <h2 style={{fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '0.4rem'}}>Set up two-factor authentication</h2>
          <p style={{fontSize: '14px', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.6}}>Scan the QR code with an authenticator app like Google Authenticator or Authy, then enter the 6-digit code to confirm.</p>

          {qrCode && (
            <div className={mfaStyles.qrWrap}>
              <img src={qrCode} alt="QR Code" width={180} height={180} />
            </div>
          )}

          {secret && (
            <div className={mfaStyles.secretBox}>
              <div className={mfaStyles.secretLabel}>Or enter this code manually</div>
              <div className={mfaStyles.secret}>{secret}</div>
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="field" style={{marginTop: '1.25rem'}}>
              <label>6-digit verification code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="000000"
                maxLength={6}
                style={{letterSpacing: '0.3rem', fontSize: '18px', textAlign: 'center'}}
                required
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading || code.length !== 6}>
              {loading ? 'Verifying...' : 'Enable 2FA →'}
            </button>
          </form>

          <p className={styles.hint} style={{marginTop: '1rem'}}>
            <button className={styles.link} onClick={() => router.push('/dashboard')}>Skip for now</button>
          </p>
        </div>
      </div>
    </div>
  )
}
