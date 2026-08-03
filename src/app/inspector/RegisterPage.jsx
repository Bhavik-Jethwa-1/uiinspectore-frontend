import { useState } from 'react';
import { ACCENT } from './constants/theme';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';
import { useInspectorAuth } from '../../contexts/InspectorAuthContext';

export default function InspectorRegisterPage() {
  const { register, loading } = useInspectorAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await register(name, email, password, confirm);
      navigate('/inspector');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: ACCENT }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#34d399' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: ACCENT }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--text)' }}>UI Inspector</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>AI-powered UI/UX review platform</p>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-[16px] font-bold mb-5" style={{ color: 'var(--text)' }}>Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none transition-all"
                style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none transition-all"
                style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border text-[13px] outline-none transition-all"
                  style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                placeholder="Repeat password"
                className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none transition-all"
                style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>

            {error && (
              <div className="px-3 py-2 rounded-xl text-[12px]" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: ACCENT }}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
            <Link to="/inspector/login" className="text-[12px] font-bold" style={{ color: ACCENT }}>Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
