import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [openaiKey, setOpenaiKey] = useState('');
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
        if (data.openai_key) setOpenaiKey(data.openai_key);
      }
    } catch {}
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ openai_key: openaiKey }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      addToast({ type: 'success', message: 'Settings saved successfully.' });
      setError('');
    } catch (e) {
      addToast({ type: 'error', message: e.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page" style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div className="admin-page-content" style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
              Settings
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Configure system-wide settings for UI Review
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Admin</span>
          <span>/</span>
          <span>Settings</span>
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
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="input"
                  style={{ width: '100%' }}
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
