import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, Zap, Layers, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) { setErr('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard', { replace: true });
    } catch (e) {
      setErr(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid w-screen h-screen overflow-hidden bg-[var(--bg)] grid-cols-[1.1fr_1fr] max-[900px]:grid-cols-1">
      <aside
        className="relative flex-col justify-center p-12 overflow-hidden flex max-[900px]:hidden"
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
                  <linearGradient id="hl-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7c5cff" />
                    <stop offset="1" stopColor="#ff6b9d" />
                  </linearGradient>
                </defs>
                <path d="M16 4c-3 0-5 1-6 3-3 0-5 3-5 6 0 2 1 4 2 5-1 1-2 3-2 5 0 3 2 5 5 5 1 2 3 3 6 3s5-1 6-3c3 0 5-2 5-5 0-2-1-4-2-5 1-1 2-3 2-5 0-3-2-6-5-6-1-2-3-3-6-3z" fill="url(#hl-grad)" />
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
            transition={{ delay: 0.05 }}
          >
            Design at the{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent-hover) 0%, var(--accent-pink) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              speed of thought.
            </span>
          </motion.h1>

          <motion.p
            className="text-[var(--text-2)] text-[17px] leading-[1.6] mb-9"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Generate beautiful UI mockups from text, convert screenshots to editable designs,
            and prototype entire flows — all powered by AI.
          </motion.p>

          <motion.div
            className="flex flex-col gap-3.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="flex items-center gap-3.5 p-3.5 border border-[var(--border)] rounded-[var(--radius)] backdrop-blur-md"
              style={{ background: 'rgba(18, 18, 31, 0.6)' }}
            >
              <div
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124, 92, 255, 0.2)' }}
              >
                <Wand2 size={16} />
              </div>
              <div>
                <div className="text-[14px] font-bold mb-0.5">Autodesigner</div>
                <div className="text-[12px] text-[var(--text-2)]">Generate full screens from text prompts</div>
              </div>
            </div>
            <div
              className="flex items-center gap-3.5 p-3.5 border border-[var(--border)] rounded-[var(--radius)] backdrop-blur-md"
              style={{ background: 'rgba(18, 18, 31, 0.6)' }}
            >
              <div
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255, 107, 157, 0.2)' }}
              >
                <Layers size={16} />
              </div>
              <div>
                <div className="text-[14px] font-bold mb-0.5">Editor</div>
                <div className="text-[12px] text-[var(--text-2)]">Drag-and-drop canvas with smart components</div>
              </div>
            </div>
            <div
              className="flex items-center gap-3.5 p-3.5 border border-[var(--border)] rounded-[var(--radius)] backdrop-blur-md"
              style={{ background: 'rgba(18, 18, 31, 0.6)' }}
            >
              <div
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0, 212, 255, 0.2)' }}
              >
                <Zap size={16} />
              </div>
              <div>
                <div className="text-[14px] font-bold mb-0.5">Prototype</div>
                <div className="text-[12px] text-[var(--text-2)]">Link screens with hotspots, share live previews</div>
              </div>
            </div>
          </motion.div>
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
            <h2 className="text-[28px] font-bold tracking-[-0.02em] mb-1.5">Welcome back</h2>
            <p className="text-[var(--text-2)] text-sm">Sign in to continue designing.</p>
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
              <label className="label" htmlFor="email">Email</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  id="email"
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
              <label className="label" htmlFor="password">Password</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  className="input !pl-10 !pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-2 w-[30px] h-[30px] flex items-center justify-center text-[var(--text-muted)] rounded-md hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)]"
                  onClick={() => setShow((s) => !s)}
                  aria-label="Toggle password"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 text-[15px] mt-2" disabled={loading}>
              {loading ? (
                <span className="dots"><span></span><span></span><span></span></span>
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>

            <div
              className="flex items-center gap-3 my-2 text-[var(--text-muted)] text-xs before:content-[''] before:flex-1 before:h-px before:bg-[var(--border)] after:content-[''] after:flex-1 after:h-px after:bg-[var(--border)]"
            >
              <span>or</span>
            </div>

            <p className="text-center text-[13px] text-[var(--text-2)]">
              New here?{' '}
              <Link to="/register" className="text-[var(--accent-hover)] font-semibold hover:text-[var(--accent)]">
                Create an account →
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
