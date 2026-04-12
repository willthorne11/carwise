.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  border-bottom: 0.5px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 100;
}

.logo {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  letter-spacing: -0.5px;
  text-decoration: none;
  color: var(--text);
}

.logo span { color: var(--accent); }

.links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.links a {
  color: var(--muted);
  font-size: 14px;
  transition: color 0.2s;
  text-decoration: none;
}

.links a:hover { color: var(--text); }

.ctaSecondary {
  color: var(--muted) !important;
}

.cta {
  background: var(--accent) !important;
  color: #000 !important;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full);
  font-weight: 500;
  font-size: 14px;
  transition: opacity 0.2s !important;
  text-decoration: none !important;
}

.cta:hover { opacity: 0.85; }

.hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  padding: 4px;
}

.mobileMenu {
  display: none;
  flex-direction: column;
  background: var(--surface);
  border-bottom: 0.5px solid var(--border);
  position: sticky;
  top: 65px;
  z-index: 99;
}

.mobileLink {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 1.5rem;
  color: var(--muted);
  text-decoration: none;
  font-size: 15px;
  border-bottom: 0.5px solid var(--border);
  transition: background 0.15s, color 0.15s;
}

.mobileLink:last-child { border-bottom: none; }
.mobileLink:hover { background: var(--surface2); color: var(--text); }

@media (max-width: 680px) {
  .nav { padding: 1rem 1.5rem; }
  .links { display: none; }
  .hamburger { display: flex; }
  .mobileMenu { display: flex; }
}
