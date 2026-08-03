import { useState } from 'react';
import { useInspectorAuth } from '../../contexts/InspectorAuthContext';
import { inspectorApi } from '../../utils/inspectorApi';
import { Save, User, Lock, Trash2, Eye, EyeOff, CheckCircle, AlertTriangle, X } from 'lucide-react';

const ACCENT = '#7c5cff';

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileSaved, setProfileSaved] = useState(false);

  // Password state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleProfileSave = async () => {
    if (!profile.name.trim()) return;
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
    setPasswordError('');
    if (!passwords.current) { setPasswordError('Current password is required'); return; }
    if (passwords.new.length < 8) { setPasswordError('New password must be at least 8 characters'); return; }
    if (passwords.new !== passwords.confirm) { setPasswordError('Passwords do not match'); return; }
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

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account & security</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium ${
          message.type === 'success' ? 'text-green-400' : 'text-red-400'
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
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
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
                onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-[13px] border outline-none transition-all"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwords.new}
                onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-[13px] border outline-none transition-all"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(s => ({ ...s, new: !s.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-[13px] border outline-none transition-all"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {passwordError && (
            <p className="text-[12px] text-red-400">{passwordError}</p>
          )}
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
