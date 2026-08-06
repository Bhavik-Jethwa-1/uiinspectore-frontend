import { useState, useEffect } from 'react';
import { useInspectorAuth } from '../../contexts/InspectorAuthContext';
import { inspectorApi } from '../../utils/inspectorApi';
import { Save, User, Lock, Trash2, Eye, EyeOff, CheckCircle, AlertTriangle, X, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/LoadingScreen';

const ACCENT = '#7c5cff';

function AppearanceSection() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const options = [
    {
      value: 'dark',
      icon: Moon,
      label: 'Dark',
      desc: 'Easy on the eyes at night',
      preview: 'linear-gradient(135deg, #09090b 50%, #18181b 50%)',
    },
    {
      value: 'light',
      icon: Sun,
      label: 'Light',
      desc: 'Clean and bright',
      preview: 'linear-gradient(135deg, #ffffff 50%, #f4f4f5 50%)',
    },
    {
      value: 'system',
      icon: Monitor,
      label: 'System',
      desc: `Following ${resolvedTheme}`,
      preview: 'linear-gradient(135deg, #09090b 25%, #ffffff 25%, #ffffff 50%, #09090b 50%, #09090b 75%, #ffffff 75%)',
    },
  ];

  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
          <Moon size={15} style={{ color: ACCENT }} />
        </div>
        <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>Appearance</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map(({ value, icon: Icon, label, desc, preview }) => {
          const selected = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className="relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
              style={{
                background: 'var(--bg)',
                borderColor: selected ? ACCENT : 'var(--border)',
                boxShadow: selected ? `0 0 0 2px ${ACCENT}30` : 'none',
              }}
            >
              {/* Color preview swatch */}
              <div
                className="w-full h-10 rounded-lg border"
                style={{ background: preview, borderColor: 'var(--border)' }}
              />
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1.5">
                  {selected && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
                  )}
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--text)' }}>{label}</span>
                </div>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
            {danger
              ? <AlertTriangle size={20} className="text-red-400" />
              : <AlertTriangle size={20} className="text-amber-400" />
            }
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text)' }}>{title}</h3>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-[13px] font-medium border transition-all hover:opacity-70"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all"
                style={{ background: danger ? '#ef4444' : ACCENT }}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
          <button onClick={onCancel} className="shrink-0 p-1 rounded-lg hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useInspectorAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState({ name: '', email: '' });

  // Password state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({ current: '', new: '', confirm: '' });
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleProfileSave = async () => {
    const errors = { name: '', email: '' };
    if (!profile.name.trim()) errors.name = 'Name is required';
    if (!profile.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errors.email = 'Invalid email address';
    if (errors.name || errors.email) {
      setProfileErrors(errors);
      return;
    }
    setProfileErrors({ name: '', email: '' });
    setLoading(true);
    setMessage(null);
    try {
      const res = await inspectorApi.updateProfile({ name: profile.name, email: profile.email });
      if (setUser && res.user) setUser(res.user);
      setProfileSaved(true);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    const errors = { current: '', new: '', confirm: '' };
    if (!passwords.current) errors.current = 'Current password is required';
    if (!passwords.new) errors.new = 'New password is required';
    else if (passwords.new.length < 8) errors.new = 'Must be at least 8 characters';
    if (!passwords.confirm) errors.confirm = 'Please confirm your new password';
    else if (passwords.new !== passwords.confirm) errors.confirm = 'Passwords do not match';
    if (errors.current || errors.new || errors.confirm) {
      setPasswordErrors(errors);
      return;
    }
    setPasswordErrors({ current: '', new: '', confirm: '' });
    setLoading(true);
    setMessage(null);
    try {
      await inspectorApi.updateProfile({
        current_password: passwords.current,
        password: passwords.new,
        password_confirmation: passwords.confirm,
      });
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordSaved(true);
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    setDeleting(true);
    try {
      const res = await inspectorApi.deleteAccount();
      setShowDeleteModal(false);
      // Clear local auth and redirect
      localStorage.removeItem('inspector_token');
      localStorage.removeItem('inspector_user');
      // Small delay to let modal close before redirect
      setTimeout(() => {
        window.location.href = '/inspector/landing';
      }, 100);
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to delete data' });
      setShowDeleteModal(false);
      setDeleting(false);
    }
  };

  // Simulate initial load for skeleton
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (pageLoading) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-6">
        <div>
          <Skeleton className="h-6 w-20 rounded mb-1" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
        {/* Profile skeleton */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-2 w-10 rounded mb-2" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-2 w-10 rounded mb-2" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
        {/* Appearance skeleton */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-20 w-20 rounded-xl" />
            <Skeleton className="h-20 w-20 rounded-xl" />
            <Skeleton className="h-20 w-20 rounded-xl" />
          </div>
        </div>
        {/* Password skeleton */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-2 w-28 rounded mb-2" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-2 w-24 rounded mb-2" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-2 w-28 rounded mb-2" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account & security</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'
          }`} style={{ background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
          {message.type === 'success' && <CheckCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
            <User size={15} style={{ color: ACCENT }} />
          </div>
          <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => { setProfile(p => ({ ...p, name: e.target.value })); setProfileErrors(p => ({ ...p, name: '' })); }}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
              style={{ background: 'var(--bg)', borderColor: profileErrors.name ? '#ef4444' : 'var(--border)', color: 'var(--text)' }}
            />
            {profileErrors.name && (
              <p className="text-[11px] mt-1.5" style={{ color: '#ef4444' }}>{profileErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={e => { setProfile(p => ({ ...p, email: e.target.value })); setProfileErrors(p => ({ ...p, email: '' })); }}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
              style={{ background: 'var(--bg)', borderColor: profileErrors.email ? '#ef4444' : 'var(--border)', color: 'var(--text)' }}
            />
            {profileErrors.email && (
              <p className="text-[11px] mt-1.5" style={{ color: '#ef4444' }}>{profileErrors.email}</p>
            )}
          </div>
          <div className="pt-1">
            <button
              onClick={handleProfileSave}
              disabled={loading || !profile.name.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: profileSaved ? '#22c55e' : ACCENT }}
            >
              <Save size={13} />
              {profileSaved ? 'Saved!' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <AppearanceSection />

      {/* Change Password Section */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
            <Lock size={15} style={{ color: ACCENT }} />
          </div>
          <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>Change Password</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwords.current}
                onChange={e => { setPasswords(p => ({ ...p, current: e.target.value })); setPasswordErrors(p => ({ ...p, current: '' })); }}
                placeholder="Enter current password"
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-[13px] border outline-none transition-all placeholder:opacity-50"
                style={{ background: 'var(--bg)', borderColor: passwordErrors.current ? '#ef4444' : 'var(--border)', color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-2/3 -translate-y-1/2 p-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.current && (
              <p className="text-[11px] mt-1.5" style={{ color: '#ef4444' }}>{passwordErrors.current}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwords.new}
                onChange={e => { setPasswords(p => ({ ...p, new: e.target.value })); setPasswordErrors(p => ({ ...p, new: '' })); }}
                placeholder="Enter new password"
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-[13px] border outline-none transition-all placeholder:opacity-50"
                style={{ background: 'var(--bg)', borderColor: passwordErrors.new ? '#ef4444' : 'var(--border)', color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(s => ({ ...s, new: !s.new }))}
                className="absolute right-3 top-2/3 -translate-y-1/2 p-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.new && (
              <p className="text-[11px] mt-1.5" style={{ color: '#ef4444' }}>{passwordErrors.new}</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={e => { setPasswords(p => ({ ...p, confirm: e.target.value })); setPasswordErrors(p => ({ ...p, confirm: '' })); }}
                placeholder="Confirm new password"
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-[13px] border outline-none transition-all placeholder:opacity-50"
                style={{ background: 'var(--bg)', borderColor: passwordErrors.confirm ? '#ef4444' : 'var(--border)', color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-2/3 -translate-y-1/2 p-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.confirm && (
              <p className="text-[11px] mt-1.5" style={{ color: '#ef4444' }}>{passwordErrors.confirm}</p>
            )}
          </div>
          <div className="pt-1">
            <button
              onClick={handlePasswordSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: passwordSaved ? '#22c55e' : ACCENT }}
            >
              <Lock size={13} />
              {passwordSaved ? 'Password Changed!' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <Trash2 size={15} style={{ color: '#ef4444' }} />
          </div>
          <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>Account</h2>
        </div>
        <p className="text-[12px] mb-4" style={{ color: 'var(--text-muted)' }}>
          Permanently delete all your projects, reviews, and screenshots. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-red-400 border transition-all hover:bg-red-500/10"
          style={{ borderColor: 'rgba(239,68,68,0.4)' }}
        >
          <Trash2 size={13} />
          Delete All Data
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete All Data?"
          message="This will permanently delete all your projects, reviews, screenshots, and account data. This action cannot be undone."
          confirmLabel={deleting ? 'Deleting...' : 'Delete Everything'}
          onConfirm={handleDeleteAllData}
          onCancel={() => setShowDeleteModal(false)}
          danger
        />
      )}
    </div>
  );
}
