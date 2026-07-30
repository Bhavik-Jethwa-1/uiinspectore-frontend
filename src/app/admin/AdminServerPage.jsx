import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Cpu, HardDrive, Wifi, Activity, Clock, Zap, MemoryStick, Network, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

const ACCENT = '#ef4444';

function GaugeCard({ icon: Icon, label, value, unit, pct, color, delay, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border p-5"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}15` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <div className="text-[12px] font-semibold text-white">{label}</div>
            {subtitle && <div className="text-[10px] text-gray-500">{subtitle}</div>}
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-[36px] font-black text-white leading-none">{value}</span>
        <span className="text-[14px] text-gray-500 font-semibold">{unit}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: pct > 80
              ? `linear-gradient(90deg, ${color}, ${ACCENT})`
              : pct > 60
                ? `linear-gradient(90deg, ${color}, #f59e0b)`
                : color,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-gray-500">0%</span>
        <span className="font-bold" style={{ color: pct > 80 ? ACCENT : color }}>{pct.toFixed(1)}%</span>
        <span className="text-gray-500">100%</span>
      </div>
    </motion.div>
  );
}

function MetricRow({ label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center justify-between py-2.5 border-b last:border-0"
      style={{ borderColor: 'rgba(239,68,68,0.06)' }}>
      <span className="text-[12px] text-gray-400">{label}</span>
      <span className="text-[12px] font-bold font-mono" style={{ color }}>{value}</span>
    </motion.div>
  );
}

export default function AdminServerPage() {
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  // Simulate live metrics
  useEffect(() => {
    setLoading(false);
    const i = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(i);
  }, []);

  // Vary values slightly each tick to feel "live"
  const cpuPct = 42 + (tick % 17);
  const ramPct = 67 + (tick % 9);
  const diskIops = 1240 + (tick * 13 % 200);
  const netIn = 18.4 + (tick % 7 * 0.3);
  const netOut = 9.2 + (tick % 5 * 0.2);

  const uptime = '47d 13h 22m';
  const loadAvg = [1.42, 1.88, 2.04];
  const processes = 247;

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <Server size={20} style={{ color: ACCENT }} /> Infrastructure
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Real-time resource utilization across primary and edge nodes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              All nodes healthy
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* Main gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GaugeCard
            icon={Cpu} label="CPU Usage" value={cpuPct.toFixed(1)} unit="%"
            pct={cpuPct} color="#8b5cf6" delay={0.05}
            subtitle="8 cores / 16 threads"
          />
          <GaugeCard
            icon={MemoryStick} label="RAM Usage" value={ramPct.toFixed(1)} unit="%"
            pct={ramPct} color="#06b6d4" delay={0.10}
            subtitle="10.7 GB / 16 GB"
          />
          <GaugeCard
            icon={HardDrive} label="Disk I/O" value={diskIops.toLocaleString()} unit="IOPS"
            pct={Math.min(100, (diskIops / 2000) * 100)} color="#10b981" delay={0.15}
            subtitle="NVMe SSD · 500 GB"
          />
          <GaugeCard
            icon={ArrowDown} label="Network In" value={netIn.toFixed(2)} unit="MB/s"
            pct={Math.min(100, (netIn / 50) * 100)} color="#f59e0b" delay={0.20}
            subtitle="eth0 · 1 Gbps"
          />
          <GaugeCard
            icon={ArrowUp} label="Network Out" value={netOut.toFixed(2)} unit="MB/s"
            pct={Math.min(100, (netOut / 50) * 100)} color="#f97316" delay={0.25}
            subtitle="eth0 · 1 Gbps"
          />
          <GaugeCard
            icon={Clock} label="Uptime" value={uptime.split(' ')[0]} unit="days"
            pct={97.4} color="#10b981" delay={0.30}
            subtitle={`${uptime} continuous`}
          />
        </div>

        {/* Detailed metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <h3 className="text-[14px] font-bold text-white mb-3 flex items-center gap-2">
              <Cpu size={14} className="text-gray-500" /> CPU Details
            </h3>
            <MetricRow label="Model"          value="AMD EPYC 7763"  color="#8b5cf6" delay={0.1} />
            <MetricRow label="Cores / Threads" value="8 / 16"         color="#8b5cf6" delay={0.15} />
            <MetricRow label="Base Frequency" value="2.45 GHz"       color="#8b5cf6" delay={0.2} />
            <MetricRow label="Load Avg (1m)"  value={loadAvg[0].toFixed(2)} color="#10b981" delay={0.25} />
            <MetricRow label="Load Avg (5m)"  value={loadAvg[1].toFixed(2)} color="#f59e0b" delay={0.3} />
            <MetricRow label="Load Avg (15m)" value={loadAvg[2].toFixed(2)} color="#f59e0b" delay={0.35} />
            <MetricRow label="Context Switches" value="42,841/s"      color="#9ca3af" delay={0.4} />
          </div>

          <div className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <h3 className="text-[14px] font-bold text-white mb-3 flex items-center gap-2">
              <MemoryStick size={14} className="text-gray-500" /> Memory Details
            </h3>
            <MetricRow label="Total"          value="16.0 GB"        color="#06b6d4" delay={0.1} />
            <MetricRow label="Used"           value="10.7 GB"        color="#10b981" delay={0.15} />
            <MetricRow label="Free"           value="5.3 GB"         color="#9ca3af" delay={0.2} />
            <MetricRow label="Cached"         value="2.4 GB"         color="#8b5cf6" delay={0.25} />
            <MetricRow label="Buffers"        value="384 MB"         color="#9ca3af" delay={0.3} />
            <MetricRow label="Swap Used"      value="0 MB"           color="#10b981" delay={0.35} />
            <MetricRow label="Active"         value="8.1 GB"         color="#06b6d4" delay={0.4} />
          </div>

          <div className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <h3 className="text-[14px] font-bold text-white mb-3 flex items-center gap-2">
              <HardDrive size={14} className="text-gray-500" /> Disk Details
            </h3>
            <MetricRow label="Filesystem"     value="ext4 / NVMe"    color="#9ca3af" delay={0.1} />
            <MetricRow label="Total"          value="500 GB"         color="#06b6d4" delay={0.15} />
            <MetricRow label="Used"           value="284 GB"         color="#f59e0b" delay={0.2} />
            <MetricRow label="Available"      value="216 GB"         color="#10b981" delay={0.25} />
            <MetricRow label="Read IOPS"      value="847"            color="#10b981" delay={0.3} />
            <MetricRow label="Write IOPS"     value="393"            color="#8b5cf6" delay={0.35} />
            <MetricRow label="Processes"      value={processes.toString()} color="#f59e0b" delay={0.4} />
          </div>
        </div>

        {/* Node cluster */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
            <Network size={14} className="text-gray-500" /> Cluster Nodes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: 'app-01.primary', region: 'us-east-1',  cpu: 42, ram: 67, status: 'healthy', color: '#10b981' },
              { name: 'app-02.primary', region: 'us-east-1',  cpu: 38, ram: 71, status: 'healthy', color: '#10b981' },
              { name: 'app-03.secondary', region: 'us-west-2', cpu: 51, ram: 58, status: 'healthy', color: '#10b981' },
              { name: 'worker-eu-01',     region: 'eu-west-1',  cpu: 78, ram: 82, status: 'warning', color: '#f59e0b' },
              { name: 'worker-eu-02',     region: 'eu-west-1',  cpu: 24, ram: 41, status: 'healthy', color: '#10b981' },
              { name: 'ai-gpu-01',        region: 'us-east-1',  cpu: 92, ram: 88, status: 'warning', color: '#f59e0b' },
              { name: 'ai-gpu-02',        region: 'us-east-1',  cpu: 18, ram: 24, status: 'healthy', color: '#10b981' },
              { name: 'edge-ap-01',       region: 'ap-south-1', cpu: 33, ram: 47, status: 'healthy', color: '#10b981' },
            ].map((node, i) => (
              <motion.div
                key={node.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="p-3 rounded-xl border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.08)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-white truncate">{node.name}</span>
                  <span className="w-2 h-2 rounded-full" style={{ background: node.color }} />
                </div>
                <div className="text-[10px] text-gray-500 mb-2">{node.region}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[9px] text-gray-500">CPU</div>
                    <div className="text-[12px] font-bold text-white">{node.cpu}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500">RAM</div>
                    <div className="text-[12px] font-bold text-white">{node.ram}%</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}