import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Left Panel - Brand */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        background: 'var(--primary)', padding: '48px 40px', flex: '0 0 45%',
        minWidth: 0
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>UI</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 10, lineHeight: 1.2 }}>
            AI Screenshot Review
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: 340 }}>
            Get instant, actionable feedback on your UI designs. Upload a screenshot and let AI analyze it.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '✦', title: 'Visual Hierarchy Analysis', desc: 'Understand how users see your interface' },
            { icon: '✦', title: 'Accessibility Review', desc: 'WCAG compliance and readability checks' },
            { icon: '✦', title: 'UX Recommendations', desc: 'Actionable suggestions to improve your UI' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 3, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>{item.title}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', minWidth: 0
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Sign in to continue to your dashboard
            </p>
          </div>

          {error && (
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, background: 'var(--error-light)', color: 'var(--error)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
