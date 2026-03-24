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
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#pricing">Pricing</Link>
        {user ? (
          <Link href="/dashboard" className={styles.cta}>My account</Link>
        ) : (
          <Link href="/auth" className={styles.cta}>Get started free</Link>
        )}
      </div>
    </nav>
  )
}
