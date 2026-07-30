import { useState, useEffect } from 'react';
import {
  Sparkles, PencilRuler, Wand2, LayoutTemplate, Layers,
  ArrowRight, Check, Star, Play, Smartphone, Globe,
  ChevronRight, Menu, X, Plus, Code2, Eye, Download,
  Layers2, ArrowDown, Monitor
} from 'lucide-react';

const FEATURES = [
  { icon: Layers2, title: 'Screenshot Scanner', desc: 'Upload any screenshot. AI instantly extracts components, colors, fonts, and layout structure.', color: '#7c5cff', tag: 'AI Vision' },
  { icon: Wand2, title: 'Autodesigner', desc: 'Describe your idea in plain English. Watch AI generate complete, polished multi-screen mockups.', color: '#ff6b9d', tag: 'AI Generate' },
  { icon: PencilRuler, title: 'Visual Editor', desc: 'Drag, resize, recolor — full canvas editor with layers, properties, and real-time preview.', color: '#10b981', tag: 'Editor' },
  { icon: Code2, title: 'Code Export', desc: 'Export to clean React, Vue, or HTML. Production-ready code — not messy AI-generated garbage.', color: '#3b82f6', tag: 'Export' },
  { icon: LayoutTemplate, title: 'Design Templates', desc: 'Material, Apple, Tailwind, Fluent — built-in design systems for consistent, scalable UI.', color: '#f59e0b', tag: 'Templates' },
  { icon: Globe, title: 'AI Research', desc: 'Instant insights on UX, UI, accessibility, and design trends from trusted industry sources.', color: '#06b6d4', tag: 'AI Research' },
];

const STEPS = [
  { num: '01', title: 'Drop a Screenshot', desc: 'Upload any design screenshot or type your idea in words. AI understands instantly.', color: '#7c5cff' },
  { num: '02', title: 'AI Generates Mockups', desc: 'Our AI creates polished, editable UI mockups in seconds — not minutes.', color: '#ff6b9d' },
  { num: '03', title: 'Edit & Refine', desc: 'Drag, resize, recolor every element. Full control with a gentle learning curve.', color: '#10b981' },
  { num: '04', title: 'Export Clean Code', desc: 'One click to production-ready React, Vue, or HTML. Copy and ship.', color: '#3b82f6' },
];

const STATS = [
  { value: '12,000+', label: 'Active Users' },
  { value: '840,000+', label: 'Screens Generated' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '98%', label: 'Satisfaction' },
];

const TEMPLATES = [
  { name: 'SaaS Dashboard', desc: 'Data panels, KPI cards, charts', screens: 12, color: '#7c5cff', icon: LayoutTemplate },
  { name: 'E-Commerce', desc: 'Product grids, cart, checkout', screens: 8, color: '#ff6b9d', icon: Layers },
  { name: 'Mobile App', desc: 'Onboarding, feeds, profiles', screens: 10, color: '#10b981', icon: Smartphone },
  { name: 'Landing Page', desc: 'Hero, features, pricing, CTA', screens: 6, color: '#3b82f6', icon: Globe },
  { name: 'Portfolio', desc: 'Minimalist creative portfolio', screens: 5, color: '#f59e0b', icon: Monitor },
  { name: 'Admin Panel', desc: 'Users, settings, analytics', screens: 14, color: '#06b6d4', icon: Code2 },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Product Designer', avatar: 'SC', text: 'UI Inspectore cut our design-to-prototype time by 70%. The AI autodesigner is genuinely magical — it just gets design intent.', color: '#7c5cff' },
  { name: 'Marcus Rodriguez', role: 'Frontend Engineer', avatar: 'MR', text: 'Finally a tool that exports clean, semantic React code. No more hand-editing AI mess. My whole team uses it every day.', color: '#ff6b9d' },
  { name: 'Aisha Patel', role: 'Startup Founder', avatar: 'AP', text: 'We validated our entire product concept with mockups before writing a single line of code. Paid for itself on day one.', color: '#10b981' },
];

const FAQS = [
  { q: 'Does it require design experience?', a: 'Not at all. UI Inspectore is built for designers, developers, founders, and non-designers alike. Describe what you want in plain English and AI handles the rest.' },
  { q: 'What frameworks does code export support?', a: 'Currently React and Vue with HTML/CSS. Angular support is coming soon. All exported code is clean, semantic, accessible, and production-ready.' },
  { q: 'Is my design data private?', a: 'Yes. All uploads and projects are encrypted at rest and in transit. We never use your designs to train AI models. SOC 2 compliant.' },
  { q: 'Is there a free plan?', a: 'Yes. The free plan includes 10 AI generations, 5 project exports, and access to all core features. No credit card required.' },
];

const PRICING = [
  { name: 'Free', price: '$0', period: 'forever', desc: 'Perfect for trying out UI Inspectore', features: ['10 AI generations / month', '5 project exports', '3 templates', 'Community support'], cta: 'Get Started', featured: false },
  { name: 'Pro', price: '$19', period: '/ month', desc: 'For designers and teams who move fast', features: ['Unlimited AI generations', 'Unlimited exports', 'All 40+ templates', 'Priority support', 'Team collaboration', 'Custom design systems'], cta: 'Start Free Trial', featured: true },
  { name: 'Team', price: '$49', period: '/ month', desc: 'For growing teams with big ambitions', features: ['Everything in Pro', '5 seats included', 'Advanced analytics', 'API access', 'Custom onboarding', 'Dedicated support'], cta: 'Contact Sales', featured: false },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [titleIdx, setTitleIdx] = useState(0);
  const [titleVisible, setTitleVisible] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  const titles = [
    'Design stunning interfaces',
    'Generate UI from screenshots',
    'Prototype at the speed of thought',
    'Export production-ready code',
    'Build design systems instantly',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleVisible(false);
      setTimeout(() => {
        setTitleIdx(i => (i + 1) % titles.length);
        setTitleVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <div className="lp">

      {/* ── Background ── */}
      <div className="lp-bg">
        <div className="lp-bg-glow lp-bg-glow-1" />
        <div className="lp-bg-glow lp-bg-glow-2" />
        <div className="lp-bg-glow lp-bg-glow-3" />
      </div>

      {/* ── Nav ── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
            <div className="lp-logo-icon"><PencilRuler size={17} color="white" /></div>
            <div>
              <span className="lp-logo-name">UI Inspectore</span>
              <span className="lp-logo-sub">AI Design Studio</span>
            </div>
          </div>
          <div className="lp-nav-links">
            {[['features', 'Features'], ['how-it-works', 'How it Works'], ['templates', 'Templates'], ['pricing', 'Pricing']].map(([id, label]) => (
              <button key={id} className="lp-nav-link" onClick={() => scrollTo(id)}>{label}</button>
            ))}
          </div>
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={() => window.location.href = '/auth/login'}>Sign In</button>
            <button className="lp-btn-primary" onClick={() => window.location.href = '/auth/register'}>Start Free <ArrowRight size={13} /></button>
          </div>
          <button className="lp-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="lp-mobile-menu">
            {[['features', 'Features'], ['how-it-works', 'How it Works'], ['templates', 'Templates'], ['pricing', 'Pricing']].map(([id, label]) => (
              <button key={id} className="lp-mobile-link" onClick={() => scrollTo(id)}>{label}</button>
            ))}
            <button className="lp-btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }} onClick={() => window.location.href = '/auth/register'}>Start Free</button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-badge">
            <Sparkles size={11} />
            <span>Powered by Advanced AI — Free to start</span>
          </div>
          <h1 className="lp-hero-title">
            <span className={`lp-title-word ${titleVisible ? 'lp-title-visible' : ''}`}>
              {titles[titleIdx]}
              <span className="lp-title-cursor" />
            </span>
            <br />
            <span className="lp-hero-gradient">with AI-powered design</span>
          </h1>
          <p className="lp-hero-sub">
            Drop a screenshot → AI extracts the design. Describe an idea → AI generates mockups.
            Edit in our visual editor and export production-ready code in one click.
          </p>
          <div className="lp-hero-ctas">
            <button className="lp-btn-primary lp-btn-lg" onClick={() => window.location.href = '/auth/register'}>
              Start Designing Free <ArrowRight size={16} />
            </button>
            <button className="lp-btn-outline lp-btn-lg" onClick={() => scrollTo('how-it-works')}>
              <Play size={14} /> See How it Works
            </button>
          </div>
          <div className="lp-hero-trust">
            <div className="lp-stars">
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />)}
            </div>
            <span><strong>4.9/5</strong> from <strong>12,000+</strong> designers and developers</span>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="lp-hero-visual">
          <div className="lp-mockup">
            <div className="lp-mockup-bar">
              <div className="lp-dots">
                <span style={{ background: '#ef4444' }} />
                <span style={{ background: '#f59e0b' }} />
                <span style={{ background: '#22c55e' }} />
              </div>
              <div className="lp-tabs">
                <div className="lp-tab lp-tab-active"><Layers size={10} /> Dashboard</div>
                <div className="lp-tab">Analytics</div>
                <div className="lp-tab">Settings</div>
              </div>
              <div className="lp-bar-actions">
                <div className="lp-bar-btn"><Sparkles size={10} /></div>
                <div className="lp-bar-btn lp-bar-accent"><Wand2 size={10} /></div>
              </div>
            </div>
            <div className="lp-mockup-body">
              <div className="lp-sidebar">
                {[
                  { icon: LayoutTemplate, label: 'Dashboard', active: true },
                  { icon: Layers, label: 'Projects' },
                  { icon: Wand2, label: 'Autodesigner' },
                  { icon: Layers2, label: 'Scanner' },
                  { icon: Globe, label: 'AI Research' },
                  { icon: Code2, label: 'Export' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`lp-side-item ${item.active ? 'active' : ''}`}>
                      <Icon size={13} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="lp-main-area">
                <div className="lp-main-header">
                  <div className="lp-welcome">Welcome back, Sarah</div>
                  <div className="lp-main-btns">
                    <div className="lp-main-btn"><Plus size={11} /></div>
                    <div className="lp-main-btn lp-main-accent"><Sparkles size={11} /> Generate</div>
                  </div>
                </div>
                <div className="lp-project-cards">
                  {[
                    { label: 'E-Commerce', tag: 'React', color: '#7c5cff', pct: '68%' },
                    { label: 'SaaS Dashboard', tag: 'Vue', color: '#10b981', pct: '82%' },
                    { label: 'Portfolio Site', tag: 'HTML', color: '#f59e0b', pct: '55%' },
                  ].map((card) => (
                    <div key={card.label} className="lp-proj-card" style={{ '--c': card.color }}>
                      <div className="lp-proj-top">
                        <span className="lp-proj-tag">{card.tag}</span>
                        <span className="lp-proj-name">{card.label}</span>
                      </div>
                      <div className="lp-proj-bar">
                        <div className="lp-proj-fill" style={{ width: card.pct }} />
                      </div>
                      <div className="lp-proj-footer">
                        <span>{card.pct} complete</span>
                        <Eye size={10} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lp-ai-chip">
                  <Sparkles size={11} />
                  <span>AI Suggestion: Optimize card layout for mobile to boost engagement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div className="lp-float lp-float-1">
            <div className="lp-fi"><Check size={12} color="#22c55e" /></div>
            <div>
              <p className="lp-fi-title">Screenshot scanned</p>
              <p className="lp-fi-sub">12 components extracted</p>
            </div>
          </div>
          <div className="lp-float lp-float-2">
            <div className="lp-fi"><Download size={12} color="#7c5cff" /></div>
            <div>
              <p className="lp-fi-title">React code exported</p>
              <p className="lp-fi-sub">Clean, semantic markup</p>
            </div>
          </div>
          <div className="lp-float lp-float-3">
            <div className="lp-fi"><Sparkles size={12} color="#ff6b9d" /></div>
            <div>
              <p className="lp-fi-title">Autodesigner running</p>
              <p className="lp-fi-sub">Generating 3 screens...</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Logo Cloud ── */}
      <div className="lp-logos">
        <p className="lp-logos-label">Trusted by teams at</p>
        <div className="lp-logos-list">
          {['Figma', 'Sketch', 'Framer', 'Notion', 'Linear', 'Vercel', 'Stripe', 'GitHub'].map(l => (
            <div key={l} className="lp-logos-item">{l}</div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="lp-section lp-section-alt">
        <div className="lp-container">
          <div className="lp-section-head">
            <div className="lp-badge">Features</div>
            <h2 className="lp-section-title">Everything you need to<br /><span className="lp-grad-text">design, prototype & ship</span></h2>
            <p className="lp-section-sub">From screenshot to production code in minutes. No design skills required.</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="lp-feat-card">
                <div className="lp-feat-top">
                  <div className="lp-feat-icon" style={{ background: f.color + '18', color: f.color }}>
                    <f.icon size={20} />
                  </div>
                  <span className="lp-feat-tag" style={{ color: f.color, background: f.color + '15' }}>{f.tag}</span>
                </div>
                <h3 className="lp-feat-title">{f.title}</h3>
                <p className="lp-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <div className="lp-badge">How it Works</div>
            <h2 className="lp-section-title">From idea to design<br /><span className="lp-grad-text">in four steps</span></h2>
            <p className="lp-section-sub">No learning curve. No design experience needed. Just describe and watch AI work.</p>
          </div>
          <div className="lp-steps">
            {STEPS.map((step, i) => (
              <div key={step.num} className="lp-step">
                <div className="lp-step-num" style={{ color: step.color }}>{step.num}</div>
                <div className="lp-step-icon" style={{ background: step.color + '18', color: step.color }}>
                  {i === 0 && <Layers2 size={22} />}
                  {i === 1 && <Wand2 size={22} />}
                  {i === 2 && <PencilRuler size={22} />}
                  {i === 3 && <Code2 size={22} />}
                </div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
                {i < STEPS.length - 1 && <div className="lp-step-arrow"><ChevronRight size={16} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="lp-stats">
        <div className="lp-container">
          <div className="lp-stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="lp-stat">
                <div className="lp-stat-value">{s.value}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Templates ── */}
      <section id="templates" className="lp-section lp-section-alt">
        <div className="lp-container">
          <div className="lp-section-head">
            <div className="lp-badge">Templates</div>
            <h2 className="lp-section-title">Start from proven<br /><span className="lp-grad-text">design systems</span></h2>
            <p className="lp-section-sub">Pre-built templates from Material, Apple, Tailwind, and Fluent — ready to customize in seconds.</p>
          </div>
          <div className="lp-templates-grid">
            {TEMPLATES.map((t) => (
              <div key={t.name} className="lp-tpl-card">
                <div className="lp-tpl-preview" style={{ background: `linear-gradient(135deg, ${t.color}12, ${t.color}05)` }}>
                  <div className="lp-tpl-icon" style={{ background: t.color + '20', color: t.color }}>
                    <t.icon size={22} strokeWidth={1.5} />
                  </div>
                  <div className="lp-tpl-screens">{t.screens} screens</div>
                </div>
                <div className="lp-tpl-info">
                  <h3>{t.name}</h3>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <div className="lp-badge">Testimonials</div>
            <h2 className="lp-section-title">Loved by designers<br /><span className="lp-grad-text">and developers</span></h2>
          </div>
          <div className="lp-tests-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="lp-test-card">
                <div className="lp-test-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p className="lp-test-text">"{t.text}"</p>
                <div className="lp-test-author">
                  <div className="lp-test-avatar" style={{ background: t.color + '22', color: t.color }}>{t.avatar}</div>
                  <div>
                    <p className="lp-test-name">{t.name}</p>
                    <p className="lp-test-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="lp-section lp-section-alt">
        <div className="lp-container">
          <div className="lp-section-head">
            <div className="lp-badge">Pricing</div>
            <h2 className="lp-section-title">Start free.<br /><span className="lp-grad-text">Scale when ready.</span></h2>
            <p className="lp-section-sub">No credit card required. Cancel anytime.</p>
          </div>
          <div className="lp-pricing-grid">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`lp-price-card ${plan.featured ? 'lp-price-featured' : ''}`}>
                {plan.featured && <div className="lp-price-badge">Most Popular</div>}
                <div className="lp-price-name">{plan.name}</div>
                <div className="lp-price-amount">
                  <span className="lp-price-num">{plan.price}</span>
                  <span className="lp-price-period">{plan.period}</span>
                </div>
                <p className="lp-price-desc">{plan.desc}</p>
                <ul className="lp-price-features">
                  {plan.features.map((f) => (
                    <li key={f}><Check size={13} color="#22c55e" /><span>{f}</span></li>
                  ))}
                </ul>
                <button className={`${plan.featured ? 'lp-btn-primary' : 'lp-btn-outline'} lp-price-btn`}>
                  {plan.cta} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section">
        <div className="lp-container lp-faq-container">
          <div className="lp-section-head">
            <div className="lp-badge">FAQ</div>
            <h2 className="lp-section-title">Questions?<br /><span className="lp-grad-text">We've got answers.</span></h2>
          </div>
          <div className="lp-faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} className={`lp-faq-item ${openFaq === i ? 'lp-faq-open' : ''}`}>
                <button className="lp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <Plus size={16} className="lp-faq-icon" />
                </button>
                {openFaq === i && <p className="lp-faq-a">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-cta-section">
        <div className="lp-cta-glow" />
        <div className="lp-cta-inner">
          <div className="lp-final-badge">
            <Sparkles size={13} />
            <span>Join 12,000+ designers shipping faster</span>
          </div>
          <h2 className="lp-cta-title">Ready to design<br /><span className="lp-grad-text">10× faster?</span></h2>
          <p className="lp-cta-sub">Start for free. No credit card. Ship your first AI-generated UI in under 5 minutes.</p>
          <div className="lp-cta-btns">
            <button className="lp-btn-primary lp-btn-lg" onClick={() => window.location.href = '/auth/register'}>
              Start for Free <ArrowRight size={16} />
            </button>
            <button className="lp-btn-outline lp-btn-lg" onClick={() => scrollTo('features')}>
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            {/* Brand */}
            <div className="lp-footer-brand">
              <div className="lp-logo">
                <div className="lp-logo-icon"><PencilRuler size={17} color="white" /></div>
                <div>
                  <span className="lp-logo-name">UI Inspectore</span>
                  <span className="lp-logo-sub">AI Design Studio</span>
                </div>
              </div>
              <p>AI-powered design studio for modern product teams. Turn ideas into production UI in minutes.</p>
              <div className="lp-footer-social-row">
                {[
                  { label: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z' },
                  { label: 'GitHub', path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2Z' },
                  { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                ].map(s => (
                  <a key={s.label} href="#" className="lp-social-icon" aria-label={s.label}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            <div className="lp-footer-links">
              {[['Product', ['Features', 'Templates', 'Pricing', 'Changelog']], ['Company', ['About', 'Blog', 'Careers', 'Press']], ['Legal', ['Privacy', 'Terms', 'Security']]].map(([group, links]) => (
                <div key={group} className="lp-footer-col">
                  <h4>{group}</h4>
                  {links.map(l => <a key={l} href="#" className="lp-footer-link">{l}</a>)}
                </div>
              ))}
            </div>

            {/* Newsletter */}
            <div className="lp-footer-newsletter">
              <h4>Stay Updated</h4>
              <p>Get the latest features and news delivered to your inbox.</p>
              <form className="lp-newsletter-form" onSubmit={(e) => { e.preventDefault(); const v = e.target.email.value; if (v) { e.target.reset(); setSubscribed(true); setTimeout(() => setSubscribed(false), 3000); } }}>
                <input name="email" type="email" placeholder="your@email.com" required className="lp-newsletter-input" />
                <button type="submit" className="lp-newsletter-btn">{subscribed ? <Check size={14} /> : <ArrowRight size={14} />}</button>
              </form>
              {subscribed && <p className="lp-newsletter-success"><Check size={11} /> Thanks! You're subscribed.</p>}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="lp-footer-bottom">
            <p>© {new Date().getFullYear()} UI Inspectore. All rights reserved.</p>
            <div className="lp-footer-bottom-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        /* ── Global scroll reset ── */
        html { overflow-x: hidden; overflow-y: scroll; scroll-behavior: smooth; }
        body { margin: 0; padding: 0; overflow-x: hidden; }

        /* ── Reset & Base ── */
        .lp {
          background: #09090b;
          color: #f4f4f5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
        }

        /* ── Background ── */
        .lp-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .lp-bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          will-change: transform;
        }
        .lp-bg-glow-1 {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(124,92,255,0.18) 0%, transparent 70%);
          top: -200px; left: -200px;
          animation: float-glow 16s ease-in-out infinite;
        }
        .lp-bg-glow-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(255,107,157,0.14) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          animation: float-glow 20s ease-in-out infinite reverse;
        }
        .lp-bg-glow-3 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%);
          top: 40%; left: 35%;
          animation: float-glow 24s ease-in-out infinite 5s;
        }
        @keyframes float-glow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -40px) scale(1.05); }
          66% { transform: translate(-30px, 50px) scale(0.95); }
        }

        /* ── Layout helpers ── */
        .lp-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* ── Nav ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0.875rem 2rem;
          transition: background 0.3s, backdrop-filter 0.3s, box-shadow 0.3s;
        }
        .lp-nav-scrolled {
          background: rgba(9,9,11,0.82);
          backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06);
        }
        .lp-nav-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; gap: 2rem;
        }
        .lp-logo { display: flex; align-items: center; gap: 0.625rem; flex-shrink: 0; }
        .lp-logo-icon {
          width: 2.1rem; height: 2.1rem; border-radius: 9px;
          background: linear-gradient(135deg, #7c5cff, #ff6b9d);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(124,92,255,0.35);
        }
        .lp-logo-name { font-size: 0.9375rem; font-weight: 800; color: #f4f4f5; }
        .lp-logo-sub { font-size: 0.625rem; color: #71717a; display: block; margin-top: -1px; }
        .lp-nav-links { display: flex; align-items: center; gap: 0.125rem; flex: 1; justify-content: center; }
        .lp-nav-link {
          padding: 0.375rem 0.75rem; border-radius: 7px; border: none;
          background: transparent; color: #a1a1aa; font-size: 0.875rem; font-weight: 500;
          cursor: pointer; transition: color 0.15s, background 0.15s;
        }
        .lp-nav-link:hover { color: #f4f4f5; background: rgba(255,255,255,0.06); }
        .lp-nav-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
        .lp-mobile-toggle {
          display: none; background: none; border: none;
          color: #f4f4f5; cursor: pointer; margin-left: auto; padding: 0.25rem;
        }
        .lp-mobile-menu {
          padding: 1rem 2rem;
          background: rgba(9,9,11,0.95); backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; gap: 0.25rem;
        }
        .lp-mobile-link {
          padding: 0.625rem 0; border: none; background: none;
          color: #a1a1aa; font-size: 1rem; text-align: left; cursor: pointer;
        }

        /* ── Buttons ── */
        .lp-btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; border-radius: 9px; border: none;
          background: linear-gradient(135deg, #7c5cff, #a78bfa 40%, #ff6b9d);
          background-size: 200% 100%;
          color: white; font-size: 0.875rem; font-weight: 600; cursor: pointer;
          transition: background-position 0.3s, box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 2px 20px rgba(124,92,255,0.3);
        }
        .lp-btn-primary:hover {
          background-position: 100% 0;
          box-shadow: 0 4px 30px rgba(124,92,255,0.45);
          transform: translateY(-1px);
        }
        .lp-btn-primary:active { transform: translateY(0); }
        .lp-btn-lg { padding: 0.75rem 1.5rem; font-size: 1rem; border-radius: 12px; }
        .lp-btn-ghost {
          padding: 0.5rem 0.875rem; border-radius: 9px; border: none;
          background: transparent; color: #a1a1aa; font-size: 0.875rem; font-weight: 500; cursor: pointer;
          transition: color 0.15s;
        }
        .lp-btn-ghost:hover { color: #f4f4f5; }
        .lp-btn-outline {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.1); background: transparent;
          color: #a1a1aa; font-size: 0.875rem; font-weight: 500; cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .lp-btn-outline:hover { border-color: rgba(255,255,255,0.2); color: #f4f4f5; background: rgba(255,255,255,0.03); }
        .lp-btn-outline.lp-btn-lg { padding: 0.75rem 1.5rem; border-radius: 12px; }

        /* ── Hero ── */
        .lp-hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 7rem 2rem 3rem;
          z-index: 1;
        }
        .lp-hero-inner {
          text-align: center; max-width: 760px;
          display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
          animation: fade-up 0.8s ease-out both;
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lp-hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.375rem 1rem; border-radius: 9999px;
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.02em;
          background: rgba(124,92,255,0.12); color: #b09aff;
          border: 1px solid rgba(124,92,255,0.25);
          animation: fade-up 0.8s ease-out 0.1s both;
        }
        .lp-hero-title {
          font-size: clamp(2.5rem, 6vw, 3.75rem); font-weight: 900;
          line-height: 1.15; letter-spacing: -0.035em; color: #f4f4f5; margin: 0;
          animation: fade-up 0.8s ease-out 0.2s both;
        }
        .lp-title-word {
          display: inline;
          background: linear-gradient(135deg, #7c5cff 0%, #a78bfa 50%, #ff6b9d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          opacity: 0;
          transform: translateY(16px);
          filter: blur(6px);
          transition: opacity 0.4s ease, transform 0.4s ease, filter 0.4s ease, background-position 3s ease;
        }
        .lp-title-word.lp-title-visible {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
          animation: title-glow 3s ease-in-out infinite;
        }
        @keyframes title-glow {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        .lp-title-cursor {
          display: inline-block;
          width: 3px;
          height: 0.9em;
          background: linear-gradient(180deg, #7c5cff, #ff6b9d);
          margin-left: 3px;
          vertical-align: text-bottom;
          border-radius: 2px;
          animation: cursor-blink 0.85s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(124,92,255,0.6), 0 0 16px rgba(124,92,255,0.3);
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .lp-hero-gradient {
          background: linear-gradient(135deg, #7c5cff 0%, #a78bfa 40%, #ff6b9d 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .lp-hero-sub {
          font-size: 1.0625rem; color: #a1a1aa; line-height: 1.75; max-width: 520px;
          animation: fade-up 0.8s ease-out 0.3s both;
        }
        .lp-hero-ctas {
          display: flex; align-items: center; gap: 0.875rem; flex-wrap: wrap; justify-content: center;
          animation: fade-up 0.8s ease-out 0.4s both;
        }
        .lp-hero-trust {
          display: flex; align-items: center; gap: 0.625rem; font-size: 0.8125rem; color: #71717a;
          animation: fade-up 0.8s ease-out 0.5s both;
        }
        .lp-stars { display: flex; gap: 2px; }

        /* ── Mockup ── */
        .lp-hero-visual {
          position: relative; width: 100%; max-width: 900px; margin-top: 3.5rem;
          animation: fade-up 1s ease-out 0.5s both;
        }
        .lp-mockup {
          background: #18181b; border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 0 0 1px rgba(124,92,255,0.12), 0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(124,92,255,0.06);
        }
        .lp-mockup-bar {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.625rem 1rem; background: #27272a;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lp-dots { display: flex; gap: 0.375rem; flex-shrink: 0; }
        .lp-dots span { width: 0.625rem; height: 0.625rem; border-radius: 50%; }
        .lp-tabs { display: flex; gap: 0.25rem; flex: 1; justify-content: center; }
        .lp-tab {
          display: flex; align-items: center; gap: 0.3rem;
          padding: 0.25rem 0.625rem; border-radius: 6px;
          font-size: 0.6875rem; color: #52525b; cursor: pointer;
        }
        .lp-tab-active { background: rgba(124,92,255,0.15); color: #b09aff; }
        .lp-bar-actions { display: flex; gap: 0.25rem; }
        .lp-bar-btn {
          width: 1.375rem; height: 1.375rem; border-radius: 6px;
          background: rgba(255,255,255,0.05); color: #71717a;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-bar-accent { background: rgba(124,92,255,0.25); color: #b09aff; }
        .lp-mockup-body { display: flex; min-height: 360px; }
        .lp-sidebar {
          width: 8.5rem; flex-shrink: 0; padding: 0.875rem 0.375rem;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; gap: 0.125rem;
        }
        .lp-side-item {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.4375rem 0.5rem; border-radius: 7px;
          font-size: 0.625rem; color: #52525b; cursor: pointer; white-space: nowrap;
        }
        .lp-side-item.active { background: rgba(124,92,255,0.15); color: #b09aff; }
        .lp-main-area { flex: 1; padding: 1rem; display: flex; flex-direction: column; gap: 0.875rem; overflow: hidden; }
        .lp-main-header { display: flex; align-items: center; justify-content: space-between; }
        .lp-welcome { font-size: 0.8125rem; font-weight: 700; color: #f4f4f5; }
        .lp-main-btns { display: flex; gap: 0.375rem; }
        .lp-main-btn {
          width: 1.5rem; height: 1.5rem; border-radius: 6px;
          background: rgba(255,255,255,0.05); color: #71717a;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-main-accent { background: rgba(124,92,255,0.25); color: #b09aff; width: auto; padding: 0 0.5rem; gap: 0.25rem; font-size: 0.625rem; font-weight: 600; }
        .lp-project-cards { display: flex; flex-direction: column; gap: 0.5rem; }
        .lp-proj-card {
          background: #27272a; border-radius: 9px; padding: 0.625rem 0.75rem;
          border-left: 3px solid var(--c, #7c5cff);
        }
        .lp-proj-top { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.375rem; }
        .lp-proj-tag {
          font-size: 0.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--c, #7c5cff); background: rgba(255,255,255,0.05);
          padding: 0.1rem 0.375rem; border-radius: 4px;
        }
        .lp-proj-name { font-size: 0.6875rem; font-weight: 600; color: #e4e4e7; }
        .lp-proj-bar { height: 3px; background: rgba(255,255,255,0.07); border-radius: 9999px; overflow: hidden; margin-bottom: 0.375rem; }
        .lp-proj-fill { height: 100%; background: var(--c, #7c5cff); border-radius: 9999px; opacity: 0.7; }
        .lp-proj-footer { display: flex; align-items: center; justify-content: space-between; font-size: 0.5625rem; color: #52525b; }
        .lp-ai-chip {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.3125rem 0.625rem; border-radius: 6px;
          background: rgba(124,92,255,0.1); color: #b09aff;
          font-size: 0.5625rem; font-weight: 500;
          border: 1px solid rgba(124,92,255,0.2); align-self: flex-start;
        }
        /* Floating cards */
        .lp-float {
          position: absolute; display: flex; align-items: center; gap: 0.625rem;
          padding: 0.5rem 0.875rem; border-radius: 11px;
          background: #18181b; border: 1px solid rgba(255,255,255,0.1);
          font-size: 0.6875rem; color: #a1a1aa;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          white-space: nowrap; z-index: 10;
        }
        .lp-fi {
          width: 1.625rem; height: 1.625rem; border-radius: 7px;
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .lp-fi-title { font-weight: 600; color: #f4f4f5; font-size: 0.6875rem; }
        .lp-fi-sub { color: #71717a; font-size: 0.625rem; }
        .lp-float-1 { top: 12%; right: -2.5rem; animation: float-card 4s ease-in-out infinite; }
        .lp-float-2 { bottom: 18%; left: -3rem; animation: float-card 5s ease-in-out infinite 1.5s; }
        .lp-float-3 { top: 5%; left: -2.5rem; animation: float-card 3.5s ease-in-out infinite 0.8s; }
        @keyframes float-card {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* ── Logo Cloud ── */
        .lp-logos {
          padding: 2.5rem 2rem; border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; z-index: 1;
          background: rgba(255,255,255,0.015);
        }
        .lp-logos-label { text-align: center; font-size: 0.75rem; color: #52525b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin-bottom: 1.25rem; }
        .lp-logos-list { display: flex; align-items: center; justify-content: center; gap: 2.5rem; flex-wrap: wrap; }
        .lp-logos-item { font-size: 0.875rem; font-weight: 700; color: #52525b; letter-spacing: -0.01em; transition: color 0.2s; cursor: default; }
        .lp-logos-item:hover { color: #71717a; }

        /* ── Sections ── */
        .lp-section { padding: 6rem 0; position: relative; z-index: 1; }
        .lp-section-alt { background: rgba(255,255,255,0.02); }
        .lp-section-head { text-align: center; margin-bottom: 3.5rem; }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.25rem 0.75rem; border-radius: 9999px;
          font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          background: rgba(124,92,255,0.12); color: #b09aff;
          border: 1px solid rgba(124,92,255,0.25); margin-bottom: 1.25rem;
        }
        .lp-section-title {
          font-size: clamp(1.875rem, 4vw, 2.5rem); font-weight: 900;
          color: #f4f4f5; letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 0.875rem;
        }
        .lp-grad-text {
          background: linear-gradient(135deg, #7c5cff, #ff6b9d);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .lp-section-sub { font-size: 1rem; color: #71717a; max-width: 480px; margin: 0 auto; line-height: 1.7; }

        /* ── Features ── */
        .lp-features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.125rem;
        }
        .lp-feat-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.5rem;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .lp-feat-card:hover { border-color: rgba(124,92,255,0.3); background: rgba(124,92,255,0.04); transform: translateY(-3px); }
        .lp-feat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .lp-feat-icon { width: 2.625rem; height: 2.625rem; border-radius: 11px; display: flex; align-items: center; justify-content: center; }
        .lp-feat-tag { font-size: 0.5625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.2rem 0.5rem; border-radius: 5px; }
        .lp-feat-title { font-size: 1rem; font-weight: 700; color: #f4f4f5; margin-bottom: 0.375rem; }
        .lp-feat-desc { font-size: 0.875rem; color: #71717a; line-height: 1.65; margin: 0; }

        /* ── Steps ── */
        .lp-steps {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; position: relative;
        }
        .lp-step {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 1.75rem 1.25rem; position: relative; text-align: center;
          transition: border-color 0.2s, transform 0.2s;
        }
        .lp-step:hover { border-color: rgba(124,92,255,0.25); transform: translateY(-4px); }
        .lp-step-num { font-size: 3rem; font-weight: 900; opacity: 0.25; line-height: 1; margin-bottom: 0.75rem; }
        .lp-step-icon { width: 3.25rem; height: 3.25rem; border-radius: 13px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
        .lp-step-title { font-size: 0.9375rem; font-weight: 700; color: #f4f4f5; margin-bottom: 0.375rem; }
        .lp-step-desc { font-size: 0.8125rem; color: #71717a; line-height: 1.65; margin: 0; }
        .lp-step-arrow { position: absolute; right: -1.375rem; top: 50%; transform: translateY(-50%); color: #3f3f46; z-index: 2; display: flex; align-items: center; }

        /* ── Stats ── */
        .lp-stats {
          padding: 3.5rem 0; border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.015); position: relative; z-index: 1;
        }
        .lp-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; text-align: center; }
        .lp-stat-value {
          font-size: 2.25rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.1;
          background: linear-gradient(135deg, #7c5cff, #ff6b9d);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .lp-stat-label { font-size: 0.8125rem; color: #71717a; margin-top: 0.25rem; font-weight: 500; }

        /* ── Templates ── */
        .lp-templates-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        .lp-tpl-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; overflow: hidden; cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
        }
        .lp-tpl-card:hover { border-color: rgba(124,92,255,0.3); transform: translateY(-4px); }
        .lp-tpl-preview {
          height: 150px; display: flex; align-items: center; justify-content: center; position: relative;
        }
        .lp-tpl-icon { width: 3.5rem; height: 3.5rem; border-radius: 13px; display: flex; align-items: center; justify-content: center; }
        .lp-tpl-screens {
          position: absolute; bottom: 0.625rem; right: 0.75rem;
          font-size: 0.5625rem; font-weight: 600; color: #71717a;
          background: rgba(0,0,0,0.5); padding: 0.2rem 0.5rem; border-radius: 9999px;
        }
        .lp-tpl-info { padding: 1rem; }
        .lp-tpl-info h3 { font-size: 0.9375rem; font-weight: 700; color: #f4f4f5; margin-bottom: 0.25rem; }
        .lp-tpl-info p { font-size: 0.75rem; color: #71717a; }

        /* ── Testimonials ── */
        .lp-tests-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.125rem; }
        .lp-test-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.5rem;
          transition: border-color 0.2s, transform 0.2s;
        }
        .lp-test-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-3px); }
        .lp-test-stars { display: flex; gap: 2px; margin-bottom: 0.875rem; }
        .lp-test-text { font-size: 0.9375rem; color: #a1a1aa; line-height: 1.7; margin-bottom: 1.125rem; font-style: italic; }
        .lp-test-author { display: flex; align-items: center; gap: 0.75rem; }
        .lp-test-avatar {
          width: 2.125rem; height: 2.125rem; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.625rem; font-weight: 800; flex-shrink: 0;
        }
        .lp-test-name { font-size: 0.875rem; font-weight: 600; color: #f4f4f5; }
        .lp-test-role { font-size: 0.75rem; color: #71717a; }

        /* ── Pricing ── */
        .lp-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: start; }
        .lp-price-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 2rem; position: relative;
          transition: transform 0.2s;
        }
        .lp-price-card:hover { transform: translateY(-4px); }
        .lp-price-featured {
          background: linear-gradient(160deg, rgba(124,92,255,0.1), rgba(255,107,157,0.05));
          border-color: rgba(124,92,255,0.35);
          transform: scale(1.02);
        }
        .lp-price-featured:hover { transform: scale(1.02) translateY(-4px); }
        .lp-price-badge {
          position: absolute; top: -0.75rem; left: 50%; transform: translateX(-50%);
          padding: 0.25rem 0.875rem; border-radius: 9999px;
          background: linear-gradient(135deg, #7c5cff, #ff6b9d);
          color: white; font-size: 0.6875rem; font-weight: 700; white-space: nowrap;
        }
        .lp-price-name { font-size: 1rem; font-weight: 700; color: #f4f4f5; margin-bottom: 0.75rem; }
        .lp-price-amount { display: flex; align-items: baseline; gap: 0.25rem; margin-bottom: 0.5rem; }
        .lp-price-num { font-size: 2.25rem; font-weight: 900; color: #f4f4f5; letter-spacing: -0.03em; }
        .lp-price-period { font-size: 0.875rem; color: #71717a; }
        .lp-price-desc { font-size: 0.8125rem; color: #71717a; margin-bottom: 1.5rem; line-height: 1.5; }
        .lp-price-features { list-style: none; padding: 0; margin: 0 0 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .lp-price-features li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #a1a1aa; }
        .lp-price-btn { width: 100%; justify-content: center; }

        /* ── FAQ ── */
        .lp-faq-container { max-width: 680px; }
        .lp-faq-list { display: flex; flex-direction: column; }
        .lp-faq-item { border-bottom: 1px solid rgba(255,255,255,0.06); }
        .lp-faq-q {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 0; background: none; border: none;
          color: #f4f4f5; font-size: 0.9375rem; font-weight: 600; cursor: pointer; text-align: left; gap: 1rem;
        }
        .lp-faq-open .lp-faq-q { color: #b09aff; }
        .lp-faq-icon {
          flex-shrink: 0; transition: transform 0.2s;
        }
        .lp-faq-open .lp-faq-icon { transform: rotate(45deg); }
        .lp-faq-a { font-size: 0.875rem; color: #71717a; line-height: 1.75; padding-bottom: 1.25rem; margin: 0; }

        /* ── CTA Section ── */
        .lp-cta-section {
          position: relative; padding: 8rem 2rem;
          display: flex; align-items: center; justify-content: center;
          text-align: center; overflow: hidden; z-index: 1;
        }
        .lp-cta-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(124,92,255,0.18), transparent);
          pointer-events: none;
        }
        .lp-cta-inner { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
        .lp-final-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.375rem 1rem; border-radius: 9999px;
          background: rgba(124,92,255,0.12); border: 1px solid rgba(124,92,255,0.25);
          color: #b09aff; font-size: 0.8125rem; font-weight: 600;
        }
        .lp-cta-title { font-size: clamp(2.25rem, 5vw, 3.25rem); font-weight: 900; color: #f4f4f5; letter-spacing: -0.03em; line-height: 1.1; margin: 0; }
        .lp-cta-sub { font-size: 1.0625rem; color: #71717a; max-width: 460px; line-height: 1.7; }
        .lp-cta-btns { display: flex; gap: 0.875rem; flex-wrap: wrap; justify-content: center; }

        /* ── Footer ── */
        .lp-footer {
          background: #08080b;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 4rem 0 0;
          position: relative;
          z-index: 1;
        }
        .lp-footer::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,92,255,0.5) 30%, rgba(255,107,157,0.5) 70%, transparent);
        }
        .lp-footer-top {
          display: grid;
          grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 1.3fr;
          gap: 2.5rem;
          padding-bottom: 3rem;
        }
        .lp-footer-brand {}
        .lp-footer-brand .lp-logo { margin-bottom: 1rem; }
        .lp-footer-brand p { font-size: 0.8125rem; color: #52525b; max-width: 240px; line-height: 1.7; }
        .lp-footer-social-row { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
        .lp-social-icon {
          width: 2.25rem; height: 2.25rem;
          border-radius: 0.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: #71717a;
          transition: all 0.2s;
          text-decoration: none;
        }
        .lp-social-icon:hover {
          background: rgba(124,92,255,0.15);
          border-color: rgba(124,92,255,0.35);
          color: #a78bfa;
          transform: translateY(-2px);
        }
        .lp-footer-links { display: contents; }
        .lp-footer-col { display: flex; flex-direction: column; gap: 0.625rem; }
        .lp-footer-col h4 {
          font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: #f4f4f5; margin-bottom: 0.5rem;
        }
        .lp-footer-link {
          background: none; border: none; color: #71717a; font-size: 0.8125rem;
          text-align: left; cursor: pointer; padding: 0; text-decoration: none;
          transition: color 0.15s;
          line-height: 1.6;
        }
        .lp-footer-link:hover { color: #a78bfa; }
        .lp-footer-newsletter {}
        .lp-footer-newsletter h4 {
          font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: #f4f4f5; margin-bottom: 0.5rem;
        }
        .lp-footer-newsletter p { font-size: 0.8125rem; color: #71717a; line-height: 1.7; margin-bottom: 1rem; }
        .lp-newsletter-form { display: flex; gap: 0.5rem; align-items: center; }
        .lp-newsletter-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.625rem;
          padding: 0.625rem 0.875rem;
          color: #f4f4f5;
          font-size: 0.8125rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .lp-newsletter-input::placeholder { color: #52525b; }
        .lp-newsletter-input:focus {
          border-color: rgba(124,92,255,0.6);
          box-shadow: 0 0 0 3px rgba(124,92,255,0.1);
        }
        .lp-newsletter-btn {
          background: linear-gradient(135deg, #7c5cff, #9b6dff);
          border: none; border-radius: 0.625rem;
          width: 2.75rem; height: 2.75rem;
          color: white;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s;
        }
        .lp-newsletter-btn:hover {
          background: linear-gradient(135deg, #6b4fe6, #8a5cf0);
          transform: translateX(2px);
        }
        .lp-newsletter-success {
          display: inline-flex; align-items: center; gap: 0.375rem;
          font-size: 0.75rem; color: #4ade80 !important;
          margin-top: 0.625rem !important;
        }
        .lp-footer-bottom {
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 0.75rem;
        }
        .lp-footer-bottom p { font-size: 0.8125rem; color: #52525b; }
        .lp-footer-bottom-links { display: flex; gap: 1.5rem; }
        .lp-footer-bottom-links a {
          font-size: 0.8125rem; color: #52525b; text-decoration: none; transition: color 0.15s;
        }
        .lp-footer-bottom-links a:hover { color: #a78bfa; }

        /* ── Responsive ── */
        /* ── Nav responsive — all screens ── */
        /* Tablet and below: hide desktop nav, show hamburger */
        @media (max-width: 1024px) {
          .lp-nav-links, .lp-nav-actions { display: none; }
          .lp-mobile-toggle { display: flex; }
          .lp-nav-inner { gap: 1rem; }
          .lp-logo-name { font-size: 0.875rem; }
          .lp-logo-sub { display: none; }
          .lp-nav { padding: 0.75rem 1.25rem; }
        }
        /* Desktop only: full nav visible */
        @media (min-width: 1025px) {
          .lp-mobile-toggle { display: none; }
          .lp-mobile-menu { display: none !important; }
        }
        @media (max-width: 1024px) {
          .lp-features-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-templates-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-tests-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
          .lp-price-featured { transform: none; }
          .lp-price-featured:hover { transform: translateY(-4px); }
          .lp-steps { grid-template-columns: repeat(2, 1fr); }
          .lp-step-arrow { display: none; }
          .lp-footer-inner { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .lp-footer-top { grid-template-columns: 1fr 1fr; gap: 2.5rem; }
          .lp-footer-newsletter { grid-column: 1 / -1; }
          .lp-footer-links { display: none; }
          .lp-footer-brand p { max-width: 100%; }
        }
        @media (max-width: 768px) {
          .lp-nav-links, .lp-nav-actions { display: none; }
          .lp-mobile-toggle { display: flex; }
          .lp-hero { padding: 6rem 1.25rem 2.5rem; }
          .lp-hero-title { font-size: 2.25rem; }
          .lp-hero-visual { max-width: 100%; }
          .lp-float { display: none; }
          .lp-features-grid, .lp-steps, .lp-tests-grid, .lp-templates-grid { grid-template-columns: 1fr; }
          .lp-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-section { padding: 4rem 0; }
          .lp-footer-inner { grid-template-columns: 1fr; gap: 2rem; }
          .lp-footer-top { grid-template-columns: 1fr; gap: 2rem; }
          .lp-footer-newsletter { grid-column: auto; }
          .lp-footer-links { display: none; }
          .lp-footer-brand {}
          .lp-footer-brand p { max-width: 100%; }
          .lp-newsletter-form { flex-direction: column; }
          .lp-newsletter-input { width: 100%; }
          .lp-newsletter-btn { width: 100%; height: 2.75rem; justify-content: center; gap: 0.5rem; }
          .lp-footer-bottom { flex-direction: column; text-align: center; gap: 1rem; }
          .lp-footer-bottom-links { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
