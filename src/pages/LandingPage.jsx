import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Zap, Lightbulb, Eye, CheckCircle2, ArrowRight, Menu, X } from 'lucide-react';

/* ── Intersection Observer hook for scroll reveals ──────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Reveal wrapper ─────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style: extraStyle }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

/* ── Score Ring SVG ─────────────────────────────────────────────────────── */
function ScoreRing({ score, size = 96, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--error)';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
}

/* ── Mini screenshot preview ───────────────────────────────────────────── */
function ScreenshotPreview() {
  return (
    <div className="card" style={{ width: '100%', maxWidth: 360, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
      {/* Window chrome */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        <div style={{ flex: 1, marginLeft: 6, height: 18, borderRadius: 4, background: 'var(--background)', border: '1px solid var(--border)' }} />
      </div>
      {/* Fake UI */}
      <div style={{ padding: '16px', background: 'var(--background)' }}>
        <div style={{ height: 80, borderRadius: 8, background: 'var(--border)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Annotation pin */}
          <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', background: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700 }}>3</div>
          {/* Arrow annotation */}
          <div style={{ position: 'absolute', bottom: 8, left: 16, width: 40, height: 2, background: 'var(--warning)', borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>UI SCREENSHOT</span>
        </div>
        {/* Score bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <ScoreRing score={87} size={56} stroke={5} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Overall Score</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>87</div>
          </div>
        </div>
        {/* Category bars */}
        {[
          { label: 'Performance', score: 92 },
          { label: 'Accessibility', score: 85 },
          { label: 'Best Practices', score: 88 },
          { label: 'SEO', score: 81 },
        ].map(({ label, score }) => (
          <div key={label} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>{score}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--border)' }}>
              <div style={{ height: '100%', width: `${score}%`, borderRadius: 2, background: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--error)', transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
        {/* Issue tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {['3 Issues', '7 Suggestions', '12 Annotations'].map(t => (
            <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Navbar ─────────────────────────────────────────────────────────────── */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(248,249,253,0.88)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      height: 60,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          aria-label="UI Review home"
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 800, letterSpacing: '-0.02em' }}>UI</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Review</span>
        </button>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="desktop-nav">
          <Link to="/login" className="btn-ghost" style={{ fontSize: 14, padding: '7px 14px' }}>Login</Link>
          <Link to="/register" className="btn-primary" style={{ fontSize: 14, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            Start Free <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'none', color: 'var(--text-primary)' }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 4
        }}>
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: 15, color: 'var(--text-secondary)', textDecoration: 'none', padding: '10px 0', fontWeight: 500, borderBottom: '1px solid var(--divider)' }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-ghost" style={{ fontSize: 14, padding: '10px 14px', textAlign: 'center' }}>Login</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ fontSize: 14, padding: '10px 16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Start Free <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

/* ── Feature cards ─────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: <Zap size={18} />, title: 'AI UI Review', desc: 'Analyze your interface automatically and get instant feedback powered by machine learning.' },
  { icon: <Eye size={18} />, title: 'Visual Issues', desc: 'Identify design inconsistencies, misaligned elements, and usability problems at a glance.' },
  { icon: <CheckCircle2 size={18} />, title: 'Annotations', desc: 'See exactly where problems occur with precise visual markers directly on your UI.' },
  { icon: <Lightbulb size={18} />, title: 'Actionable Suggestions', desc: 'Receive practical, prioritized improvements you can implement right away.' },
];

/* ── Step cards ────────────────────────────────────────────────────────── */
const STEPS = [
  { num: '01', icon: <Upload size={20} />, title: 'Upload', desc: 'Drop your UI screenshot — any page, any design system.' },
  { num: '02', icon: <Zap size={20} />, title: 'Analyze', desc: 'AI inspects every element and scores performance, accessibility, and more.' },
  { num: '03', icon: <Lightbulb size={20} />, title: 'Improve', desc: 'Apply actionable suggestions and track your UI quality over time.' },
];

/* ── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 800 }}>UI</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Review</span>
        </div>
        <nav style={{ display: 'flex', gap: 24 }}>
          {[['Features', '#features'], ['How it Works', '#how-it-works'], ['Login', '/login']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>{label}</a>
          ))}
        </nav>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', width: '100%', textAlign: 'center', marginTop: 8 }}>
          © {new Date().getFullYear()} UI Review. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ── Landing Page ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>

      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 120, paddingBottom: 80, padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <Reveal>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--primary-light)', borderRadius: 20,
                padding: '5px 12px', marginBottom: 20,
              }}>
                <Zap size={12} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.01em' }}>AI-Powered UI Analysis</span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.12, letterSpacing: '-0.025em', marginBottom: 18 }}>
                Get Better UI/UX<br />Feedback in Seconds
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 440, marginBottom: 32 }}>
                Upload your interface screenshot and get AI-powered insights, annotated issues, category scores, and actionable suggestions — no setup required.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--primary)', color: 'white',
                  padding: '11px 22px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  transition: 'background 0.15s, transform 0.15s',
                  boxShadow: '0 2px 8px rgba(91,95,239,0.3)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Start Free <ArrowRight size={14} />
                </Link>
                <a href="#how-it-works" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--surface)', color: 'var(--text-primary)',
                  padding: '11px 22px', borderRadius: 10, border: '1px solid var(--border)',
                  fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                >
                  See How It Works
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right — product preview */}
          <Reveal delay={120} style={{ display: 'flex', justifyContent: 'center' }}>
            <ScreenshotPreview />
          </Reveal>
        </div>

        <style>{`
          @media (max-width: 768px) {
            section > div { grid-template-columns: 1fr !important; }
            section > div > div:last-child { order: -1; }
          }
        `}</style>
      </section>

      {/* ── Built for UI teams ─────────────────────────────────────────── */}
      <Reveal>
        <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Built for modern UI teams</p>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 700, margin: '0 auto' }}>
            {[
              { icon: <Zap size={16} />, text: 'Analyze screenshots instantly' },
              { icon: <Eye size={16} />, text: 'Identify visual issues' },
              { icon: <Lightbulb size={16} />, text: 'Get actionable suggestions' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--primary)' }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── How it Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>Three steps to better UI</h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 48px', lineHeight: 1.6 }}>
              No complex setup. No integrations. Just upload and get insights.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {STEPS.map(({ num, icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 90}>
                <div className="card" style={{ padding: '28px 24px', textAlign: 'left', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                      {icon}
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--border)', letterSpacing: '-0.02em' }}>{num}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <style>{`
            @media (max-width: 640px) {
              #how-it-works .card { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>

        <style>{`
          @media (max-width: 640px) {
            #how-it-works div[style*="grid-template-columns: repeat(3, 1fr)"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Features</p>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 40 }}>
              Everything you need to ship better UI
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {FEATURES.map(({ icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="card" style={{ padding: '24px', textAlign: 'left', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 }}>{title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <style>{`
            @media (max-width: 640px) {
              #features div[style*="grid-template-columns: repeat(2, 1fr)"] {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </section>

      {/* ── Instant Analysis highlight ───────────────────────────────────── */}
      <section style={{ padding: '0 24px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 40,
              alignItems: 'center',
              position: 'relative',
            }}>

              {/* Thermometer icon — no card background, just the gradient element */}
              <div style={{
                width: 80, height: 80,
                borderRadius: 18,
                background: 'linear-gradient(135deg, #5B5FEF 0%, #8B5CF6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 6px 20px rgba(91,95,239,0.35)',
                position: 'relative',
              }}>
                {/* White bulb */}
                <div style={{
                  position: 'absolute', bottom: 14,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                }} />
                {/* White stem */}
                <div style={{
                  position: 'absolute', top: 12,
                  width: 3, height: 32, borderRadius: 2,
                  background: 'rgba(255,255,255,0.9)',
                }} />
                {/* Small dot below bulb */}
                <div style={{
                  position: 'absolute', bottom: 5,
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.45)',
                }} />
              </div>

              {/* Text */}
              <div style={{ position: 'relative' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Instant Analysis
                </p>
                <h2 style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 10 }}>
                  See issues the moment you upload
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 460 }}>
                  Drop any screenshot and our AI immediately highlights problems, scores your UI, and marks issues with precision annotations — all in under 10 seconds.
                </p>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 28, marginTop: 20, flexWrap: 'wrap' }}>
                  {[
                    { value: '<10s', label: 'Analysis time' },
                    { value: '7', label: 'Score categories' },
                    { value: '100%', label: 'Automated' },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>{value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Scores preview ─────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal>
            <div className="card" style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', overflow: 'hidden' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Scoring</p>
                <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>
                  Detailed scores for every category
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 20 }}>
                  Get a clear breakdown across Performance, Accessibility, Best Practices, and SEO. Know exactly where your UI stands.
                </p>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--primary)', color: 'white',
                  padding: '10px 20px', borderRadius: 9,
                  fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  transition: 'background 0.15s',
                  boxShadow: '0 2px 8px rgba(91,95,239,0.25)',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                >
                  Try it free <ArrowRight size={13} />
                </Link>
              </div>

              {/* Score demo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Performance', score: 92 },
                  { label: 'Accessibility', score: 85 },
                  { label: 'Best Practices', score: 88 },
                  { label: 'SEO', score: 81 },
                ].map(({ label, score }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 80, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>{label}</div>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--border)' }}>
                      <div style={{
                        height: '100%', width: `${score}%`, borderRadius: 4,
                        background: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--error)',
                        transition: 'width 1s ease',
                      }} />
                    </div>
                    <div style={{ width: 30, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>{score}</div>
                  </div>
                ))}
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>Example scores for demonstration purposes</p>
              </div>
            </div>
          </Reveal>

          <style>{`
            @media (max-width: 640px) {
              .card > div[style*="grid-template-columns: 1fr 1fr"] {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ padding: '56px 40px', borderRadius: 16, background: 'var(--primary)', position: 'relative', overflow: 'hidden' }}>
              {/* Subtle bg circle */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: -60, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

              <div style={{ position: 'relative' }}>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 10 }}>
                  Ready to improve your interface?
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', marginBottom: 28, lineHeight: 1.6 }}>
                  Upload your first screenshot and discover what can be improved — in seconds.
                </p>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'white', color: 'var(--primary)',
                  padding: '12px 28px', borderRadius: 10,
                  fontSize: 15, fontWeight: 700, textDecoration: 'none',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
                >
                  Start Free <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
