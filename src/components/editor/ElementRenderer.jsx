import { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { findComponent } from '../../utils/elementLibrary';

// Render an icon by name
function IconByName({ name, size = 16, color, strokeWidth }) {
  if (!name) return null;
  const IconComp = LucideIcons[name] || LucideIcons[name
    .split('-')
    .map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1)))
    .join('')] || LucideIcons.Star;
  if (!IconComp) return null;
  return <IconComp size={size} color={color} strokeWidth={strokeWidth || 2} />;
}

// Element visual renderer — renders the inside of an element
export function ElementContent({ element, editing, onTextChange, onEditingEnd }) {
  const { type, props = {}, text } = element;

  // text editing mode
  if (editing && ['text', 'heading', 'paragraph', 'button', 'badge', 'chip', 'breadcrumb', 'alert'].includes(type)) {
    return (
      <EditableText
        text={text || props.text || ''}
        onChange={(v) => {
          if (onTextChange) onTextChange(v);
        }}
        onBlur={onEditingEnd}
        onKey={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && type !== 'paragraph' && type !== 'text') {
            e.preventDefault();
            onEditingEnd();
          } else if (e.key === 'Escape') {
            onEditingEnd();
          }
        }}
        style={{
          color: props.color,
          fontSize: props.fontSize,
          fontWeight: props.fontWeight,
          lineHeight: props.lineHeight,
          textAlign: props.align,
        }}
        multiline={type === 'paragraph' || type === 'text'}
      />
    );
  }

  switch (type) {
    case 'button':
      return <span className="text-sm font-semibold px-4 py-2 rounded-lg">{text || props.text || 'Button'}</span>;

    case 'badge':
    case 'chip':
      return <span>{text || props.text || 'Badge'}</span>;

    case 'input':
    case 'search':
      return (
        <div className="w-full border border-[var(--border)] rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--accent)]">
          <span className="w-full border border-[var(--border)] rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--accent)]-placeholder">{props.placeholder || 'Type here…'}</span>
        </div>
      );

    case 'textarea':
      return (
        <div className="w-full border border-[var(--border)] rounded-xl px-3 py-2 text-sm resize-y min-h-[80px] bg-transparent focus:outline-none focus:border-[var(--accent)]">
          <span className="w-full border border-[var(--border)] rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--accent)]-placeholder">{props.placeholder || 'Write something…'}</span>
        </div>
      );

    case 'select':
      return (
        <div className="w-full border border-[var(--border)] rounded-xl px-3 py-2 text-sm bg-transparent focus:outline-none cursor-pointer appearance-none">
          <span>{props.text || 'Select an option'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center gap-2 cursor-pointer text-sm">
          <div className="flex items-center gap-2 cursor-pointer text-sm-box" />
          <span>{text || props.text || 'Checkbox'}</span>
        </div>
      );

    case 'radio':
      return (
        <div className="flex items-center gap-2 cursor-pointer text-sm">
          <div className="flex items-center gap-2 cursor-pointer text-sm-dot" />
          <span>{text || props.text || 'Radio'}</span>
        </div>
      );

    case 'toggle':
      return (
        <div className="w-10 h-5 rounded-full relative cursor-pointer transition-all" style={{ background: props.backgroundColor || '#7c5cff' }}>
          <div className="w-10 h-5 rounded-full relative cursor-pointer transition-all-knob" style={{ right: 3 }} />
        </div>
      );

    case 'slider':
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3-track">
            <div className="flex items-center gap-3-fill" style={{ background: props.backgroundColor || '#7c5cff' }} />
          </div>
          <div className="flex items-center gap-3-thumb" />
        </div>
      );

    case 'heading':
      return <div className="text-base font-bold">{text || props.text || 'Heading'}</div>;

    case 'text':
      return <div className="text-sm">{text || props.text || 'Text'}</div>;

    case 'paragraph':
      return <div className="text-sm leading-relaxed text-[var(--text-2)]">{text || props.text || 'Paragraph'}</div>;

    case 'breadcrumb':
      return <div className="flex items-center gap-2 text-xs text-[var(--text-2)]">{text || props.text || 'Home / Page'}</div>;

    case 'image':
      return (
        <div className="w-full rounded-xl overflow-hidden bg-[var(--surface2)]">
          {props.src ? (
            <img src={props.src} alt="" />
          ) : (
            <div className="w-full rounded-xl overflow-hidden bg-[var(--surface2)]-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Image</span>
            </div>
          )}
        </div>
      );

    case 'icon':
      return (
        <div className="w-8 h-8 rounded-lg bg-[var(--surface2)] flex items-center justify-center shrink-0">
          <IconByName name={props.icon || 'star'} size={Math.min(element.width, element.height) * 0.6} color={props.color} />
        </div>
      );

    case 'avatar':
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface2)] flex items-center justify-center font-bold text-sm shrink-0" style={{ background: props.backgroundColor, color: props.color }}>
          {props.text || 'A'}
        </div>
      );

    case 'card':
      return (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
          <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]-thumb" />
          <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]-title" />
          <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]-line" />
          <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]-line max-w-xs" />
        </div>
      );

    case 'divider':
      return <div className="h-px bg-[var(--border)] w-full my-4" />;

    case 'header':
    case 'footer':
      return (
        <div className="text-sm-xs font-bold uppercase tracking-wide text-[var(--text-2)] px-4 py-2">
          <div className="text-sm-xs font-bold uppercase tracking-wide text-[var(--text-2)] px-4 py-2-logo" />
          <div className="text-sm-xs font-bold uppercase tracking-wide text-[var(--text-2)] px-4 py-2-links">
            <div /><div /><div /><div />
          </div>
          <div className="text-sm-xs font-bold uppercase tracking-wide text-[var(--text-2)] px-4 py-2-cta" />
        </div>
      );

    case 'navigation':
    case 'tabs':
      return (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[var(--border)]">
          {(props.items || []).map((label, i) => (
            <span key={i} className={i === 0 ? 'active' : ''}>{label}</span>
          ))}
        </div>
      );

    case 'sidebar':
      return (
        <div className="w-56 h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col">
          <div className="w-56 h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col-logo" />
          <div className="w-56 h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col-items">
            {[...Array(5)].map((_, i) => <div key={i} className={`el-sidebar-item ${i === 0 ? 'active' : ''}`} />)}
          </div>
        </div>
      );

    case 'form':
      return (
        <div className="space-y-4 p-4">
          <div className="space-y-4 p-4-field" />
          <div className="space-y-4 p-4-field" />
          <div className="space-y-4 p-4-field" />
          <div className="space-y-4 p-4-button" />
        </div>
      );

    case 'table':
      return (
        <div className="w-full border-collapse">
          <div className="w-full border-collapse-row text-xs font-bold uppercase tracking-wide text-[var(--text-2)] px-4 py-2">
            <div /><div /><div />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full border-collapse-row">
              <div /><div /><div />
            </div>
          ))}
        </div>
      );

    case 'list':
    case 'list-ordered':
      return (
        <div className="space-y-2">
          {(props.items || ['Item 1', 'Item 2', 'Item 3']).map((label, i) => (
            <div key={i} className="space-y-2-item">
              {type === 'list-ordered' && <span className="space-y-2-num">{i + 1}.</span>}
              <span>{label}</span>
            </div>
          ))}
        </div>
      );

    case 'alert':
      return (
        <div className="flex items-start gap-3 p-4 rounded-xl border">
          <span className="flex items-start gap-3 p-4 rounded-xl border-icon">⚠</span>
          <span>{text || props.text || 'Alert message'}</span>
        </div>
      );

    case 'modal':
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4-head">
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4-title" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4-close" />
          </div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4-body">
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4-line" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4-line max-w-xs" />
          </div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4-foot">
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4-btn" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4-btn bg-[var(--accent)] text-white" />
          </div>
        </div>
      );

    case 'pagination':
      return (
        <div className="flex items-center gap-2">
          <span>‹</span>
          <span className="ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]">1</span>
          <span>2</span>
          <span>3</span>
          <span>›</span>
        </div>
      );

    case 'container':
    case 'section':
    case 'row':
    case 'column':
    case 'spacer':
    default:
      return null;
  }
}

// Editable text overlay (shown when in editing mode)
function EditableText({ text, onChange, onBlur, onKey, style, multiline }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      // Select all
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, []);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onBlur(e.currentTarget.textContent)}
      onInput={(e) => onChange(e.currentTarget.textContent)}
      onKeyDown={onKey}
      style={{
        outline: 'none',
        width: '100%',
        height: '100%',
        cursor: 'text',
        ...style,
      }}
    >
      {text}
    </div>
  );
}
