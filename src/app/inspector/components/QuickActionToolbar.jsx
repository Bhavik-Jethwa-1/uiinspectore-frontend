import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Wand2, Download, Share2, Eye, Loader2,
  Copy, CheckCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { ACCENT } from '../constants/theme';

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({ icon: Icon, label, onClick, loading, disabled, variant = 'default', active }) {
  const isPrimary = variant === 'primary';
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={disabled || loading}
      className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      style={{
        background: isPrimary ? ACCENT : active ? `${ACCENT}18` : 'var(--surface)',
        color: isPrimary ? '#fff' : active ? ACCENT : 'var(--text-muted)',
        border: isPrimary ? 'none' : `1px solid ${active ? `${ACCENT}50` : 'var(--border)'}`,
        boxShadow: isPrimary ? `0 4px 16px ${ACCENT}35` : 'none',
      }}
      onMouseEnter={e => {
        if (!isPrimary && !active) {
          e.currentTarget.style.borderColor = 'var(--text-muted)';
          e.currentTarget.style.color = 'var(--text)';
        }
      }}
      onMouseLeave={e => {
        if (!isPrimary && !active) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Icon size={13} style={active ? { color: ACCENT } : {}} />
      )}
      {label}
    </motion.button>
  );
}

// ─── Share Button ─────────────────────────────────────────────────────────────
function ShareButton({ projectId }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/inspector/projects/${projectId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleShare}
      className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
      style={{
        background: 'var(--surface)',
        color: 'var(--text-muted)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {copied ? <CheckCircle size={13} style={{ color: '#22c55e' }} /> : <Share2 size={13} />}
      {copied ? 'Copied!' : 'Share'}
    </motion.button>
  );
}

// ─── Download Button ──────────────────────────────────────────────────────────
function DownloadButton({ screenshotUrl, redesignUrl, projectName }) {
  const [showMenu, setShowMenu] = useState(false);

  const downloadImage = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank');
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setShowMenu(!showMenu)}
        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
        style={{
          background: 'var(--surface)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <Download size={13} /> Download
      </motion.button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 top-full mt-2 rounded-xl py-1 z-20 min-w-[180px]"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          >
            {screenshotUrl && (
              <button
                onClick={() => downloadImage(screenshotUrl, `${projectName}-original.png`)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[12px] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Eye size={12} /> Original Screenshot
              </button>
            )}
            {redesignUrl && (
              <button
                onClick={() => downloadImage(redesignUrl, `${projectName}-ai-improved.png`)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[12px] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Wand2 size={12} /> AI Redesign
              </button>
            )}
            {!screenshotUrl && !redesignUrl && (
              <div className="px-3 py-2.5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                No images available
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

// ─── Quick Action Toolbar ─────────────────────────────────────────────────────
export default function QuickActionToolbar({
  projectId,
  projectName,
  screenshotUrl,
  redesignUrl,
  reviewStatus,       // 'none' | 'pending' | 'analyzing' | 'done'
  redesignStatus,     // 'none' | 'generating' | 'done'
  hasReview,
  hasRedesign,
  onReview,
  onRegenerateRedesign,
  onCompare,
  generatingReview,
  generatingRedesign,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Review */}
      <ActionBtn
        icon={Zap}
        label={generatingReview ? 'Analyzing…' : hasReview ? 'Re-Review' : 'Review'}
        onClick={onReview}
        loading={generatingReview}
        disabled={!screenshotUrl && !hasReview}
        variant={!hasReview ? 'primary' : 'default'}
      />

      {/* Redesign / Regenerate */}
      <ActionBtn
        icon={generatingRedesign ? Loader2 : hasRedesign ? RefreshCw : Wand2}
        label={generatingRedesign ? 'Generating…' : hasRedesign ? 'Regenerate' : 'Redesign'}
        onClick={onRegenerateRedesign}
        loading={generatingRedesign}
        disabled={!screenshotUrl}
        variant={!hasRedesign && !generatingRedesign ? 'primary' : 'default'}
      />

      {/* Compare */}
      <ActionBtn
        icon={Eye}
        label="Compare"
        onClick={onCompare}
        disabled={!hasRedesign}
        active={false}
      />

      <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

      {/* Download */}
      <DownloadButton
        screenshotUrl={screenshotUrl}
        redesignUrl={redesignUrl}
        projectName={projectName}
      />

      {/* Share */}
      <ShareButton projectId={projectId} />
    </div>
  );
}
