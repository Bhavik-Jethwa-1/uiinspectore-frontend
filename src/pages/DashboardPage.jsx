import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Plus, Search, FolderOpen, Clock,
  ChevronRight, ChevronLeft, X, Loader2, Upload, Trash2, Eye, Sparkles,
  BarChart3, Image as ImageIcon, CheckCircle2, HelpCircle, ChevronDown,
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import NewReviewModal from '../components/NewReviewModal';

// ---- First-time user guide component ----
function HowItWorksGuide({ onDismiss }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('dashboard_guide_dismissed') === 'true'; } catch { return false; }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('dashboard_guide_dismissed', 'true'); } catch {}
    if (onDismiss) onDismiss();
  };

  return (
    <div style={{
      padding: '16px',
      borderRadius: 12,
      background: 'var(--primary-light)',
      border: '1px solid var(--primary)20',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={15} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>How it works</span>
        </div>
        <button onClick={handleDismiss} className="btn-icon" style={{ width: 22, height: 22 }} aria-label="Dismiss guide">
          <X size={12} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { num: '1', title: 'Upload a screenshot', desc: 'Take a screenshot of any page — login, dashboard, settings, landing page, anything.' },
          { num: '2', title: 'AI reviews your interface', desc: 'Our AI analyzes visual hierarchy, readability, accessibility, and more.' },
          { num: '3', title: 'Explore your results', desc: 'See your score, annotated issues, and prioritized suggestions.' },
          { num: '4', title: 'Fix and improve', desc: 'Each suggestion includes a "How to fix" section with actionable steps.' },
        ].map(({ num, title, desc }) => (
          <div key={num} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800,
            }}>
              {num}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 1 }}>{title}</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Main Dashboard ----
export default function DashboardPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showNewForProject, setShowNewForProject] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsLastPage, setProjectsLastPage] = useState(1);
  const [projectsTotal, setProjectsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLastPage, setReviewsLastPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);

  useEffect(() => {
    if (!token) return;
    loadData(1, 1);
  }, [token]);

  async function loadData(pPage = 1, rPage = 1) {
    try {
      const data = await api.getDashboard(token, {
        projects_page: pPage,
        reviews_page: rPage,
        projects_per_page: 10,
        reviews_per_page: 10,
      });
      setProjects(Array.isArray(data.projects) ? data.projects : (data.projects?.data ?? []));
      setProjectsTotal(data.projects_meta?.total ?? 0);
      setProjectsPage(data.projects_meta?.current_page ?? 1);
      setProjectsLastPage(data.projects_meta?.last_page ?? 1);
      setReviews(Array.isArray(data.reviews) ? data.reviews : (data.reviews?.data ?? []));
      setReviewsTotal(data.reviews_meta?.total ?? 0);
      setReviewsPage(data.reviews_meta?.current_page ?? 1);
      setReviewsLastPage(data.reviews_meta?.last_page ?? 1);
    } catch {} finally {
      setLoading(false);
    }
  }

  const totalProjects = projectsTotal;
  const totalReviews = reviewsTotal;
  const avg = (() => {
    const scored = reviews.filter(r => r.scores?.overall);
    if (scored.length === 0) return null;
    return Math.round(scored.reduce((s, r) => s + r.scores.overall, 0) / scored.length);
  })();

  const filteredProjects = search
    ? projects.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : projects;

  const getScoreColor = (score) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Get contextual label for avg score
  const getAvgScoreContext = (avgScore) => {
    if (avgScore === null) return { label: 'No scores yet', sub: 'Complete a review to see your average' };
    if (avgScore >= 85) return { label: 'Excellent', sub: 'Your UI is well-designed' };
    if (avgScore >= 70) return { label: 'Good', sub: 'Room for improvement' };
    if (avgScore >= 50) return { label: 'Needs work', sub: 'Focus on key findings below' };
    return { label: 'Poor', sub: 'Address issues for better UX' };
  };

  const scoreContext = getAvgScoreContext(avg);

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Review your UI</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Upload a screenshot and get actionable UI/UX feedback in seconds.</p>
        </div>

        {/* First-time user guide — only show when no projects */}
        {!loading && projectsTotal === 0 && <HowItWorksGuide />}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, minWidth: 0 }}>
              <FolderOpen size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Total Projects</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>{totalProjects}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>All your UI projects</p>
          </div>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, minWidth: 0 }}>
              <CheckCircle2 size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Total Reviews</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>{totalReviews}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI reviews completed</p>
          </div>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, minWidth: 0 }}>
              <BarChart3 size={13} style={{ color: avg ? getScoreColor(avg) : 'var(--text-muted)', flexShrink: 0 }} />
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Avg Score</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: avg ? getScoreColor(avg) : 'var(--text-muted)', lineHeight: 1, marginBottom: 4 }}>{avg !== null ? avg : '—'}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{scoreContext.sub}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={14} /> New Review</button>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setProjectsPage(1); }} placeholder="Search projects..." className="input" style={{ paddingLeft: 32, borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
        {loading ? (
          <div className="card" style={{ padding: '32px 0', textAlign: 'center' }}>
            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--border)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Sparkles size={22} style={{ color: 'var(--primary)' }} />
            </div>
            {search ? (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No results found</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Try a different search term</p>
                <button onClick={() => setSearch('')} className="btn-secondary" style={{ fontSize: 12 }}>Clear Search</button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No projects yet</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, maxWidth: 280, margin: '0 auto 16px' }}>Create your first UI review project and get AI-powered UX feedback.</p>
                <button onClick={() => setShowNew(true)} className="btn-primary" style={{ fontSize: 13 }}><Plus size={14} /> Create Project</button>
              </>
            )}
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredProjects.map((p) => {
              const projectReviews = reviews.filter(r => r.project_id === p.id);
              const latestReview = projectReviews.length > 0 ? projectReviews.reduce((best, r) => r.id > best.id ? r : best, projectReviews[0]) : null;
              const latestScore = latestReview?.scores?.overall;
              return (
                <div key={p.id} className="card card-hover" style={{ padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => { if (latestReview) { navigate(`/review/${latestReview.id}`); } else { setShowNewForProject({ id: p.id, name: p.name }); } }}>
                  <div style={{ width: 40, height: 40, borderRadius: 9, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FolderOpen size={17} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{p.name}</p>
                      {p.reviews_count > 0 && (
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: latestScore ? (latestScore >= 80 ? 'var(--success-light)' : latestScore >= 60 ? 'var(--warning-light)' : 'var(--error-light)') : 'var(--hover)', color: latestScore ? (latestScore >= 80 ? 'var(--success)' : latestScore >= 60 ? 'var(--warning)' : 'var(--error)') : 'var(--text-muted)', fontWeight: 600 }}>
                          {latestScore ? `${latestScore}/100` : `${p.reviews_count} review${p.reviews_count !== 1 ? 's' : ''}`}
                        </span>
                      )}
                      {p.reviews_count === 0 && (
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'var(--hover)', color: 'var(--text-muted)', fontWeight: 600 }}>
                          New
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> Last reviewed {formatDate(p.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <button 
                      className="btn-icon" 
                      aria-label="View project details"
                      onClick={(e) => { e.stopPropagation(); navigate(`/projects/${p.id}`); }}
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="btn-icon" 
                      aria-label="Delete project"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: p.id, name: p.name, type: 'project' }); }}
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={14} style={{ color: 'var(--border)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && !search && projectsLastPage > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Page {projectsPage} of {projectsLastPage} &middot; {projectsTotal} project{projectsTotal !== 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => { const p = Math.max(1, projectsPage - 1); setProjectsPage(p); loadData(p, reviewsPage); }}
                disabled={projectsPage <= 1}
                className="btn-secondary"
                style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <button
                onClick={() => { const p = Math.min(projectsLastPage, projectsPage + 1); setProjectsPage(p); loadData(p, reviewsPage); }}
                disabled={projectsPage >= projectsLastPage}
                className="btn-secondary"
                style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
      <NewReviewModal open={showNew} onClose={() => setShowNew(false)} project={null} />
      <NewReviewModal open={!!showNewForProject} onClose={() => setShowNewForProject(null)} project={showNewForProject} />
      {deleteTarget && (
        <ConfirmModal title={deleteTarget.type === 'project' ? 'Delete Project' : 'Delete Review'}
          message={deleteTarget.type === 'project' ? `Are you sure you want to delete the project "${deleteTarget.name}" and all its reviews? This cannot be undone.` : `Are you sure you want to delete the review for "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete" variant="danger" loading={deleting}
          onConfirm={async () => { setDeleting(true); try { if (deleteTarget.type === 'project') { await api.deleteProject(deleteTarget.id, token); } else { await api.deleteReview(deleteTarget.id, token); } setDeleteTarget(null); loadData(projectsPage, reviewsPage); } catch { setDeleteTarget(null); } finally { setDeleting(false); } }}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
