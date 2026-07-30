import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Search, GripVertical, MousePointer2, Plus, Square, Type,
  Heading1, AlignLeft, Image as ImageIcon, Tag, CircleUser, Pill,
  CreditCard, LayoutGrid, Box, Rows, Columns, Minus, Space,
  PanelTop, PanelBottom, PanelLeft, Navigation, Folder,
  List, ListOrdered, Table2, MessageSquare, AlertCircle, CheckSquare,
  ToggleLeft, SlidersHorizontal, ChevronRight, Hash, X
} from 'lucide-react';
import { COMPONENT_GROUPS } from '../../utils/elementLibrary';

const ACCENT = '#7c5cff';

// Icon map for rendering from stored type
const ICON_MAP = {
  MousePointer2, Square, Type, Heading1, AlignLeft, Image: ImageIcon,
  Tag, CircleUser, Pill, CreditCard, LayoutGrid, Box, Rows, Columns,
  Minus, Space, PanelTop, PanelBottom, PanelLeft, Navigation, Folder,
  List, ListOrdered, Table2, MessageSquare, AlertCircle, CheckSquare,
  ToggleLeft, SlidersHorizontal, ChevronRight, Hash, ChevronDown,
};

function getIcon(iconFn) {
  if (!iconFn) return Square;
  // If it's a known icon function from the map, return it
  return iconFn;
}

function ComponentItem({ item, searchTerm, onAddComponent }) {
  const Icon = getIcon(item.icon);
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', item.type);
    const { icon: _icon, ...serializable } = item;
    e.dataTransfer.setData('application/x-ui-inspectore-component', JSON.stringify(serializable));
    setTimeout(() => setIsDragging(false), 0);
  };

  const onDragEnd = () => setIsDragging(false);

  // Click to add at center of canvas
  const handleClick = () => {
    if (onAddComponent) onAddComponent(item);
  };

  const isHovering = searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div
      className={`group relative flex items-center gap-0 rounded-xl transition-all duration-150 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
      style={{ background: isDragging ? `${ACCENT}18` : 'transparent' }}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      title={`${item.name} — click or drag to canvas`}
    >
      {/* Drag handle */}
      <div className="w-6 h-9 flex items-center justify-center shrink-0 opacity-30 group-hover:opacity-60 transition-opacity">
        <GripVertical size={12} />
      </div>

      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
        style={{
          background: isHovering ? `${ACCENT}20` : 'var(--surface2)',
          border: `1px solid ${isHovering ? `${ACCENT}40` : 'var(--border)'}`,
        }}
      >
        <Icon size={16} strokeWidth={1.8} style={{ color: isHovering ? ACCENT : 'var(--text-muted)' }} />
      </div>

      {/* Name */}
      <span
        className="flex-1 text-xs font-medium truncate px-2 py-2"
        style={{ color: 'var(--text-2)' }}
      >
        {item.name}
      </span>

      {/* Plus icon on hover */}
      <div className="w-6 h-9 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: ACCENT }}>
        <Plus size={11} />
      </div>
    </div>
  );
}

export default function ComponentsPanel({ onAddComponent }) {
  const [open, setOpen] = useState(() =>
    COMPONENT_GROUPS.reduce((acc, g) => ({ ...acc, [g.id]: true }), {})
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items across all groups when searching
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return COMPONENT_GROUPS;
    const q = searchTerm.toLowerCase();
    return COMPONENT_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        item.name.toLowerCase().includes(q) ||
        (item.defaults?.text || '').toLowerCase().includes(q)
      ),
    })).filter((g) => g.items.length > 0);
  }, [searchTerm]);

  const totalComponents = COMPONENT_GROUPS.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-[13px] font-black tracking-tight" style={{ color: 'var(--text)' }}>Components</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}15`, color: ACCENT }}>
            {totalComponents}
          </span>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Drag and drop onto canvas
        </p>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────── */}
      <div className="px-4 pb-3 shrink-0">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
          style={{
            background: 'var(--surface2)',
            borderColor: searchTerm ? ACCENT : 'var(--border)',
            boxShadow: searchTerm ? `0 0 0 3px ${ACCENT}15` : 'none',
          }}
        >
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search components…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[12px]"
            style={{ color: 'var(--text)' }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="shrink-0">
              <X size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* ── Component Groups ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Search size={28} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
            <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--text-2)' }}>No results</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              No components match "{searchTerm}"
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.id} className="mb-1">
              {/* Group Header */}
              <button
                className="w-full flex items-center gap-2 px-2 py-2 rounded-xl transition-all hover:bg-[var(--surface2)] cursor-pointer group"
                onClick={() => setOpen((s) => ({ ...s, [group.id]: !s[group.id] }))}
              >
                {/* Colored dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: group.id === 'basic' ? ACCENT : group.id === 'content' ? '#ff6b9d' : group.id === 'layout' ? '#10b981' : group.id === 'navigation' ? '#f59e0b' : '#06b6d4' }}
                />
                <span className="flex-1 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: 'var(--text-2)' }}>
                  {group.label}
                </span>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
                >
                  {group.items.length}
                </span>
                <ChevronDown
                  size={13}
                  className="transition-transform duration-200"
                  style={{
                    color: 'var(--text-muted)',
                    transform: open[group.id] ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}
                />
              </button>

              {/* Group Items */}
              <AnimatePresence>
                {open[group.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-1 pt-0.5 pb-1 space-y-0.5">
                      {group.items.map((item) => (
                        <ComponentItem key={item.type} item={item} searchTerm={searchTerm} onAddComponent={onAddComponent} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* ── Footer hint ──────────────────────────────────────────────────── */}
      {searchTerm && (
        <div className="px-4 py-2 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
            {filteredGroups.reduce((s, g) => s + g.items.length, 0)} component{filteredGroups.reduce((s, g) => s + g.items.length, 0) !== 1 ? 's' : ''} found
          </p>
        </div>
      )}
    </div>
  );
}


