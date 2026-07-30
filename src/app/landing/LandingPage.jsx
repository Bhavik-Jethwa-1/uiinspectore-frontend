import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Shield, Layers, Sparkles, Wand2, Eye, MessageCircle,
  Download, Star, ArrowRight, Check, Globe, Bot, Code2, Palette,
  Clock, Users, Cpu, BarChart3,
} from 'lucide-react';

const ACCENT     = '#7c5cff';
const ACCENT_PINK = '#ff6b9d';
const SUCCESS    = '#10b981';

const FEATURES = [
  {
    icon: Wand2, title: 'AI Auto Designer',
    desc: 'Generate complete UI screens from text prompts in seconds. Production-ready code.',
    color: ACCENT,
  },
  {
    icon: Eye, title: 'AI UI Review',
    desc: 'Upload any screenshot and get actionable UX feedback, accessibility insights, and improvement suggestions.',
    color: '#06b6d4',
  },
  {
    icon: MessageCircle, title: 'AI Chat',
    desc: 'Multi-model AI chat with Groq, OpenAI, and OpenRouter. Ask anything about your designs.',
    color: SUCCESS,
  },
  {
    icon: Sparkles, title: 'AI Redesign',
    desc: 'Take any screenshot and generate a modern redesign with improved UX patterns.',
    color: ACCENT_PINK,
  },
  {
    icon: Download, title: 'Code Export',
    desc: 'Export designs to React, Next.js, Vue, or Tailwind CSS with a single click.',
    color: '#f59e0b',
  },
  {
    icon: Layers, title: 'Screenshot Analysis',
    desc: 'Analyze screenshots for UI patterns, color palettes, typography, and component structures.',
    color: '#8b5cf6',
  },
];

const STATS = [
  { value: '50K+', label: 'Designs Generated' },
  { value: '15+', label: 'AI Models' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User Rating' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for trying out AI design.',
    color: '#6b7280',
    cta: 'Get Started',
    features: ['10 AI generations/month', 'Basic templates', 'PNG export', 'Community support'],
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    desc: 'For designers and developers who need more.',
    color: ACCENT,
    popular: true,
    cta: 'Start Pro Trial',
    features: ['Unlimited AI generations', 'All templates', 'React/Next.js/Vue export', 'Priority support', 'API access'],
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    desc: 'Collaborate with your entire team.',
    color: '#f59e0b',
    cta: 'Contact Sales',
    features: ['Everything in Pro', '5 team members', 'Shared workspace', 'Role management', 'Dedicated support'],
  },
];

const AI_MODELS = [
  { name: 'Llama 3.3 70B',     provider: 'Groq',      badge: 'Fastest' },
  { name: 'GPT-4o',            provider: 'OpenAI',    badge: 'Most capable' },
  { name: 'Gemini 2.0 Flash', provider: 'Google',    badge: 'Best value' },
  { name: 'Mistral 22B',       provider: 'Groq',      badge: 'Efficient' },
  { name: 'Qwen 2.5 72B',     provider: 'OpenRouter', badge: 'Open source' },
  { name: 'DeepSeek V3',       provider: 'OpenRouter', badge: 'Smart' },
];

function FadeUp({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[150px]"
            style={{ background: `${ACCENT}18` }} />
          <div className="absolute top-20 right-10 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: `${ACCENT_PINK}12` }} />
          {/* Grid */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
              backgroundSize: '48px 48px',
            }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold mb-8"
            style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
            <Sparkles size={12} />
            Powered by multiple AI models — Groq, OpenAI, Google, and more
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[52px] md:text-[72px] font-black leading-[1.05] tracking-tight mb-6"
          >
            <span style={{
              background: `linear-gradient(135deg, #fff 0%, ${ACCENT} 50%, ${ACCENT_PINK} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              AI-Powered UI Design
            </span>
            <br />
            <span className="text-white">Studio in Your Browser</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[18px] text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Generate stunning UI designs from text prompts. Inspect and analyze screenshots with AI.
            Export to React, Next.js, Vue, or Tailwind CSS. All free to start.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate('/auth/register')}
              className="flex items-center gap-2 px-8 py-4 text-[15px] font-bold text-white rounded-2xl transition-all"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`,
                boxShadow: `0 8px 40px ${ACCENT}44`,
              }}>
              Start Creating Free <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/app/autodesigner')}
              className="flex items-center gap-2 px-8 py-4 text-[15px] font-semibold text-white rounded-2xl border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              <Wand2 size={16} /> Try AI Designer
            </button>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative rounded-3xl overflow-hidden border"
            style={{
              borderColor: `${ACCENT}25`,
              boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px ${ACCENT}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}>
            <div className="h-8 flex items-center gap-2 px-4" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                <span key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
              <span className="ml-4 text-[10px] text-gray-600">uiinspectore.167.233.101.27.nip.io</span>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #0d0b1e 0%, #1a1040 100%)',
              minHeight: 420,
            }} className="p-6">
              {/* Mock dashboard */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Total Designs', value: '2,847', trend: '+12%' },
                  { label: 'AI Generations', value: '18.4K', trend: '+28%' },
                  { label: 'Export Rate', value: '94.2%', trend: '+3%' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-[11px] text-gray-500 mb-1">{stat.label}</div>
                    <div className="text-[22px] font-black text-white">{stat.value}</div>
                    <div className="text-[11px] font-semibold mt-1" style={{ color: SUCCESS }}>{stat.trend}</div>
                  </div>
                ))}
              </div>
              {/* Mock screen grid */}
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden" style={{
                    background: `linear-gradient(135deg, hsl(${i * 45 + 200},60%,${20 + i * 3}%), hsl(${i * 45 + 200},40%,${15 + i * 2}%))`,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div className="w-full h-3 bg-white/5" />
                    <div className="p-1.5 space-y-1">
                      <div className="h-1.5 bg-white/10 rounded w-3/4" />
                      <div className="h-1.5 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08}>
              <div className="text-center">
                <div className="text-[32px] font-black text-white mb-1">{s.value}</div>
                <div className="text-[13px] text-gray-500">{s.label}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold mb-4"
                style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                <Zap size={11} /> AI-Powered Features
              </div>
              <h2 className="text-[38px] font-black text-white mb-4">Everything you need to design faster</h2>
              <p className="text-[16px] text-gray-400 max-w-2xl mx-auto">
                From prompt to production-ready code in seconds. Our AI understands UI patterns, design systems, and modern frameworks.
              </p>
            </FadeUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.08}>
                <div className="group rounded-2xl p-6 border transition-all hover:-translate-y-1 cursor-default"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: `${f.color}15`,
                    boxShadow: 'none',
                  }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${f.color}15` }}>
                    <f.icon size={22} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-[16px] font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-[13px] text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Models ─────────────────────────────────────────────────── */}
      <section id="models" className="py-24 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold mb-4"
              style={{ background: '#06b6d415', color: '#06b6d4', border: '1px solid #06b6d425' }}>
              <Cpu size={11} /> Multiple AI Providers
            </div>
            <h2 className="text-[38px] font-black text-white mb-4">Choose your AI model</h2>
            <p className="text-[16px] text-gray-400 mb-12">
              We route requests to the best provider for your task — Groq for speed, OpenAI for quality, OpenRouter for variety.
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {AI_MODELS.map((m, i) => (
              <FadeUp key={m.name} delay={i * 0.06}>
                <div className="flex items-center justify-between p-4 rounded-2xl border transition-all hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black"
                      style={{ background: `${ACCENT}15`, color: ACCENT }}>
                      {m.provider.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white">{m.name}</div>
                      <div className="text-[11px] text-gray-500">{m.provider}</div>
                    </div>
                  </div>
                  {m.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${SUCCESS}15`, color: SUCCESS }}>
                      {m.badge}
                    </span>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold mb-4"
                style={{ background: '#f59e0b15', color: '#f59e0b', border: '1px solid #f59e0b25' }}>
                <BarChart3 size={11} /> Simple Pricing
              </div>
              <h2 className="text-[38px] font-black text-white mb-4">Start free. Scale when ready.</h2>
              <p className="text-[16px] text-gray-400">
                No hidden fees. Cancel anytime. All plans include core AI features.
              </p>
            </FadeUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => (
              <FadeUp key={plan.name} delay={i * 0.1}>
                <div className={`relative rounded-3xl border p-6 flex flex-col ${plan.popular ? 'scale-[1.03]' : ''}`}
                  style={{
                    background: plan.popular ? `${plan.color}08` : 'rgba(255,255,255,0.02)',
                    borderColor: plan.popular ? `${plan.color}40` : 'rgba(255,255,255,0.06)',
                    boxShadow: plan.popular ? `0 0 60px ${plan.color}15` : 'none',
                  }}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}aa)` }}>
                      Most Popular
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-[18px] font-black text-white mb-1">{plan.name}</h3>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-[32px] font-black" style={{ color: plan.color }}>{plan.price}</span>
                      <span className="text-[13px] text-gray-500 mb-1">{plan.period}</span>
                    </div>
                    <p className="text-[12px] text-gray-400">{plan.desc}</p>
                  </div>

                  <button
                    onClick={() => navigate('/auth/register')}
                    className="w-full py-3 rounded-xl text-[13px] font-bold mb-6 transition-all"
                    style={plan.popular
                      ? { background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, color: '#fff', boxShadow: `0 4px 20px ${plan.color}33` }
                      : { background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }
                    }>
                    {plan.cta}
                  </button>

                  <ul className="space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-[12px] text-gray-300">
                        <Check size={12} style={{ color: SUCCESS }} strokeWidth={3} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden border p-12"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT_PINK}10)`,
                borderColor: `${ACCENT}25`,
              }}>
              {/* Glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-60 rounded-full blur-[100px] pointer-events-none"
                style={{ background: `${ACCENT}30` }} />

              <div className="relative">
                <Sparkles size={32} style={{ color: ACCENT }} className="mx-auto mb-4" />
                <h2 className="text-[32px] font-black text-white mb-3">
                  Ready to design smarter?
                </h2>
                <p className="text-[15px] text-gray-400 mb-8">
                  Join thousands of designers and developers using AI to build better interfaces, faster.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/auth/register')}
                    className="flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-bold text-white rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`, boxShadow: `0 8px 40px ${ACCENT}44` }}>
                    Get Started Free <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="px-8 py-4 text-[15px] font-semibold text-gray-300 rounded-2xl border hover:bg-white/5 transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
