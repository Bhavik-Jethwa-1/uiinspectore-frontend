import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Search, Loader2, AlertCircle, Eye, FolderOpen, Plus, ChevronRight } from 'lucide-react';

export default function AdminProjectsPage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) loadProjects();
  }, [token]);

  async function loadProjects() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProjects(token);
      // Sort by most recent first
      const sorted = (data.projects || []).sort((a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      setProjects(sorted);
    } catch (e) {
      setError(e.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  const filtered = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            All Projects
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {projects.length} total project{projects.length !== 1 ? 's' : ''} across all users
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
              placeholder="Search projects..."
              className="input"
              style={{ paddingLeft: 36, borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading projects...</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <AlertCircle size={20} style={{ color: 'var(--error)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{error}</p>
            <button className="btn-primary" onClick={loadProjects}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
              <FolderOpen size={20} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {search ? 'No results found' : 'No projects yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {search ? `No projects matching "${search}"` : 'Projects will appear here once created'}
            </p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Description', 'Reviews', 'Created', ''].map(h => (
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
                {filtered.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.name}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {p.description ? (
                          <span className="truncate" style={{ display: 'block', maxWidth: 200 }}>
                            {p.description}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                        {p.reviews_count ?? 0}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)' }}>
                      {formatDate(p.created_at)}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <Link to={`/projects/${p.id}`} className="btn-icon" title="View project">
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
