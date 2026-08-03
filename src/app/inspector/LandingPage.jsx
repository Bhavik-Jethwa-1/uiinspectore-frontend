import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Shield, Eye, Wand2, AlertTriangle, CheckCircle,
  ArrowRight, Layers, Users, Accessibility, Palette,
  ChevronRight, Star, MousePointerClick, ZoomIn
} from 'lucide-react';
import InspectorLayout from './layouts/InspectorLayout';
import { ACCENT } from './constants/theme';

const FEATURES = [
  {
    icon: Eye,
    title: 'Screenshot Review',
    desc: 'Upload any UI screenshot and get instant AI analysis with scores for UX, hierarchy, clarity, accessibility, and consistency.',
    color: ACCENT,
  },
  {
    icon: Users,
    title: 'Persona-Based Review',
    desc: 'See your UI through First-time Users, Non-Technical Users, Junior Developers, DevOps Engineers, and Product Designers.',
    color: '#10b981',
  },
  {
    icon: AlertTriangle,
    title: 'Smart Annotations',
    desc: 'AI detects issues and places numbered markers directly on your screenshot. Click any marker to zoom, highlight, and understand the problem.',
    color: '#f59e0b',
  },
  {
    icon: CheckCircle,
    title: 'Actionable Fixes',
    desc: 'Every suggestion includes the problem, the reason it matters, and a specific fix — no generic advice, only concrete improvements.',
    color: '#ef4444',
  },
  {
    icon: Wand2,
    title: 'Before / After Compare',
    desc: 'Upload one screenshot. AI generates an improved version preserving your layout and branding. Compare with swipe, zoom, and pan.',
    color: '#8b5cf6',
  },
];

const PERSONAS = [
  { label: 'First-time User', icon: Star },
  { label: 'Non-Technical User', icon: Users },
  { label: 'Junior Developer', icon: Zap },
  { label: 'DevOps Engineer', icon: Shield },
  { label: 'Product Designer', icon: Palette },
];

const STEPS = [
  { n: '01', title: 'Create Project', desc: 'Name your project and upload a UI screenshot' },
  { n: '02', title: 'Select Persona', desc: 'Choose who will use the interface' },
  { n: '03', title: 'Enter Page Goal', desc: 'Describe what this page should accomplish' },
  { n: '04', title: 'AI Review', desc: 'Get scores, annotations, and suggestions instantly' },
  { n: '05', title: 'Review Results', desc: 'Explore issues, apply fixes, compare before/after' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('inspector_token');
    if (token) navigate('/inspector');
  }, [navigate]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-[15px]">UI Inspector</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/inspector/login')}
            className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/inspector/register')}
            className="px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90"
            style={{ background: ACCENT }}>
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${ACCENT}15, transparent)`,
        }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium mb-6"
            style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
            <Zap size={11} /> AI-Powered UI Analysis
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight" style={{ color: 'var(--text)' }}>
            See Your UI Through<br />
            <span style={{ color: ACCENT }}>Your Users' Eyes</span>
          </h1>

          <p className="text-[16px] max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Upload any screenshot. Get instant AI review with scores, numbered annotations,
            practical fix suggestions, and AI-generated before/after comparisons.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/inspector/register')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[14px] font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: ACCENT }}>
              Start Free Review <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/inspector/login')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[14px] font-medium transition-all hover:opacity-70"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              Sign In
            </button>
          </div>
        </motion.div>

        {/* Hero screenshot mockup */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 max-w-4xl mx-auto">
          <div className="rounded-2xl border overflow-hidden shadow-2xl" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} />
              <div className="flex-1 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
                uiinspectore.167.233.101.27.nip.io/inspector
              </div>
            </div>
            <div className="relative" style={{ background: '#0a0a0a', minHeight: 300 }}>
              <img
                src="https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1200&q=80"
                alt="UI Dashboard Preview"
                className="w-full object-cover opacity-80"
                style={{ height: 340 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {/* Floating annotation markers */}
              {[
                { n: 1, x: '20%', y: '25%', color: '#ef4444' },
                { n: 2, x: '55%', y: '45%', color: '#f59e0b' },
                { n: 3, x: '75%', y: '65%', color: '#3b82f6' },
              ].map(a => (
                <div key={a.n}
                  className="absolute flex items-center justify-center rounded-full font-bold text-white shadow-lg"
                  style={{
                    left: a.x, top: a.y, transform: 'translate(-50%,-50%)',
                    width: 26, height: 26, background: a.color, fontSize: 11,
                  }}>
                  {a.n}
                </div>
              ))}
              {/* Score ring overlay */}
              <div className="absolute top-4 right-4 rounded-2xl p-3 backdrop-blur-md"
                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-[22px] font-bold text-white">87<span className="text-[11px] text-white/60">/100</span></div>
                <div className="text-[10px] text-white/60">Overall</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Personas */}
      <section className="px-6 py-16 border-y" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[12px] font-medium mb-5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Review from 5 different perspectives
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PERSONAS.map(p => {
              const Icon = p.icon;
              return (
                <div key={p.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <Icon size={13} style={{ color: ACCENT }} /> {p.label}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need to improve your UI</h2>
            <p className="text-[15px]" style={{ color: 'var(--text-muted)' }}>
              From screenshot to actionable insights in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-5 border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${f.color}15` }}>
                    <Icon size={20} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text)' }}>{f.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </motion.div>
              );
            })}

            {/* How it works — spans full width */}
            <div className="md:col-span-2 lg:col-span-3">
              <h3 className="text-[18px] font-bold mb-6 text-center">How it works</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {STEPS.map((s, i) => (
                  <motion.div key={s.n} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                    className="relative rounded-2xl p-4 text-center border"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="text-[28px] font-black mb-2" style={{ color: `${ACCENT}30` }}>{s.n}</div>
                    <div className="text-[12px] font-bold mb-1" style={{ color: 'var(--text)' }}>{s.title}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                    {i < STEPS.length - 1 && (
                      <ChevronRight size={14} className="absolute right-[-14px] top-1/2 -translate-y-1/2 hidden sm:block" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center" style={{ background: 'var(--surface)' }}>
        <div className="max-w-lg mx-auto">
          <MousePointerClick size={40} style={{ color: ACCENT, margin: '0 auto 16px' }} />
          <h2 className="text-2xl font-bold mb-3">Ready to improve your UI?</h2>
          <p className="text-[14px] mb-8" style={{ color: 'var(--text-muted)' }}>
            Upload your first screenshot and get a comprehensive AI review in under 2 minutes.
          </p>
          <button onClick={() => navigate('/inspector/register')}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[14px] font-bold text-white mx-auto transition-all hover:opacity-90"
            style={{ background: ACCENT }}>
            Create Free Account <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t text-center text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        UI Inspector AI — Free &amp; Open Source Models
      </footer>
    </div>
  );
}
