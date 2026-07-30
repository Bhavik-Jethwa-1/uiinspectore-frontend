import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';

const ACCENT     = '#7c5cff';
const ACCENT_PINK = '#ff6b9d';

export default function AuthLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #07071a 0%, #0f0a24 50%, #0a0618 100%)' }}>

      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ background: `${ACCENT}20` }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
        style={{ background: `${ACCENT_PINK}15` }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-[13px] font-medium text-gray-400 hover:text-white transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to home
      </Link>

      {/* Card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#ff6b9d] flex items-center justify-center mb-4"
            style={{ boxShadow: `0 8px 40px ${ACCENT}44` }}>
            <Layers size={26} color="white" />
          </div>
          <h1 className="text-[22px] font-black text-white">UI Inspectore</h1>
          <p className="text-[13px]" style={{ color: ACCENT }}>AI Studio</p>
        </div>

        <div className="relative rounded-3xl border p-8"
          style={{
            background: 'rgba(15,10,35,0.8)',
            backdropFilter: 'blur(40px)',
            borderColor: `${ACCENT}20`,
            boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${ACCENT}10`,
          }}>
          <Outlet />
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-gray-600 mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-gray-500 hover:text-gray-400">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-gray-500 hover:text-gray-400">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
