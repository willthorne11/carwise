import Link from 'next/link'
import styles from './Nav.module.css'

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        Car<span>wise</span>
      </Link>
      <div className={styles.links}>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#pricing">Pricing</Link>
        <Link href="/shortlist" className={styles.cta}>Get started free</Link>
      </div>
    </nav>
  )
}
