/**
 * PullCord — Verlet rope physics theme toggle.
 *
 * Architecture: all SVG rendering is done via direct DOM manipulation
 * (ref-based) so React reconciliation never interferes with the animation.
 * useState is only used to signal the initial render and theme transitions.
 */
import { useRef, useState, useCallback, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/* ── Tunable physics constants ─────────────────────────────────────────── */
const NUM_POINTS         = 8;    // rope segments (index 0 = pinned anchor)
const SEG_LEN            = 5;    // rest length per segment (px) — total rope ≈ 40px
const GRAVITY            = 0.25; // downward acceleration px/frame²
const IDLE_GRAVITY       = 0.035;// subtle gravity when idle (rope breathes gently)
const DAMPING            = 0.984;// velocity decay per frame (near 1 = long swing)
const CONSTRAINT_ITERS   = 12;   // constraint iterations per frame
const PULL_THRESHOLD     = 30;   // px downward drag from anchor to trigger toggle
const THEME_COOLDOWN_MS  = 750;  // ms before next toggle allowed
const DRAG_LERP          = 0.58; // how fast bottom point snaps to pointer (0-1)
const HANDLE_RADIUS      = 5.5;  // handle bulb radius (px) — small minimalist dot
const MAX_SWING_FRAC     = 0.85; // max horizontal swing as fraction of rope length
const SETTLE_VELOCITY    = 0.06; // velocity threshold below which rope is "settled"

/* ── Rope factory ──────────────────────────────────────────────────────── */
function makeRope() {
  const pts = [];
  for (let i = 0; i <= NUM_POINTS; i++) {
    const y = i * SEG_LEN;
    pts.push({ x: 0, y, px: 0, py: y });
  }
  return pts;
}

/* ── Verlet integration ───────────────────────────────────────────────── */
function stepRope(pts, gravity, damping) {
  for (let i = 1; i <= NUM_POINTS; i++) {
    const p = pts[i];
    const vx = (p.x - p.px) * damping;
    const vy = (p.y - p.py) * damping;
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + gravity;
  }
  // Anchor is always fixed
  pts[0].x = 0; pts[0].y = 0;
  pts[0].px = 0; pts[0].py = 0;
}

/* ── Distance constraints (Jakobsen) ─────────────────────────────────── */
function satisfyConstraints(pts) {
  for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
    pts[0].x = 0; pts[0].y = 0;
    for (let i = 0; i < NUM_POINTS; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
      const diff = (dist - SEG_LEN) / dist;
      const ox = dx * diff * 0.5;
      const oy = dy * diff * 0.5;
      a.x += ox; a.y += oy;
      b.x -= ox; b.y -= oy;
    }
  }
  pts[0].x = 0; pts[0].y = 0;
}

/* ── Check if rope has settled to rest ───────────────────────────────── */
function isSettled(pts) {
  for (let i = 1; i <= NUM_POINTS; i++) {
    const vx = Math.abs(pts[i].x - pts[i].px);
    const vy = Math.abs(pts[i].y - pts[i].py);
    if (vx > SETTLE_VELOCITY || vy > SETTLE_VELOCITY) return false;
  }
  return true;
}

/* ── Coordinate extraction ────────────────────────────────────────────── */
function getPointerPos(e) {
  if (e.clientX !== undefined) return { x: e.clientX, y: e.clientY };
  if (e.touches?.[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches?.[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: 0, y: 0 };
}

/* ── Build SVG polyline path string from rope points ─────────────────── */
function buildRopePath(pts) {
  const parts = [`M 0,0`];
  for (let i = 1; i <= NUM_POINTS; i++) {
    parts.push(`L ${pts[i].x.toFixed(2)},${pts[i].y.toFixed(2)}`);
  }
  return parts.join(' ');
}

export default function PullCord() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  /* ── Physics state (refs — never triggers React re-render) ─────────── */
  const rope         = useRef(makeRope());
  const handleTarget = useRef({ x: 0, y: NUM_POINTS * SEG_LEN });
  const drag         = useRef({ active: false, anchorX: 0, anchorY: 0, didDrag: false, totalDown: 0 });
  const animId       = useRef(null);
  const cooldown     = useRef(false);
  const triggered    = useRef(false); // triggered this pull session

  /* ── DOM refs ─────────────────────────────────────────────────────── */
  const containerRef = useRef(null); // outer container div
  const svgRef       = useRef(null); // <svg> element
  const ropePathRef  = useRef(null); // <path> rope element
  const handleGRef   = useRef(null); // <g> handle group
  const anchorRef   = useRef(null); // anchor div

  /* ── Theme state (only for crossfade) ─────────────────────────────── */
  const [crossfading, setCrossfading] = useState(false);

  /* ── SVG dimensions (fixed, based on NUM_POINTS/SEG_LEN) ─────────── */
  const ropeLen        = NUM_POINTS * SEG_LEN;
  const svgW           = Math.round(ropeLen * MAX_SWING_FRAC * 2 + HANDLE_RADIUS * 2 + 12);
  const svgH           = ropeLen + HANDLE_RADIUS * 2 + 14;
  const viewX          = -Math.round(ropeLen * MAX_SWING_FRAC) - HANDLE_RADIUS - 6;
  const viewY          = -6;

  /* ── Theme colors ─────────────────────────────────────────────────── */
  const ropeColor  = isDark ? 'rgba(200,180,255,0.62)'  : 'rgba(80,60,180,0.78)';
  const ropeWidth  = isDark ? 2.0 : 2.8;
  const handleFill = isDark ? '#c4b8ff' : '#5B5FEF';
  const triggerGlow= isDark ? 'rgba(196,184,255,0.9)' : 'rgba(91,95,239,0.7)';
  const anchorColor= isDark ? 'rgba(190,170,255,0.5)'  : 'rgba(100,90,200,0.45)';

  /* ── Direct DOM update (called every animation frame) ─────────────── */
  const updateDOM = useCallback(() => {
    const pts = rope.current;
    const dg  = drag.current;

    // Update rope path
    if (ropePathRef.current) {
      ropePathRef.current.setAttribute('d', buildRopePath(pts));
    }

    // Update handle bulb position
    const h = pts[NUM_POINTS];
    if (handleGRef.current) {
      handleGRef.current.setAttribute('cx', h.x.toFixed(2));
      handleGRef.current.setAttribute('cy', h.y.toFixed(2));
      const isTriggered = dg.active && dg.totalDown >= PULL_THRESHOLD;
      handleGRef.current.style.filter = isTriggered
        ? `drop-shadow(0 0 7px ${triggerGlow})`
        : `drop-shadow(0 0 4px ${isDark ? 'rgba(196,184,255,0.6)' : 'rgba(91,95,239,0.35)'})`;
    }
  }, [triggerGlow, isDark]);

  /* ── Physics loop ──────────────────────────────────────────────────── */
  const startPhysics = useCallback(() => {
    if (animId.current) return;

    const loop = () => {
      const pts = rope.current;
      const dg  = drag.current;
      const gravity = dg.active ? GRAVITY : IDLE_GRAVITY;

      /* During drag: lerp last rope point toward pointer target */
      if (dg.active) {
        const last = pts[NUM_POINTS];
        const tgt  = handleTarget.current;
        // Preserve momentum before overwriting
        last.px = last.x;
        last.py = last.y;
        // Lerp bottom toward handle target
        last.x += (tgt.x - last.x) * DRAG_LERP;
        last.y += (tgt.y - last.y) * DRAG_LERP;
      }

      stepRope(pts, gravity, DAMPING);
      satisfyConstraints(pts);

      updateDOM();

      animId.current = requestAnimationFrame(loop);
    };

    animId.current = requestAnimationFrame(loop);
  }, [updateDOM]);

  const stopPhysics = useCallback(() => {
    if (animId.current) {
      cancelAnimationFrame(animId.current);
      animId.current = null;
    }
  }, []);

  /* ── Theme toggle ─────────────────────────────────────────────────── */
  const fireToggle = useCallback(() => {
    if (cooldown.current || triggered.current) return;
    triggered.current = true;
    cooldown.current  = true;

    toggleTheme();
    setCrossfading(true);
    setTimeout(() => setCrossfading(false), 520);
    setTimeout(() => { cooldown.current = false; }, THEME_COOLDOWN_MS);
  }, [toggleTheme]);

  /* ── Pointer down ─────────────────────────────────────────────────── */
  const onPointerDown = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    if (cooldown.current) return;

    stopPhysics();

    // Reset rope to hanging rest position
    const pts = rope.current;
    for (let i = 0; i <= NUM_POINTS; i++) {
      pts[i].x = 0; pts[i].y = i * SEG_LEN;
      pts[i].px = 0; pts[i].py = i * SEG_LEN;
    }
    updateDOM();

    const pos = getPointerPos(e);
    drag.current = { active: true, anchorX: pos.x, anchorY: pos.y, didDrag: false, totalDown: 0 };
    handleTarget.current = { x: 0, y: NUM_POINTS * SEG_LEN };
    triggered.current = false;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    startPhysics();
  }, [startPhysics, stopPhysics, updateDOM]);

  /* ── Pointer move ─────────────────────────────────────────────────── */
  const onPointerMove = useCallback((e) => {
    if (!drag.current.active) return;
    e.preventDefault();

    const pos = getPointerPos(e);
    const dg  = drag.current;
    const dx  = pos.x - dg.anchorX;
    const dy  = pos.y - dg.anchorY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dg.didDrag = true;
    dg.totalDown = Math.max(0, dy);

    const maxSwing = ropeLen * MAX_SWING_FRAC;
    handleTarget.current = {
      x: Math.max(-maxSwing, Math.min(maxSwing, dx)),
      y: Math.max(0, dy) + SEG_LEN,
    };
  }, [ropeLen]);

  /* ── Pointer up ──────────────────────────────────────────────────── */
  const onPointerUp = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;

    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    const dg = drag.current;
    if (dg.totalDown >= PULL_THRESHOLD && dg.didDrag && !triggered.current) {
      fireToggle();
    }
  }, [fireToggle]);

  /* ── Pointer cancel ──────────────────────────────────────────────── */
  const onPointerCancel = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    stopPhysics();

    const pts = rope.current;
    for (let i = 0; i <= NUM_POINTS; i++) {
      pts[i].x = 0; pts[i].y = i * SEG_LEN;
      pts[i].px = 0; pts[i].py = i * SEG_LEN;
    }
    updateDOM();
  }, [stopPhysics, updateDOM]);

  /* ── Keyboard ─────────────────────────────────────────────────────── */
  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!cooldown.current) {
        cooldown.current = true;
        toggleTheme();
        setCrossfading(true);
        setTimeout(() => setCrossfading(false), 520);
        setTimeout(() => { cooldown.current = false; }, THEME_COOLDOWN_MS);
      }
    }
  }, [toggleTheme]);

  /* ── Click (tap without drag = toggle) ──────────────────────────── */
  const onClick = useCallback((e) => {
    e.stopPropagation();
    if (cooldown.current || drag.current.didDrag) return;
    cooldown.current = true;
    toggleTheme();
    setCrossfading(true);
    setTimeout(() => setCrossfading(false), 520);
    setTimeout(() => { cooldown.current = false; }, THEME_COOLDOWN_MS);
  }, [toggleTheme]);

  /* ── Mount: start idle physics ─────────────────────────────────────── */
  useEffect(() => {
    // Seed rope path DOM immediately
    if (ropePathRef.current) {
      ropePathRef.current.setAttribute('d', buildRopePath(rope.current));
    }
    startPhysics();
  }, [startPhysics]);

  /* ── Unmount cleanup ───────────────────────────────────────────────── */
  useEffect(() => {
    return () => {
      stopPhysics();
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [stopPhysics]);

  /* ── Derived values ────────────────────────────────────────────────── */
  const isDragging  = drag.current.active;
  const isTriggered = isDragging && drag.current.totalDown >= PULL_THRESHOLD;
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    padding: '6px 8px',
    borderRadius: 16,
    background: 'transparent',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    border: 'none',
    boxShadow: 'none',
    WebkitTapHighlightColor: 'transparent',
    opacity: crossfading ? 0.82 : 1,
    transition: crossfading ? 'opacity 0.35s ease' : 'none',
    outline: 'none',
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={containerStyle}
    >
      {/* SVG: rope + handle — all animated via direct DOM refs, no React re-renders */}
      <svg
        ref={svgRef}
        width={svgW}
        height={svgH}
        viewBox={`${viewX} ${viewY} ${svgW} ${svgH}`}
        style={{ overflow: 'visible', display: 'block', flexShrink: 0, pointerEvents: 'none' }}
      >
        {/* Rope — path `d` is updated every frame via ropePathRef */}
        <path
          ref={ropePathRef}
          d={buildRopePath(rope.current)}
          stroke={ropeColor}
          strokeWidth={ropeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Handle — minimalist pendant bulb, no grip lines */}
        <circle
          ref={handleGRef}
          cx={0}
          cy={NUM_POINTS * SEG_LEN}
          r={HANDLE_RADIUS}
          fill={isDark ? '#c4b8ff' : '#5B5FEF'}
          style={{ filter: `drop-shadow(0 0 4px ${isDark ? 'rgba(196,184,255,0.6)' : 'rgba(91,95,239,0.35)'})` }}
        />
      </svg>

      {/* Anchor dot — fixed above SVG, never moves */}
      <div
        ref={anchorRef}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: anchorColor,
          flexShrink: 0,
          marginTop: -1,
          boxShadow: isDark
            ? '0 0 4px rgba(150,120,255,0.4)'
            : '0 0 4px rgba(100,90,200,0.3)',
        }}
      />
    </div>
  );
}
