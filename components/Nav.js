import Link from 'next/link'
import { useAuth } from '../lib/auth'
import styles from './Nav.module.css'

export default function Nav() {
  const { user } = useAuth()

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        Car<span>wise</span>
      </Link>
      <div className={styles.links}>
        <Link href="/shortlist">Shortlist</Link>
        <Link href="/#pricing">Pricing</Link>
        <Link href="/support">Support</Link>
        {user ? (
          <Link href="/dashboard" className={styles.ctaSecondary}>My account</Link>
        ) : (
          <Link href="/auth" className={styles.ctaSecondary}>Sign in</Link>
        )}
        <Link href="/review" className={styles.cta}>Review a car</Link>
      </div>
    </nav>
  )
}
