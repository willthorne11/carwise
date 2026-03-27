import Link from 'next/link'
import Nav from '../components/Nav'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div>
      <Nav />
      <main>
        <section className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.dot}></span>
            Now live — free to try
          </div>
          <h1>Stop getting<br /><em>ripped off</em><br />buying a used car</h1>
          <p className={styles.sub}>
            Most buyers overpay by £1,000–£3,000. Carwise gives you an instant shortlist of the best cars available to you right now — and an honest verdict on any car you're considering.
          </p>
          <div className={styles.statBar}>
            <div className={styles.stat}><div className={styles.statNum}>£1,847</div><div className={styles.statLabel}>avg. overpaid</div></div>
            <div className={styles.stat}><div className={styles.statNum}>60 sec</div><div className={styles.statLabel}>to your shortlist</div></div>
            <div className={styles.stat}><div className={styles.statNum}>100%</div><div className={styles.statLabel}>plain English</div></div>
          </div>
          <div className={styles.ctaRow}>
            <Link href="/shortlist" className={styles.btnPrimary}>Build my shortlist</Link>
            <Link href="/review" className={styles.btnSecondary}>Review a car</Link>
          </div>
          <p className={styles.freeTag}>No card required. Free to start.</p>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionLabel}>What we do</p>
          <div className={styles.products}>
            <div className={styles.productCard} style={{borderColor: 'rgba(232,255,71,0.2)'}}>
              <div className={styles.productTitle}>The Shortlist</div>
              <p className={styles.productDesc}>Tell us your budget, how you use your car, and what matters to you. Choose how many cars you want back — 3, 5, or 10 — ranked, explained, and ready to act on.</p>
              <div className={styles.tags}>
                <span className={styles.tag}>Cross-platform</span>
                <span className={styles.tag}>You choose the size</span>
                <span className={styles.tag}>Real-time</span>
              </div>
            </div>
            <div className={styles.productCard}>
              <div className={styles.productTitle}>The Review</div>
              <p className={styles.productDesc}>Found a car you like? Enter the details and get an instant verdict on price, reliability, red flags — plus better alternatives at the same budget.</p>
              <div className={styles.tags}>
                <span className={styles.tag}>Any listing</span>
                <span className={styles.tag}>Red flags</span>
                <span className={styles.tag}>Alternatives</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="how-it-works">
          <p className={styles.sectionLabel}>How it works</p>
          <div className={styles.steps}>
            {[
              { n: '01', title: 'Tell us what you need', desc: 'Budget, lifestyle, priorities — takes about 60 seconds. Or enter a car you already found.' },
              { n: '02', title: 'We analyse the market', desc: 'We cross-reference pricing data, reliability records, common faults, and what\'s available to you right now.' },
              { n: '03', title: 'Get your shortlist or verdict', desc: 'Clear, honest, plain English. Every car in your shortlist has a one-click review option.' },
              { n: '04', title: 'Buy with confidence', desc: 'Walk into every viewing knowing exactly what the car is worth, what to check, and what to walk away from.' },
            ].map(s => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <div><h4>{s.title}</h4><p>{s.desc}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="pricing">
          <p className={styles.sectionLabel}>Pricing</p>
          <div className={styles.pricingBox}>
            <div className={styles.pricingAccent}></div>
            <div className={styles.pricingGrid}>
              <div className={styles.pricingTier}>
                <div className={styles.tierLabel}>Free — no card needed</div>
                <div className={styles.tierPrice}>£0</div>
                <div className={styles.tierPriceSub}>to get started</div>
                <ul className={styles.tierPerks}>
                  <li><span>+</span> 1 full shortlist (up to 5 cars)</li>
                  <li><span>+</span> 5 car reviews</li>
                  <li><span>+</span> Full results, no catch</li>
                  <li><span>+</span> No account required</li>
                </ul>
              </div>
              <div className={styles.pricingTierFeatured}>
                <div className={styles.tierLabel}>Unlimited — one time</div>
                <div className={styles.tierPrice}>£7.99</div>
                <div className={styles.tierPriceSub}>once, forever — never a subscription</div>
                <ul className={styles.tierPerks}>
                  <li><span>+</span> Unlimited shortlists</li>
                  <li><span>+</span> Unlimited reviews</li>
                  <li><span>+</span> All platforms covered</li>
                  <li><span>+</span> Every future feature included</li>
                </ul>
              </div>
            </div>
            <div className={styles.pricingCta}>
              <Link href="/shortlist" className={styles.btnPrimary} style={{maxWidth: '280px', display: 'block', margin: '0 auto', textAlign: 'center'}}>
                Start for free
              </Link>
              <p className={styles.pricingNudge}>You're about to spend £5,000+ on a car. <strong>This costs less than a coffee.</strong></p>
            </div>
          </div>
        </section>

        <section className={styles.section} id="support" style={{paddingTop: 0}}>
          <div className={styles.supportBox}>
            <div className={styles.supportTitle}>Need help?</div>
            <p className={styles.supportText}>Got a question or something not working? We're here.</p>
            <a href="mailto:help@carwise.site" className={styles.supportEmail}>help@carwise.site</a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Built to stop you getting ripped off. <strong>Carwise</strong> — know before you buy.</p>
        <p style={{marginTop: '0.5rem'}}><a href="mailto:help@carwise.site" style={{color: 'var(--muted)', fontSize: '13px'}}>help@carwise.site</a></p>
      </footer>
    </div>
  )
}
