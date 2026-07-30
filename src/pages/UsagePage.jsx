import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Loader2, AlertCircle, ArrowUpRight,
  CheckCircle2, XCircle, Clock, RefreshCw, Zap,
} from 'lucide-react';
import { getUsage, USAGE_FEATURE_ORDER, FEATURE_LABELS } from '../utils/billingApi';

const ACCENT     = '#7c5cff';
const ACCENT_PINK = '#ff6b9d';
const SUCCESS    = '#10b981';
const WARNING    = '#f59e0b';
const DANGER     = '#f87171';
const INFO      = '#06b6d4';

function LimitBar({ used, limit, label, color, unlimited }) {
  const pct = unlimited ? 0 : Math.min(100, (used / Math.max(limit, 1)) * 100);
  const statusColor = unlimited ? SUCCESS : pct >= 90 ? DANGER : pct >= 70 ? WARNING : color || SUCCESS;

  const barColor = unlimited
    ? `linear-gradient(90deg, ${SUCCESS}, ${INFO})`
    : pct >= 90
      ? `linear-gradient(90deg, ${DANGER}, ${WARNING})`
      : pct >= 70
        ? `linear-gradient(90deg, ${WARNING}, ${WARNING}88)`
        : `linear-gradient(90deg, ${statusColor}, ${statusColor}cc)`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-2)' }}>{label}</span>
        <div className="flex items-center gap-2">
          {unlimited ? (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${SUCCESS}18`, color: SUCCESS }}>
              <CheckCircle2 size={10} className="inline mr-1" />Unlimited
            </span>
          ) : (
            <span className="text-[12px] font-bold" style={{ color: statusColor }}>
              {used} / {limit}
            </span>
          )}
        </div>
      </div>

      {!unlimited && (
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      )}

      {!unlimited && (
        <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span>{pct.toFixed(0)}% used</span>
          <span>{Math.max(0, limit - used)} remaining</span>
        </div>
      )}
    </div>
  );
}

function UsageCard({ feature, data, index }) {
  const limit = data.limit ?? 0;
  const unlimited = limit === -1;
  const exceeded = data.exceeded;
  const label = FEATURE_LABELS[feature] || feature;

  const color = exceeded ? DANGER : ACCENT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="rounded-2xl border p-5"
      style={{
        background: 'var(--surface)',
        borderColor: exceeded ? `${DANGER}30` : 'var(--border)',
        boxShadow: exceeded ? `0 0 20px ${DANGER}10` : 'none',
      }}
    >
      {exceeded && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: `${DANGER}10`, color: DANGER }}>
          <AlertCircle size={13} />
          Limit reached — upgrade to Pro for unlimited
          <ArrowUpRight size={12} className="ml-auto" />
        </div>
      )}
      <LimitBar
        used={data.used}
        limit={limit}
        label={label}
        color={color}
        unlimited={unlimited}
      />
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl border p-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-[12px] font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div className="text-[24px] font-black" style={{ color }}>{value}</div>
    </motion.div>
  );
}

export default function UsagePage() {
  const [usage, setUsage] = useState({});
  const [limits, setLimits] = useState({});
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getUsage();
      setUsage(data.usage || {});
      setLimits(data.limits || {});
      setPeriod(data.period || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: ACCENT }} />
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading usage data…</p>
        </div>
      </div>
    );
  }

  const totalUsed = Object.values(usage).reduce((s, u) => s + (u.used || 0), 0);
  const totalLimits = Object.values(usage).reduce((s, u) => s + (u.limit > 0 ? u.limit : 0), 0);
  const exceededCount = Object.values(usage).filter(u => u.exceeded).length;

  return (
    <div className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-[22px] font-black mb-1" style={{ color: 'var(--text)' }}>Usage</h1>
            {period && (
              <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                <Clock size={11} />
                Resets {new Date(period.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all hover:bg-[var(--surface2)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-6 py-5 max-w-4xl mx-auto">
        <div className="grid xs:grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Activity}  label="Total Used"    value={totalUsed.toLocaleString()} color={ACCENT}     delay={0.0} />
          <StatCard icon={Zap}       label="Features"     value={Object.keys(usage).length}    color={INFO}      delay={0.06} />
          <StatCard icon={CheckCircle2} label="In Limit"  value={Object.keys(usage).length - exceededCount} color={SUCCESS} delay={0.12} />
          <StatCard icon={XCircle}    label="Exceeded"    value={exceededCount}              color={exceededCount > 0 ? DANGER : SUCCESS} delay={0.18} />
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5" style={{ background: `${DANGER}10`, color: DANGER }}>
            <AlertCircle size={14} /> <span className="text-[12px]">{error}</span>
          </div>
        )}

        {/* Usage cards */}
        <div className="mb-6">
          <h2 className="text-[14px] font-bold mb-3" style={{ color: 'var(--text-2)' }}>Monthly Limits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {USAGE_FEATURE_ORDER.filter(f => usage[f]).map((feature, i) => (
              <UsageCard key={feature} feature={feature} data={usage[feature]} index={i} />
            ))}
          </div>
        </div>

        {exceededCount > 0 && (
          <div className="rounded-2xl p-5 border text-center"
            style={{ background: `linear-gradient(135deg, ${DANGER}08, ${WARNING}05)`, borderColor: `${DANGER}25` }}>
            <AlertCircle size={24} style={{ color: DANGER }} className="mx-auto mb-2" />
            <h3 className="text-[15px] font-bold mb-1" style={{ color: DANGER }}>
              You've reached a limit on {exceededCount} feature{exceededCount > 1 ? 's' : ''}
            </h3>
            <p className="text-[12px] mb-4" style={{ color: 'var(--text-muted)' }}>
              Upgrade to Pro for unlimited generations, exports, and AI features.
            </p>
            <button
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`, boxShadow: `0 4px 20px ${ACCENT}44` }}
              onClick={() => window.location.href = '/app/pricing'}
            >
              Upgrade to Pro <ArrowUpRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
