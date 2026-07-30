import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Edit2, Check, Star, Users, DollarSign, Zap } from 'lucide-react';

const ACCENT = '#ef4444';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    color: '#9ca3af',
    description: 'For individuals exploring UIInspectore',
    features: [
      '5 AI redesigns / month',
      '20 image generations / month',
      '3 active projects',
      'Basic templates',
      'Community support',
    ],
    featureCount: 12,
    subscribers: 9847,
    isPopular: false,
    seats: 1,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    period: 'month',
    color: '#818cf8',
    description: 'For professional designers & freelancers',
    features: [
      'Unlimited AI redesigns',
      '500 image generations / month',
      '25 active projects',
      'Premium templates',
      'Export to Figma & code',
      'Priority email support',
      'Custom brand kit',
    ],
    featureCount: 28,
    subscribers: 2471,
    isPopular: true,
    seats: 1,
  },
  {
    id: 'team',
    name: 'Team',
    price: 49,
    period: 'month / per seat',
    color: '#fbbf24',
    description: 'For teams collaborating on design systems',
    features: [
      'Everything in Pro',
      'Unlimited image generations',
      'Unlimited projects',
      'Team workspaces & roles',
      'Shared component library',
      'SSO & SAML',
      'Advanced analytics',
      'Dedicated CSM',
    ],
    featureCount: 45,
    subscribers: 471,
    isPopular: false,
    seats: 3,
  },
];

const PLAN_BADGES = {
  free: { label: 'Free', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' },
  pro:  { label: 'Pro',  color: '#818cf8', bg: 'rgba(129,140,248,0.15)' },
  team: { label: 'Team', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
};

function PlanCard({ plan, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border p-6 flex flex-col relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: plan.isPopular ? `${plan.color}40` : 'rgba(239,68,68,0.1)',
        boxShadow: plan.isPopular ? `0 0 0 1px ${plan.color}30` : 'none',
      }}>

      {plan.isPopular && (
        <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider"
          style={{ background: plan.color, color: '#000' }}>
          <Star size={9} className="inline mr-1" /> Popular
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${plan.color}18` }}>
            <Layers size={18} style={{ color: plan.color }} />
          </div>
          <h3 className="text-[20px] font-black text-white">{plan.name}</h3>
        </div>
        <p className="text-[12px] text-gray-500 mt-1">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-5 pb-5 border-b" style={{ borderColor: 'rgba(239,68,68,0.08)' }}>
        <div className="flex items-baseline gap-1">
          <span className="text-[40px] font-black text-white">${plan.price}</span>
          <span className="text-[12px] text-gray-500">/ {plan.period}</span>
        </div>
        {plan.seats > 1 && (
          <p className="text-[11px] text-gray-500 mt-1">Includes {plan.seats} seats minimum</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-[10px] text-gray-500 mb-1">Subscribers</div>
          <div className="text-[16px] font-black text-white">{plan.subscribers.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-[10px] text-gray-500 mb-1">Features</div>
          <div className="text-[16px] font-black text-white">{plan.featureCount}</div>
        </div>
      </div>

      {/* Features list */}
      <div className="space-y-2 mb-6 flex-1">
        {plan.features.map(f => (
          <div key={f} className="flex items-start gap-2 text-[12px] text-gray-300">
            <Check size={13} className="shrink-0 mt-0.5" style={{ color: plan.color }} />
            <span>{f}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold border transition-all hover:bg-white/5"
          style={{ borderColor: `${plan.color}40`, color: plan.color }}>
          <Edit2 size={12} /> Edit Plan
        </button>
        <button
          className="px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all"
          style={{ background: plan.color, color: plan.id === 'free' ? '#000' : '#fff' }}>
          View Details
        </button>
      </div>
    </motion.div>
  );
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState(PLANS);

  const totalSubscribers = PLANS.reduce((sum, p) => sum + p.subscribers, 0);
  const mrrFromPlans = PLANS.reduce((sum, p) => sum + (p.price * p.subscribers), 0);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white">Subscription Plans</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Manage pricing tiers, features, and limits across {plans.length} active plans
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
            style={{ background: ACCENT, color: '#fff' }}>
            <Plus size={14} /> Create Plan
          </button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Plans',     value: plans.length.toString(),                  icon: Layers,     color: '#6366f1' },
            { label: 'Total Subscribers',value: totalSubscribers.toLocaleString(),        icon: Users,      color: '#8b5cf6' },
            { label: 'Plan MRR',         value: `$${mrrFromPlans.toLocaleString()}`,      icon: DollarSign, color: '#10b981' },
            { label: 'Avg ARPU',         value: `$${(mrrFromPlans / totalSubscribers).toFixed(2)}`, icon: Zap, color: '#fbbf24' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}15` }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-[24px] font-black text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Plan cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((p, i) => <PlanCard key={p.id} plan={p} delay={i * 0.1} />)}
        </div>

        {/* Plan comparison footer */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <h3 className="text-[14px] font-bold text-white mb-4">Plan Comparison Snapshot</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                  <th className="px-3 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-left">Capability</th>
                  {plans.map(p => (
                    <th key={p.id} className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-center"
                      style={{ color: p.color }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'AI redesigns / month',   values: ['5',       'Unlimited', 'Unlimited'] },
                  { feature: 'Image generations',     values: ['20',      '500',       'Unlimited'] },
                  { feature: 'Active projects',        values: ['3',       '25',        'Unlimited'] },
                  { feature: 'Export to Figma',        values: ['—',       '✓',         '✓'] },
                  { feature: 'SSO & SAML',             values: ['—',       '—',         '✓'] },
                  { feature: 'Dedicated CSM',          values: ['—',       '—',         '✓'] },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(239,68,68,0.06)' }}>
                    <td className="px-3 py-2.5 text-[12px] text-gray-300">{row.feature}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="px-3 py-2.5 text-[12px] text-center">
                        <span className={v === '✓' ? 'text-green-400 font-bold' : v === '—' ? 'text-gray-600' : 'text-white font-semibold'}>
                          {v}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}