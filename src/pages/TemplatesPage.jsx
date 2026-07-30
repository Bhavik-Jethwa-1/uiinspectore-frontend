import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Loader2, ArrowRight, Layers } from 'lucide-react';
import api from '../utils/api';
import { newId } from '../utils/elementLibrary';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'web', label: 'Web' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'e-commerce', label: 'E-commerce' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'blog', label: 'Blog' },
  { id: 'landing', label: 'Landing' },
];

const FALLBACK_TEMPLATES = [
  { id: 'tpl-1', name: 'SaaS Landing', category: 'web', description: 'Modern SaaS landing page with hero, features, and pricing', color: ['#7c5cff', '#ff6b9d'] },
  { id: 'tpl-2', name: 'Mobile Fitness App', category: 'mobile', description: 'Track workouts and goals', color: ['#10b981', '#34d399'] },
  { id: 'tpl-3', name: 'Analytics Dashboard', category: 'dashboard', description: 'Data-rich admin dashboard', color: ['#3b82f6', '#06b6d4'] },
  { id: 'tpl-4', name: 'E-commerce Product', category: 'e-commerce', description: 'Product detail with checkout', color: ['#f59e0b', '#ef4444'] },
  { id: 'tpl-5', name: 'Designer Portfolio', category: 'portfolio', description: 'Showcase your work elegantly', color: ['#0f172a', '#7c5cff'] },
  { id: 'tpl-6', name: 'Personal Blog', category: 'blog', description: 'Clean blog with article layout', color: ['#06b6d4', '#3b82f6'] },
  { id: 'tpl-7', name: 'Restaurant Booking', category: 'mobile', description: 'Reserve tables on the go', color: ['#ef4444', '#f59e0b'] },
  { id: 'tpl-8', name: 'Startup Landing', category: 'landing', description: 'Convert visitors into signups', color: ['#7c5cff', '#06b6d4'] },
  { id: 'tpl-9', name: 'Photography Site', category: 'portfolio', description: 'Image-first portfolio', color: ['#0f172a', '#d4af37'] },
  { id: 'tpl-10', name: 'Crypto Dashboard', category: 'dashboard', description: 'Track crypto portfolio', color: ['#fbbf24', '#f59e0b'] },
];

function TemplatePreview({ template }) {
  if (template.thumbnail) {
    return (
      <div className="tpl-preview" style={{ padding: 0 }}>
        <img 
          src={template.thumbnail} 
          alt={template.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.style.background = `linear-gradient(135deg, ${template.color?.[0] || '#7c5cff'}33, ${template.color?.[1] || '#ff6b9d'}22)`;
          }}
        />
      </div>
    );
  }
  return (
    <div className="tpl-preview" style={{
      background: `linear-gradient(135deg, ${template.color?.[0] || '#7c5cff'}33, ${template.color?.[1] || '#ff6b9d'}22)`,
    }}>
      <div className="tpl-preview-stack">
        <div className="tpl-preview-card c1" />
        <div className="tpl-preview-card c2" />
        <div className="tpl-preview-card c3" />
      </div>
      <div className="tpl-preview-overlay">
        <div className="tpl-preview-title">{template.name}</div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, cRes] = await Promise.allSettled([api.listTemplates(), api.listTemplateCategories()]);
        let list = [];
        if (tRes.status === 'fulfilled') {
          list = Array.isArray(tRes.value) ? tRes.value : (tRes.value.items || tRes.value.templates || []);
        }
        if (!list || list.length === 0) list = FALLBACK_TEMPLATES;
        setTemplates(list);

        let cats = [];
        if (cRes.status === 'fulfilled') {
          const raw = Array.isArray(cRes.value) ? cRes.value : (cRes.value.items || cRes.value.categories || []);
          // API returns plain strings like ["dashboard","mobile"] — normalize to objects
          cats = raw.map((c) => typeof c === 'string' ? { id: c, label: c.charAt(0).toUpperCase() + c.slice(1) } : c);
        }
        if (!cats || cats.length === 0) cats = CATEGORIES;
        setCategories([{ id: 'all', label: 'All' }, ...cats.filter((c) => c.id !== 'all')]);
      } catch (err) {
        setTemplates(FALLBACK_TEMPLATES);
        setCategories(CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = templates.filter((t) => {
    if (activeCat !== 'all' && t.category !== activeCat) return false;
    if (search && !t.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const useTemplate = async (tpl) => {
    try {
      // Assign IDs to template screens and their elements
      const screensWithIds = (tpl.screens || []).map((s) => ({
        ...s,
        id: s.id || newId('screen'),
        elements: (s.elements || []).map((e) => ({
          ...e,
          id: e.id || newId(),
        })),
      }));
      const p = await api.createProject({
        name: tpl.name,
        template_id: tpl.id,
        screens: screensWithIds,
        device: tpl.category === 'mobile' ? 'mobile' : 'web',
      });
      navigate(`/app/editor/${p.id}`);
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="templates-page page">
      <header className="tpl-header">
        <div>
          <h1 className="page-title">Template Library</h1>
          <p className="page-subtitle">Start with a beautifully crafted template and customize to your needs.</p>
        </div>
        <div className="tpl-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="cat-tabs">
        {categories.map((c) => (
          <button
            key={c.id}
            className={`cat-tab ${activeCat === c.id ? 'active' : ''}`}
            onClick={() => setActiveCat(c.id)}
          >
            {c.label || c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="tpl-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="tpl-card skeleton-card">
              <div className="skeleton thumb" />
              <div className="skeleton line" />
              <div className="skeleton line short" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="tpl-empty">
          <Layers size={48} strokeWidth={1.2} />
          <h3>No templates found</h3>
          <p>Try a different category or search term.</p>
        </div>
      ) : (
        <motion.div className="tpl-grid" layout>
          {filtered.map((tpl) => (
            <motion.div
              key={tpl.id}
              className="tpl-card"
              onClick={() => useTemplate(tpl)}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <TemplatePreview template={tpl} />
              <div className="tpl-meta">
                <div>
                  <div className="tpl-card-name">{tpl.name}</div>
                  <div className="tpl-card-desc">{tpl.description || tpl.category || 'Template'}</div>
                </div>
                <button className="tpl-use-btn">
                  Use <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
