import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const { token, user } = useAuth();
  const [openaiKey, setOpenaiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) loadConfig();
  }, [token]);

  async function loadConfig() {
    try {
      // Use relative URL via fetch (api utility doesn't have admin/settings GET)
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
    setSaved(false);
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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Admin Settings
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Configure system-wide settings for UI Review
          </p>
        </div>

        {/* AI Configuration */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              AI Configuration
            </h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Configure the OpenAI API key used for AI-powered review analysis
            </p>
          </div>

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

            {saved && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                background: 'color-mix(in srgb, var(--success) 10%, transparent)',
                color: 'var(--success)', fontSize: 12, marginBottom: 12,
              }}>
                <CheckCircle size={13} />
                Settings saved successfully
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

        {/* System Info */}
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            System Information
          </h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Admin User', value: user?.email || '—' },
              { label: 'Environment', value: 'Production' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
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
