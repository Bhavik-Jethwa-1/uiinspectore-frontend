import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Copy, Plus, Search } from 'lucide-react';

const TEMPLATES = [
  { id: 1, name: 'SaaS Dashboard', description: 'Typical SaaS dashboard with sidebar navigation, stats cards, and data tables', category: 'Dashboard', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', reviews: 47, avgScore: 78 },
  { id: 2, name: 'E-commerce Product Page', description: 'Product detail page with hero image, pricing, and add-to-cart flow', category: 'E-commerce', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', reviews: 35, avgScore: 72 },
  { id: 3, name: 'Onboarding Flow', description: 'Multi-step onboarding wizard with progress indicator', category: 'Onboarding', image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=300&fit=crop', reviews: 28, avgScore: 81 },
  { id: 4, name: 'Settings Page', description: 'Account settings with form sections, tabs, and sidebar navigation', category: 'Settings', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=300&fit=crop', reviews: 19, avgScore: 85 },
  { id: 5, name: 'Login / Sign Up', description: 'Authentication pages with form validation and social login options', category: 'Auth', image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=400&h=300&fit=crop', reviews: 52, avgScore: 74 },
  { id: 6, name: 'Pricing Page', description: 'Pricing table with feature comparison and FAQ section', category: 'Marketing', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop', reviews: 23, avgScore: 79 },
];

const CATEGORIES = ['All', 'Dashboard', 'E-commerce', 'Onboarding', 'Settings', 'Auth', 'Marketing'];

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = TEMPLATES.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 65) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Templates</h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pre-built page patterns for quick reference</p>
          </div>
          <Link to="/projects" className="btn-primary" style={{ flexShrink: 0 }}>
            <Plus size={15} /> Use Template
          </Link>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="input"
              style={{ paddingLeft: 36, borderRadius: 'var(--radius-sm)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Star size={32} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No templates found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {filtered.map(template => (
              <div
                key={template.id}
                className="card card-hover"
                style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <div style={{ position: 'relative', height: 160, background: 'var(--hover)', overflow: 'hidden' }}>
                  <img
                    src={template.image}
                    alt={template.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onError={e => { e.target.style.display = 'none'; }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{ position: 'absolute', top: 10, left: 10 }}>
                    <span className="badge badge-blue" style={{ fontSize: 10 }}>{template.category}</span>
                  </div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{template.name}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{template.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{template.reviews} reviews</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: getScoreColor(template.avgScore) }}>Avg: {template.avgScore}</span>
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <Copy size={11} /> Use
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
