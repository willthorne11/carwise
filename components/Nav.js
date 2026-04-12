import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../lib/auth'
import styles from './Nav.module.css'

export default function Nav() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          Car<span>wise</span>
        </Link>

        {/* Desktop links */}
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

        {/* Mobile hamburger */}
        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/review" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            Review a car
          </Link>
          <Link href="/shortlist" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            Build a shortlist
          </Link>
          {user ? (
            <Link href="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My account
            </Link>
          ) : (
            <Link href="/auth" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign in
            </Link>
          )}
          <Link href="/support" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            Support
          </Link>
          <Link href="/#pricing" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            Pricing
          </Link>
        </div>
      )}
    </>
  )
}
