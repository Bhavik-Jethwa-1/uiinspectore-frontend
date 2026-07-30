import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Star, Eye, Edit2, Trash2, Search, Layout, Smartphone, Monitor, ShoppingBag, BarChart, Users } from 'lucide-react';

const ACCENT = '#ef4444';

const CATEGORY_COLORS = {
  landing:    '#8b5cf6',
  dashboard:  '#06b6d4',
  mobile:     '#10b981',
  ecommerce:  '#f59e0b',
  portfolio:  '#ef4444',
  blog:       '#ec4899',
  saas:       '#3b82f6',
  marketing:  '#f97316',
};

const CATEGORY_ICONS = {
  landing:    Monitor,
  dashboard:  BarChart,
  mobile:     Smartphone,
  ecommerce:  ShoppingBag,
  portfolio:  Users,
  blog:       Layout,
  saas:       Layers,
  marketing:  Layout,
};

const TEMPLATES = [
  { id: 1, name: 'SaaS Landing Pro',          category: 'landing',    usage: 4820, rating: 4.9, reviews: 184, status: 'active',   author: 'UIInspectore', updated: '2d ago',  price: 'Free' },
  { id: 2, name: 'Analytics Dashboard',       category: 'dashboard',  usage: 3240, rating: 4.8, reviews: 142, status: 'active',   author: 'UIInspectore', updated: '5d ago',  price: 'Pro' },
  { id: 3, name: 'Mobile Banking App',         category: 'mobile',     usage: 2840, rating: 4.7, reviews: 98,  status: 'active',   author: 'Aria M.',     updated: '1w ago',  price: 'Pro' },
  { id: 4, name: 'E-commerce Storefront',      category: 'ecommerce',  usage: 6420, rating: 4.9, reviews: 284, status: 'active',   author: 'UIInspectore', updated: '3d ago',  price: 'Free' },
  { id: 5, name: 'Creative Portfolio',         category: 'portfolio',  usage: 1840, rating: 4.6, reviews: 64,  status: 'active',   author: 'Sarah L.',    updated: '2w ago',  price: 'Free' },
  { id: 6, name: 'Modern Blog Template',       category: 'blog',       usage: 1240, rating: 4.5, reviews: 48,  status: 'active',   author: 'UIInspectore', updated: '1mo ago', price: 'Free' },
  { id: 7, name: 'Enterprise SaaS Suite',     category: 'saas',       usage: 1840, rating: 4.8, reviews: 92,  status: 'active',   author: 'Marcus T.',   updated: '4d ago',  price: 'Team' },
  { id: 8, name: 'Marketing Campaign LP',      category: 'marketing',  usage: 980,  rating: 4.4, reviews: 38,  status: 'draft',    author: 'Alex K.',     updated: '1d ago',  price: 'Pro' },
  { id: 9, name: 'Admin Panel Dark',          category: 'dashboard',  usage: 2240, rating: 4.9, reviews: 124, status: 'active',   author: 'UIInspectore', updated: '6d ago',  price: 'Pro' },
  { id: 10, name: 'iOS Fitness App',            category: 'mobile',     usage: 1640, rating: 4.7, reviews: 72,  status: 'active',   author: 'Hiroshi S.',  updated: '2w ago',  price: 'Pro' },
];

const STATUS_COLORS = {
  active: '#10b981',
  draft: '#f59e0b',
  archived: '#9ca3af',
};

function TemplateCard({ template, delay }) {
  const Icon = CATEGORY_ICONS[template.category] || Layout;
  const color = CATEGORY_COLORS[template.category] || '#9ca3af';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border p-4 flex flex-col"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>

      {/* Thumbnail placeholder */}
      <div className="aspect-[16/10] rounded-xl mb-3 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)`, border: `1px solid ${color}30` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={36} style={{ color }} />
        </div>
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{ background: `${color}30`, color }}>
            {template.category}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{ background: template.price === 'Free' ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.2)', color: template.price === 'Free' ? '#10b981' : '#8b5cf6' }}>
            {template.price}
          </span>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={{ background: 'rgba(0,0,0,0.5)', color: '#fbbf24', backdropFilter: 'blur(8px)' }}>
          <Star size={9} fill="#fbbf24" /> {template.rating}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-[13px] font-bold text-white truncate">{template.name}</h3>
        <p className="text-[10px] text-gray-500 mt-0.5">by {template.author}</p>

        <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <Eye size={9} /> {template.usage.toLocaleString()}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Star size={9} /> {template.reviews} reviews
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'rgba(239,68,68,0.08)' }}>
          <span className="text-[9px] text-gray-500 font-mono">Updated {template.updated}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 capitalize"
            style={{ background: `${STATUS_COLORS[template.status]}15`, color: STATUS_COLORS[template.status] }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[template.status] }} />
            {template.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-3">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold border transition-all hover:bg-white/5"
          style={{ borderColor: `${color}40`, color }}>
          <Edit2 size={10} /> Edit
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 hover:text-white border transition-all"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Eye size={11} />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 hover:text-red-400 border transition-all"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Trash2 size={11} />
        </button>
      </div>
    </motion.div>
  );
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState(TEMPLATES);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const totalUsage = TEMPLATES.reduce((s, t) => s + t.usage, 0);
  const avgRating = (TEMPLATES.reduce((s, t) => s + t.rating, 0) / TEMPLATES.length).toFixed(1);

  const filtered = templates.filter(t =>
    (category === 'all' || t.category === category) &&
    (search === '' || t.name.toLowerCase().includes(search.toLowerCase()) || t.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <Layers size={20} style={{ color: ACCENT }} /> Template Library
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {TEMPLATES.length} templates across {Object.keys(CATEGORY_COLORS).length} categories — {totalUsage.toLocaleString()} total usages
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
            style={{ background: ACCENT, color: '#fff' }}>
            <Plus size={14} /> Add Template
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Templates', value: TEMPLATES.length.toString(),       icon: Layers, color: '#8b5cf6' },
            { label: 'Active',          value: TEMPLATES.filter(t => t.status === 'active').length.toString(), icon: Layout, color: '#10b981' },
            { label: 'Total Usages',    value: `${(totalUsage / 1000).toFixed(1)}K`, icon: Eye,    color: '#06b6d4' },
            { label: 'Avg Rating',      value: `${avgRating} ★`,                   icon: Star,   color: '#fbbf24' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}15` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-[22px] font-black text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border p-4 flex items-center gap-3 flex-wrap"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="w-full pl-9 pr-4 py-2 rounded-lg text-[12px] text-white placeholder-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setCategory('all')}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={category === 'all'
                ? { background: ACCENT, color: '#fff' }
                : { background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }
              }>
              All
            </button>
            {Object.keys(CATEGORY_COLORS).map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all"
                style={category === c
                  ? { background: CATEGORY_COLORS[c], color: '#fff' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }
                }>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((t, i) => <TemplateCard key={t.id} template={t} delay={i * 0.05} />)}
        </div>
      </div>
    </div>
  );
}