import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { User, Loader2, CheckCircle } from 'lucide-react';

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
            Profile Settings
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Update your account information
          </p>
        </div>

        {/* Avatar */}
        <div className="card" style={{ padding: '20px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
              {name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{name || 'User'}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{email}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: '20px 20px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
      </div>
    </div>
  );
}
