import { useState, useEffect } from 'react';
import AdminTable from '../../../components/shared/AdminTable';
import { Bell, Mail, MessageSquare, Smartphone, Send, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';

const ACCENT = '#ef4444';

const TYPE_COLORS = {
  email: '#06b6d4',
  sms: '#10b981',
  push: '#8b5cf6',
  webhook: '#f59e0b',
  in_app: '#6366f1',
};

const TYPE_ICONS = {
  email: Mail,
  sms: MessageSquare,
  push: Smartphone,
  webhook: Send,
  in_app: Bell,
};

const STATUS_COLORS = {
  delivered: '#10b981',
  opened: '#06b6d4',
  clicked: '#8b5cf6',
  failed: '#ef4444',
  pending: '#f59e0b',
  bounced: '#f97316',
};

const NOTIFICATIONS = [
  { id: 1, title: 'Welcome to UIInspectore Pro!',          type: 'email',   sentTo: 'sarah@example.com',     sentAt: '2026-07-24 09:42:18', status: 'opened',    campaign: 'onboarding-pro' },
  { id: 2, title: 'Your trial ends in 3 days',              type: 'email',   sentTo: 'yuki@studio.jp',         sentAt: '2026-07-24 09:30:12', status: 'delivered', campaign: 'trial-expiry' },
  { id: 3, title: 'New AI model: Claude 3.5 Sonnet',         type: 'push',    sentTo: '12,847 users',          sentAt: '2026-07-24 09:15:00', status: 'clicked',   campaign: 'product-update' },
  { id: 4, title: 'Payment failed: card ending 1111',       type: 'email',   sentTo: 'emma@freelance.net',     sentAt: '2026-07-24 08:48:33', status: 'opened',    campaign: 'payment-failed' },
  { id: 5, title: 'Verify your phone number',                type: 'sms',     sentTo: '+1 555-0142',            sentAt: '2026-07-24 08:22:14', status: 'delivered', campaign: '2fa-setup' },
  { id: 6, title: 'Team invitation: join Acme Corp',         type: 'email',   sentTo: 'newdev@acme.com',        sentAt: '2026-07-24 07:55:42', status: 'clicked',   campaign: 'team-invite' },
  { id: 7, title: 'Critical: Storage limit 90% reached',     type: 'in_app',  sentTo: 'james@corp.io',          sentAt: '2026-07-24 07:32:18', status: 'delivered', campaign: 'storage-warning' },
  { id: 8, title: 'Weekly usage summary',                     type: 'email',   sentTo: '8,294 users',            sentAt: '2026-07-24 06:00:00', status: 'opened',    campaign: 'weekly-digest' },
  { id: 9, title: 'New comment on your design',              type: 'push',    sentTo: 'priya@design.co',        sentAt: '2026-07-23 22:11:50', status: 'clicked',   campaign: 'social-engagement' },
  { id: 10, title: 'Export ready for download',              type: 'in_app',  sentTo: 'alex.j@agency.com',      sentAt: '2026-07-23 21:48:30', status: 'failed',    campaign: 'export-ready' },
  { id: 11, title: 'Stripe webhook: invoice.paid',            type: 'webhook', sentTo: 'https://api.acme.com',    sentAt: '2026-07-23 21:22:08', status: 'delivered', campaign: 'stripe-webhook' },
  { id: 12, title: 'Verify your email address',              type: 'email',   sentTo: 'carlos@dev.es',          sentAt: '2026-07-23 20:14:11', status: 'bounced',   campaign: 'email-verify' },
];

const FIELDS = [
  { key: 'title', label: 'Title', sortable: true, render: (v, row) => (
    <div>
      <div className="text-[12px] font-semibold text-white">{v}</div>
      <div className="text-[10px] text-gray-500 mt-0.5 font-mono">{row.campaign}</div>
    </div>
  )},
  { key: 'type', label: 'Type', sortable: true, render: v => {
    const Icon = TYPE_ICONS[v];
    return (
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1.5"
        style={{ background: `${TYPE_COLORS[v]}15`, color: TYPE_COLORS[v] }}>
        <Icon size={10} />
        {v.replace('_', ' ')}
      </span>
    );
  }},
  { key: 'sentTo', label: 'Sent To', render: v => (
    <span className="text-[11px] font-mono text-gray-300">{v}</span>
  )},
  { key: 'sentAt', label: 'Sent At', sortable: true, render: v => (
    <span className="text-[11px] font-mono text-gray-400">{v}</span>
  )},
  { key: 'status', label: 'Status', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1 capitalize"
      style={{ background: `${STATUS_COLORS[v]}15`, color: STATUS_COLORS[v] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[v] }} />
      {v}
    </span>
  )},
];

export default function AdminNotificationsPage() {
  const [data, setData] = useState(NOTIFICATIONS);
  const [loading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const deliveredCount = NOTIFICATIONS.filter(n => n.status === 'delivered' || n.status === 'opened' || n.status === 'clicked').length;
  const failedCount = NOTIFICATIONS.filter(n => n.status === 'failed' || n.status === 'bounced').length;
  const openRate = '67.4%';
  const clickRate = '24.8%';

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <Bell size={20} style={{ color: ACCENT }} /> System Notifications
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Email, SMS, push, and webhook delivery history — {NOTIFICATIONS.length} events in the last 24h
            </p>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'email', 'sms', 'push', 'in_app'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all"
                style={typeFilter === t
                  ? { background: ACCENT, color: '#fff' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }
                }>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Delivered',  value: deliveredCount.toString(),  icon: CheckCircle2, color: '#10b981' },
            { label: 'Failed',     value: failedCount.toString(),     icon: XCircle,      color: '#ef4444' },
            { label: 'Open Rate',  value: openRate,                    icon: Mail,         color: '#06b6d4' },
            { label: 'Click Rate', value: clickRate,                   icon: Send,         color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}15` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-[22px] font-black text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Channel breakdown */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <h3 className="text-[14px] font-bold text-white mb-4">Channel Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.keys(TYPE_ICONS).map(t => {
              const Icon = TYPE_ICONS[t];
              const items = NOTIFICATIONS.filter(n => n.type === t);
              return (
                <div key={t} className="p-3 rounded-xl border"
                  style={{ background: `${TYPE_COLORS[t]}08`, borderColor: `${TYPE_COLORS[t]}30` }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon size={12} style={{ color: TYPE_COLORS[t] }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider capitalize" style={{ color: TYPE_COLORS[t] }}>
                      {t.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[18px] font-black text-white">{items.length}</div>
                  <div className="text-[10px] text-gray-500">last 24h</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications table */}
        <AdminTable
          title="All Notifications"
          subtitle="Delivery log across email, SMS, push, in-app, and webhooks"
          fields={FIELDS}
          data={typeFilter === 'all' ? data : data.filter(n => n.type === typeFilter)}
          loading={loading}
          searchable
          searchPlaceholder="Search by title, recipient, or campaign…"
          exportable
          stats={[
            { label: 'Delivered', value: NOTIFICATIONS.filter(n => n.status === 'delivered').length.toString() },
            { label: 'Opened',    value: NOTIFICATIONS.filter(n => n.status === 'opened').length.toString() },
            { label: 'Clicked',   value: NOTIFICATIONS.filter(n => n.status === 'clicked').length.toString() },
            { label: 'Failed',    value: failedCount.toString() },
          ]}
          actions={[
            { label: 'View',   onClick: row => alert(`View ${row.id}`) },
            { label: 'Retry',  onClick: row => alert(`Retry ${row.id}`) },
          ]}
        />
      </div>
    </div>
  );
}