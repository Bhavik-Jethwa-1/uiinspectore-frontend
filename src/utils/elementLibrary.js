// Element library — definitions for draggable components
// Each component has: type, name, category, icon (lucide), defaultProps, defaultSize

import {
  MousePointer2, Square, Type, Heading1, AlignLeft, Image as ImageIcon,
  Tag, CircleUser, Pill, CreditCard, LayoutGrid, Box, Rows, Columns,
  Minus, Space, PanelTop, PanelBottom, PanelLeft, Navigation, Folder,
  List, ListOrdered, Table2, MessageSquare, AlertCircle, CheckSquare,
  ToggleLeft, SlidersHorizontal, ChevronDown, Hash, Search
} from 'lucide-react';

export const COMPONENT_GROUPS = [
  {
    id: 'basic',
    label: 'Basic',
    items: [
      { type: 'button', name: 'Button', icon: MousePointer2, defaultSize: { w: 160, h: 44 }, defaults: { variant: 'primary', text: 'Click me', backgroundColor: '#7c5cff', color: '#ffffff', borderRadius: 10, fontSize: 14, fontWeight: 600 } },
      { type: 'input', name: 'Input', icon: Square, defaultSize: { w: 240, h: 44 }, defaults: { placeholder: 'Type here…', backgroundColor: '#ffffff', color: '#111827', borderRadius: 8, fontSize: 14 } },
      { type: 'textarea', name: 'Textarea', icon: AlignLeft, defaultSize: { w: 280, h: 100 }, defaults: { placeholder: 'Write something…', backgroundColor: '#ffffff', color: '#111827', borderRadius: 8, fontSize: 14 } },
      { type: 'select', name: 'Select', icon: ChevronDown, defaultSize: { w: 200, h: 44 }, defaults: { text: 'Choose an option', backgroundColor: '#ffffff', color: '#111827', borderRadius: 8, fontSize: 14 } },
      { type: 'checkbox', name: 'Checkbox', icon: CheckSquare, defaultSize: { w: 160, h: 24 }, defaults: { text: 'Checkbox label', color: '#111827', fontSize: 14 } },
      { type: 'radio', name: 'Radio', icon: CircleUser, defaultSize: { w: 160, h: 24 }, defaults: { text: 'Radio option', color: '#111827', fontSize: 14 } },
      { type: 'toggle', name: 'Toggle', icon: ToggleLeft, defaultSize: { w: 50, h: 28 }, defaults: { backgroundColor: '#7c5cff' } },
      { type: 'slider', name: 'Slider', icon: SlidersHorizontal, defaultSize: { w: 200, h: 24 }, defaults: { backgroundColor: '#7c5cff' } },
      { type: 'search', name: 'Search', icon: Search, defaultSize: { w: 240, h: 40 }, defaults: { placeholder: 'Search…', backgroundColor: '#f3f4f6', color: '#111827', borderRadius: 999, fontSize: 14 } },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    items: [
      { type: 'heading', name: 'Heading', icon: Heading1, defaultSize: { w: 320, h: 40 }, defaults: { text: 'Section Title', color: '#111827', fontSize: 28, fontWeight: 700 } },
      { type: 'text', name: 'Text', icon: Type, defaultSize: { w: 240, h: 24 }, defaults: { text: 'Body text', color: '#4b5563', fontSize: 14, fontWeight: 400 } },
      { type: 'paragraph', name: 'Paragraph', icon: AlignLeft, defaultSize: { w: 320, h: 80 }, defaults: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.', color: '#4b5563', fontSize: 14, lineHeight: 1.5 } },
      { type: 'image', name: 'Image', icon: ImageIcon, defaultSize: { w: 240, h: 160 }, defaults: { backgroundColor: '#e5e7eb', src: '' } },
      { type: 'icon', name: 'Icon', icon: Hash, defaultSize: { w: 32, h: 32 }, defaults: { icon: 'star', color: '#7c5cff' } },
      { type: 'badge', name: 'Badge', icon: Tag, defaultSize: { w: 80, h: 24 }, defaults: { text: 'New', backgroundColor: '#7c5cff', color: '#ffffff', borderRadius: 999, fontSize: 11, fontWeight: 700 } },
      { type: 'avatar', name: 'Avatar', icon: CircleUser, defaultSize: { w: 48, h: 48 }, defaults: { backgroundColor: '#7c5cff', color: '#ffffff', borderRadius: 999, text: 'A' } },
      { type: 'chip', name: 'Chip', icon: Pill, defaultSize: { w: 100, h: 28 }, defaults: { text: 'Tag', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: 999, fontSize: 12, fontWeight: 500 } },
    ],
  },
  {
    id: 'layout',
    label: 'Layout',
    items: [
      { type: 'card', name: 'Card', icon: CreditCard, defaultSize: { w: 280, h: 180 }, defaults: { backgroundColor: '#ffffff', borderRadius: 16, borderColor: '#e5e7eb', borderWidth: 1 } },
      { type: 'container', name: 'Container', icon: Box, defaultSize: { w: 320, h: 200 }, defaults: { backgroundColor: '#f9fafb', borderRadius: 8 } },
      { type: 'section', name: 'Section', icon: LayoutGrid, defaultSize: { w: 400, h: 200 }, defaults: { backgroundColor: '#ffffff' } },
      { type: 'row', name: 'Row', icon: Rows, defaultSize: { w: 400, h: 100 }, defaults: { backgroundColor: 'transparent' } },
      { type: 'column', name: 'Column', icon: Columns, defaultSize: { w: 200, h: 200 }, defaults: { backgroundColor: 'transparent' } },
      { type: 'divider', name: 'Divider', icon: Minus, defaultSize: { w: 240, h: 2 }, defaults: { backgroundColor: '#e5e7eb' } },
      { type: 'spacer', name: 'Spacer', icon: Space, defaultSize: { w: 100, h: 40 }, defaults: { backgroundColor: 'transparent' } },
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    items: [
      { type: 'header', name: 'Header', icon: PanelTop, defaultSize: { w: 1200, h: 64 }, defaults: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1 } },
      { type: 'footer', name: 'Footer', icon: PanelBottom, defaultSize: { w: 1200, h: 80 }, defaults: { backgroundColor: '#111827', color: '#ffffff' } },
      { type: 'sidebar', name: 'Sidebar', icon: PanelLeft, defaultSize: { w: 240, h: 600 }, defaults: { backgroundColor: '#111827', color: '#ffffff' } },
      { type: 'navigation', name: 'Nav links', icon: Navigation, defaultSize: { w: 320, h: 40 }, defaults: { backgroundColor: '#ffffff', items: ['Home', 'Features', 'Pricing', 'About'] } },
      { type: 'tabs', name: 'Tabs', icon: Folder, defaultSize: { w: 320, h: 40 }, defaults: { backgroundColor: '#ffffff', items: ['Tab 1', 'Tab 2', 'Tab 3'] } },
      { type: 'breadcrumb', name: 'Breadcrumb', icon: ChevronDown, defaultSize: { w: 320, h: 24 }, defaults: { text: 'Home / Section / Page', color: '#6b7280', fontSize: 13 } },
      { type: 'pagination', name: 'Pagination', icon: Hash, defaultSize: { w: 200, h: 32 }, defaults: { backgroundColor: '#ffffff' } },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    items: [
      { type: 'form', name: 'Form', icon: MessageSquare, defaultSize: { w: 360, h: 320 }, defaults: { backgroundColor: '#ffffff', borderRadius: 12, borderColor: '#e5e7eb', borderWidth: 1 } },
      { type: 'table', name: 'Table', icon: Table2, defaultSize: { w: 480, h: 240 }, defaults: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1 } },
      { type: 'list', name: 'List', icon: List, defaultSize: { w: 280, h: 160 }, defaults: { backgroundColor: '#ffffff', items: ['First item', 'Second item', 'Third item'] } },
      { type: 'list-ordered', name: 'Ordered List', icon: ListOrdered, defaultSize: { w: 280, h: 160 }, defaults: { backgroundColor: '#ffffff', items: ['Step one', 'Step two', 'Step three'] } },
      { type: 'modal', name: 'Modal', icon: MessageSquare, defaultSize: { w: 400, h: 280 }, defaults: { backgroundColor: '#ffffff', borderRadius: 16, borderColor: '#e5e7eb', borderWidth: 1 } },
      { type: 'alert', name: 'Alert', icon: AlertCircle, defaultSize: { w: 360, h: 64 }, defaults: { text: 'This is an important alert.', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: 8 } },
    ],
  },
];

export const DEVICE_PRESETS = {
  web: {
    width: 1440, height: 900,
    label: 'Web',
    icon: 'monitor',
    color: '#6366f1',
    bgColor: '#eef2ff',
    bezel: 'laptop',
    description: '1440 × 900',
  },
  tablet: {
    width: 768, height: 1024,
    label: 'Tablet',
    icon: 'tablet',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    bezel: 'tablet',
    description: '768 × 1024',
  },
  mobile: {
    width: 375, height: 812,
    label: 'Mobile',
    icon: 'smartphone',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    bezel: 'phone',
    description: '375 × 812',
  },
};

let _id = 1;
export const newId = (prefix = 'elem') => `${prefix}_${Date.now().toString(36)}_${(_id++).toString(36)}`;

export const makeElement = (component, x, y) => {
  return {
    id: newId(),
    type: component.type,
    x: Math.max(0, Math.round(x)),
    y: Math.max(0, Math.round(y)),
    width: component.defaultSize.w,
    height: component.defaultSize.h,
    props: { ...component.defaults },
    text: component.defaults.text || '',
    visible: true,
    locked: false,
    name: component.name,
  };
};

export const findComponent = (type) => {
  for (const g of COMPONENT_GROUPS) {
    const f = g.items.find((i) => i.type === type);
    if (f) return f;
  }
  return null;
};
