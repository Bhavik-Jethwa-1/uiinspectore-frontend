import { useState, useEffect } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, MessageSquare, Activity as ActivityIcon, Send,
  MoreVertical, Crown, Shield, Pencil, Eye, Trash2, Reply,
  Heart, AtSign, Clock, Sparkles, Mail, CheckCircle2, AlertCircle,
  GitBranch, Upload, Star
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ROLE_META = {
  owner:  { label: 'Owner',  icon: Crown,  className: 'owner' },
  admin:  { label: 'Admin',  icon: Shield, className: 'admin' },
  editor: { label: 'Editor', icon: Pencil, className: 'editor' },
  viewer: { label: 'Viewer', icon: Eye,    className: 'viewer' },
};

const AVATAR_PALETTE = ['#7c5cff', '#ff6b9d', '#00d4ff', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'];

function avatarColor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || '?';
}

const DEMO_MEMBERS = [
  { id: 'u1', name: 'Maya Chen',      email: 'maya@acme.io',      role: 'owner',  status: 'online' },
  { id: 'u2', name: 'Diego Alvarez',  email: 'diego@acme.io',     role: 'admin',  status: 'online' },
  { id: 'u3', name: 'Priya Shah',     email: 'priya@acme.io',     role: 'editor', status: 'away' },
  { id: 'u4', name: 'Jonas Weber',    email: 'jonas@acme.io',     role: 'editor', status: 'offline' },
  { id: 'u5', name: 'Aiko Tanaka',    email: 'aiko@acme.io',      role: 'viewer', status: 'online' },
];

const DEMO_COMMENTS = [
  {
    id: 'c1', user: 'Maya Chen', time: '2h ago', project: 'Onboarding v3',
    text: 'Loving the new CTA contrast — but the @diego spacing on the secondary button feels off by 4px.',
    likes: 4,
  },
  {
    id: 'c2', user: 'Diego Alvarez', time: '1h ago', project: 'Pricing page',
    text: 'Fixed! Also pushed the @priya suggestion to make the hero copy 12% larger on mobile.',
    likes: 2,
  },
  {
    id: 'c3', user: 'Priya Shah', time: '23m ago', project: 'Checkout flow',
    text: 'I think we should A/B test the new payment error UX before rolling out — risk of +3% drop-off.',
    likes: 6,
  },
];

const DEMO_ACTIVITY = [
  { id: 'a1', icon: GitBranch, color: '#7c5cff', user: 'Diego Alvarez', action: 'pushed 3 commits to', target: 'design-tokens', time: '12m ago' },
  { id: 'a2', icon: Upload,    color: '#00d4ff', user: 'Maya Chen',     action: 'uploaded screenshots to', target: 'Onboarding v3', time: '1h ago' },
  { id: 'a3', icon: CheckCircle2, color: '#10b981', user: 'Priya Shah', action: 'resolved issue', target: '#124 — Form labels contrast', time: '2h ago' },
  { id: 'a4', icon: Star,      color: '#f59e0b', user: 'Aiko Tanaka',   action: 'starred report', target: 'Q3 UX Audit', time: '4h ago' },
  { id: 'a5', icon: AlertCircle, color: '#ef4444', user: 'Diego Alvarez', action: 'flagged critical issue', target: 'Checkout — payment error', time: '6h ago' },
];

export default function TeamPage() {
  const { user } = useAuth();
  const { ask } = useConfirm();
  const [members, setMembers] = useState(DEMO_MEMBERS);
  const [comments, setComments] = useState(DEMO_COMMENTS);
  const [activity] = useState(DEMO_ACTIVITY);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.request('/team/members').catch(() => null);
        if (Array.isArray(data?.members) && data.members.length) setMembers(data.members);
      } catch {}
      try {
        const data = await api.request('/team/comments').catch(() => null);
        if (Array.isArray(data?.comments) && data.comments.length) setComments(data.comments);
      } catch {}
    })();
  }, []);

  const invite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError('');
    try {
      const data = await api.request('/team/invite', {
        method: 'POST',
        body: { email: inviteEmail.trim(), role: inviteRole },
      }).catch(() => null);

      const newMember = data?.member || {
        id: `local-${Date.now()}`,
        name: inviteEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'offline',
        invited: true,
      };
      setMembers(prev => [newMember, ...prev]);
      setInviteEmail('');
      setInviteRole('editor');
    } catch (err) {
      setError(err.message || 'Failed to send invite.');
    } finally {
      setInviting(false);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const data = await api.request('/team/comments', {
        method: 'POST',
        body: { text: newComment.trim() },
      }).catch(() => null);
      const c = data?.comment || {
        id: `c-${Date.now()}`,
        user: user?.name || 'You',
        time: 'just now',
        project: 'General',
        text: newComment.trim(),
        likes: 0,
      };
      setComments(prev => [c, ...prev]);
      setNewComment('');
    } finally {
      setPosting(false);
    }
  };

  const removeMember = async (m) => {
    if (m.role === 'owner') return;
    if (!await ask({ title: 'Remove member?', message: `${m.name} will be removed from the workspace.`, confirmLabel: 'Remove', danger: true })) return;
    api.request(`/team/members/${m.id}`, { method: 'DELETE' }).catch(() => {});
    setMembers(prev => prev.filter(x => x.id !== m.id));
  };

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-badge"><Users size={11} /> Team Collaboration</div>
        <h1 className="module-title">Team</h1>
        <p className="module-subtitle">Manage team members, comments and notifications.</p>
      </div>

      {/* Invite */}
      <h3 className="module-section-title">Invite a member</h3>
      <form className="t-invite" onSubmit={invite}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          Send an invitation by email — they will join your workspace with the selected role.
        </p>
        <div className="t-invite-row">
          <div className="input-with-icon" style={{ position: 'relative' }}>
            <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="email"
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="teammate@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <select className="input" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
            {Object.entries(ROLE_META).filter(([k]) => k !== 'owner').map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button className="btn btn-primary" type="submit" disabled={inviting}>
            <UserPlus size={14} /> {inviting ? 'Sending…' : 'Invite'}
          </button>
        </div>
        {error && <div className="auth-error" style={{ marginTop: 10 }}>{error}</div>}
      </form>

      <div className="t-layout">
        {/* Left col */}
        <div className="t-col">
          <h3 className="module-section-title">Members ({members.length})</h3>
          <div className="t-col">
            <AnimatePresence>
              {members.map((m) => {
                const roleMeta = ROLE_META[m.role] || ROLE_META.viewer;
                const RoleIcon = roleMeta.icon;
                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="t-member"
                  >
                    <div className="t-avatar" style={{ background: avatarColor(m.email || m.name) }}>
                      {initials(m.name)}
                      <span className={`t-status-dot ${m.status}`} />
                    </div>
                    <div className="t-member-info">
                      <p className="t-member-name">{m.name}{m.invited && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11 }}> · invited</span>}</p>
                      <p className="t-member-email">{m.email}</p>
                    </div>
                    <span className={`t-role ${roleMeta.className}`}>
                      <RoleIcon size={9} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                      {roleMeta.label}
                    </span>
                    <div className="t-member-actions">
                      <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => removeMember(m)} title="Remove">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <h3 className="module-section-title">Comments</h3>
          <form className="t-comment" onSubmit={postComment}>
            <div className="t-add-comment">
              <div className="t-avatar" style={{ background: avatarColor(user?.email || 'me'), width: 32, height: 32, fontSize: 12 }}>
                {initials(user?.name || 'Me')}
              </div>
              <textarea
                className="input"
                placeholder="Write a comment… use @name to mention someone"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={posting || !newComment.trim()}>
                <Send size={12} /> Post
              </button>
            </div>
          </form>
          {comments.map((c) => (
            <div key={c.id} className="t-comment">
              <div className="t-comment-head">
                <div className="t-avatar" style={{ background: avatarColor(c.user), width: 28, height: 28, fontSize: 11 }}>
                  {initials(c.user)}
                </div>
                <div>
                  <span className="t-comment-name">{c.user}</span>
                  {c.project && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}> on {c.project}</span>}
                  <div className="t-comment-time">{c.time}</div>
                </div>
              </div>
              <div className="t-comment-text">
                {c.text.split(/(@\w+)/g).map((part, i) =>
                  part.startsWith('@')
                    ? <span key={i} className="mention">{part}</span>
                    : <span key={i}>{part}</span>
                )}
              </div>
              <div className="t-comment-actions">
                <span><Heart size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {c.likes || 0}</span>
                <span><Reply size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> Reply</span>
                <span><AtSign size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> Mention</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right col — Activity */}
        <div className="t-col">
          <h3 className="module-section-title">Recent activity</h3>
          <div className="t-col">
            {activity.map((a) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="t-activity"
                >
                  <div className="t-activity-icon" style={{ background: `${a.color}1a`, color: a.color }}>
                    <Icon size={14} />
                  </div>
                  <div className="t-activity-body">
                    <p className="t-activity-title">
                      <b>{a.user}</b> {a.action} <b style={{ color: a.color }}>{a.target}</b>
                    </p>
                    <span className="t-activity-time">
                      <Clock size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                      {a.time}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}