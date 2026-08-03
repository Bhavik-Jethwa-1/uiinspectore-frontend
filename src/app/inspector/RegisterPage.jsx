import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useInspectorAuth } from '../../contexts/InspectorAuthContext';
import { ACCENT } from './constants/theme';

const PERKS = [
  'Unlimited screenshot reviews',
  '5 persona perspectives',
  'Visual before/after comparison',
  'Actionable fix suggestions',
];

export default function InspectorRegisterPage() {
  const { user, register, loading } = useInspectorAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => { if (user) navigate('/inspector'); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    try {
      await register(name, email, password, confirm);
      navigate('/inspector');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left — Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, #1a1625 0%, #0f1623 100%)' }}>
        <div className="max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mx-auto"
            style={{ background: `${ACCENT}20` }}>
            <Sparkles size={32} style={{ color: ACCENT }} />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text)' }}>
            Start reviewing UIs in seconds
          </h2>
          <div className="space-y-3">
            {PERKS.map(perk => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${ACCENT}20` }}>
                  <Check size={11} style={{ color: ACCENT }} />
                </div>
                <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: ACCENT }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>UI Inspector</span>
          </div>

          <h1 className="text-[26px] font-bold mb-1.5" style={{ color: 'var(--text)' }}>Create your account</h1>
          <p className="text-[14px] mb-8" style={{ color: 'var(--text-muted)' }}>Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12px] font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={(e) => e.target.style.borderColor = ACCENT}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="text-[12px] font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={(e) => e.target.style.borderColor = ACCENT}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="text-[12px] font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full px-4 py-3 rounded-xl text-[14px] outline-none pr-12 transition-all"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  onFocus={(e) => e.target.style.borderColor = ACCENT}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                  {showPw ? <EyeOff size={15} style={{ color: 'var(--text-muted)' }} /> : <Eye size={15} style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Confirm password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={(e) => e.target.style.borderColor = ACCENT}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {error && (
              <p className="text-[12px] px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: ACCENT }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <>Create Account <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-[13px] text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/inspector/login" className="font-medium transition-opacity hover:opacity-70" style={{ color: ACCENT }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
