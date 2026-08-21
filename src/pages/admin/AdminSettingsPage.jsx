import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminSettingsPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [openaiKey, setOpenaiKey] = useState('');
  const [keyEdited, setKeyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) loadConfig();
  }, [token]);

  async function loadConfig() {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.openai_key) {
          setOpenaiKey(data.openai_key);
          setKeyEdited(false);
        }
      }
    } catch {}
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Only send openai_key if user explicitly edited it
      // Otherwise omit it so backend keeps the existing key
      const body = keyEdited ? { openai_key: openaiKey } : {};
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      addToast({ type: 'success', message: 'Settings saved successfully.' });
      setError('');
      setKeyEdited(false);
      // Reload config to get fresh masked value
      await loadConfig();
    } catch (e) {
      addToast({ type: 'error', message: e.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-content">

      {/* Page Header */}
      <div className="admin-header">
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          <button
            onClick={() => navigate('/admin')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 12, padding: '2px 4px', borderRadius: 4 }}
          >
            Admin
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 12, padding: '2px 4px' }}>
            Settings
          </span>
        </nav>
        <button
          onClick={() => navigate('/admin')}
          className="btn-ghost"
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 10px', color: 'var(--text-secondary)' }}
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={12} />
          <span>Back</span>
        </button>
      </div>

      {/* Settings Description */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="admin-page-title">Settings</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Configure system-wide settings for UI Review
        </p>
      </div>

        {/* AI Configuration */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              AI Configuration
            </h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Configure the OpenAI API key used for AI-powered review analysis
            </p>
          </div>

          <div style={{ padding: '16px' }}>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={e => { setOpenaiKey(e.target.value); setKeyEdited(true); }}
                  placeholder="Enter new API key to update, or leave blank to keep current"
                  className="input"
                  style={{ width: '100%' }}
                  autoComplete="off"
                />
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary)' }}
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  background: 'color-mix(in srgb, var(--error) 10%, transparent)',
                  color: 'var(--error)', fontSize: 12, marginBottom: 12,
                }}>
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* System Info */}
        <div className="card">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              System Information
            </h2>
          </div>
          <div>
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Admin User', value: user?.email || '—' },
              { label: 'Environment', value: 'Production' },
            ].map(({ label, value }, i, arr) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
