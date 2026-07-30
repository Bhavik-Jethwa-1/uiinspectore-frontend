import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#7c5cff';
const ACCENT_PINK = '#ff6b9d';
const SUCCESS = '#10b981';

function PasswordStrength({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong'];
  const colors = ['#f87171', '#fb923c', '#facc15', '#34d399'];
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i < score ? colors[Math.max(0, score - 1)] : 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <p className="text-[10px]" style={{ color: colors[Math.max(0, score - 1)] }}>
        {labels[Math.max(0, score - 1)]}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (!agreed) { setError('Please agree to the terms'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await register({ name, email, password });
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-[22px] font-black text-white mb-1">Create your account</h2>
      <p className="text-[13px] mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Free forever. No credit card required.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-[12px] font-semibold"
          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
          <div className="relative">
            <User size={14} className="absolute left-3.5 top-2/3 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] text-white placeholder-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-2/3 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] text-white placeholder-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full pl-10 pr-10 py-3 rounded-xl text-[13px] text-white placeholder-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-2/3 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        {/* Agree to terms */}
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => setAgreed(v => !v)}
            className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
            style={agreed
              ? { background: ACCENT, color: 'white' }
              : { background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.15)' }
            }>
            {agreed && <Check size={10} strokeWidth={3} />}
          </button>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            I agree to the{' '}
            <a href="#" className="font-semibold hover:underline" style={{ color: ACCENT }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="font-semibold hover:underline" style={{ color: ACCENT }}>Privacy Policy</a>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold text-white transition-all disabled:opacity-60 mt-2"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`, boxShadow: `0 4px 20px ${ACCENT}33` }}>
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
            : <>Create Account <ArrowRight size={15} /></>
          }
        </button>
      </form>

      {/* Benefits */}
      <div className="mt-6 p-4 rounded-xl space-y-2"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          'Free 10 AI generations per month',
          'Access to all basic templates',
          'React/Next.js/Vue/Tailwind export',
          'Priority support',
        ].map(b => (
          <div key={b} className="flex items-center gap-2 text-[11px] text-gray-400">
            <Check size={11} style={{ color: SUCCESS }} strokeWidth={3} />
            {b}
          </div>
        ))}
      </div>

      <p className="text-center text-[13px] mt-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Already have an account?{' '}
        <Link to="/auth/login" className="font-bold hover:underline" style={{ color: ACCENT }}>
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
