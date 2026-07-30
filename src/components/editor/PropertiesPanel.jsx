import { useState, useEffect } from 'react';
import { Trash2, Copy, Lock, Unlock, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, Type, Square } from 'lucide-react';
import { findComponent } from '../../utils/elementLibrary';

function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 hover:bg-[var(--surface2)] rounded-lg mx-2 min-w-0">
      <label className="text-xs text-[var(--text-2)] w-14 shrink-0 truncate">{label}</label>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <div className="w-7 h-7 rounded-lg border border-[var(--border)] cursor-pointer overflow-hidden shrink-0 p-0">
          <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="p-0 w-full h-full cursor-pointer" />
        </div>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 min-w-0 font-mono text-[10px] text-[var(--text-2)] bg-transparent border border-[var(--border)] rounded px-1.5 py-0.5 focus:outline-none focus:border-[var(--accent)]"
        />
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, suffix, min, max }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 hover:bg-[var(--surface2)] rounded-lg mx-2 min-w-0">
      <label className="text-xs text-[var(--text-2)] w-14 shrink-0 truncate">{label}</label>
      <div className="flex items-center flex-1 border border-[var(--border)] rounded-lg px-2 py-1 bg-[var(--surface)] focus-within:border-[var(--accent)] min-w-0">
        <input
          type="number"
          value={Math.round(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="flex-1 w-full text-xs text-right bg-transparent outline-none text-[var(--text)] min-w-0"
        />
        {suffix && <span className="text-[var(--text-muted)] text-[10px] ml-1 shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function SliderInput({ label, value, onChange, min = 0, max = 100 }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 hover:bg-[var(--surface2)] rounded-lg mx-2 min-w-0">
      <label className="text-xs text-[var(--text-2)] w-14 shrink-0 truncate">{label}</label>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          type="range"
          min={min}
          max={max}
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 min-w-0"
        />
        <span className="text-xs text-[var(--text-2)] w-7 text-right font-mono shrink-0">{Math.round(value ?? 0)}</span>
      </div>
    </div>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 hover:bg-[var(--surface2)] rounded-lg mx-2 min-w-0">
      <label className="text-xs text-[var(--text-2)] w-14 shrink-0 truncate">{label}</label>
      <select
        className="flex-1 min-w-0 border border-[var(--border)] rounded-lg px-2 py-1 text-xs bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] cursor-pointer text-[var(--text)]"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Segmented({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 hover:bg-[var(--surface2)] rounded-lg mx-2 min-w-0">
      <label className="text-xs text-[var(--text-2)] w-14 shrink-0 truncate">{label}</label>
      <div className="inline-flex bg-[var(--surface2)] rounded-xl p-1 gap-1 shrink-0">
        {options.map((o) => (
          <button
            key={o.value}
            className={`seg-btn ${value === o.value ? 'active' : ''}`}
            onClick={() => onChange(o.value)}
            title={o.label}
            type="button"
          >
            {o.icon ? <o.icon size={13} /> : o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PropertiesPanel({
  element,
  onUpdate,
  onUpdateProps,
  onDelete,
  onDuplicate,
}) {
  if (!element) {
    return (
      <div className="flex flex-col h-full bg-[var(--surface)] border-l border-[var(--border)]">
        <div className="text-xs font-bold uppercase tracking-wide px-4 py-2">
          <h3>Properties</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-48 gap-2 text-[var(--text-muted)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface2)] flex items-center justify-center mb-2">
            <Square size={24} strokeWidth={1.3} />
          </div>
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const { props = {} } = element;
  const updateProp = (key, value) => {
    onUpdateProps(element.id, { [key]: value });
  };
  const update = (patch) => {
    onUpdate(element.id, patch);
  };

  const textTypes = ['text', 'heading', 'paragraph', 'button', 'badge', 'chip', 'breadcrumb', 'alert'];
  const isText = textTypes.includes(element.type);

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] border-l border-[var(--border)]">
      <div className="text-xs font-bold uppercase tracking-wide px-4 py-2">
        <h3>{element.name || findComponent(element.type)?.name || element.type}</h3>
        <span className="text-[11px] text-[var(--text-muted)] px-4 mb-3">#{element.id.slice(-6)}</span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wide px-4 py-2 mb-1">Layout</div>
          <div className="grid grid-cols-2 gap-2 px-4 py-1">
            <NumberInput label="X" value={element.x} onChange={(v) => update({ x: v })} suffix="px" />
            <NumberInput label="Y" value={element.y} onChange={(v) => update({ y: v })} suffix="px" />
            <NumberInput label="W" value={element.width} onChange={(v) => update({ width: Math.max(20, v) })} suffix="px" min={20} />
            <NumberInput label="H" value={element.height} onChange={(v) => update({ height: Math.max(20, v) })} suffix="px" min={20} />
          </div>
        </div>

        {isText && (
          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wide px-4 py-2 mb-1">Typography</div>
            <div className="grid grid-cols-2 gap-2 px-4 py-1">
              <NumberInput label="Size" value={props.fontSize} onChange={(v) => updateProp('fontSize', v)} suffix="px" min={6} />
              <SelectInput
                label="Weight"
                value={props.fontWeight || 400}
                onChange={(v) => updateProp('fontWeight', Number(v))}
                options={[
                  { value: 300, label: 'Light' },
                  { value: 400, label: 'Regular' },
                  { value: 500, label: 'Medium' },
                  { value: 600, label: 'Semibold' },
                  { value: 700, label: 'Bold' },
                  { value: 800, label: 'Extra bold' },
                ]}
              />
            </div>
            <Segmented
              label="Align"
              value={props.align || 'left'}
              onChange={(v) => updateProp('align', v)}
              options={[
                { value: 'left', label: 'L', icon: AlignLeft },
                { value: 'center', label: 'C', icon: AlignCenter },
                { value: 'right', label: 'R', icon: AlignRight },
              ]}
            />
            <NumberInput label="Line height" value={props.lineHeight || 1.4} onChange={(v) => updateProp('lineHeight', v)} min={1} max={3} step={0.1} />
          </div>
        )}

        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wide px-4 py-2 mb-1">Style</div>
          <ColorInput label="Background" value={props.backgroundColor} onChange={(v) => updateProp('backgroundColor', v)} />
          <ColorInput label="Text color" value={props.color} onChange={(v) => updateProp('color', v)} />
          <ColorInput label="Border" value={props.borderColor} onChange={(v) => updateProp('borderColor', v)} />
          <div className="grid grid-cols-2 gap-2 px-4 py-1">
            <NumberInput label="Border W" value={props.borderWidth || 0} onChange={(v) => updateProp('borderWidth', v)} suffix="px" min={0} />
            <SliderInput label="Radius" value={props.borderRadius || 0} onChange={(v) => updateProp('borderRadius', v)} max={64} />
          </div>
          <NumberInput label="Padding" value={props.padding || 0} onChange={(v) => updateProp('padding', v)} suffix="px" min={0} />
        </div>

        {/* Element-specific */}
        {(element.type === 'input' || element.type === 'search' || element.type === 'textarea') && (
          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wide px-4 py-2 mb-1">Element</div>
            <div className="flex items-center gap-2 px-4 py-1.5 hover:bg-[var(--surface2)] rounded-lg mx-2">
              <label className="text-xs text-[var(--text-2)] w-20 shrink-0 truncate">Placeholder</label>
              <input
                type="text"
                className="flex-1 min-w-0"
                value={props.placeholder || ''}
                onChange={(e) => updateProp('placeholder', e.target.value)}
              />
            </div>
          </div>
        )}

        {element.type === 'image' && (
          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wide px-4 py-2 mb-1">Element</div>
            <div className="flex items-center gap-2 px-4 py-1.5 hover:bg-[var(--surface2)] rounded-lg mx-2">
              <label className="text-xs text-[var(--text-2)] w-20 shrink-0 truncate">Image URL</label>
              <input
                type="text"
                className="flex-1 min-w-0"
                value={props.src || ''}
                onChange={(e) => updateProp('src', e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>
        )}

        {element.type === 'icon' && (
          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wide px-4 py-2 mb-1">Element</div>
            <div className="flex items-center gap-2 px-4 py-1.5 hover:bg-[var(--surface2)] rounded-lg mx-2">
              <label className="text-xs text-[var(--text-2)] w-20 shrink-0 truncate">Icon name</label>
              <input
                type="text"
                className="flex-1 min-w-0"
                value={props.icon || ''}
                onChange={(e) => updateProp('icon', e.target.value)}
                placeholder="star, heart, arrow-right…"
              />
            </div>
          </div>
        )}

        {(element.type === 'list' || element.type === 'list-ordered' || element.type === 'navigation' || element.type === 'tabs') && (
          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wide px-4 py-2 mb-1">Items</div>
            <div className="flex-1 min-w-0">
              {(props.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-1 hover:bg-[var(--surface2)] rounded-lg mx-2">
                  <input
                    type="text"
                    className="flex-1 min-w-0"
                    value={item}
                    onChange={(e) => {
                      const items = [...(props.items || [])];
                      items[i] = e.target.value;
                      updateProp('items', items);
                    }}
                  />
                  <button
                    className="w-6 h-6 p-0 rounded text-red-400 hover:bg-red-500/10 inline-flex items-center justify-center"
                    onClick={() => {
                      const items = (props.items || []).filter((_, idx) => idx !== i);
                      updateProp('items', items);
                    }}
                  >×</button>
                </div>
              ))}
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg mx-2 mt-1 cursor-pointer transition-all"
                onClick={() => updateProp('items', [...(props.items || []), 'New item'])}
              >
                + Add item
              </button>
            </div>
          </div>
        )}

        {(element.type === 'text' || element.type === 'heading' || element.type === 'paragraph' || element.type === 'button' || element.type === 'alert') && (
          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wide px-4 py-2 mb-1">Content</div>
            <div className="flex items-center gap-2 px-4 py-1.5 hover:bg-[var(--surface2)] rounded-lg mx-2">
              <label className="text-xs text-[var(--text-2)] w-20 shrink-0 truncate">Text</label>
              <textarea
                className="flex-1 min-w-0"
                value={element.text || ''}
                onChange={(e) => {
                  onUpdate(element.id, { text: e.target.value });
                  updateProp('text', e.target.value);
                }}
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 p-3 border-t border-[var(--border)]">
        <button className="w-7 h-7 p-0 rounded-lg inline-flex items-center justify-center" onClick={() => update({ visible: element.visible === false })} title="Toggle visibility">
          {element.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button className="w-7 h-7 p-0 rounded-lg inline-flex items-center justify-center" onClick={() => update({ locked: !element.locked })} title="Toggle lock">
          {element.locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
        <button className="w-7 h-7 p-0 rounded-lg inline-flex items-center justify-center" onClick={() => onDuplicate(element.id)} title="Duplicate">
          <Copy size={14} />
        </button>
        <button className="w-7 h-7 p-0 rounded-lg inline-flex items-center justify-center text-red-400 hover:bg-red-500/10" onClick={() => onDelete(element.id)} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
