import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, Monitor, Smartphone, Tablet, Sparkles, Loader2,
  ArrowRight, RefreshCw, Check, X, ChevronRight, Layout,
  MessageSquare, Send, Bot, User, Sparkle, Maximize, Image, Download, Eye
} from 'lucide-react';
import api from '../utils/api';
import { generateImage } from '../services/ImageService';

const DEVICES = [
  { id: 'web', icon: Monitor, label: 'Web', width: 1440, height: 900, bg: '#f8f9ff' },
  { id: 'tablet', icon: Tablet, label: 'Tablet', width: 768, height: 1024, bg: '#f8f9ff' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile', width: 375, height: 812, bg: '#f8f9ff' },
];

const STYLES = [
  { id: 'modern', label: 'Modern', colors: ['#7c5cff', '#ff6b9d', '#ffffff'], desc: 'Bold & vibrant' },
  { id: 'minimal', label: 'Minimal', colors: ['#18181b', '#71717a', '#ffffff'], desc: 'Clean & simple' },
  { id: 'corporate', label: 'Corporate', colors: ['#1e40af', '#3b82f6', '#f8fafc'], desc: 'Professional' },
  { id: 'playful', label: 'Playful', colors: ['#f59e0b', '#ec4899', '#fef3c7'], desc: 'Fun & colorful' },
  { id: 'elegant', label: 'Elegant', colors: ['#0f172a', '#d4af37', '#fafaf9'], desc: 'Sophisticated' },
  { id: 'startup', label: 'Startup', colors: ['#10b981', '#7c5cff', '#ffffff'], desc: 'Fresh & modern' },
  { id: 'dark', label: 'Dark', colors: ['#09090b', '#7c5cff', '#27272a'], desc: 'Night mode' },
  { id: 'glassmorphism', label: 'Glass', colors: ['#06b6d4', '#7c5cff', '#1e293b'], desc: 'Frosted glass' },
];

// Map AI element types → Editor element types
const TYPE_MAP = {
  nav: 'navigation',
  list: 'text',
  chart: 'section',
  table: 'section',
  heading: 'heading',
  paragraph: 'paragraph',
  divider: 'divider',
};

/* ─── Transform AI sections[] → positioned canvas elements ─────────────── */
/**
 * Generate positioned elements from AI sections for any screen size.
 * Layout strategy:
 *   Desktop (≥1024px): sidebar + 3-col grid
 *   Tablet  (≥640px):  sidebar + 2-col grid
 *   Mobile  (<640px): bottom tab bar + single-col stacked cards
 *
 * @param {Array}  sections  - AI returned sections
 * @param {Object} palette   - color palette
 * @param {number} canvasW   - target canvas width
 * @param {number} canvasH   - target canvas height
 */

/* ─── Polished SaaS Layout Engine ─────────────────────────────────────────── */
/**
 * sectionsToElements — transforms AI sections into a premium SaaS dashboard layout.
 * Mobile:   topbar + stat cards + stacked section cards + bottom tab bar
 * Tablet:   icon sidebar + topbar + stat cards + 2-col grid
 * Desktop:  full sidebar + topbar + 3-col stat cards + section grid
 */
function sectionsToElements(sections, palette, canvasW = 1440, canvasH = 900) {
  if (!sections || sections.length === 0) return [];

  const BASE_W = 1440, BASE_H = 900;
  const s = canvasW / BASE_W;
  const px  = (v) => Math.round(v * s);
  const pxs = (v, min = 0) => Math.max(min, px(v));
  const fs  = (v) => Math.max(9, px(v));

  const primary   = palette.primary   || '#7c5cff';
  const secondary = palette.secondary || '#ff6b9d';
  const success   = '#10b981';
  const warning   = '#f59e0b';
  const info      = '#06b6d4';

  const els = [];
  const sid = (id) => id;

  const isMobile = canvasW < 640;
  const isTablet  = canvasW >= 640 && canvasW < 1024;

  // ── Mobile ────────────────────────────────────────────────────────────────
  if (isMobile) {
    const pad    = 16;
    const cardW  = canvasW - pad * 2;

    // Topbar with gradient
    els.push({
      id: 'el_topbar', type: 'topbar',
      x: 0, y: 0, width: canvasW, height: 54,
      props: { background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`, shadow: '0 2px 12px rgba(124,92,255,0.4)' },
    });
    els.push({
      id: 'el_logo', type: 'logoBadge',
      x: pad, y: 12, width: 72, height: 30,
      props: { backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: 10, textColor: '#fff', fontSize: 13, fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      text: 'APP',
    });
    els.push({
      id: 'el_topbar_avatar', type: 'avatar',
      x: canvasW - pad - 30, y: 12, width: 30, height: 30,
      props: { backgroundColor: 'rgba(255,255,255,0.35)', textColor: '#fff', fontSize: 12, fontWeight: '800', borderRadius: '50%' },
      text: 'U',
    });

    let cy = 62;

    // Stat row — 2 per row
    const statW = (cardW - 10) / 2;
    const statColors = [primary, success, secondary, warning];
    sections.slice(0, 4).forEach((section, si) => {
      const col  = si % 2;
      const sc   = statColors[si % statColors.length];
      const vals = (section.components || []).map(c => typeof c === 'string' ? c : c.name || '').filter(Boolean);
      els.push({
        id: sid(`el_stat_${si}`), type: 'statCard',
        x: pad + col * (statW + 10), y: cy, width: statW, height: 86,
        props: { backgroundColor: sc, gradient: `linear-gradient(135deg, ${sc} 0%, ${sc}AA 100%)`, borderRadius: 16, shadow: `0 6px 20px ${sc}44`, textColor: '#fff' },
        text: section.name || `Metric ${si + 1}`,
        sub:  vals[0] || `${(Math.random() * 800 + 200).toFixed(0)}`,
      });
      if (col === 1) cy += 96;
    });
    if (sections.length <= 4) cy += 96;

    // Section cards
    sections.slice(4).forEach((section, si) => {
      const components = (section.components || []).filter(Boolean);
      const titleH  = 26;
      const rowH    = 34;
      const cardH   = titleH + Math.min(components.length, 4) * rowH + 18;

      els.push({
        id: sid(`el_card_${si}`), type: 'sectionCard',
        x: pad, y: cy, width: cardW, height: cardH,
        props: { backgroundColor: palette.surfaceElevated || '#1c1c28', borderRadius: 18, border: `1px solid ${palette.border || '#2a2a3a'}`, shadow: '0 4px 16px rgba(0,0,0,0.25)', padding: '14px' },
        text: section.name || '',
      });
      els.push({
        id: sid(`el_accent_${si}`), type: 'accentLine',
        x: pad, y: cy, width: cardW, height: 3,
        props: { backgroundColor: primary, borderRadius: '18px 18px 0 0' },
      });
      els.push({
        id: sid(`el_title_${si}`), type: 'text',
        x: pad + 14, y: cy + 14, width: cardW - 28, height: titleH,
        props: { fontSize: 13, fontWeight: '800', color: palette.textPrimary || '#f4f4f8', backgroundColor: 'transparent' },
        text: section.name || '',
      });
      components.slice(0, 4).forEach((comp, ci) => {
        const name = typeof comp === 'string' ? comp : comp.name || comp.title || '';
        els.push({
          id: sid(`el_row_${si}_${ci}`), type: 'listRow',
          x: pad + 14, y: cy + titleH + 10 + ci * rowH, width: cardW - 28, height: rowH - 4,
          props: { backgroundColor: palette.surface || '#15151f', borderRadius: 10, fontSize: 12, color: palette.textSecondary || '#9ca3af', padding: '5px 10px' },
          text: `▸  ${name}`,
        });
      });
      cy += cardH + 14;
    });

    // Bottom tab bar
    const tabH  = 58;
    const tabW  = Math.floor(canvasW / 5);
    const tabs  = ['⌘', '⚡', '📊', '🔔', '⚙'];
    const tabActive = [true, false, false, false, false];
    tabs.forEach((item, i) => {
      els.push({
        id: sid(`el_tab_${i}`), type: 'tab',
        x: i * tabW, y: canvasH - tabH, width: tabW, height: tabH,
        props: {
          backgroundColor: tabActive[i] ? `${primary}18` : 'transparent',
          borderTop: `2.5px solid ${tabActive[i] ? primary : 'transparent'}`,
          textColor: tabActive[i] ? primary : '#6b6b7b',
        },
        text: item,
      });
    });

  // ── Tablet ────────────────────────────────────────────────────────────────
  } else if (isTablet) {
    const sidebarW = 72;
    const topbarH  = 62;
    const pad      = 20;
    const contentW = canvasW - sidebarW - pad * 2;
    const cols     = 2;
    const gapX     = 16;
    const colW     = Math.floor((contentW - gapX) / cols);

    // Sidebar
    els.push({
      id: 'el_sidebar', type: 'sidebar',
      x: 0, y: 0, width: sidebarW, height: canvasH,
      props: { backgroundColor: palette.surface || '#15151f', borderRight: `1px solid ${palette.border || '#2a2a3a'}` },
    });
    els.push({
      id: 'el_side_logo', type: 'logoBadge',
      x: 10, y: 10, width: 52, height: 42,
      props: { backgroundColor: primary, borderRadius: 14, textColor: '#fff', fontSize: 18, fontWeight: '900', shadow: `0 4px 12px ${primary}44` },
      text: 'A',
    });
    const navIcons = ['⌘', '⚡', '📊', '📋', '🔔', '⚙'];
    navIcons.forEach((item, i) => {
      const isActive = i === 0;
      els.push({
        id: sid(`el_nav_${i}`), type: 'navItem',
        x: 8, y: 68 + i * 62, width: 56, height: 50,
        props: { backgroundColor: isActive ? `${primary}22` : 'transparent', borderRadius: 14, border: isActive ? `1.5px solid ${primary}50` : '1.5px solid transparent', textColor: isActive ? primary : '#6b6b7b', fontSize: 11, fontWeight: '600', textAlign: 'center' },
        text: item,
      });
    });

    // Topbar
    els.push({
      id: 'el_topbar', type: 'topbar',
      x: sidebarW, y: 0, width: canvasW - sidebarW, height: topbarH,
      props: { backgroundColor: palette.surface || '#15151f', borderBottom: `1px solid ${palette.border || '#2a2a3a'}` },
    });
    els.push({
      id: 'el_topbar_title', type: 'text',
      x: sidebarW + pad, y: 16, width: 220, height: 30,
      props: { fontSize: 16, fontWeight: '800', color: palette.textPrimary || '#f4f4f8', backgroundColor: 'transparent' },
      text: sections[0]?.name || 'Dashboard',
    });
    els.push({
      id: 'el_topbar_avatar', type: 'avatar',
      x: canvasW - sidebarW - 54, y: 14, width: 34, height: 34,
      props: { backgroundColor: primary, textColor: '#fff', fontSize: 13, fontWeight: '800', borderRadius: '50%', shadow: `0 2px 8px ${primary}44` },
      text: 'U',
    });

    const startY = topbarH + pad;
    const statColors2 = [primary, success, secondary, warning];
    const statH = 96;
    const statRowW = Math.floor((contentW - gapX) / 2);

    // Stat row
    sections.slice(0, 4).forEach((section, si) => {
      const col  = si % 2;
      const sc   = statColors2[si % statColors2.length];
      const vals = (section.components || []).map(c => typeof c === 'string' ? c : c.name || '').filter(Boolean);
      els.push({
        id: sid(`el_stat_${si}`), type: 'statCard',
        x: sidebarW + pad + col * (statRowW + gapX), y: startY, width: statRowW, height: statH,
        props: { backgroundColor: sc, gradient: `linear-gradient(135deg, ${sc} 0%, ${sc}BB 100%)`, borderRadius: 18, shadow: `0 6px 20px ${sc}33`, textColor: '#fff' },
        text: section.name || `Stat ${si + 1}`,
        sub:  vals[0] || `${(Math.random() * 9000 + 1000).toFixed(0)}`,
      });
    });

    const row2Y = startY + statH + pad;

    // Section cards — 2 per row
    sections.slice(4).forEach((section, si) => {
      const col  = si % 2;
      const row  = Math.floor(si / 2);
      const cx   = sidebarW + pad + col * (colW + gapX);
      const cy2  = row2Y + row * (200 + pad);
      const components = section.components || [];
      const cardH = Math.min(components.length, 3) * 30 + 64;

      els.push({
        id: sid(`el_card_${si}`), type: 'sectionCard',
        x: cx, y: cy2, width: colW, height: cardH,
        props: { backgroundColor: palette.surfaceElevated || '#1c1c28', borderRadius: 18, border: `1px solid ${palette.border || '#2a2a3a'}`, shadow: '0 4px 16px rgba(0,0,0,0.2)', padding: '14px' },
        text: section.name || '',
      });
      els.push({
        id: sid(`el_accent_${si}`), type: 'accentLine',
        x: cx, y: cy2, width: colW, height: 3,
        props: { backgroundColor: primary, borderRadius: '18px 18px 0 0' },
      });
      els.push({
        id: sid(`el_title_${si}`), type: 'text',
        x: cx + 14, y: cy2 + 12, width: colW - 28, height: 22,
        props: { fontSize: 12, fontWeight: '800', color: palette.textPrimary || '#f4f4f8', backgroundColor: 'transparent' },
        text: section.name || '',
      });
      components.slice(0, 3).forEach((comp, ci) => {
        const name = typeof comp === 'string' ? comp : comp.name || comp.title || '';
        els.push({
          id: sid(`el_row_${si}_${ci}`), type: 'listRow',
          x: cx + 14, y: cy2 + 40 + ci * 30, width: colW - 28, height: 26,
          props: { backgroundColor: palette.surface || '#15151f', borderRadius: 8, fontSize: 11, color: palette.textSecondary || '#9ca3af', padding: '4px 8px' },
          text: `▸  ${name}`,
        });
      });
    });

  // ── Desktop ──────────────────────────────────────────────────────────────
  } else {
    const sidebarW = px(268);
    const topbarH  = px(66);
    const pad      = px(28);
    const contentW = canvasW - sidebarW - pad * 2;
    const cols     = 3;
    const gapX     = px(20);
    const gapY     = px(22);
    const colW     = Math.floor((contentW - gapX * (cols - 1)) / cols);
    const startY   = topbarH + px(28);

    // ── Topbar ──────────────────────────────────────────────────────────────
    els.push({
      id: 'el_topbar', type: 'topbar',
      x: 0, y: 0, width: canvasW, height: topbarH,
      props: { backgroundColor: palette.surface || '#15151f', borderBottom: `1px solid ${palette.border || '#2a2a3a'}`, shadow: '0 2px 8px rgba(0,0,0,0.3)' },
    });
    els.push({
      id: 'el_logo', type: 'logoBadge',
      x: px(20), y: px(14), width: px(38), height: px(38),
      props: { backgroundColor: primary, borderRadius: px(11), textColor: '#fff', fontSize: px(18, 14), fontWeight: '900', shadow: `0 4px 14px ${primary}44` },
      text: 'A',
    });
    els.push({
      id: 'el_brand', type: 'text',
      x: px(66), y: px(19), width: px(110), height: px(28),
      props: { fontSize: px(16, 13), fontWeight: '900', color: palette.textPrimary || '#f4f4f8', backgroundColor: 'transparent' },
      text: 'AppName',
    });
    els.push({
      id: 'el_search', type: 'searchBar',
      x: px(390), y: px(14), width: px(340), height: px(38),
      props: { backgroundColor: palette.surfaceElevated || '#1c1c28', borderRadius: px(11), border: `1px solid ${palette.border || '#2a2a3a'}`, placeholderColor: '#6b6b7b' },
      text: '',
    });
    els.push({
      id: 'el_notif', type: 'iconBtn',
      x: px(750), y: px(15), width: px(36), height: px(36),
      props: { backgroundColor: 'transparent', borderRadius: px(10) },
      text: '🔔',
    });
    els.push({
      id: 'el_notif_dot', type: 'badge',
      x: px(772), y: px(15), width: px(8), height: px(8),
      props: { backgroundColor: '#ef4444', borderRadius: '50%' },
    });
    els.push({
      id: 'el_topbar_avatar', type: 'avatar',
      x: canvasW - px(56), y: px(14), width: px(38), height: px(38),
      props: { backgroundColor: primary, textColor: '#fff', fontSize: px(15, 12), fontWeight: '800', borderRadius: '50%', shadow: `0 2px 8px ${primary}44` },
      text: 'U',
    });

    // ── Sidebar ─────────────────────────────────────────────────────────────
    els.push({
      id: 'el_sidebar', type: 'sidebar',
      x: 0, y: topbarH, width: sidebarW, height: canvasH - topbarH,
      props: { backgroundColor: palette.surface || '#15151f', borderRight: `1px solid ${palette.border || '#2a2a3a'}` },
    });

    const navItems = [
      { icon: '◉', label: 'Overview',       isActive: true  },
      { icon: '⚡', label: 'Infrastructure', isActive: false },
      { icon: '☰', label: 'Containers',      isActive: false },
      { icon: '📊', label: 'Logs',            isActive: false },
      { icon: '🔔', label: 'Alerts',          isActive: false },
      { icon: '🚀', label: 'Deployments',     isActive: false },
      { icon: '🗄', label: 'Database',        isActive: false },
      { icon: '🔒', label: 'Security',        isActive: false },
    ];
    navItems.forEach((item, i) => {
      els.push({
        id: sid(`el_nav_${i}`), type: 'navItem',
        x: px(10), y: topbarH + px(20) + i * (px(42) + px(8)), width: sidebarW - px(20), height: px(42),
        props: {
          backgroundColor: item.isActive ? `${primary}18` : 'transparent',
          borderRadius: px(12),
          border: item.isActive ? `1.5px solid ${primary}44` : '1.5px solid transparent',
          textColor:  item.isActive ? primary  : '#8b8b9b',
          fontSize:   px(13, 11),
          fontWeight: item.isActive ? '700'   : '500',
        },
        text: `${item.icon}  ${item.label}`,
      });
    });
    els.push({
      id: 'el_nav_settings', type: 'navItem',
      x: px(10), y: canvasH - px(64), width: sidebarW - px(20), height: px(42),
      props: { backgroundColor: 'transparent', borderRadius: px(10), border: '1px solid transparent', textColor: '#8b8b9b', fontSize: px(13, 11), fontWeight: '500' },
      text: '⚙  Settings',
    });

    // ── Stat cards row ─────────────────────────────────────────────────────
    const statColors = [primary, success, secondary];
    const statW = Math.floor((contentW - gapX * (cols - 1)) / cols);
    const statH = px(118);
    sections.slice(0, 3).forEach((section, si) => {
      const sc   = statColors[si % statColors.length];
      const vals = (section.components || []).map(c => typeof c === 'string' ? c : c.name || '').filter(Boolean);
      els.push({
        id: sid(`el_stat_${si}`), type: 'statCard',
        x: sidebarW + pad + si * (statW + gapX), y: startY, width: statW, height: statH,
        props: {
          backgroundColor: sc,
          gradient: `linear-gradient(135deg, ${sc} 0%, ${sc}88 100%)`,
          borderRadius: px(20),
          shadow: `0 8px 28px ${sc}33`,
          textColor: '#fff',
        },
        text: section.name || `Stat ${si + 1}`,
        sub:  vals[0] || `${(Math.random() * 9000 + 1000).toFixed(0)}`,
      });
    });

    // ── Section cards ───────────────────────────────────────────────────────
    const row2Y = startY + statH + gapY;
    const cardH_base = px(210);
    sections.slice(3).forEach((section, si) => {
      const col  = si % cols;
      const row  = Math.floor(si / cols);
      const cx   = sidebarW + pad + col * (colW + gapX);
      const cy2  = row2Y + row * (cardH_base + gapY);
      const components = section.components || [];
      const titleH  = px(24);
      const rowH    = px(32);
      const cardH   = titleH + Math.min(components.length, 5) * rowH + px(28);

      els.push({
        id: sid(`el_card_${si}`), type: 'sectionCard',
        x: cx, y: cy2, width: colW, height: cardH,
        props: {
          backgroundColor: palette.surfaceElevated || '#1c1c28',
          borderRadius: px(20),
          border: `1px solid ${palette.border || '#2a2a3a'}`,
          shadow: `0 6px 24px rgba(0,0,0,0.22)`,
          padding: `${px(16)}px`,
        },
        text: section.name || '',
      });
      els.push({
        id: sid(`el_accent_${si}`), type: 'accentLine',
        x: cx + px(16), y: cy2, width: colW - px(32), height: px(3),
        props: { backgroundColor: primary, borderRadius: `0 0 ${px(3)} ${px(3)}` },
      });
      els.push({
        id: sid(`el_title_${si}`), type: 'text',
        x: cx + px(16), y: cy2 + px(14), width: colW - px(32), height: titleH,
        props: { fontSize: px(14, 12), fontWeight: '800', color: palette.textPrimary || '#f4f4f8', backgroundColor: 'transparent' },
        text: section.name || '',
      });
      components.slice(0, 5).forEach((comp, ci) => {
        const name = typeof comp === 'string' ? comp : comp.name || comp.title || '';
        els.push({
          id: sid(`el_row_${si}_${ci}`), type: 'listRow',
          x: cx + px(16), y: cy2 + titleH + px(12) + ci * rowH, width: colW - px(32), height: rowH - px(4),
          props: {
            backgroundColor: palette.surface || '#15151f',
            borderRadius: px(9),
            fontSize: px(12, 10),
            color: palette.textSecondary || '#9ca3af',
            padding: `${px(4)}px ${px(10)}px`,
          },
          text: `▸  ${name}`,
        });
      });
    });
  }

  return els;
}
function transformToScreen(aiResult, deviceId) {
  const dev = DEVICES.find(d => d.id === deviceId) || DEVICES[0];
  // Use elements directly, or generate from parsed.sections
  const rawEls = aiResult.elements && aiResult.elements.length > 0
    ? aiResult.elements
    : (aiResult.parsed?.sections ? sectionsToElements(aiResult.parsed.sections, aiResult.parsed?.colorPalette || {}, dev.width, dev.height) : []);
  const screen = {
    id: `screen_${Date.now()}`,
    name: aiResult.screen_name || aiResult.name || 'Generated Screen',
    width: dev.width,
    height: dev.height,
    elements: rawEls.map((el, i) => ({
      id: el.id || `el_${i}`,
      type: TYPE_MAP[el.type] || el.type,
      x: Number(el.x) || 0,
      y: Number(el.y) || 0,
      width: Number(el.width) || 100,
      height: Number(el.height) || 50,
      props: {
        ...(el.props || {}),
        // AI uses 'background' field for bg color — map to backgroundColor
        backgroundColor: el.props?.backgroundColor || el.props?.background || undefined,
      },
      text: el.text || '',
      visible: true,
      locked: false,
      name: (TYPE_MAP[el.type] || el.type) + ' ' + (i + 1),
    })),
  };
  return screen;
}

const EXAMPLE_PROMPTS = [
  { title: 'SaaS Dashboard', prompt: 'Analytics dashboard with charts, KPIs, and a sidebar navigation' },
  { title: 'E-commerce', prompt: 'Product listing page with grid, filters sidebar, and add to cart' },
  { title: 'Social Feed', prompt: 'Social media feed with post cards, like, comment, and share buttons' },
];

export default function AutodesignerPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [device, setDevice] = useState('web');
  const [style, setStyle] = useState('modern');
  const [generating, setGenerating] = useState(false);
  const [stage, setStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showExamples, setShowExamples] = useState(true);
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatThinking, setChatThinking] = useState(false);
  const [chatError, setChatError] = useState('');
  const [currentDesign, setCurrentDesign] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null); // { url, prompt, model }
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [imageLightbox, setImageLightbox] = useState(null); // URL for fullscreen view
  const chatEndRef = { current: null };

  const scrollChat = () => {
    setTimeout(() => {
      if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatThinking) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatError('');
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: userMsg }]);
    setChatThinking(true);
    scrollChat();
    try {
      // Build history for context (last 10 messages)
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const data = await api.autodesignChat({
        message: userMsg,
        history,
        device,
        style,
        currentDesign,
      });
      const { reply, design } = data;
      if (reply) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'assistant', content: reply },
        ]);
      }
      if (design) {
        setCurrentDesign(design);
        setResult(design);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            role: 'system',
            content: `✨ Design "${design.screen_name || 'Screen'}" is ready — ${design.elements?.length || 0} elements`,
            isDesign: true,
          },
        ]);
      }
    } catch (err) {
      setChatError(err.message || 'Failed to get response');
    } finally {
      setChatThinking(false);
      scrollChat();
    }
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError('');
    setResult(null);
    setStage('Analyzing your request…');
    setShowExamples(false);
    try {
      const stages = [
        'Analyzing your request…',
        'Designing the layout…',
        'Selecting colors & fonts…',
        'Building components…',
        'Finalizing details…',
      ];
      let i = 0;
      const ticker = setInterval(() => {
        i = Math.min(stages.length - 1, i + 1);
        setStage(stages[i]);
      }, 1500);

      const data = await api.autodesign({ description: prompt, device, style });
      clearInterval(ticker);

      // AI returns { reply, parsed: { layout, sections, colorPalette } }
      // sections live inside parsed — check there
      const sections = data.parsed?.sections;
      if ((!data.elements || data.elements.length === 0) && sections && sections.length > 0) {
        data.elements = sectionsToElements(sections, data.parsed?.colorPalette || {});
      }

      setResult(data);
      if (chatMode) {
        setCurrentDesign(data);
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'system', content: `✨ Design "${data.screen_name || 'Screen'}" generated with ${data.elements?.length || 0} elements`, isDesign: true },
        ]);
      }
      setStage('');
    } catch (err) {
      setError(err.message || 'Generation failed — please try again.');
      setStage('');
    } finally {
      setGenerating(false);
    }
  };

  const openInEditor = async () => {
    if (!result) return;
    try {
      // Transform AI result → Editor screen format
      const screen = transformToScreen(result, device);
      // Create project first (basic info only — backend doesn't store screens)
      const project = await api.createProject({
        name: result.screen_name || prompt.slice(0, 60) || 'AI generated',
        description: result.description || '',
        device,
      });
      // Pass AI screen via state so editor loads it immediately
      navigate(`/app/editor/${project.id}`, {
        state: { aiScreen: screen, aiPalette: result.colorPalette },
      });
    } catch (err) {
      alert('Failed to open in editor: ' + err.message);
    }
  };

  /** Open the generated design in a new fullscreen tab using canvas rendering */
  const openFullscreenPreview = () => {
    if (!result) return;
    const dev = DEVICES.find(d => d.id === device) || DEVICES[0];
    const w = dev.width, h = dev.height;
    // Compute elements for the current device (same logic as ResponsiveCanvas)
    const els = (result.elements && result.elements.length > 0)
      ? result.elements
      : (result.parsed?.sections ? sectionsToElements(result.parsed.sections, result.parsed?.colorPalette || {}, w, h) : []);
    const palette = result.parsed?.colorPalette || result.colorPalette || {};
    const name = result.screen_name || result.name || 'Design Preview';
    const bgColor = palette.background || '#f8f9ff';

    // Serialize elements safely
    const safeEls = els.map(el => ({
      id: String(el.id || ''),
      type: String(el.type || 'rect'),
      x: Number(el.x) || 0, y: Number(el.y) || 0,
      width: Number(el.width) || 100, height: Number(el.height) || 50,
      text: String(el.text || ''),
      props: Object.fromEntries(
        Object.entries(el.props || {})
          .filter(([, v]) => v === null || typeof v !== 'object')
          .map(([k, v]) => [k, typeof v === 'string' ? v : String(v)])
      ),
    }));

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;min-height:100%;background:#0d0d14;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
.toolbar{position:sticky;top:0;z-index:50;width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:rgba(13,13,20,0.97);border-bottom:1px solid #252535;backdrop-filter:blur(12px)}
.tl{display:flex;align-items:center;gap:10px}
.tt{font-size:13px;font-weight:700;color:#e0e0f0;font-family:system-ui,sans-serif}
.badge{font-size:10px;padding:3px 10px;border-radius:20px;background:rgba(124,92,255,0.18);color:#c4b5fd;font-family:system-ui,sans-serif;font-weight:600}
.btn{padding:7px 16px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;border:none;font-family:system-ui,sans-serif}
.btn-ghost{background:rgba(255,255,255,0.06);color:#8888a0;border:1px solid #252535}
.canvas-wrap{width:${w}px;min-height:${h}px;position:relative;overflow:hidden;margin:24px auto;border-radius:12px;box-shadow:0 32px 80px rgba(0,0,0,0.7)}
canvas{display:block}
@media(max-width:${w + 80}px){.canvas-wrap{width:100%;border-radius:0;margin:0}}
</style>
</head>
<body>
<div class="toolbar">
<div class="tl"><span class="tt">${name}</span><span class="badge">${dev.label} · ${w}×${h}</span></div>
<div style="display:flex;gap:8px"><button class="btn btn-ghost" onclick="window.close()">✕ Close</button></div>
</div>
<div class="canvas-wrap"><canvas id="c" width="${w}" height="${h}"></canvas></div>
<script>
(function(){
var els=${JSON.stringify(safeEls)};
var w=${w},h=${h};
var c=document.getElementById('c');
var ctx=c.getContext('2d');
ctx.fillStyle='${bgColor}';
ctx.fillRect(0,0,w,h);
function rR(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
els.forEach(function(el){
  try{
    var x=el.x||0,y=el.y||0,ew=el.width||100,eh=el.height||50;
    var p=el.props||{};
    var bg=p.backgroundColor||'';
    if(bg){ctx.fillStyle=bg;if(p.borderRadius>0){rR(x,y,ew,eh,Math.min(p.borderRadius,ew/2,eh/2));}else{ctx.fillRect(x,y,ew,eh);}ctx.fill();}
    if(p.border){
      var parts=p.border.split(' ');
      if(parts[2]){ctx.strokeStyle=parts[2];ctx.lineWidth=parseInt(parts[0])||1;if(p.borderRadius>0){rR(x,y,ew,eh,Math.min(p.borderRadius,ew/2,eh/2));}else{ctx.strokeRect(x,y,ew,eh);}ctx.stroke();}
    }
    if(el.text){
      var fs=parseFloat(p.fontSize)||12;
      ctx.fillStyle=p.color||'#fff';
      ctx.font=(p.fontWeight||400)+' '+fs+'px system-ui,sans-serif';
      ctx.textAlign=p.align==='center'?'center':p.align==='right'?'right':'left';
      ctx.textBaseline='middle';
      var tx=p.align==='center'?x+ew/2:p.align==='right'?x+ew-4:x+6;
      ctx.fillText(el.text,tx,y+eh/2,ew-12);
    }
  }catch(e){}
});
})();
<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) { alert('Please allow popups for fullscreen preview.'); return; }
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  /** Generate a photorealistic AI image of the current design */
  const generateDesignImage = async () => {
    if (imageLoading) return;
    setImageLoading(true);
    setImageError('');
    setGeneratedImage(null);

    try {
      // Build a rich prompt from the design result
      const palette = result.parsed?.colorPalette || result.colorPalette || {};
      const sections = result.parsed?.sections || [];
      const sectionNames = sections.map(s => s.name || s.title || '').filter(Boolean);
      const components = sections.flatMap(s => (s.components || []).map(c => typeof c === 'string' ? c : c.name || c.title || '')).filter(Boolean);

      const dev = DEVICES.find(d => d.id === device) || DEVICES[0];
      const isMobile = dev.id === 'mobile';
      const isTablet = dev.id === 'tablet';
      const isWeb = dev.id === 'web';

      const style = selectedStyle?.label || 'Modern';
      const productName = result.screen_name || result.name || 'SaaS Dashboard';

      // Construct a rich, detailed prompt for MiniMax image-01
      const prompt = `A beautiful, ultra-detailed ${style.toLowerCase()} ${isMobile ? 'mobile app' : isTablet ? 'tablet app' : 'web dashboard'} UI design for "${productName}". Dark theme with purple accent colors. Clean professional layout with: ${sectionNames.slice(0, 6).join(', ') || 'statistics cards, charts, data tables, sidebar navigation'}. ${components.slice(0, 8).join(', ') || ' KPIs, line charts, bar charts, user avatars, status badges'}. High fidelity UI mockup, 4K, ultra detailed, professional SaaS design, purple gradient accents, glass morphism, soft shadows, clean typography`;

      const size = isMobile ? '1024x1792' : isTablet ? '768x1024' : '1792x1024';
      const imgResult = await generateImage(prompt, { size, n: 1 });

      if (!imgResult.success) {
        setImageError(imgResult.error || 'Image generation failed');
        return;
      }

      setGeneratedImage({
        url: imgResult.images[0],
        prompt: imgResult.prompt || prompt,
        model: imgResult.model,
        size,
      });
    } catch (err) {
      setImageError(err.message || 'An unexpected error occurred');
    } finally {
      setImageLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPrompt('');
    setError('');
    setShowExamples(true);
    setMessages([]);
    setCurrentDesign(null);
    setChatInput('');
    setChatError('');
    setGeneratedImage(null);
    setImageLoading(false);
    setImageError('');
    setImageLightbox(null);
  };

  const selectedDevice = DEVICES.find((d) => d.id === device) || DEVICES[0];
  const selectedStyle = STYLES.find((s) => s.id === style) || STYLES[0];

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] pb-6 lg:pb-10">
      {/* Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-4 lg:px-8 py-5 lg:py-7 mb-4 lg:mb-6 border-b" style={{ borderColor: 'var(--border)', background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.06) 0%, rgba(255, 107, 157, 0.04) 100%)' }}>
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-2" style={{ background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.15), rgba(255, 107, 157, 0.1))', borderColor: 'rgba(124, 92, 255, 0.25)', color: '#7c5cff' }}>
            <Sparkles size={10} />
            <span>AI Autodesigner</span>
          </div>
          <h1 className="text-xl lg:text-[26px] font-extrabold tracking-tight mb-0.5" style={{ color: 'var(--text)' }}>Generate UI from text</h1>
          <p className="text-xs lg:text-sm" style={{ color: 'var(--text-muted)' }}>Describe your design and get an editable mockup in seconds.</p>
        </div>
        {result && !generating && (
          <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all" style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} onClick={reset}>
              <RefreshCw size={14} />
              <span>New</span>
            </button>
            <button className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-pink))', color: 'white', boxShadow: '0 4px 14px rgba(124, 92, 255, 0.35)' }} onClick={openInEditor}>
              Open in editor
              <ArrowRight size={14} />
            </button>
          </div>
        )}

      </header>

      {/* Main: Sidebar + Preview */}
      <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-4 lg:gap-6 px-4 lg:px-8 items-start min-h-0">
        {/* Left Panel — Form */}
        <div className="flex flex-col gap-3 min-w-0 w-full">
          {/* Prompt */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
            <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>Describe your design</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Be specific</span>
            </label>
            <textarea
              className="w-full border rounded-xl px-3 py-2.5 text-sm resize-y focus:outline-none transition-all"
              style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)', minHeight: '80px' }}
              placeholder="e.g. SaaS dashboard with sidebar, stats cards, and charts…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              onFocus={() => setShowExamples(false)}
            />
            <AnimatePresence>
              {showExamples && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className="flex flex-col gap-1 mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Popular</span>
                    {EXAMPLE_PROMPTS.map((ex) => (
                      <button key={ex.title} className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-left transition-all hover:bg-[var(--surface2)]" style={{ color: 'var(--text-2)' }} onClick={() => setPrompt(ex.prompt)}>
                        <span className="font-medium text-xs">{ex.title}</span>
                        <ChevronRight size={11} />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Device */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-2)' }}>Device</label>
            <div className="grid grid-cols-3 gap-2">
              {DEVICES.map((d) => {
                const Icon = d.icon;
                const isActive = device === d.id;
                return (
                  <button key={d.id} className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs border transition-all" style={isActive ? { background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.2), rgba(255, 107, 157, 0.1))', borderColor: 'var(--accent)', color: 'var(--text)' } : { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text-2)' }} onClick={() => setDevice(d.id)}>
                    <Icon size={16} />
                    <span className="font-semibold">{d.label}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{d.label === 'Web' ? '1440' : d.label === 'Tablet' ? '768' : '375'}×{d.label === 'Web' ? '900' : d.label === 'Tablet' ? '1024' : '812'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-2)' }}>Design style</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button key={s.id} className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs border transition-all relative" style={style === s.id ? { background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.2), rgba(255, 107, 157, 0.1))', borderColor: 'var(--accent)', color: 'var(--text)' } : { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text-2)' }} onClick={() => setStyle(s.id)}>
                  <div className="flex gap-0.5 shrink-0">
                    {s.colors.map((c, i) => (<div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />))}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="font-semibold block leading-tight text-[11px] truncate">{s.label}</span>
                  </div>
                  {style === s.id && (
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}>
                      <Check size={9} color="white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--danger)' }}>
              <X size={13} />
              <span>{error}</span>
            </div>
          )}

          {/* Generate */}
          <button className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-pink))', color: 'white', boxShadow: '0 4px 14px rgba(124,92,255,0.35)' }} onClick={generate} disabled={!prompt.trim() || generating}>
            {generating ? <><Loader2 size={16} className="animate-spin" /><span className="text-xs">{stage || 'Generating…'}</span></> : <><Wand2 size={16} /><span>Generate design</span></>}
          </button>

          <p className="text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>Powered by OpenClaw AI · ~10–20s</p>
        </div>

        {/* Chat Panel */}
        <AnimatePresence>
          {chatMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3 min-w-0 w-full"
            >
              {/* Chat header */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-3 min-h-0 overflow-hidden" style={{ maxHeight: '520px' }}>
                <div className="flex items-center gap-2 shrink-0">
                  <Bot size={14} className="text-[var(--accent)]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>AI Design Chat</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(124,92,255,0.15)', color: 'var(--accent)', fontWeight: 600 }}>MiniMax-M2.7 · Free</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[200px] max-h-[340px] pr-1">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-6">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center">
                        <Sparkle size={18} className="text-[var(--accent)]" />
                      </div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Chat to design your UI</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>Tell me what you want — I'll generate it and refine based on your feedback</p>
                    </div>
                  )}
                  {messages.map((msg) => {
                    if (msg.isDesign) {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold border"
                          style={{ background: 'rgba(124,92,255,0.1)', borderColor: 'rgba(124,92,255,0.25)', color: 'var(--accent)' }}
                        >
                          <Sparkle size={12} />
                          {msg.content}
                        </motion.div>
                      );
                    }
                    const isUser = msg.role === 'user';
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: isUser ? 'var(--accent)' : 'var(--surface2)', border: '1px solid var(--border)' }}>
                          {isUser ? <User size={11} className="text-white" /> : <Bot size={11} className="text-[var(--accent)]" />}
                        </div>
                        <div
                          className="flex-1 px-3 py-2 rounded-2xl text-[12px] leading-[1.5]" style={{ background: isUser ? 'var(--accent)' : 'var(--surface2)', color: isUser ? 'white' : 'var(--text)', maxWidth: '85%', wordBreak: 'break-word' }}
                        >
                          {msg.content}
                        </div>
                      </motion.div>
                    );
                  })}
                  {chatThinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-2"
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                        <Bot size={11} className="text-[var(--accent)]" />
                      </div>
                      <div className="flex-1 px-3 py-2 rounded-2xl text-[12px]" style={{ background: 'var(--surface2)', color: 'var(--text-2)' }}>
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '300ms' }} />
                        </span>
                      </div>
                    </motion.div>
                  )}
                  {chatError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px]" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)' }}>
                      <X size={12} />
                      {chatError}
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <textarea
                    className="flex-1 border rounded-xl px-3 py-2 text-xs resize-none focus:outline-none transition-all min-h-[40px] max-h-[80px]"
                    style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    placeholder="Describe or tweak your design…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
                    }}
                    rows={1}
                  />
                  <button
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                    style={{ background: chatInput.trim() && !chatThinking ? 'linear-gradient(135deg, var(--accent), var(--accent-pink))' : 'var(--surface2)', color: chatInput.trim() && !chatThinking ? 'white' : 'var(--text-muted)', boxShadow: chatInput.trim() && !chatThinking ? '0 2px 10px rgba(124,92,255,0.35)' : 'none' }}
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || chatThinking}
                  >
                    {chatThinking ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Panel — Preview */}
        <div className="w-full rounded-2xl border overflow-hidden flex flex-col relative min-h-[400px] lg:min-h-[560px]" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {/* Generating */}
          <AnimatePresence>
            {generating && (
              <motion.div className="flex flex-col items-center justify-center gap-5 flex-1 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/20 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/10 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }} />
                  <Wand2 size={24} className="relative z-10 text-[var(--accent)]" />
                </div>
                <div className="text-xs font-medium text-center px-4">{stage}</div>
                <div className="flex gap-1.5 [&>span]:w-1.5 [&>span]:h-1.5 [&>span]:rounded-full [&>span]:bg-[var(--accent)] [&>span]:animate-pulse">
                  <span style={{ animationDelay: '0ms' }} /><span style={{ animationDelay: '200ms' }} /><span style={{ animationDelay: '400ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!generating && !result && (
            <div className="flex flex-col items-center justify-center gap-4 flex-1 py-12 px-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center">
                <Monitor size={24} strokeWidth={1.2} className="text-[var(--text-muted)]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text)] mb-1">Preview will appear here</p>
                <p className="text-xs" style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>
                  Fill in the form and tap <span className="font-semibold" style={{ color: 'var(--accent)' }}>Generate design</span>
                </p>
              </div>
              <div className="w-7 h-7 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
                <ArrowRight size={12} className="text-[var(--accent)]" />
              </div>
            </div>
          )}

          {/* Result */}
          {!generating && result && (
            <motion.div className="flex flex-col flex-1 overflow-hidden" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
              {/* Result bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <p className="text-sm font-bold text-[var(--text)] truncate max-w-[200px]">{result.screen_name || result.name || 'Generated Screen'}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: 'rgba(124,92,255,0.2)', color: 'var(--accent)' }}>{selectedStyle.label}</span>
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>{result.elements?.length || 0} elements</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all shrink-0" style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} onClick={reset}>
                    <RefreshCw size={12} /> New
                  </button>
                  <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-pink))', color: 'white' }} onClick={openInEditor}>
                    Open in editor <ArrowRight size={12} />
                  </button>
                  <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all shrink-0 cursor-pointer" style={{ background: 'rgba(0,212,255,0.08)', borderColor: 'rgba(0,212,255,0.25)', color: '#00d4ff' }} onClick={openFullscreenPreview}>
                    <Maximize size={11} /> Preview
                  </button>
                  <button
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all shrink-0 cursor-pointer disabled:opacity-40"
                    style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981' }}
                    onClick={generateDesignImage}
                    disabled={imageLoading}
                  >
                    {imageLoading
                      ? <><Loader2 size={11} className="animate-spin" /> Generating…</>
                      : <><Image size={11} /> AI Image</>
                    }
                  </button>
                </div>
              </div>
              {/* Canvas — responsive scale */}
              <div className="flex-1 overflow-auto p-3 lg:p-6 flex flex-col items-center">
                <ResponsiveCanvas result={currentDesign || result} activeDevice={device} selectedStyle={selectedStyle} setDevice={setDevice} />
              </div>

              {/* AI Image Generation — photorealistic render */}
              <div className="shrink-0 border-t" style={{ borderColor: 'var(--border)' }}>
                {/* Image section header */}
                <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Image size={13} className="text-[var(--accent)]" />
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--text)' }}>AI Image Preview</span>
                    {generatedImage && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                        {generatedImage.model} · {generatedImage.size}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { setGeneratedImage(null); setImageError(''); }}
                    className="text-[10px] px-2 py-1 rounded-lg cursor-pointer transition-colors"
                    style={{ color: 'var(--text-muted)', background: 'transparent' }}
                  >
                    ✕ Clear
                  </button>
                </div>

                {/* Image content area */}
                <div className="p-4">
                  {/* Loading state */}
                  {imageLoading && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
                      <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        Generating photorealistic image…
                      </p>
                      <p className="text-[11px] text-center max-w-sm" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                        Using MiniMax Image-01 — this may take up to 20 seconds
                      </p>
                    </div>
                  )}

                  {/* Error state */}
                  {!imageLoading && imageError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl text-[12px]" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}>
                      <X size={13} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Image generation failed: </span>
                        <span>{imageError}</span>
                      </div>
                    </div>
                  )}

                  {/* Generated image */}
                  {!imageLoading && generatedImage && (
                    <div className="space-y-3">
                      {/* Prompt used */}
                      <p className="text-[11px] italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        "{generatedImage.prompt}"
                      </p>

                      {/* Image display */}
                      <div
                        className="relative rounded-2xl overflow-hidden cursor-pointer group"
                        style={{ border: '1px solid var(--border)', maxHeight: '320px' }}
                        onClick={() => setImageLightbox(generatedImage.url)}
                      >
                        <img
                          src={generatedImage.url}
                          alt="AI generated design"
                          className="w-full object-contain"
                          style={{ maxHeight: '320px', background: '#0d0d14', display: 'block' }}
                          onError={() => setImageError('Failed to load generated image')}
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                            <Eye size={13} /> Click to enlarge
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <a
                          href={generatedImage.url}
                          download={`ai-design-${Date.now()}.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold cursor-pointer transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #7C3AED, #9D7AFF)', color: '#fff' }}
                        >
                          <Download size={12} /> Download
                        </a>
                        <button
                          onClick={generateDesignImage}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all hover:opacity-90"
                          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        >
                          <Loader2 size={11} className="animate-spin" style={{ display: 'none' }} />
                          ↻ Regenerate
                        </button>
                        <button
                          onClick={() => setImageLightbox(generatedImage.url)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all hover:opacity-90"
                          style={{ background: 'rgba(0,212,255,0.06)', borderColor: 'rgba(0,212,255,0.2)', color: '#00d4ff' }}
                        >
                          <Eye size={12} /> Enlarge
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Empty state — prompt to generate */}
                  {!imageLoading && !generatedImage && !imageError && (
                    <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,92,255,0.12)' }}>
                        <Image size={20} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Generate AI Design Image</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          Create a photorealistic rendering of your design using MiniMax Image-01
                        </p>
                      </div>
                      <button
                        onClick={generateDesignImage}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-semibold cursor-pointer transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #059669, #10B981)', color: '#fff' }}
                      >
                        <Image size={13} /> Generate Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lightbox */}
              {imageLightbox && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-6"
                  style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
                  onClick={() => setImageLightbox(null)}
                >
                  <div className="relative max-w-4xl w-full">
                    <button
                      className="absolute -top-10 right-0 flex items-center gap-1.5 text-[12px] cursor-pointer"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                      onClick={() => setImageLightbox(null)}
                    >
                      ✕ Close
                    </button>
                    <img
                      src={imageLightbox}
                      alt="AI generated design — full size"
                      className="w-full rounded-2xl"
                      style={{ border: '2px solid rgba(255,255,255,0.1)' }}
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="flex items-center justify-center gap-3 mt-3">
                      <a
                        href={imageLightbox}
                        download={`ai-design-${Date.now()}.jpg`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-semibold cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #9D7AFF)', color: '#fff' }}
                      >
                        <Download size={13} /> Download HD
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function MultiDeviceCanvas({ result, activeDevice }) {
  const active = DEVICES.find((d) => d.id === activeDevice) || DEVICES[0];
  const sz = { displayW: 640, displayH: 400, canvasW: active.width, canvasH: active.height };
  const Icon = active.icon;
  const scale = sz.displayW / sz.canvasW;

  const elements = result.elements || result.screen?.elements || [];
  const screen = result.screen || result;
  const bg = result.background || screen.background || '#f8f9ff';

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border overflow-hidden active">
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border-b border-[var(--border)]">
          <div className="flex gap-1.5 [&_span]:w-2 [&_span]:h-2 [&_span]:rounded-full [&_span]:bg-[var(--surface3)]">
            <span /><span /><span />
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
            <Icon size={11} />
            <span>{active.label} · {active.width}×{active.height}</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 ml-auto" />
        </div>
        <div className="bg-[var(--surface2)] p-4 overflow-auto">
          <div className="relative shadow-xl">
            <div
              className="relative overflow-hidden"
              style={{
                width: sz.canvasW,
                height: sz.canvasH,
                background: bg,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {elements.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-[var(--text-muted)]">
                  <Sparkles size={16} />
                  <span>Open in editor</span>
                </div>
              ) : elements.map((el, i) => (
                <RenderElement key={el.id || i} el={el} scale={scale} palette={result.colorPalette || {}} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function ResponsiveCanvas({ result, activeDevice, selectedStyle, setDevice }) {
  const active = DEVICES.find((d) => d.id === activeDevice) || DEVICES[0];
  const bg = result.background || '#f8f9ff';
  const canvasW = active.width;
  const canvasH = active.height;

  // Regenerate elements from sections when device changes so they fit the new width
  const elements = useMemo(() => {
    const src = result.elements && result.elements.length > 0
      ? result.elements
      : (result.parsed?.sections ? sectionsToElements(result.parsed.sections, result.parsed?.colorPalette || {}, canvasW, canvasH) : []);
    return src;
  }, [result, canvasW, canvasH]);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Device tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl shrink-0" style={{ background: 'var(--surface2)' }}>
        {DEVICES.map((d) => {
          const Icon = d.icon;
          const isActive = d.id === activeDevice;
          return (
            <button
              key={d.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={isActive ? { background: 'var(--accent)', color: 'white' } : { color: 'var(--text-2)' }}
              onClick={() => setDevice(d.id)}
            >
              <Icon size={12} />
              <span>{d.label}</span>
              <span style={{ opacity: 0.6, fontSize: '9px' }}>{d.width}×{d.height}</span>
            </button>
          );
        })}
      </div>

      {/* Browser frame — device-width constrained */}
      <div
        className="w-full overflow-hidden rounded-xl border shrink-0"
        style={{
          borderColor: 'var(--border)',
          maxWidth: active.id === 'web' ? '100%' : `${canvasW}px`,
        }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full block" style={{ background: '#ff5f57' }} />
            <span className="w-2.5 h-2.5 rounded-full block" style={{ background: '#febc2e' }} />
            <span className="w-2.5 h-2.5 rounded-full block" style={{ background: '#28c840' }} />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-1 rounded-lg text-[10px] font-medium max-w-[260px] w-full truncate" style={{ background: 'var(--surface2)', color: 'var(--text-2)' }}>
              {active.label} · {canvasW}×{canvasH} · {selectedStyle?.label || ''} design
            </div>
          </div>
          <div className="w-2.5 h-2.5 shrink-0" />
        </div>
        {/* Canvas — fixed aspect ratio, centered */}
        <div
          className="relative overflow-hidden bg-white mx-auto"
          style={{ paddingBottom: `${(canvasH / canvasW) * 100}%`, maxHeight: 'calc(100vh - 300px)' }}
        >
          <CanvasScaler elements={elements} canvasW={canvasW} canvasH={canvasH} palette={result.colorPalette || {}} />
        </div>
      </div>
    </div>
  );
}

function CanvasScaler({ elements, canvasW, canvasH, palette }) {
  let ro;

  function measure(el) {
    if (!el) return;
    // Get the parent container width — it's constrained by max-width to device width
    const parent = el.parentElement;
    if (!parent) return;
    const w = parent.offsetWidth;
    if (w === 0) return;
    const s = w / canvasW;
    el.style.transform = `scale(${s})`;
    el.style.transformOrigin = 'top left';
    el.style.width = `${canvasW}px`;
    el.style.height = `${canvasH}px`;
  }

  function attach(el) {
    if (!el) {
      if (ro) { ro.disconnect(); ro = undefined; }
      return;
    }
    measure(el);
    if (ro) ro.disconnect();
    ro = new ResizeObserver(() => measure(el));
    ro.observe(el.parentElement);
  }

  return (
    <div
      ref={attach}
      className="absolute inset-0"
      style={{ background: '#f8f9ff' }}
    >
      {elements.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Sparkles size={20} />
          <span className="text-xs">Open in editor to view full design</span>
        </div>
      ) : (
        elements.map((el, i) => (
          <RenderElement key={el.id || i} el={el} scale={1} palette={palette} />
        ))
      )}
    </div>
  );
}


/* ─── Beautiful Element Renderer ────────────────────────────────────────── */
function RenderElement({ el, scale, palette }) {
  const p = el.props || {};
  const x = el.x * scale;
  const y = el.y * scale;
  const w = Math.max(1, el.width  * scale);
  const h = Math.max(1, el.height * scale);
  const r = (v) => Math.max(0, v * scale);

  // Helper styles shared across types
  const baseStyle = {
    position: 'absolute',
    left: x, top: y, width: w, height: h,
    borderRadius: r(p.borderRadius || 0),
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: p.align === 'center' ? 'center' : p.align === 'right' ? 'flex-end' : 'flex-start',
  };

  // ── topbar ─────────────────────────────────────────────────────────────────
  if (el.type === 'topbar') {
    return (
      <div style={{
        ...baseStyle,
        background: p.background || p.backgroundColor || '#15151f',
        boxShadow: p.shadow || 'none',
        padding: `0 ${w * 0.03}px`,
        zIndex: 10,
      }} />
    );
  }

  // ── logoBadge ──────────────────────────────────────────────────────────────
  if (el.type === 'logoBadge') {
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || '#7c5cff',
        borderRadius: r(p.borderRadius || 10),
        color: p.textColor || '#fff',
        fontSize: Math.max(9, (p.fontSize || 14) * scale),
        fontWeight: p.fontWeight || '900',
        fontFamily: 'system-ui, sans-serif',
        letterSpacing: '-0.5px',
        boxShadow: p.shadow || 'none',
        justifyContent: 'center',
      }}>
        {el.text}
      </div>
    );
  }

  // ── searchBar ──────────────────────────────────────────────────────────────
  if (el.type === 'searchBar') {
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || '#1c1c28',
        border: `${scale < 1 ? '1px' : '1.5px'} solid ${palette?.border || '#2a2a3a'}`,
        borderRadius: r(p.borderRadius || 10),
        padding: `0 ${w * 0.04}px`,
        gap: w * 0.02,
      }}>
        <svg width={Math.max(10, 14 * scale)} height={Math.max(10, 14 * scale)} viewBox="0 0 24 24" fill="none" stroke="#6b6b7b" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span style={{ fontSize: Math.max(8, 12 * scale), color: '#6b6b7b', fontFamily: 'system-ui, sans-serif', flex: 1 }}>
          Search…
        </span>
      </div>
    );
  }

  // ── iconBtn ─────────────────────────────────────────────────────────────────
  if (el.type === 'iconBtn') {
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || 'transparent',
        borderRadius: r(p.borderRadius || 8),
        fontSize: Math.max(10, 14 * scale),
        cursor: 'default',
      }}>
        {el.text}
      </div>
    );
  }

  // ── badge ──────────────────────────────────────────────────────────────────
  if (el.type === 'badge') {
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || '#ef4444',
        borderRadius: p.borderRadius === '50%' ? '50%' : r(p.borderRadius || 4),
        minWidth: w, minHeight: h,
      }} />
    );
  }

  // ── avatar ─────────────────────────────────────────────────────────────────
  if (el.type === 'avatar') {
    return (
      <div style={{
        ...baseStyle,
        background: `linear-gradient(135deg, ${p.backgroundColor || '#7c5cff'}, ${p.backgroundColor || '#7c5cff'}bb)`,
        borderRadius: p.borderRadius || (w === h ? '50%' : r(10)),
        color: p.textColor || '#fff',
        fontSize: Math.max(7, (p.fontSize || 13) * scale),
        fontWeight: p.fontWeight || '700',
        fontFamily: 'system-ui, sans-serif',
        boxShadow: p.shadow || 'none',
        justifyContent: 'center',
        flexDirection: 'column',
        lineHeight: 1,
      }}>
        {p.initials || el.text}
      </div>
    );
  }

  // ── sidebar ─────────────────────────────────────────────────────────────────
  if (el.type === 'sidebar') {
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || '#15151f',
        borderRight: p.borderRight || '1px solid #2a2a3a',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: `${h * 0.01}px 0`,
      }} />
    );
  }

  // ── navItem ─────────────────────────────────────────────────────────────────
  if (el.type === 'navItem') {
    const isActive = p.isActive;
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || 'transparent',
        border: p.border || '1.5px solid transparent',
        borderRadius: r(p.borderRadius || 10),
        color: p.textColor || '#8b8b9b',
        fontSize: Math.max(8, (p.fontSize || 13) * scale),
        fontWeight: p.fontWeight || '500',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: `0 ${w * 0.05}px`,
        justifyContent: 'flex-start',
        gap: w * 0.03,
        transition: 'all 0.15s',
      }}>
        {el.text}
      </div>
    );
  }

  // ── statCard ───────────────────────────────────────────────────────────────
  if (el.type === 'statCard') {
    const labelSize = Math.max(8, 11 * scale);
    const numSize   = Math.max(14, 32 * scale);
    const subSize   = Math.max(8, 13 * scale);
    const gradient  = p.gradient || p.backgroundColor || '#7c5cff';
    const shadow    = p.shadow || `0 6px 20px ${p.backgroundColor || '#7c5cff'}44`;

    // Parse main label and sub value
    const lines = (el.text || '').split(' ');
    const label = lines.length > 1 ? lines.slice(0, -1).join(' ') : '';
    const value = lines.length > 1 ? lines[lines.length - 1] : (el.sub || el.text || '');
    const sub   = typeof el.sub === 'string' ? el.sub : value;

    return (
      <div style={{
        ...baseStyle,
        background: gradient,
        borderRadius: r(p.borderRadius || 18),
        boxShadow: shadow,
        padding: `${h * 0.08}px ${w * 0.08}px`,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: h * 0.04,
      }}>
        {/* Label */}
        <span style={{
          fontSize: labelSize,
          fontWeight: '600',
          color: 'rgba(255,255,255,0.8)',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1.2,
          maxWidth: w * 0.75,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>

        {/* Big number */}
        <span style={{
          fontSize: numSize,
          fontWeight: '900',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1,
          letterSpacing: '-1px',
        }}>
          {typeof el.sub === 'string' ? el.sub.replace(/[^0-9.]/g, '') : el.sub || '0'}
        </span>

        {/* Sub label or change indicator */}
        <span style={{
          fontSize: subSize,
          fontWeight: '500',
          color: 'rgba(255,255,255,0.65)',
          fontFamily: 'system-ui, sans-serif',
        }}>
          {typeof el.sub === 'string' && el.sub.match(/[+-]/) ? el.sub : '↑ 12%'}
        </span>

        {/* Decorative circle */}
        <div style={{
          position: 'absolute',
          right: -w * 0.08,
          bottom: -h * 0.08,
          width: w * 0.5,
          height: w * 0.5,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
      </div>
    );
  }

  // ── sectionCard ─────────────────────────────────────────────────────────────
  if (el.type === 'sectionCard') {
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || '#1c1c28',
        borderRadius: r(p.borderRadius || 16),
        border: `${scale < 1 ? '0.75px' : '1px'} solid ${palette?.border || '#2a2a3a'}`,
        boxShadow: p.shadow || '0 4px 16px rgba(0,0,0,0.2)',
        padding: p.padding || `${h * 0.04}px`,
        flexDirection: 'column',
        alignItems: 'stretch',
      }} />
    );
  }

  // ── accentLine ──────────────────────────────────────────────────────────────
  if (el.type === 'accentLine') {
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || '#7c5cff',
        borderRadius: r(p.borderRadius || 3),
        height: Math.max(2, 3 * scale),
        top: y,
      }} />
    );
  }

  // ── text ────────────────────────────────────────────────────────────────────
  if (el.type === 'text') {
    const fSize = Math.max(8, (p.fontSize || 12) * scale);
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || 'transparent',
        fontSize: fSize,
        fontWeight: p.fontWeight || '600',
        color: p.color || palette?.textPrimary || '#f4f4f8',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: 1.3,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: `0 ${w * 0.02}px`,
      }}>
        {el.text}
      </div>
    );
  }

  // ── listRow ─────────────────────────────────────────────────────────────────
  if (el.type === 'listRow') {
    const fSize = Math.max(7, (p.fontSize || 12) * scale);
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || '#15151f',
        borderRadius: r(p.borderRadius || 8),
        padding: p.padding || `${h * 0.1}px ${w * 0.04}px`,
        fontSize: fSize,
        color: p.color || palette?.textSecondary || '#9ca3af',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        gap: w * 0.01,
      }}>
        <span style={{ color: (palette?.primary || '#7c5cff'), marginRight: w * 0.01, flexShrink: 0 }}>
          ▸
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {typeof el.text === 'string' ? el.text.replace(/^▸\s*/, '') : el.text}
        </span>
      </div>
    );
  }

  // ── tab ─────────────────────────────────────────────────────────────────────
  if (el.type === 'tab') {
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || 'transparent',
        borderTop: p.borderTop || '2px solid transparent',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: h * 0.05,
        fontSize: Math.max(10, 16 * scale),
        color: p.textColor || '#6b6b7b',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <span style={{ fontSize: Math.max(12, 18 * scale), lineHeight: 1 }}>{el.text}</span>
      </div>
    );
  }

  // ── sidebarLogo ─────────────────────────────────────────────────────────────
  if (el.type === 'sidebarLogo') {
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || '#7c5cff',
        borderRadius: r(p.borderRadius || 14),
        color: p.textColor || '#fff',
        fontSize: Math.max(12, (p.fontSize || 18) * scale),
        fontWeight: p.fontWeight || '900',
        fontFamily: 'system-ui, sans-serif',
        boxShadow: p.shadow || 'none',
        justifyContent: 'center',
      }}>
        {el.text}
      </div>
    );
  }

  // ── sidebarItem ─────────────────────────────────────────────────────────────
  if (el.type === 'sidebarItem') {
    return (
      <div style={{
        ...baseStyle,
        background: p.backgroundColor || 'transparent',
        border: p.border || '1.5px solid transparent',
        borderRadius: r(p.borderRadius || 14),
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        fontSize: Math.max(8, (p.fontSize || 11) * scale),
        color: p.textColor || '#6b6b7b',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <span style={{ fontSize: Math.max(12, 18 * scale), lineHeight: 1 }}>{el.text}</span>
      </div>
    );
  }

  // ── Fallback ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      ...baseStyle,
      background: p.backgroundColor || 'transparent',
    }}>
      {el.text && (
        <span style={{
          fontSize: Math.max(6, (p.fontSize || 11) * scale),
          color: p.color || palette?.textSecondary || '#9ca3af',
          fontFamily: 'system-ui, sans-serif',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {el.text}
        </span>
      )}
    </div>
  );
}
