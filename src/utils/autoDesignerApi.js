/**
 * Auto Designer API — frontend service for the Premium Auto Designer pipeline.
 * All methods return Promise<{success, data?, error?}>
 */

const BASE = '/api/auto-designer';

function getToken() {
  return localStorage.getItem('ui_inspectore_token');
}

async function post(path, body, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    throw new Error(data.error || `HTTP ${resp.status}`);
  }
  return data;
}

async function get(path) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(`${BASE}${path}`, { headers });
  const data = await resp.json();
  if (!resp.ok || !data.success) {
    throw new Error(data.error || `HTTP ${resp.status}`);
  }
  return data;
}

async function del(path) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(`${BASE}${path}`, { method: 'DELETE', headers });
  const data = await resp.json();
  if (!resp.ok || !data.success) {
    throw new Error(data.error || `HTTP ${resp.status}`);
  }
  return data;
}

/** Step 1: Analyze requirements → structured brief */
export async function analyzeRequirements(data) {
  return post('/analyze', data);
}

/** Step 2: Optimize user prompt → professional design prompt */
export async function optimizePrompt(data) {
  return post('/optimize-prompt', data);
}

/**
 * Step 3: Generate UI images (async, returns immediately, images may be pending)
 * @param {object} data  - { optimizedPrompt, variations, size, style, theme, seed }
 * @param {AbortSignal} opts.signal
 */
export async function generateDesigns(data, opts = {}) {
  return post('/generate', data, { signal: opts.signal });
}

/** Step 4: Analyze a generated design → scores + suggestions */
export async function analyzeDesign(imageUrl, prompt) {
  return post('/analyze-design', { imageUrl, prompt });
}

/** Step 5: Redesign — improve a design */
export async function redesign(imageUrl, improvementFocus, size, theme) {
  return post('/redesign', { imageUrl, improvementFocus, size, theme });
}

/** Step 6: Generate code from design */
export async function generateCode(imageUrl, prompt, framework, designNotes) {
  return post('/generate-code', { imageUrl, prompt, framework, designNotes });
}

// ─── Design History ────────────────────────────────────────────────────────

/** Load all designs from history */
export async function loadHistory() {
  return get('/history');
}

/** Save a design to history */
export async function saveDesign(design) {
  return post('/history/save', design);
}

/** Delete a design from history */
export async function deleteDesign(id) {
  return del(`/history/${id}`);
}

/** Toggle favorite */
export async function toggleFavorite(id) {
  return post(`/history/${id}/favorite`, {});
}

// ─── Constants ─────────────────────────────────────────────────────────────

export const APP_TYPES = [
  'Dashboard', 'Landing Page', 'Admin Panel', 'Mobile App',
  'SaaS Product', 'E-commerce', 'CRM', 'ERP', 'Analytics',
  'Social Network', 'Portfolio', 'Blog', 'Forum', 'Other',
];

export const DESIGN_STYLES = [
  'Modern SaaS', 'Minimal', 'Glassmorphism', 'Neumorphism',
  'Enterprise', 'FinTech', 'Healthcare', 'Crypto', 'Startup',
];

export const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'E-commerce', 'Education',
  'Social Media', 'Gaming', 'Real Estate', 'Travel', 'Food & Beverage',
  'Entertainment', 'SaaS', 'Agency', 'Non-profit', 'Government', 'Other',
];

export const COMPLEXITY_LEVELS = [
  { value: 'simple',       label: 'Simple',       desc: '1-3 screens, basic features' },
  { value: 'professional', label: 'Professional', desc: '5-10 screens, real-world features' },
  { value: 'enterprise',   label: 'Enterprise',   desc: '10+ screens, complex workflows' },
];

export const IMAGE_SIZES = [
  { value: '1792x1024', label: 'Landscape 16:9',  desc: 'Best for desktop web designs' },
  { value: '1024x1792', label: 'Portrait 9:16',   desc: 'Best for mobile app designs' },
  { value: '1024x1024', label: 'Square 1:1',      desc: 'Universal format' },
  { value: '768x1024',  label: 'Portrait 3:4',    desc: 'Good for tablet' },
];

export const CODE_FRAMEWORKS = [
  { value: 'react',    label: 'React',        desc: 'React 18 + hooks' },
  { value: 'nextjs',   label: 'Next.js',      desc: 'Next.js 14 App Router' },
  { value: 'vue',       label: 'Vue 3',        desc: 'Vue Composition API' },
  { value: 'tailwind',  label: 'HTML + Tailwind', desc: 'Vanilla HTML + Tailwind CSS' },
  { value: 'shadcn',    label: 'shadcn/ui',   desc: 'React + shadcn + Radix UI' },
];

/** Regenerate a design's image from its stored prompt */
export async function regenerateDesign(item) {
  const data = await post('/generate', {
    optimizedPrompt: item.prompt || item.description || '',
    variations: 1,
    size: item.size || '1792x1024',
    style: item.style || 'Modern SaaS',
    theme: item.theme || 'dark',
  });
  if (!data.designs?.length) throw new Error('Regeneration failed');
  const newDesign = data.designs[0];
  // Save updated imageUrl to history
  await saveDesign({
    ...item,
    imageUrl: newDesign.imageUrl,
    regeneratedAt: new Date().toISOString(),
  });
  return newDesign;
}
