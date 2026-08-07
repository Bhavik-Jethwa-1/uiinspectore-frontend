import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-[24px] font-black mb-2" style={{ color: 'var(--text)' }}>Settings</h1>
      <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Platform settings</p>
      <div className="mt-8 rounded-2xl border p-12 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Settings size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Settings page coming soon</p>
      </div>
    </div>
  );
}
