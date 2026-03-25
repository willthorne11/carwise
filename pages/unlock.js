import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Nav from '../components/Nav'
import { useAuth } from '../lib/auth'
import { unlockUnlimited, getProfile } from '../lib/usage'
import styles from '../styles/Unlock.module.css'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

function CheckoutForm({ onSuccess, userId }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const { error: submitError } = await elements.submit()
    if (submitError) { setError(submitError.message); setLoading(false); return }

    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    const { clientSecret, error: apiError } = await res.json()
    if (apiError) { setError(apiError); setLoading(false); return }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: `${window.location.origin}/unlock?success=true` },
      redirect: 'if_required'
    })

    if (confirmError) {
      setError(confirmError.message)
      setLoading(false)
    } else {
      // Also update Supabase directly as backup to webhook
      await unlockUnlimited(userId)
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={`btn-primary ${styles.payBtn}`} disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay £7.99 →'}
      </button>
    </form>
  )
}

export default function Unlock() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [clientSecret, setClientSecret] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState('paywall')
  const [alreadyUnlimited, setAlreadyUnlimited] = useState(false)

  useEffect(() => {
    if (authLoading) return

    // Not signed in — redirect to auth first
    if (!user) {
      router.push('/auth?next=/unlock')
      return
    }

    // Check if already paid
    getProfile(user.id).then(profile => {
      if (profile?.is_unlimited) setAlreadyUnlimited(true)
    })

    // Handle redirect back from Stripe
    if (router.query.success === 'true') {
      unlockUnlimited(user.id).then(() => setSuccess(true))
    }
  }, [user, authLoading, router.query])

  const startCheckout = async () => {
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email })
    })
    const { clientSecret } = await res.json()
    setClientSecret(clientSecret)
    setStep('checkout')
  }

  if (authLoading) return (
    <div><Nav /><div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><div className="spinner"></div></div></div>
  )

  if (alreadyUnlimited) return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.successWrap}>
          <div className={styles.successIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color: 'var(--success)'}}><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2>You're already unlocked</h2>
          <p>You have unlimited access to Carwise. Go find your perfect car.</p>
          <a href="/shortlist" className="btn-primary" style={{display:'block',textAlign:'center'}}>Build a shortlist →</a>
        </div>
      </div>
    </div>
  )

  if (success) return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.successWrap}>
          <div className={styles.successIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color: 'var(--success)'}}><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <div className={styles.confettiRow}>
            {[1,2,3,4,5].map(i => <div key={i} className={styles.conf}></div>)}
          </div>
          <h2>You're unlocked</h2>
          <p>Unlimited shortlists and reviews, forever. Go find yourself a car you won't regret.</p>
          <a href="/dashboard" className="btn-primary" style={{display:'block',textAlign:'center'}}>Go to my account →</a>
        </div>
      </div>
    </div>
  )

  if (step === 'checkout' && clientSecret) return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.checkoutHeader}>
          <h2>Complete your purchase</h2>
          <p>Signed in as <strong>{user?.email}</strong></p>
        </div>
        <div className={styles.orderSummary}>
          <div className={styles.orderRow}><span>Carwise — unlimited access</span><span>£7.99</span></div>
          <div className={styles.orderRow} style={{opacity: 0.5}}><span>VAT included</span><span>£1.33</span></div>
          <div className={`${styles.orderRow} ${styles.orderTotal}`}><span>Total today</span><span>£7.99</span></div>
        </div>
        <div className={styles.checkoutNudge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink: 0}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>You're spending <strong>thousands on a car</strong> — this £7.99 could save you hundreds.</span>
        </div>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm onSuccess={() => setSuccess(true)} userId={user?.id} />
        </Elements>
        <button className="btn-ghost" style={{marginTop: '0.75rem'}} onClick={() => setStep('paywall')}>← Back</button>
      </div>
    </div>
  )

  return (
    <div>
      <Nav />
      <div className={styles.wrap}>
        <div className={styles.paywallTop}>
          <div className={styles.lockIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <h2>You've used your free searches</h2>
          <p>Unlock unlimited shortlists and reviews — one payment, yours forever.</p>
        </div>

        <div className={styles.usedBar}>
          <div className={styles.usedTop}><span>Free searches used</span><span>6 of 6</span></div>
          <div className={styles.usedTrack}><div className={styles.usedFill}></div></div>
        </div>

        <div className={styles.priceBox}>
          <div>
            <div className={styles.priceAmount}>£7.99</div>
            <div className={styles.priceOnce}>one time · never a subscription</div>
          </div>
          <div>
            <div className={styles.noSub}>No monthly fees</div>
            <div className={styles.noSubSub}>Pay once, use forever</div>
          </div>
        </div>

        <ul className={styles.perks}>
          {[
            'Unlimited shortlists — any size, any time',
            'Unlimited reviews across all platforms',
            'Save and track any car you\'re considering',
            'Full MOT history, insurance and tax data',
            'Access from any device, forever'
          ].map(p => (
            <li key={p}><span className={styles.perkDot}></span>{p}</li>
          ))}
        </ul>

        <p className={styles.nudge}>
          You're about to spend <strong>thousands on a car</strong> — the average buyer overpays by <strong>£1,847</strong> without proper research.
        </p>

        <button className="btn-primary" onClick={startCheckout}>Unlock for £7.99 →</button>

        <div className={styles.trustRow}>
          {[
            { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Secure payment' },
            { icon: 'M20 6L9 17l-5-5', label: 'Instant access' },
            { icon: 'M12 8v4l3 3 M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', label: '30 seconds' },
          ].map(t => (
            <div key={t.label} className={styles.trustItem}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={t.icon}/></svg>
              {t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
