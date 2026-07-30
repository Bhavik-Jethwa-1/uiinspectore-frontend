import { useState, useEffect, useCallback, useRef } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, ZoomIn, ZoomOut, Maximize2, Play, Monitor,
  Smartphone, Tablet, Eye, Undo2, Redo2, Plus, Settings as SettingsIcon,
  Share2, Download, Layers, LayoutGrid, SlidersHorizontal, PanelBottom,
  Edit2,
} from 'lucide-react';
import api from '../utils/api';
import { makeElement, DEVICE_PRESETS, newId } from '../utils/elementLibrary';
import ComponentsPanel from '../components/editor/ComponentsPanel';
import Canvas from '../components/editor/Canvas';
import PropertiesPanel from '../components/editor/PropertiesPanel';
import LayersPanel from '../components/editor/LayersPanel';
import ScreensSidebar from '../components/editor/ScreensSidebar';

const DEFAULT_ELEMENTS = {
  web: {
    name: 'Home',
    width: 1440,
    height: 900,
    elements: [
      {
        id: newId(), type: 'header', x: 0, y: 0, width: 1440, height: 72,
        props: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1 },
        text: '', visible: true, locked: false, name: 'Header'
      },
      {
        id: newId(), type: 'navigation', x: 80, y: 24, width: 600, height: 24,
        props: { backgroundColor: 'transparent', items: ['Product', 'Features', 'Pricing', 'About'] },
        text: '', visible: true, locked: false, name: 'Nav'
      },
      {
        id: newId(), type: 'button', x: 1240, y: 18, width: 120, height: 40,
        props: { backgroundColor: '#7c5cff', color: '#ffffff', borderRadius: 10, fontSize: 14, fontWeight: 600, align: 'center' },
        text: 'Get started', visible: true, locked: false, name: 'CTA'
      },
      {
        id: newId(), type: 'heading', x: 120, y: 180, width: 600, height: 60,
        props: { color: '#0f172a', fontSize: 56, fontWeight: 800, align: 'left' },
        text: 'Design at the\nspeed of thought.', visible: true, locked: false, name: 'Hero Title'
      },
      {
        id: newId(), type: 'paragraph', x: 120, y: 260, width: 540, height: 80,
        props: { color: '#475569', fontSize: 18, fontWeight: 400, lineHeight: 1.6, align: 'left' },
        text: 'Generate beautiful UI mockups from text, convert screenshots to editable designs, and prototype entire flows.', visible: true, locked: false, name: 'Hero Text'
      },
      {
        id: newId(), type: 'button', x: 120, y: 360, width: 160, height: 48,
        props: { backgroundColor: '#7c5cff', color: '#ffffff', borderRadius: 12, fontSize: 15, fontWeight: 700, align: 'center' },
        text: 'Start free', visible: true, locked: false, name: 'Primary CTA'
      },
      {
        id: newId(), type: 'button', x: 296, y: 360, width: 160, height: 48,
        props: { backgroundColor: '#ffffff', color: '#0f172a', borderRadius: 12, fontSize: 15, fontWeight: 700, borderColor: '#e2e8f0', borderWidth: 1, align: 'center' },
        text: 'Watch demo', visible: true, locked: false, name: 'Secondary CTA'
      },
      {
        id: newId(), type: 'card', x: 120, y: 500, width: 380, height: 280,
        props: { backgroundColor: '#ffffff', borderRadius: 16, borderColor: '#e2e8f0', borderWidth: 1 },
        text: '', visible: true, locked: false, name: 'Feature 1'
      },
      {
        id: newId(), type: 'card', x: 530, y: 500, width: 380, height: 280,
        props: { backgroundColor: '#ffffff', borderRadius: 16, borderColor: '#e2e8f0', borderWidth: 1 },
        text: '', visible: true, locked: false, name: 'Feature 2'
      },
      {
        id: newId(), type: 'card', x: 940, y: 500, width: 380, height: 280,
        props: { backgroundColor: '#ffffff', borderRadius: 16, borderColor: '#e2e8f0', borderWidth: 1 },
        text: '', visible: true, locked: false, name: 'Feature 3'
      },
    ],
  },
};

// Preview generator — renders elements as standalone HTML in a new tab
function generatePreviewHTML(elements = [], width = 1440, height = 900) {
  const renderElement = (el) => {
    if (!el || el.visible === false) return '';
    const p = el.props || {};
    const style = [
      `position:absolute`,
      `left:${el.x}px`,
      `top:${el.y}px`,
      `width:${el.width}px`,
      `height:${el.height}px`,
      `background:${p.backgroundColor || 'transparent'}`,
      p.color ? `color:${p.color}` : '',
      p.borderRadius != null ? `border-radius:${p.borderRadius}px` : '',
      p.borderWidth ? `border:${p.borderWidth}px solid ${p.borderColor || '#e5e7eb'}` : '',
      p.padding ? `padding:${p.padding}px` : '',
      p.shadow || '',
      el.opacity != null ? `opacity:${el.opacity}` : '',
      'pointer-events:none',
      'box-sizing:border-box',
      'overflow:hidden',
    ].filter(Boolean).join(';');

    const text = el.text || p.text || '';
    const fontSize = p.fontSize ? `font-size:${p.fontSize}px` : '';
    const fontWeight = p.fontWeight ? `font-weight:${p.fontWeight}` : '';
    const textAlign = p.align ? `text-align:${p.align}` : '';
    const lineHeight = p.lineHeight ? `line-height:${p.lineHeight}` : '';
    const displayFlex = 'display:flex;align-items:center';

    switch (el.type) {
      case 'button':
        return `<div style="${style};${displayFlex};justify-content:center;gap:8px">
          ${p.icon ? `<span style="font-size:${fontSize};${fontWeight}">▶</span>` : ''}
          <span style="${fontSize};${fontWeight};color:${p.color || '#fff'}">${text || 'Button'}</span>
        </div>`;
      case 'heading':
        return `<div style="${style};${displayFlex};${fontSize};${fontWeight};${textAlign};${p.color ? `color:${p.color}` : ''}">${text || p.text || 'Heading'}</div>`;
      case 'text':
        return `<div style="${style};${displayFlex};${fontSize};${fontWeight};${p.color ? `color:${p.color}` : ''}">${text}</div>`;
      case 'paragraph':
        return `<div style="${style};${displayFlex};${fontSize};color:${p.color || '#6b7280'};line-height:1.6">${text}</div>`;
      case 'badge':
      case 'chip':
        return `<div style="${style};${displayFlex};justify-content:center;${fontSize};${fontWeight};background:${p.backgroundColor || '#6366f1'};color:${p.color || '#fff'};border-radius:9999px">${text || 'Badge'}</div>`;
      case 'alert':
        return `<div style="${style};${displayFlex};${fontSize};${fontWeight};padding:12px 16px;background:${p.backgroundColor || '#fef3c7'};color:${p.color || '#92400e'};border-radius:8px;border-left:4px solid ${p.borderColor || '#f59e0b'}">${text || p.text || 'Alert message'}</div>`;
      case 'input':
      case 'search':
        return `<div style="${style};display:flex;align-items:center;gap:8px;padding:0 12px;background:${p.backgroundColor || '#fff'};border:1px solid ${p.borderColor || '#e5e7eb'};border-radius:${p.borderRadius || 8}px;box-shadow:${p.shadow || 'none'}">
          ${el.type === 'search' ? '<span style="opacity:0.4">🔍</span>' : ''}
          <span style="flex:1;${fontSize};color:${p.placeholderColor || '#9ca3af'};pointer-events:none">${p.placeholder || 'Enter text…'}</span>
        </div>`;
      case 'textarea':
        return `<div style="${style};padding:10px 12px;background:${p.backgroundColor || '#fff'};border:1px solid ${p.borderColor || '#e5e7eb'};border-radius:${p.borderRadius || 8}px;${fontSize};color:${p.color || '#6b7280'}">${p.placeholder || 'Write something…'}</div>`;
      case 'select':
        return `<div style="${style};display:flex;align-items:center;justify-content:space-between;padding:0 12px;background:${p.backgroundColor || '#fff'};border:1px solid ${p.borderColor || '#e5e7eb'};border-radius:${p.borderRadius || 8}px">
          <span style="${fontSize};color:${p.color || '#374151'}">${p.text || 'Select option'}</span>
          <span style="opacity:0.4">▼</span>
        </div>`;
      case 'checkbox':
        return `<div style="${style};display:flex;align-items:center;gap:10px">
          <div style="width:18px;height:18px;border:2px solid ${p.borderColor || '#d1d5db'};border-radius:4px;background:${p.backgroundColor || '#fff'};flex-shrink:0"></div>
          <span style="${fontSize};color:${p.color || '#374151'}">${p.label || text || 'Checkbox'}</span>
        </div>`;
      case 'radio':
        return `<div style="${style};display:flex;align-items:center;gap:10px">
          <div style="width:18px;height:18px;border:2px solid ${p.borderColor || '#d1d5db'};border-radius:50%;background:${p.backgroundColor || '#fff'};flex-shrink:0"></div>
          <span style="${fontSize};color:${p.color || '#374151'}">${p.label || text || 'Radio'}</span>
        </div>`;
      case 'toggle':
        return `<div style="${style};display:flex;align-items:center;gap:10px">
          <div style="width:44px;height:24px;background:${p.value ? '#6366f1' : '#d1d5db'};border-radius:12px;position:relative">
            <div style="width:18px;height:18px;background:#fff;border-radius:50%;position:absolute;top:3px;${p.value ? 'right:3px' : 'left:3px'};box-shadow:0 1px 3px rgba(0,0,0,0.2)"></div>
          </div>
          <span style="${fontSize};color:${p.color || '#374151'}">${p.label || text || 'Toggle'}</span>
        </div>`;
      case 'slider':
        return `<div style="${style};display:flex;align-items:center;gap:10px;padding:0 8px">
          <div style="flex:1;height:4px;background:${p.trackColor || '#e5e7eb'};border-radius:2px;position:relative">
            <div style="width:${p.value ? Math.round((p.value / (p.max || 100)) * 100) : 50}%;height:100%;background:${p.backgroundColor || '#6366f1'};border-radius:2px"></div>
          </div>
        </div>`;
      case 'progress':
        return `<div style="${style};display:flex;align-items:center;gap:10px">
          <div style="flex:1;height:8px;background:${p.trackColor || '#e5e7eb'};border-radius:4px;overflow:hidden">
            <div style="width:${p.value ? Math.min(p.value, 100) : 60}%;height:100%;background:${p.backgroundColor || '#6366f1'};border-radius:4px"></div>
          </div>
          <span style="${fontSize || 'font-size:12px'};color:${p.color || '#6b7280'}">${p.value || 60}%</span>
        </div>`;
      case 'avatar': {
        const initials = (text || p.text || 'U').slice(0, 2).toUpperCase();
        return `<div style="${style};${displayFlex};justify-content:center;${fontSize || 'font-size:14px'};${fontWeight || 'font-weight:600'};background:${p.backgroundColor || '#6366f1'};color:${p.color || '#fff'};border-radius:50%">${initials}</div>`;
      }
      case 'icon':
        return `<div style="${style};${displayFlex};justify-content:center"><span style="font-size:${Math.min(el.width, el.height) * 0.5}px;opacity:${p.opacity || 0.7}">★</span></div>`;
      case 'image': {
        const imgSrc = p.src || `https://picsum.photos/${el.width}/${el.height}?random=${el.id || Math.random()}`;
        return `<img src="${imgSrc}" style="${style};object-fit:cover;border-radius:${p.borderRadius || 0}px" alt="image" />`;
      }
      case 'card':
        return `<div style="${style};background:${p.backgroundColor || '#fff'};border-radius:${p.borderRadius || 12}px;box-shadow:${p.shadow || '0 1px 3px rgba(0,0,0,0.1)'};border:1px solid ${p.borderColor || '#e5e7eb'}"></div>`;
      case 'divider':
        return `<div style="${style};background:${p.color || '#e5e7eb'};height:${p.thickness || 1}px"></div>`;
      case 'navbar':
        return `<div style="${style};background:${p.backgroundColor || '#1e293b'};display:flex;align-items:center;padding:0 24px;gap:32px">
          <span style="font-size:16px;font-weight:700;color:${p.color || '#fff'}">${p.brand || 'Brand'}</span>
          <div style="display:flex;gap:24px;flex:1">
            ${(p.items || ['Home', 'Features', 'Pricing', 'About']).map(item => `<span style="font-size:14px;color:${p.color || '#94a3b8'};cursor:pointer">${item}</span>`).join('')}
          </div>
        </div>`;
      case 'sidebar':
        return `<div style="${style};background:${p.backgroundColor || '#1e293b'};padding:16px;display:flex;flex-direction:column;gap:8px">
          ${(p.items || ['Dashboard', 'Analytics', 'Settings', 'Users']).map(item => `<div style="padding:10px 12px;border-radius:8px;font-size:14px;color:${p.color || '#cbd5e1'};cursor:pointer">${item}</div>`).join('')}
        </div>`;
      case 'footer':
        return `<div style="${style};background:${p.backgroundColor || '#0f172a'};padding:24px;display:flex;align-items:center;justify-content:center;gap:8px">
          <span style="font-size:14px;color:${p.color || '#94a3b8'}">${p.text || '© 2024 Company. All rights reserved.'}</span>
        </div>`;
      case 'header':
        return `<div style="${style};background:${p.backgroundColor || '#fff'};border-bottom:1px solid ${p.borderColor || '#e5e7eb'};display:flex;align-items:center;padding:0 24px;gap:16px"></div>`;
      case 'tabs':
        return `<div style="${style};background:${p.backgroundColor || '#fff'};border-bottom:1px solid #e5e7eb;display:flex;gap:4px;padding:0 16px;align-items:flex-end">
          ${(p.items || ['Tab 1', 'Tab 2', 'Tab 3']).map((item, i) => `<div style="padding:12px 16px;font-size:14px;font-weight:${i === 0 ? 600 : 400};color:${i === 0 ? '#6366f1' : '#6b7280'};border-bottom:${i === 0 ? '2px solid #6366f1' : '2px solid transparent'};cursor:pointer">${item}</div>`).join('')}
        </div>`;
      case 'table':
        return `<div style="${style};background:#fff;border-radius:${p.borderRadius || 8}px;overflow:hidden;border:1px solid #e5e7eb">
          <table style="width:100%;border-collapse:collapse">
            <thead><tr style="background:${p.headerBg || '#f9fafb'}">
              ${(p.columns || ['Name', 'Email', 'Role']).map(c => `<th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">${c}</th>`).join('')}
            </tr></thead>
            <tbody>
              ${(p.rows || [['John Doe', 'john@corp.com', 'Admin'], ['Jane Smith', 'jane@corp.com', 'Editor']]).map(row => `<tr style="border-bottom:1px solid #f3f4f6">
                ${row.map(cell => `<td style="padding:10px 16px;font-size:13px;color:#6b7280">${cell}</td>`).join('')}
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
      case 'list':
        return `<div style="${style};display:flex;flex-direction:column;gap:0">
          ${(p.items || ['List item one', 'List item two', 'List item three']).map(item => `<div style="padding:12px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;display:flex;align-items:center;gap:10px">
            <div style="width:6px;height:6px;background:#6366f1;border-radius:50%;flex-shrink:0"></div>${item}
          </div>`).join('')}
        </div>`;
      case 'breadcrumb':
        return `<div style="${style};display:flex;align-items:center;gap:8px;font-size:14px">
          ${(p.items || ['Home', 'Products', 'Shoes']).map((item, i) => `<span style="color:${i === (p.items || []).length - 1 ? '#374151' : '#9ca3af'}">${item}</span>${i < (p.items || []).length - 1 ? '<span style="color:#d1d5db">›</span>' : ''}`).join('')}
        </div>`;
      case 'pagination':
        return `<div style="${style};display:flex;align-items:center;gap:4px">
          <div style="padding:6px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;color:#6b7280;cursor:pointer">‹</div>
          ${(p.pages || [1, 2, 3, '...', 10]).map(page => `<div style="padding:6px 12px;border:1px solid ${page === 1 ? '#6366f1' : '#e5e7eb'};border-radius:6px;font-size:13px;background:${page === 1 ? '#6366f1' : '#fff'};color:${page === 1 ? '#fff' : '#6b7280'};cursor:pointer">${page}</div>`).join('')}
          <div style="padding:6px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;color:#6b7280;cursor:pointer">›</div>
        </div>`;
      case 'modal':
        return `<div style="${style};background:#fff;border-radius:16px;box-shadow:0 25px 50px rgba(0,0,0,0.25);display:flex;flex-direction:column;padding:24px;gap:16px">
          <div style="font-size:18px;font-weight:700;color:#111827">${p.title || 'Modal Title'}</div>
          <div style="font-size:14px;color:#6b7280;line-height:1.6">${p.description || 'Modal content goes here. Describe your action or message.'}</div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
            <div style="padding:8px 16px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;color:#374151;cursor:pointer">Cancel</div>
            <div style="padding:8px 16px;background:#6366f1;border-radius:8px;font-size:13px;color:#fff;cursor:pointer">Confirm</div>
          </div>
        </div>`;
      case 'chart':
        return `<div style="${style};background:${p.backgroundColor || '#fff'};border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:12px">
          <div style="font-size:14px;font-weight:600;color:#111827">${p.title || 'Chart'}</div>
          <div style="flex:1;display:flex;align-items:flex-end;gap:8px;padding-bottom:4px">
            ${(p.bars || [40, 70, 55, 90, 65, 80]).map((h, i) => `<div style="flex:1;height:${h}%;background:${['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9'][i % 6]};border-radius:4px 4px 0 0;min-width:8px"></div>`).join('')}
          </div>
          <div style="font-size:12px;color:#6b7280">${p.subtitle || ''}</div>
        </div>`;
      case 'spacer':
        return '';
      case 'container':
      case 'section':
      case 'row':
      case 'column':
        return `<div style="${style};background:${p.backgroundColor || 'transparent'};border-radius:${p.borderRadius || 0}px"></div>`;
      default:
        return `<div style="${style};${displayFlex};justify-content:center;${fontSize};${fontWeight};color:${p.color || '#9ca3af'}">${text || el.type}</div>`;
    }
  };

  const elsHTML = elements.map(renderElement).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.title || 'Preview'} — UI Inspectore</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow: auto; background: #f8fafc; }
    .preview-wrap { position: relative; width: ${width}px; min-height: ${height}px; margin: 32px auto; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; }
    .preview-wrap iframe { width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <div class="preview-wrap" style="width:${width}px;min-height:${height}px;background:#fff">
    ${elsHTML}
  </div>
</body>
</html>`;
}

function buildDefaultScreen(deviceId = 'web') {
  const tpl = DEFAULT_ELEMENTS.web;
  return {
    id: newId('screen'),
    name: 'Home',
    width: DEVICE_PRESETS[deviceId].width,
    height: DEVICE_PRESETS[deviceId].height,
    background: '#ffffff',
    elements: tpl.elements.map((e) => ({ ...e, id: newId() })),
  };
}

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [projectName, setProjectName] = useState('Untitled project');
  const [editingName, setEditingName] = useState(false);

  const [screens, setScreens] = useState([]);
  const [selectedScreenId, setSelectedScreenId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const { ask } = useConfirm();
  const [zoom, setZoom] = useState(0.6);
  const [device, setDevice] = useState('web');
  const location = useLocation();
  const [showLayers, setShowLayers] = useState(true);
  const [showProps, setShowProps] = useState(true);

  const [showComponents, setShowComponents] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const autosaveRef = useRef();

  // Load project
  useEffect(() => {
    const load = async () => {
      try {
        if (id === 'new') {
          // Create a fresh project
          const p = await api.createProject({
            name: 'Untitled project',
            description: '',
            device: 'web',
            screens: [],
          });
          // p is now unwrapped by api.js — { id, name, ... }
          if (!p?.id) {
            console.error('createProject returned no id:', p);
            alert('Failed to create project. Please try again.');
            navigate('/app/dashboard');
            return;
          }
          navigate(`/app/editor/${p.id}`, { replace: true });
          return;
        }
        // If navigated from Autodesigner with AI screen, use it directly
        if (location.state?.aiScreen) {
          const aiScreen = location.state.aiScreen;
          setScreens([aiScreen]);
          setSelectedScreenId(aiScreen.id);
          setLoading(false);
          return;
        }
        const p = await api.getProject(id);
        setProject(p);
        setProjectName(p.name || 'Untitled project');
        let list = (p.screens && p.screens.length) ? p.screens : [buildDefaultScreen(p.device || 'web')];
        // Ensure all screens and elements have IDs and proper dimensions
        const dev = p.device || 'web';
        list = list.map((s) => ({
          ...s,
          id: s.id || newId('screen'),
          width: s.width || DEVICE_PRESETS[dev].width,
          height: s.height || DEVICE_PRESETS[dev].height,
          elements: (s.elements || []).map((e) => ({ ...e, id: e.id || newId() })),
        }));
        setScreens(list);
        setSelectedScreenId(list[0]?.id);
        if (p.device) setDevice(p.device);
        // Force zoom fit after DOM has painted
        setTimeout(() => {
          const fit = () => {
            const container = document.querySelector('.canvas-area');
            const screen = list[0];
            if (!container || !screen) return;
            const rect = container.getBoundingClientRect();
            const pad = 80;
            const sx = (rect.width - pad) / screen.width;
            const sy = (rect.height - pad) / screen.height;
            setZoom(Math.min(2, Math.max(0.1, Math.min(sx, sy))));
          };
          requestAnimationFrame(() => requestAnimationFrame(fit));
        }, 150);
      } catch (err) {
        console.error('Failed to load project', err);
        alert('Failed to load project: ' + err.message);
        navigate('/app/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const currentScreen = screens.find((s) => s.id === selectedScreenId);
  const screenSize = currentScreen ? { width: currentScreen.width, height: currentScreen.height } : DEVICE_PRESETS[device];

  // Save
  const save = useCallback(async () => {
    if (!project) return;
    setSaving(true);
    try {
      await api.updateProject(project.id, {
        name: projectName,
        device,
        screens,
      });
      setDirty(false);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [project, projectName, device, screens]);

  // Auto-save every 30s
  useEffect(() => {
    autosaveRef.current = setInterval(() => {
      if (dirty) save();
    }, 30000);
    return () => clearInterval(autosaveRef.current);
  }, [dirty, save]);

  // Mark dirty on changes
  useEffect(() => {
    if (loading) return;
    setDirty(true);
  }, [screens, projectName, device, loading]);

  // Update element on canvas
  const updateElement = useCallback((elId, patch) => {
    setScreens((curr) =>
      curr.map((s) => {
        if (s.id !== selectedScreenId) return s;
        return {
          ...s,
          elements: s.elements.map((el) =>
            el.id === elId ? { ...el, ...patch, props: { ...el.props, ...(patch.props || {}) } } : el
          ),
        };
      })
    );
  }, [selectedScreenId]);

  const updateElementProps = useCallback((elId, propsPatch) => {
    setScreens((curr) =>
      curr.map((s) => {
        if (s.id !== selectedScreenId) return s;
        return {
          ...s,
          elements: s.elements.map((el) =>
            el.id === elId ? { ...el, props: { ...el.props, ...propsPatch } } : el
          ),
        };
      })
    );
  }, [selectedScreenId]);

  const deleteElement = useCallback((elId) => {
    setScreens((curr) =>
      curr.map((s) =>
        s.id !== selectedScreenId ? s : { ...s, elements: s.elements.filter((e) => e.id !== elId) }
      )
    );
    if (selectedId === elId) setSelectedId(null);
  }, [selectedScreenId, selectedId]);

  const reorderElement = useCallback((elId, newIdx) => {
    setScreens((curr) =>
      curr.map((s) => {
        if (s.id !== selectedScreenId) return s;
        const idx = s.elements.findIndex((e) => e.id === elId);
        if (idx === -1) return s;
        const next = [...s.elements];
        const [removed] = next.splice(idx, 1);
        next.splice(newIdx, 0, removed);
        return { ...s, elements: next };
      })
    );
  }, [selectedScreenId]);

  const duplicateElement = useCallback((elId) => {
    setScreens((curr) =>
      curr.map((s) => {
        if (s.id !== selectedScreenId) return s;
        const el = s.elements.find((e) => e.id === elId);
        if (!el) return s;
        const copy = { ...el, id: newId(), x: el.x + 20, y: el.y + 20, props: { ...el.props } };
        return { ...s, elements: [...s.elements, copy] };
      })
    );
  }, [selectedScreenId]);

  const addElement = useCallback((component, x, y) => {
    const el = makeElement(component, x, y);
    setScreens((curr) =>
      curr.map((s) =>
        s.id !== selectedScreenId ? s : { ...s, elements: [...s.elements, el] }
      )
    );
    setSelectedId(el.id);
  }, [selectedScreenId]);

  // Screens
  const addScreen = useCallback(() => {
    const screen = buildDefaultScreen(device);
    screen.name = `Screen ${screens.length + 1}`;
    screen.elements = [];
    setScreens((s) => [...s, screen]);
    setSelectedScreenId(screen.id);
  }, [screens.length, device]);

  const renameScreen = useCallback((sid, name) => {
    setScreens((curr) => curr.map((s) => s.id === sid ? { ...s, name } : s));
  }, []);

  const deleteScreen = useCallback(async (sid) => {
    if (screens.length === 1) {
      alert('You must have at least one screen.');
      return;
    }
    if (!await ask({ title: 'Delete screen?', message: 'This screen will be permanently removed.', confirmLabel: 'Delete', danger: true })) return;
    try {
      if (project) await api.deleteScreen(project.id, sid).catch(() => { });
    } catch { }
    setScreens((curr) => curr.filter((s) => s.id !== sid));
    if (selectedScreenId === sid) {
      const remaining = screens.filter((s) => s.id !== sid);
      setSelectedScreenId(remaining[0]?.id);
    }
  }, [screens, selectedScreenId, project]);

  const duplicateScreen = useCallback(async (sid) => {
    const src = screens.find((s) => s.id === sid);
    if (!src) return;
    const copy = {
      ...src,
      id: newId('screen'),
      name: `${src.name} copy`,
      elements: src.elements.map((e) => ({ ...e, id: newId(), props: { ...e.props } })),
    };
    setScreens((curr) => [...curr, copy]);
    if (project) {
      try { await api.createScreen(project.id, copy).catch(() => { }); } catch { }
    }
  }, [screens, project]);

  // Zoom controls
  const zoomIn = () => setZoom((z) => Math.min(4, z + 0.1));
  const zoomOut = () => setZoom((z) => Math.max(0.25, z - 0.1));
  const zoomFit = () => {
    if (!currentScreen) return;
    const container = document.querySelector('.canvas-area');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pad = 80;
    const sx = (rect.width - pad) / currentScreen.width;
    const sy = (rect.height - pad) / currentScreen.height;
    setZoom(Math.min(2, Math.max(0.1, Math.min(sx, sy))));
  };

  // Auto-fit zoom when screens first become available
  const prevScreensLen = useRef(0);
  useEffect(() => {
    if (screens.length > 0 && prevScreensLen.current === 0) {
      // Screens just loaded - fit the zoom
      requestAnimationFrame(() => {
        requestAnimationFrame(() => zoomFitRef.current?.());
      });
    }
    prevScreensLen.current = screens.length;
  }, [screens.length]);

  // Responsive: re-fit zoom whenever canvas container resizes
  const zoomFitRef = useRef(zoomFit);
  zoomFitRef.current = zoomFit;
  useEffect(() => {
    const container = document.querySelector('.canvas-area');
    if (!container) return;
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => zoomFitRef.current());
    });
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wheel zoom with Ctrl
  useEffect(() => {
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.target.closest('.canvas-area')) {
          e.preventDefault();
          if (e.deltaY < 0) zoomIn();
          else zoomOut();
        }
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  const selectedElement = currentScreen?.elements.find((e) => e.id === selectedId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <div className="flex gap-1 [&_span]:w-1.5 [&_span]:h-1.5 [&_span]:rounded-full [&_span]:bg-[var(--accent)] [&_span]:animate-pulse"><span></span><span></span><span></span></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-3 sm:px-4 py-2 border-b border-[var(--border)] shrink-0 overflow-x-auto flex-nowrap min-h-[56px]"
        style={{ background: 'linear-gradient(180deg, var(--surface) 0%, rgba(30,27,43,0.95) 100%)' }}>

        {/* Left: Back + Project Name */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all border border-[var(--border)] shrink-0"
            onClick={() => navigate('/app/dashboard')}
            title="Back to dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex flex-col min-w-0">
            {editingName ? (
              <input
                className="text-sm font-bold truncate max-w-28 sm:max-w-52 bg-[var(--surface2)] border border-[var(--accent)] rounded-lg px-2 py-1 outline-none"
                value={projectName}
                autoFocus
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingName(false);
                  if (e.key === 'Escape') setEditingName(false);
                }}
              />
            ) : (
              <button
                className="text-sm font-bold text-[var(--text)] hover:text-[var(--accent)] transition-colors truncate max-w-28 sm:max-w-52 flex items-center gap-1.5"
                onClick={() => setEditingName(true)}
              >
                <span className="truncate">{projectName}</span>
                <Edit2 size={11} className="text-[var(--text-muted)] shrink-0" />
                {dirty && <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 animate-pulse" title="Unsaved changes" />}
              </button>
            )}
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              {currentScreen?.width || DEVICE_PRESETS[device].width} × {currentScreen?.height || DEVICE_PRESETS[device].height}px
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-[var(--border)] shrink-0 hidden sm:block" />

        {/* Center: Device selector — sleek segmented control */}
        <div className="flex items-center gap-1 p-1 rounded-xl shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          {[
            { id: 'web', icon: Monitor, label: 'Web' },
            { id: 'tablet', icon: Tablet, label: 'Tablet' },
            { id: 'mobile', icon: Smartphone, label: 'Mobile' },
          ].map((d) => {
            const isActive = device === d.id;
            return (
              <button
                key={d.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? 'text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
                  }`}
                style={isActive ? { background: 'linear-gradient(135deg, #7c5cff, #a78bfa)' } : {}}
                onClick={() => {
                  setDevice(d.id);
                  if (currentScreen) {
                    const size = DEVICE_PRESETS[d.id];
                    setScreens((curr) =>
                      curr.map((s) =>
                        s.id === selectedScreenId ? { ...s, width: size.width, height: size.height } : s
                      )
                    );
                  }
                }}
              >
                <d.icon size={14} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom control — sleek pill */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-xl shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-all"
            onClick={zoomOut} title="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            className="px-2 py-1 rounded-lg text-[11px] font-bold font-mono min-w-[44px] text-center border border-transparent hover:border-[var(--accent)] transition-all"
            style={{ color: 'var(--accent)', background: 'rgba(124,92,255,0.1)' }}
            onClick={zoomFit} title="Fit to screen"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-all"
            onClick={zoomIn} title="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-4" />

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Undo/Redo — compact icon buttons */}
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all hidden sm:flex"
            title="Undo"
            onClick={() => alert('Undo coming soon')}
          >
            <Undo2 size={14} />
          </button>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all hidden sm:flex"
            title="Redo"
            onClick={() => alert('Redo coming soon')}
          >
            <Redo2 size={14} />
          </button>

          {/* Preview */}
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-[var(--text-2)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            onClick={() => {
              const screen = screens.find((s) => s.id === selectedScreenId) || screens[0];
              if (!screen || !screen.elements || screen.elements.length === 0) {
                alert('Nothing to preview yet — add some elements first!');
                return;
              }
              const preset = { web: { width: 1440, height: 900 }, tablet: { width: 768, height: 1024 }, mobile: { width: 375, height: 812 } };
              const size = preset[device] || preset.web;
              const html = generatePreviewHTML(screen.elements, size.width, size.height);
              const blob = new Blob([html], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              window.open(url, '_blank');
              setTimeout(() => URL.revokeObjectURL(url), 10000);
            }}
          >
            <Play size={13} />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Save */}
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all shrink-0"
            style={{
              background: saving
                ? 'rgba(124,92,255,0.5)'
                : 'linear-gradient(135deg, #7c5cff 0%, #a78bfa 100%)',
              boxShadow: saving ? 'none' : '0 4px 14px rgba(124,92,255,0.4)'
            }}
            onClick={save}
            disabled={saving}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span className="hidden sm:inline">{saving ? 'Saving…' : 'Save'}</span>
          </button>
        </div>
      </header>

      {/* Main editor body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Hide screens sidebar on < xl screens */}
        <div className="hidden xl:block shrink-0">
          <ScreensSidebar
            screens={screens}
            selectedScreenId={selectedScreenId}
            onSelectScreen={(sid) => { setSelectedScreenId(sid); setSelectedId(null); }}
            onAddScreen={addScreen}
            onRenameScreen={renameScreen}
            onDeleteScreen={deleteScreen}
            onDuplicateScreen={duplicateScreen}
          />
        </div>

        {/* Components panel — lg+ */}
        {!isMobile && (
          <div className={`hidden lg:block shrink-0 transition-all duration-200 overflow-hidden ed-panel-comp ${showComponents ? 'w-60' : 'w-0'}`}>
            {showComponents && <ComponentsPanel onAddComponent={(item) => addElement(item, Math.round(screenSize.width / 2 - 80), Math.round(screenSize.height / 2 - 22))} />}
          </div>
        )}

        <div className="flex-1 relative overflow-hidden bg-[var(--surface)]">
          <Canvas
            elements={currentScreen?.elements || []}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            screenSize={screenSize}
            zoom={zoom}
            device={device}
            onUpdateElement={updateElement}
            onUpdateElementProps={updateElementProps}
            onDeleteElement={deleteElement}
            onAddElement={addElement}
          />
        </div>

        {/* Layers panel — xl+ (1024px sees only comp panel + canvas) */}
        {!isMobile && (
          <div className={`hidden xl:block shrink-0 transition-all duration-200 overflow-hidden ed-panel-layers ${showLayers ? 'w-60 xl:w-72' : 'w-0'}`}>
            {showLayers && (
              <LayersPanel
                elements={currentScreen?.elements || []}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                onUpdate={updateElement}
                onDelete={deleteElement}
                onReorder={reorderElement}
              />
            )}
          </div>
        )}

        {/* Properties panel — 2xl+ (1280px sees comp+layers+canvas) */}
        {!isMobile && (
          <div className={`hidden 2xl:block shrink-0 transition-all duration-200 overflow-hidden ed-panel-props ${showProps ? 'w-72 2xl:w-80' : 'w-0'}`}>
            {showProps && (
              <PropertiesPanel
                element={selectedElement}
                onUpdate={updateElement}
                onUpdateProps={updateElementProps}
                onDelete={deleteElement}
                onDuplicate={duplicateElement}
              />
            )}
          </div>
        )}

        {/* Mobile floating toolbar — hidden on xl+ when panels are visible */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 sm:px-3 py-2 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl z-50 xl:hidden">
          <button
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--surface2)]"
            onClick={() => setShowLayers((v) => !v)}
            title="Layers"
          >
            <PanelBottom size={14} />
            <span className="hidden sm:inline">Layers</span>
          </button>
          <button
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--surface2)]"
            onClick={() => setShowComponents((v) => !v)}
            title="Components"
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">Components</span>
          </button>
          <button
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--surface2)]"
            onClick={() => setShowProps((v) => !v)}
            title="Properties"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Properties</span>
          </button>
        </div>
      </div>
    </div>
  );
}
