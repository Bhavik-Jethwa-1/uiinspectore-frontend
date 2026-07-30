import { useRef, useState, useEffect, useCallback } from 'react';
import { ElementContent } from './ElementRenderer';
import { findComponent } from '../../utils/elementLibrary';

const HANDLE_SIZE = 8;
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

function getElementStyle(el) {
  const p = el.props || {};
  const style = {
    position: 'absolute',
    left: el.x,
    top: el.y,
    width: el.width,
    height: el.height,
    background: p.backgroundColor || 'transparent',
    color: p.color,
    borderRadius: p.borderRadius ?? 0,
    borderWidth: p.borderWidth ?? 0,
    borderStyle: p.borderWidth ? 'solid' : 'none',
    borderColor: p.borderColor || '#e5e7eb',
    padding: p.padding ? `${p.padding}px` : undefined,
    boxShadow: p.shadow,
    opacity: el.visible === false ? 0.3 : 1,
    cursor: el.locked ? 'not-allowed' : 'move',
    pointerEvents: el.locked ? 'none' : 'auto',
    overflow: 'hidden',
    userSelect: 'none',
  };

  if (['button', 'heading', 'text', 'paragraph', 'badge', 'chip', 'breadcrumb', 'alert'].includes(el.type)) {
    style.fontSize = p.fontSize ?? 14;
    style.fontWeight = p.fontWeight ?? 400;
    if (p.align) {
      style.textAlign = p.align;
      style.justifyContent = p.align === 'center' ? 'center' : p.align === 'right' ? 'flex-end' : 'flex-start';
    }
    if (p.lineHeight) style.lineHeight = p.lineHeight;
    style.display = 'flex';
    style.alignItems = 'center';
  }

  return style;
}

function ScreenContent({ elements, selectedId, editingId, onElementMouseDown, onElementDoubleClick, onHandleMouseDown, onUpdateElement, onEditingEnd, dropTarget }) {
  return (
    <>
      {elements.length === 0 && (
        <div className="empty-canvas">
          <div className="empty-canvas-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="13" x2="15" y2="13" />
            </svg>
          </div>
          <h3>Drag components here</h3>
          <p>Pick elements from the left panel and drop them on this canvas to start designing.</p>
        </div>
      )}

      {elements.map((el) => (
        <div
          key={el.id}
          className={`absolute cursor-pointer ${selectedId === el.id ? 'ring-2 ring-[var(--accent)] shadow-lg' : ''}`}
          style={getElementStyle(el)}
          onMouseDown={(e) => onElementMouseDown(e, el)}
          onDoubleClick={(e) => onElementDoubleClick(e, el)}
        >
          <ElementContent
            element={el}
            editing={editingId === el.id}
            onTextChange={(v) => onUpdateElement(el.id, { text: v, props: { ...el.props, text: v } })}
            onEditingEnd={onEditingEnd}
          />
          {selectedId === el.id && !el.locked && (
            <>
              <div className="select-bounds" />
              {HANDLES.map((dir) => (
                <div
                  key={dir}
                  className={`resize-handle handle-${dir}`}
                  onMouseDown={(e) => onHandleMouseDown(e, el, dir)}
                />
              ))}
            </>
          )}
          {el.locked && selectedId === el.id && (
            <div className="locked-badge">🔒</div>
          )}
        </div>
      ))}

      {dropTarget && (
        <div
          className="drop-indicator"
          style={{
            left: dropTarget.x - 40,
            top: dropTarget.y - 20,
            width: 80,
            height: 40,
          }}
        />
      )}
    </>
  );
}

export default function Canvas({
  elements,
  selectedId,
  setSelectedId,
  screenSize,
  zoom,
  device,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
}) {
  const screenRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [drag, setDrag] = useState(null);
  const [resize, setResize] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Keyboard delete / escape
  useEffect(() => {
    const onKey = (e) => {
      if (editingId) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        onDeleteElement(selectedId);
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, editingId, onDeleteElement]);

  const getScreenPoint = (e) => {
    if (!screenRef.current) return { x: 0, y: 0 };
    const r = screenRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / zoom,
      y: (e.clientY - r.top) / zoom,
    };
  };

  const onElementMouseDown = (e, el) => {
    if (editingId === el.id) return;
    e.stopPropagation();
    if (el.locked) { setSelectedId(el.id); return; }
    setSelectedId(el.id);
    const start = getScreenPoint(e);
    setDrag({ id: el.id, startX: start.x, startY: start.y, origX: el.x, origY: el.y });
  };

  const onHandleMouseDown = (e, el, dir) => {
    e.stopPropagation();
    if (el.locked) return;
    const start = getScreenPoint(e);
    setResize({ id: el.id, dir, startX: start.x, startY: start.y, origX: el.x, origY: el.y, origW: el.width, origH: el.height });
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDropTarget(getScreenPoint(e));
  };

  const onDragLeave = (e) => {
    if (!screenRef.current?.contains(e.relatedTarget)) setDropTarget(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDropTarget(null);
    if (!onAddElement) return;
    // Try our custom MIME type first, fall back to text/plain
    let raw = e.dataTransfer.getData('application/x-ui-inspectore-component') || e.dataTransfer.getData('text/plain');
    if (!raw) return;
    try {
      let component;
      try {
        component = JSON.parse(raw);
      } catch {
        // Was plain text (type name) — look up in library
        component = findComponent(raw);
        if (!component) return;
      }
      // Get drop coordinates relative to screen-frame
      const rect = screenRef.current?.getBoundingClientRect();
      const pt = {
        x: rect ? (e.clientX - rect.left) / zoom : screenSize.width / 2,
        y: rect ? (e.clientY - rect.top) / zoom : screenSize.height / 2,
      };
      const w = component.defaultSize?.w || 160;
      const h = component.defaultSize?.h || 44;
      // Clamp to screen bounds; fallback to center if out of bounds
      const x = (pt.x < 0 || pt.x > screenSize.width) ? Math.round((screenSize.width - w) / 2) : Math.max(0, Math.min(screenSize.width - w, pt.x - w / 2));
      const y = (pt.y < 0 || pt.y > screenSize.height) ? Math.round((screenSize.height - h) / 2) : Math.max(0, Math.min(screenSize.height - h, pt.y - h / 2));
      onAddElement(component, x, y);
    } catch (err) {
      console.error('[Canvas] drop error:', err);
    }
  };

  useEffect(() => {
    if (!drag && !resize) return;
    const onMove = (e) => {
      const pt = getScreenPoint(e);
      if (drag) {
        const dx = pt.x - drag.startX;
        const dy = pt.y - drag.startY;
        onUpdateElement(drag.id, { x: Math.max(0, Math.round(drag.origX + dx)), y: Math.max(0, Math.round(drag.origY + dy)) });
      }
      if (resize) {
        const dx = pt.x - resize.startX;
        const dy = pt.y - resize.startY;
        const dir = resize.dir;
        let { origX, origY, origW, origH } = resize;
        let newX = origX, newY = origY, newW = origW, newH = origH;
        if (dir.includes('e')) newW = Math.max(20, Math.round(origW + dx));
        if (dir.includes('w')) { newW = Math.max(20, Math.round(origW - dx)); newX = Math.round(origX + (origW - newW)); }
        if (dir.includes('s')) newH = Math.max(20, Math.round(origH + dy));
        if (dir.includes('n')) { newH = Math.max(20, Math.round(origH - dy)); newY = Math.round(origY + (origH - newH)); }
        onUpdateElement(resize.id, { x: newX, y: newY, width: newW, height: newH });
      }
    };
    const onUp = () => { setDrag(null); setResize(null); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [drag, resize, screenSize, onUpdateElement]);

  const onElementDoubleClick = (e, el) => {
    e.stopPropagation();
    if (el.locked) return;
    if (['button', 'text', 'heading', 'paragraph', 'badge', 'chip', 'breadcrumb', 'alert'].includes(el.type)) {
      setEditingId(el.id);
    }
  };

  const onEditingEnd = useCallback(() => setEditingId(null), []);

  // Build the device wrapper class
  const deviceFrameClass = `device-frame device-frame-${device || 'web'}`;

  return (
    <div
      className="canvas-area"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => setSelectedId(null)}
    >
      <div className="canvas-grid" />

      {/* Web device — clean frame */}
      {device === 'web' && (
        <div className={deviceFrameClass}>
          <div
            ref={screenRef}
            className="screen-frame"
            style={{
              width: screenSize.width,
              height: screenSize.height,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ScreenContent
              elements={elements}
              selectedId={selectedId}
              editingId={editingId}
              onElementMouseDown={onElementMouseDown}
              onElementDoubleClick={onElementDoubleClick}
              onHandleMouseDown={onHandleMouseDown}
              onUpdateElement={onUpdateElement}
              onEditingEnd={onEditingEnd}
              dropTarget={dropTarget}
            />
          </div>
        </div>
      )}

      {/* Tablet device — bezel wraps screen */}
      {device === 'tablet' && (
        <div className="device-bezel device-bezel-tablet">
          <div className="device-camera" />
          <div
            ref={screenRef}
            className="screen-frame"
            style={{
              width: screenSize.width,
              height: screenSize.height,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ScreenContent
              elements={elements}
              selectedId={selectedId}
              editingId={editingId}
              onElementMouseDown={onElementMouseDown}
              onElementDoubleClick={onElementDoubleClick}
              onHandleMouseDown={onHandleMouseDown}
              onUpdateElement={onUpdateElement}
              onEditingEnd={onEditingEnd}
              dropTarget={dropTarget}
            />
          </div>
        </div>
      )}

      {/* Mobile device — phone bezel with notch */}
      {device === 'mobile' && (
        <div className="device-bezel device-bezel-phone">
          <div className="device-notch" />
          <div
            ref={screenRef}
            className="screen-frame"
            style={{
              width: screenSize.width,
              height: screenSize.height,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ScreenContent
              elements={elements}
              selectedId={selectedId}
              editingId={editingId}
              onElementMouseDown={onElementMouseDown}
              onElementDoubleClick={onElementDoubleClick}
              onHandleMouseDown={onHandleMouseDown}
              onUpdateElement={onUpdateElement}
              onEditingEnd={onEditingEnd}
              dropTarget={dropTarget}
            />
          </div>
        </div>
      )}
    </div>
  );
}
