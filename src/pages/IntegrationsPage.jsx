import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github, Figma, Trello, Slack, FileText, Code2, Globe,
  PlayCircle, Gauge, HardDrive, Sparkles, Check, Loader2, Plug, Power
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const INTEGRATIONS = [
  { id: 'github',    name: 'GitHub',       desc: 'Sync issues, PRs and design-to-code references directly from your repositories.', logo: 'GH', color: '#1f2937',  connected: true,  lastSync: '4 min ago' },
  { id: 'figma',     name: 'Figma',        desc: 'Pull frames from your design files and turn them into reviewable projects.',      logo: 'Fg', color: '#a855f7',  connected: true,  lastSync: '12 min ago' },
  { id: 'jira',      name: 'Jira',         desc: 'Two-way sync with Jira — convert design issues into tickets and back.',         logo: 'Jr', color: '#0052cc',  connected: false, lastSync: null },
  { id: 'slack',     name: 'Slack',        desc: 'Get notifications, share reports and run audits from any channel.',              logo: 'Sl', color: '#4a154b',  connected: true,  lastSync: '1 min ago' },
  { id: 'trello',    name: 'Trello',       desc: 'Push tasks and review cards into Trello boards automatically.',                  logo: 'Tr', color: '#0079bf',  connected: false, lastSync: null },
  { id: 'notion',    name: 'Notion',       desc: 'Send reports and meeting notes straight to your Notion workspace.',              logo: 'No', color: '#000000',  connected: false, lastSync: null },
  { id: 'vscode',    name: 'VS Code',      desc: 'Open any project directly in your editor with one click.',                      logo: 'VS', color: '#007acc',  connected: false, lastSync: null },
  { id: 'wordpress', name: 'WordPress',    desc: 'Publish mockups and prototypes to staging environments on WordPress.',         logo: 'WP', color: '#21759b',  connected: false, lastSync: null },
  { id: 'browser',   name: 'Browser',     desc: 'Capture live screenshots from any URL using the browser extension.',            logo: 'Br', color: '#7c5cff',  connected: true,  lastSync: '2 min ago' },
  { id: 'playwright', name: 'Playwright', desc: 'Run automated multi-page audits with Playwright scripts.',                     logo: 'Pl', color: '#2ead33',  connected: false, lastSync: null },
  { id: 'lighthouse', name: 'Lighthouse', desc: 'Combine Lighthouse perf scores with your design audits.',                       logo: 'Lh', color: '#f44b21',  connected: false, lastSync: null },
  { id: 'gdrive',    name: 'Google Drive', desc: 'Backup projects and reports to your Drive automatically.',                     logo: 'GD', color: '#1a73e8',  connected: false, lastSync: null },
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState(INTEGRATIONS);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.request('/integrations').catch(() => null);
        if (Array.isArray(data?.integrations) && data.integrations.length) {
          // merge with our defaults to keep ordering/icons
          const merged = INTEGRATIONS.map(def => {
            const remote = data.integrations.find(i => i.id === def.id);
            return remote ? { ...def, connected: !!remote.connected, lastSync: remote.lastSync || def.lastSync } : def;
          });
          setItems(merged);
        }
      } catch {}
    })();
  }, []);

  const toggle = async (id) => {
    const item = items.find(i => i.id === id);
    const newState = !item.connected;
    // Optimistic
    setItems(curr => curr.map(i => i.id === id ? { ...i, connected: newState, lastSync: newState ? 'just now' : i.lastSync } : i));
    setBusy(id);
    try {
      await api.request(`/integrations/${id}/${newState ? 'connect' : 'disconnect'}`, { method: 'POST' });
    } catch {}
    setBusy(null);
  };

  const connectedCount = items.filter(i => i.connected).length;

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-badge"><Sparkles size={11} /> Module 36</div>
        <h1 className="module-title">Integrations</h1>
        <p className="module-subtitle">Connect GitHub, Figma, Jira, Slack and more.</p>
      </div>

      {/* Summary */}
      <div className="module-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-pink))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <Plug size={20} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
              {connectedCount} of {items.length} connected
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Connect your tools to automate audits, sync issues and push reports everywhere.
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Power size={12} /> Last full sync: a moment ago
        </div>
      </div>

      <h3 className="module-section-title">Available integrations</h3>
      <div className="int-grid">
        {items.map((i) => (
          <motion.div
            key={i.id}
            layout
            className={`int-card ${i.connected ? 'connected' : ''}`}
          >
            <div className="int-card-head">
              <div className="int-card-logo" style={{ background: i.color }}>
                {i.logo}
              </div>
              <span className={`int-status ${i.connected ? 'connected' : 'available'}`}>
                <span className="int-status-dot" />
                {i.connected ? 'Connected' : 'Available'}
              </span>
            </div>
            <div>
              <h4 className="int-card-name">{i.name}</h4>
              <p className="int-card-desc">{i.desc}</p>
            </div>
            <div className="int-card-foot">
              <span className="int-last-sync">
                {i.connected ? `Synced ${i.lastSync || 'recently'}` : 'Not connected yet'}
              </span>
              <button
                className={`int-btn ${i.connected ? 'disconnect' : 'connect'}`}
                onClick={() => toggle(i.id)}
                disabled={busy === i.id}
              >
                {busy === i.id ? (
                  <Loader2 size={12} className="spin" />
                ) : i.connected ? (
                  <>
                    <Power size={12} /> Disconnect
                  </>
                ) : (
                  <>
                    <Check size={12} /> Connect
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}