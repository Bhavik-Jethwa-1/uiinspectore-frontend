import { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, EyeOff, Lock, Unlock, Trash2, Layers as LayersIcon } from 'lucide-react';
import { findComponent } from '../../utils/elementLibrary';
import * as LucideIcons from 'lucide-react';

function getTypeIcon(type) {
  const c = findComponent(type);
  if (c?.icon) return c.icon;
  return LayersIcon;
}

function ElementRow({ el, selected, onSelect, onToggleVisibility, onToggleLock, onDelete, onMove }) {
  const Icon = getTypeIcon(el.type);
  const rawText = el.text || el.props?.text || el.name || el.type;
  const display = rawText.length > 40 ? rawText.substring(0, 40) + '…' : rawText;

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${selected ? 'bg-[var(--accent)]/20 text-[var(--accent) ring-1 ring-[var(--accent)]' : 'text-[var(--text-2)] hover:bg-[var(--surface2)]'}`}
      onClick={() => onSelect(el.id)}
    >
      <Icon size={13} className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-xs truncate">{display}</span>
      <div className="flex items-center gap-0.5 ml-auto pl-2 shrink-0">
        <button
          className="w-6 h-6 p-0 rounded inline-flex items-center justify-center hover:bg-[var(--surface2)]"
          onClick={(e) => { e.stopPropagation(); onMove(el.id, 'up'); }}
          title="Move up"
        ><ChevronUp size={11} /></button>
        <button
          className="w-6 h-6 p-0 rounded inline-flex items-center justify-center hover:bg-[var(--surface2)]"
          onClick={(e) => { e.stopPropagation(); onMove(el.id, 'down'); }}
          title="Move down"
        ><ChevronDown size={11} /></button>
        <button
          className="w-6 h-6 p-0 rounded inline-flex items-center justify-center hover:bg-[var(--surface2)]"
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(el.id); }}
          title="Toggle visibility"
        >
          {el.visible === false ? <EyeOff size={11} /> : <Eye size={11} />}
        </button>
        <button
          className="w-6 h-6 p-0 rounded inline-flex items-center justify-center hover:bg-[var(--surface2)]"
          onClick={(e) => { e.stopPropagation(); onToggleLock(el.id); }}
          title="Toggle lock"
        >
          {el.locked ? <Lock size={11} /> : <Unlock size={11} />}
        </button>
        <button
          className="w-6 h-6 p-0 rounded inline-flex items-center justify-center hover:bg-[var(--surface2)] text-red-400 hover:bg-red-500/10"
          onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
          title="Delete"
        ><Trash2 size={11} /></button>
      </div>
    </div>
  );
}

export default function LayersPanel({
  elements,
  selectedId,
  setSelectedId,
  onUpdate,
  onDelete,
  onReorder,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [height, setHeight] = useState(180);

  const toggleVisibility = (id) => {
    const el = elements.find((e) => e.id === id);
    if (el) onUpdate(id, { visible: el.visible === false });
  };
  const toggleLock = (id) => {
    const el = elements.find((e) => e.id === id);
    if (el) onUpdate(id, { locked: !el.locked });
  };
  const moveLayer = (id, direction) => {
    const idx = elements.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= elements.length) return;
    if (onReorder) {
      onReorder(id, newIdx);
    } else {
      // Fallback: just do it locally
      const next = [...elements];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    }
  };

  if (collapsed) {
    return (
      <div className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] opacity-50">
        <button className="flex items-center gap-2" onClick={() => setCollapsed(false)}>
          <LayersIcon size={14} />
          <span>Layers ({elements.length})</span>
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] relative" style={{ height }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="text-xs font-bold uppercase tracking-wide">
          <LayersIcon size={14} />
          <span>Layers</span>
          <span className="text-[11px] text-[var(--text-muted)] px-2 py-0.5 rounded-full bg-[var(--surface2)]">{elements.length}</span>
        </div>
        <button className="w-7 h-7 p-0 rounded-lg inline-flex items-center justify-center" onClick={() => setCollapsed(true)}>
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {elements.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-[var(--text-muted)]">
            <p>No elements yet</p>
            <span>Drag components from the left panel</span>
          </div>
        )}
        {/* Render in reverse so top of canvas (last in array) appears at top of list */}
        {[...elements].reverse().map((el) => (
          <ElementRow
            key={el.id}
            el={el}
            selected={selectedId === el.id}
            onSelect={setSelectedId}
            onToggleVisibility={toggleVisibility}
            onToggleLock={toggleLock}
            onDelete={onDelete}
            onMove={moveLayer}
          />
        ))}
      </div>

      <div
        className="w-1 cursor-col-resize hover:bg-[var(--accent)] transition-all h-full absolute right-0 top-0"
        onMouseDown={(e) => {
          const startY = e.clientY;
          const startH = height;
          const onMove = (ev) => {
            const dy = startY - ev.clientY;
            setHeight(Math.max(100, Math.min(500, startH + dy)));
          };
          const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
          };
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        }}
      />
    </div>
  );
}
