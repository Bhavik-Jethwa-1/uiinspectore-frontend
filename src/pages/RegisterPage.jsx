import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!name || !email || !password) { setErr('All fields are required'); return; }
    if (password !== confirm) { setErr('Passwords do not match'); return; }
    if (password.length < 6) { setErr('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ name, email, password });
      navigate('/app/dashboard', { replace: true });
    } catch (e) {
      setErr(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = password.length === 0 ? 0 :
    password.length < 6 ? 1 :
    password.length < 10 ? 2 :
    /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];
  const strengthColor = ['#333', '#f87171', '#fbbf24', '#34d399', '#7c5cff'][pwStrength];

  return (
    <div className="grid w-screen h-screen overflow-hidden bg-[var(--bg)] grid-cols-[1.1fr_1fr] max-[900px]:grid-cols-1">
      <aside
        className="relative flex flex-col justify-center p-12 overflow-hidden max-[900px]:hidden"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(124, 92, 255, 0.18), transparent 60%), radial-gradient(circle at 80% 80%, rgba(255, 107, 157, 0.15), transparent 60%), linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
        }}
      >
        <div
          className="absolute w-[380px] h-[380px] rounded-full blur-[80px] pointer-events-none -top-[120px] -left-[120px]"
          style={{ background: 'var(--accent)', opacity: 0.35 }}
        />
        <div
          className="absolute w-[320px] h-[320px] rounded-full blur-[80px] pointer-events-none -bottom-[100px] -right-[100px]"
          style={{ background: 'var(--accent-pink)', opacity: 0.3 }}
        />

        <div className="relative z-[1] max-w-[520px]">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl border border-[var(--border)] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.15), rgba(255, 107, 157, 0.15))' }}
            >
              <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
                <defs>
                  <linearGradient id="hr-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7c5cff" />
                    <stop offset="1" stopColor="#ff6b9d" />
                  </linearGradient>
                </defs>
                <path d="M16 4c-3 0-5 1-6 3-3 0-5 3-5 6 0 2 1 4 2 5-1 1-2 3-2 5 0 3 2 5 5 5 1 2 3 3 6 3s5-1 6-3c3 0 5-2 5-5 0-2-1-4-2-5 1-1 2-3 2-5 0-3-2-6-5-6-1-2-3-3-6-3z" fill="url(#hr-grad)" />
              </svg>
            </div>
            <div>
              <div className="text-[22px] font-extrabold tracking-[-0.02em]">UI Inspectore</div>
              <div className="text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.1em] uppercase">AI Design Studio</div>
            </div>
          </div>

          <motion.h1
            className="text-5xl leading-[1.05] font-extrabold tracking-[-0.03em] mb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Start designing{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent-hover) 0%, var(--accent-pink) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              in seconds.
            </span>
          </motion.h1>

          <motion.p
            className="text-[var(--text-2)] text-[17px] leading-[1.6] mb-9"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Join thousands of designers, founders, and product teams shipping ideas faster.
            No credit card required.
          </motion.p>

          <motion.ul
            className="flex flex-col gap-3 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ listStyle: 'none' }}
          >
            {[
              'Generate full UI from a text prompt',
              'Drag-and-drop components with smart snapping',
              'Screenshot to editable design in one click',
              'Prototype flows and share live previews',
            ].map((b, i) => (
              <li
                key={i}
                className="flex items-center gap-2.5 text-[var(--text-2)] text-[14px]"
              >
                <span
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-pink))' }}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </motion.ul>
        </div>
      </aside>

      <div className="flex items-center justify-center p-8 bg-[var(--bg)] overflow-auto">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-7">
            <h2 className="text-[28px] font-bold tracking-[-0.02em] mb-1.5">Create your account</h2>
            <p className="text-[var(--text-2)] text-sm">Get started with UI Inspectore — it's free.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {err && (
              <div
                className="py-2.5 px-3.5 border border-[rgba(248,113,113,0.3)] text-[var(--danger)] rounded-[var(--radius-sm)] text-[13px]"
                style={{ background: 'rgba(248, 113, 113, 0.1)' }}
              >
                {err}
              </div>
            )}

            <div className="flex flex-col">
              <label className="label">Name</label>
              <div className="relative flex items-center">
                <UserIcon size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="text"
                  className="input !pl-10 !pr-10"
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="label">Email</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="email"
                  className="input !pl-10 !pr-10"
                  placeholder="you@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="label">Password</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="password"
                  className="input !pl-10 !pr-10"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2.5">
                  <div
                    className="flex-1 h-1 rounded-sm overflow-hidden"
                    style={{ background: 'var(--surface2)' }}
                  >
                    <div
                      style={{
                        width: `${(pwStrength / 4) * 100}%`,
                        height: '100%',
                        background: strengthColor,
                        transition: 'all 200ms',
                      }}
                    />
                  </div>
                  <span
                    style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}
                  >
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="label">Confirm password</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="password"
                  className="input !pl-10 !pr-10"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 text-[15px] mt-2" disabled={loading}>
              {loading ? (
                <span className="dots"><span></span><span></span><span></span></span>
              ) : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>

            <p className="text-center text-[13px] text-[var(--text-2)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--accent-hover)] font-semibold hover:text-[var(--accent)]">
                Sign in →
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
