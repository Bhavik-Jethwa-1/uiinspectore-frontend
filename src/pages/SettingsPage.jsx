import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { User, Loader2, CheckCircle, Settings, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const data = await api.updateProfile({ name, email }, token);
      updateUser(data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Settings
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Account Section */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--background)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Account</span>
            </div>
            
            {/* Avatar */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="avatar" style={{ width: 48, height: 48, fontSize: 18 }}>
                {name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{name || 'User'}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{email}</p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && (
                <div style={{ padding: '8px 10px', borderRadius: 6, fontSize: 12, background: 'var(--error-light)', color: 'var(--error)' }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ padding: '8px 10px', borderRadius: 6, fontSize: 12, background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={13} />
                  Profile updated successfully
                </div>
              )}

              <div>
                <label className="label">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                {loading ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save changes'}
              </button>
            </form>
          </div>

          {/* Preferences Section */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--background)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Palette size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Preferences</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Theme</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Toggle between light and dark mode</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--hover)', borderRadius: 6 }}>
                Use the theme toggle in the top-right corner to switch between light and dark mode.
              </p>
            </div>
          </div>

          {/* Security Section */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--background)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Security</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Password</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last changed: Never</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--hover)', borderRadius: 6, marginTop: 8 }}>
                Contact an administrator to change your password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
