import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Loader2, Check, Camera, Shield, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProfilePage() {
  const { user, updateProfile, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) { setErr('Invalid file type.'); return; }
    if (file.size > 2 * 1024 * 1024) { setErr('File too large (max 2MB).'); return; }
    setUploadingAvatar(true);
    setErr('');
    try {
      const form = new FormData();
      form.append('avatar', file);
      await api.updateProfile(form);
      await refreshUser();
    } catch { setErr('Failed to upload avatar.'); }
    finally { setUploadingAvatar(false); }
  };

  const handleSave = async () => {
    if (!name.trim()) { setErr('Name is required.'); return; }
    setSaving(true);
    setErr('');
    try {
      await updateProfile({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setErr('Failed to update profile.'); }
    finally { setSaving(false); }
  };

  const isAdmin = user?.role === 'admin' || user?.is_admin || user?.isAdmin;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold" style={{ color: 'var(--text)' }}>Profile</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage your account information and preferences
        </p>
      </div>

      <div className="space-y-5">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-[13px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
            Profile Picture
          </h2>
          <div className="flex items-center gap-5">
            {/* Avatar preview */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, #7c5cff, #ff6b9d)' }}
              >
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : (name.slice(0, 1) || user?.email?.slice(0, 1) || '?').toUpperCase()
                }
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <button
                onClick={handleAvatarClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c5cff, #a78bfa)', color: 'white' }}
              >
                <Camera size={14} /> Change photo
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </motion.div>

        {/* Personal info card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border p-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-[13px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
            Personal Information
          </h2>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>
                Full Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none transition-all"
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                  onFocus={(e) => e.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.style.borderColor = 'var(--border)'}
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] outline-none cursor-not-allowed"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                />
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)' }}>
                <Shield size={13} style={{ color: '#a78bfa' }} />
                <span className="text-[11px] font-semibold" style={{ color: '#a78bfa' }}>
                  {isAdmin ? 'Administrator' : 'Member'}
                </span>
              </div>
              {isAdmin && (
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Full access to all features</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {err && (
          <div className="px-4 py-3 rounded-xl text-[12px] font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {err}
          </div>
        )}

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: saved ? '#10b981' : 'linear-gradient(135deg, #7c5cff, #a78bfa)', boxShadow: saved ? 'none' : '0 4px 14px rgba(124,92,255,0.35)' }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
