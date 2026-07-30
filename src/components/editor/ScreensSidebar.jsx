import { useState } from 'react';
import { Plus, MoreVertical, Copy, Trash2, Edit2, ChevronLeft, ChevronRight, Image as ImageIcon, Monitor, Tablet, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEVICE_PRESETS } from '../../utils/elementLibrary';

function getDeviceType(width) {
  if (width <= 390) return 'mobile';
  if (width <= 800) return 'tablet';
  return 'web';
}

function ScreenThumb({ screen, index, selected, onClick, onRename, onDelete, onDuplicate }) {
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(screen.name || `Screen ${index + 1}`);

  const deviceType = getDeviceType(screen.width);
  const DeviceIcon = deviceType === 'mobile' ? Smartphone : deviceType === 'tablet' ? Tablet : Monitor;
  const accent = '#7c5cff';

  const submit = () => {
    setEditing(false);
    if (name.trim() && name !== screen.name) onRename(screen.id, name.trim());
  };

  // Generate a mini SVG preview from screen elements
  const renderMiniPreview = () => {
    const TW = 160, TH = 64; // SVG viewBox
    const screenW = screen.width || 1440;
    const screenH = screen.height || 900;
    const scaleX = TW / screenW;
    const scaleY = TH / screenH;

    const elements = screen.elements || [];

    // Color map for element types
    const typeColors = {
      rect: '#3b3b5c',
      button: '#7c5cff',
      heading: '#1a1a2e',
      paragraph: '#4a4a6a',
      image: '#2a2a4a',
      card: '#252540',
      section: '#1e1e35',
      navigation: '#7c5cff',
      input: '#2a2a45',
      default: '#2d2d4a',
    };

    const getFill = (el) => {
      if (el.props?.backgroundColor) return el.props.backgroundColor;
      if (el.props?.gradient) return el.props.gradient;
      return typeColors[el.type] || typeColors.default;
    };

    const rects = elements
      .filter((el) => el.width > 20 * scaleX && el.height > 6 * scaleY)
      .slice(0, 12)
      .map((el) => {
        const x = Math.round(el.x * scaleX);
        const y = Math.round(el.y * scaleY);
        const w = Math.max(1, Math.round(el.width * scaleX));
        const h = Math.max(1, Math.round(el.height * scaleY));
        const fill = getFill(el);
        const rx = Math.min(4, w / 3, h / 3);
        return `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" opacity="0.85"/>`;
      });

    const texts = elements
      .filter((el) => el.type === 'heading' || el.type === 'text' || el.type === 'paragraph')
      .slice(0, 6)
      .map((el) => {
        const x = Math.round(el.x * scaleX) + 2;
        const y = Math.round(el.y * scaleY) + Math.round(el.height * scaleY * 0.7);
        const w = Math.max(2, Math.round(el.width * scaleX) - 4);
        const h = Math.max(2, Math.round(el.height * scaleY * 0.35));
        const fill = el.props?.color || 'rgba(255,255,255,0.5)';
        return `  <rect x="${x}" y="${y - h}" width="${Math.min(w, 50)}" height="${h}" rx="2" fill="${fill}" opacity="0.6"/>`;
      });

    if (rects.length === 0 && texts.length === 0) {
      // Empty screen placeholder
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#13101f' }}>
          <div className="w-10 h-10 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center mb-1">
            <DeviceIcon size={16} className="text-white/30" />
          </div>
          <span className="text-[9px] text-white/25">Empty canvas</span>
        </div>
      );
    }

    return (
      <svg viewBox={`0 0 ${TW} ${TH}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect width={TW} height={TH} fill="#13101f" />
        {rects.map((r, i) => <rect key={i} {...Object.fromEntries(r.replace(/  <rect /g, '').matchAll(/(\w+)=\"([^\"]*)\"/g).map(([k, v]) => [k, v]))} />)}
        {texts.map((t, i) => <rect key={`t${i}`} {...Object.fromEntries(t.replace(/  <rect /g, '').matchAll(/(\w+)=\"([^\"]*)\"/g).map(([k, v]) => [k, v]))} />)}
      </svg>
    );
  };

  return (
    <div className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${selected ? 'ring-2 ring-[var(--accent)] shadow-lg' : 'ring-1 ring-[var(--border)]'} bg-[var(--surface2)]`}>
      <button className="w-full flex flex-col items-center px-2" onClick={onClick}>
        {/* Device icon bar */}
        <div className="flex items-center gap-1 px-2 py-1 bg-[var(--surface2)] w-full">
          <DeviceIcon size={9} style={{ color: accent }} />
          <div className="flex gap-0.5 ml-auto">
            <div className="w-1.5 h-1.5 rounded-sm" style={{ background: '#ef4444' }} />
            <div className="w-1.5 h-1.5 rounded-sm" style={{ background: '#fbbf24' }} />
            <div className="w-1.5 h-1.5 rounded-sm" style={{ background: '#10b981' }} />
          </div>
        </div>

        {/* Screen preview */}
        <div className="relative w-full h-16 bg-[#13101f] overflow-hidden rounded-sm">
          {renderMiniPreview()}
          {/* Selected indicator */}
          {selected && (
            <div className="absolute inset-0 border-2 rounded-sm" style={{ borderColor: accent, boxShadow: `inset 0 0 12px ${accent}44` }} />
          )}
        </div>

        <div className="text-[10px] text-[var(--text-muted)] px-2 py-1 w-full truncate flex flex-col gap-0.5">
          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={submit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
                if (e.key === 'Escape') setEditing(false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-[var(--surface)] border border-[var(--accent)] rounded px-1 py-0.5 text-[10px] outline-none text-[var(--text)]"
            />
          ) : (
            <>
              <span className="truncate">{screen.name || `Screen ${index + 1}`}</span>
              <span className="opacity-40 text-[9px]">{screen.width}×{screen.height}</span>
            </>
          )}
        </div>
      </button>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center gap-1 transition-all rounded-xl">
        <button
          className="w-6 h-6 rounded flex items-center justify-center bg-white/20 hover:bg-white/30 text-white"
          onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }}
        >
          <MoreVertical size={12} />
        </button>
        <AnimatePresence>
          {menu && (
            <>
              <div className="fixed inset-0 z-0" onClick={() => setMenu(false)} />
              <motion.div
                className="absolute right-1 top-1 z-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl p-1 min-w-[100px]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--surface2)] cursor-pointer whitespace-nowrap rounded-lg text-[var(--text)]" onClick={() => { setMenu(false); setEditing(true); }}>
                  <Edit2 size={12} /> Rename
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--surface2)] cursor-pointer whitespace-nowrap rounded-lg text-[var(--text)]" onClick={() => { setMenu(false); onDuplicate(screen.id); }}>
                  <Copy size={12} /> Duplicate
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-red-500/10 cursor-pointer whitespace-nowrap rounded-lg text-red-400" onClick={() => { setMenu(false); onDelete(screen.id); }}>
                  <Trash2 size={12} /> Delete
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ScreensSidebar({
  screens,
  selectedScreenId,
  onSelectScreen,
  onAddScreen,
  onRenameScreen,
  onDeleteScreen,
  onDuplicateScreen,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] shrink-0"
      animate={{ width: collapsed ? 0 : 180 }}
      transition={{ duration: 0.2 }}
    >
      {!collapsed && (
        <>
          <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--border)]">
            <span className="text-xs font-bold uppercase tracking-wide">Screens</span>
            <span className="text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded-full bg-[var(--surface2)]">{screens.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {screens.map((s, i) => (
              <ScreenThumb
                key={s.id ?? i}
                screen={s}
                index={i}
                selected={selectedScreenId === s.id}
                onClick={() => onSelectScreen(s.id)}
                onRename={onRenameScreen}
                onDelete={onDeleteScreen}
                onDuplicate={onDuplicateScreen}
              />
            ))}
            <button
              className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs border border-dashed border-[var(--border)] text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer mt-1"
              onClick={onAddScreen}
            >
              <Plus size={14} />
              <span>New</span>
            </button>
          </div>
        </>
      )}
      <button
        className="w-8 h-8 p-0 rounded-lg inline-flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface2)] transition-all"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Expand' : 'Collapse'}
        style={{ display: collapsed ? 'flex' : 'none' }}
      >
        <ChevronRight size={12} />
      </button>
      {!collapsed && (
        <button
          className="w-8 h-8 p-0 rounded-lg inline-flex items-center justify-center hover:bg-[var(--surface2)] transition-all mx-auto mb-2 text-[var(--text-2)]"
          onClick={() => setCollapsed((c) => !c)}
          title="Collapse"
        >
          <ChevronLeft size={12} />
        </button>
      )}
    </motion.aside>
  );
}
