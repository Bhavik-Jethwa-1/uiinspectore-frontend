import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MousePointer2, Plus, Trash2, Link as LinkIcon, Play,
  ArrowRight, ChevronRight, MousePointerClick, Edit3, X
} from 'lucide-react';
import api from '../utils/api';

export default function PrototypingPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listProjects();
        const list = Array.isArray(data) ? data : (data.items || data.projects || []);
        const withScreens = list.filter((p) => p.screens?.length > 0);
        setProjects(withScreens);
        if (withScreens.length) setActive(withScreens[0]);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const screens = active?.screens || [];
  const currentScreen = screens[previewIdx];

  const goTo = (idx) => {
    setHistory((h) => [...h, previewIdx]);
    setPreviewIdx(idx);
  };

  const goBack = () => {
    if (history.length) {
      setPreviewIdx(history[history.length - 1]);
      setHistory((h) => h.slice(0, -1));
    }
  };

  return (
    <div className="proto-page page">
      <header className="proto-header">
        <div>
          <h1 className="page-title">Prototype Flows</h1>
          <p className="page-subtitle">Connect screens with hotspots to create clickable prototypes.</p>
        </div>
        {active && (
          <button className="btn btn-primary" onClick={() => setPreviewMode(true)}>
            <Play size={14} /> Preview flow
          </button>
        )}
      </header>

      {loading ? (
        <div className="dots"><span></span><span></span><span></span></div>
      ) : projects.length === 0 ? (
        <div className="proto-empty">
          <MousePointerClick size={48} strokeWidth={1.2} />
          <h3>No projects to prototype yet</h3>
          <p>Create a project with multiple screens first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/app/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="proto-layout">
          {/* Project list */}
          <aside className="proto-projects">
            <div className="proto-section-header">Projects</div>
            {projects.map((p) => (
              <button
                key={p.id}
                className={`proto-project-item ${active?.id === p.id ? 'active' : ''}`}
                onClick={() => setActive(p)}
              >
                <div className="proto-project-thumb">
                  <div /><div /><div />
                </div>
                <div className="proto-project-info">
                  <div className="proto-project-name">{p.name}</div>
                  <div className="proto-project-meta">{p.screens.length} screens</div>
                </div>
              </button>
            ))}
          </aside>

          {/* Screens flow */}
          <div className="proto-main">
            <div className="proto-flow-header">
              <h2>{active?.name}</h2>
              <span className="chip">{screens.length} screens</span>
            </div>
            <div className="proto-flow">
              {screens.map((s, i) => (
                <div key={s.id} className="proto-flow-node">
                  <motion.div
                    className="proto-flow-screen"
                    whileHover={{ y: -3 }}
                    onClick={() => navigate(`/app/editor/${active.id}?screen=${s.id}`)}
                  >
                    <div className="proto-screen-frame">
                      <div className="t-line w70" />
                      <div className="t-line w50" />
                      <div className="t-line w40" />
                      <div className="t-block" />
                      <div className="t-line w60" />
                    </div>
                    <div className="proto-flow-name">{s.name || `Screen ${i + 1}`}</div>
                  </motion.div>
                  {i < screens.length - 1 && (
                    <div className="proto-flow-arrow">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="proto-hotspots">
              <h3>Hotspots</h3>
              <p className="muted">
                Open the project in the editor to add hotspots to elements that link to other screens.
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/app/editor/${active.id}`)}
              >
                <Edit3 size={14} /> Edit in canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {previewMode && currentScreen && (
        <div className="proto-preview-modal" onClick={() => setPreviewMode(false)}>
          <div className="proto-preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="proto-preview-head">
              <div className="proto-preview-title">{currentScreen.name}</div>
              <button className="btn-icon" onClick={() => setPreviewMode(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="proto-preview-body">
              <div className="proto-preview-screen">
                {history.length > 0 && (
                  <button className="proto-back-btn" onClick={goBack}>
                    <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
                  </button>
                )}
                {screens.map((s, i) => (
                  i !== previewIdx && (
                    <button
                      key={s.id}
                      className="proto-go-screen"
                      onClick={() => goTo(i)}
                    >
                      Go to: {s.name}
                    </button>
                  )
                ))}
                <div className="proto-preview-placeholder">
                  <MousePointer2 size={32} />
                  <span>Interactive preview</span>
                  <small>Click hotspots to navigate between screens</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
