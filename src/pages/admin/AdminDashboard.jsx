import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Search, Eye, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  async function loadData() {
    try {
      const pd = await api.getProjects(token);
      const allReviews = [];
      for (const p of pd.projects) {
        try {
          const fp = await api.getProject(p.id, token);
          allReviews.push(...fp.project.reviews.map(r => ({
            ...r,
            project_name: p.name,
            project_id: p.id,
          })));
        } catch {}
      }
      allReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(allReviews);
    } catch {} finally {
      setLoading(false);
    }
  }

  const filtered = reviews.filter(r =>
    r.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.page_goal?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-green">Completed</span>;
      case 'analyzing':
        return <span className="badge badge-blue">Analyzing</span>;
      case 'pending':
        return <span className="badge badge-gray">Pending</span>;
      case 'failed':
        return <span className="badge badge-red">Failed</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            All Reviews
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {reviews.length} total review{reviews.length !== 1 ? 's' : ''} across all projects
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="input"
              style={{ paddingLeft: 36, borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
              <AlertCircle size={20} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {search ? 'No results found' : 'No reviews yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {search ? `No reviews matching "${search}"` : 'Reviews will appear here once created'}
            </p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'Project', 'Goal', 'Status', 'Score', 'Date', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px', fontSize: 10, fontWeight: 600,
                      color: 'var(--text-muted)', textAlign: 'left',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      background: 'var(--background)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)' }}>#{r.id}</td>
                    <td style={{ padding: '11px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{r.project_name}</td>
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 140 }}>
                      <span className="truncate" style={{ display: 'block' }}>{r.page_goal || '—'}</span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>{getStatusBadge(r.status)}</td>
                    <td style={{ padding: '11px 12px' }}>
                      {r.scores?.overall ? (
                        <span style={{ fontSize: 12, fontWeight: 700, color: getScoreColor(r.scores.overall) }}>
                          {r.scores.overall}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(r.created_at)}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <Link to={`/review/${r.id}`} className="btn-icon" title="View">
                        <Eye size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
