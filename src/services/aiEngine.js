/**
 * aiEngine — Shared service wrapper for the backend AIEngine.
 *
 * All frontend AI pages should use this service OR the useAI() hook.
 * This module provides direct API access without React hooks.
 *
 * Usage:
 *   import { aiChat, aiImage, aiAnalyze, aiResearch } from '../services/aiEngine'
 *
 *   const result = await aiChat({ prompt: 'Hello' })
 *   const result = await aiImage({ prompt: 'Generate a dashboard' })
 *   const result = await aiAnalyze({ imageUrl: '...', prompt: 'Analyze this' })
 */

import { getToken } from '../utils/api';

const ENGINE_URL = '/api/ai/engine';
const STREAM_URL = '/api/ai/engine/stream';

// ─── Core ────────────────────────────────────────────────────────────────────

async function engineCall(request) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(ENGINE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  const data = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));

  if (!res.ok || !data.success) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

// ─── Individual Operations ───────────────────────────────────────────────────

/**
 * Chat — text conversation.
 */
export async function aiChat(params = {}) {
  return engineCall({
    type: 'chat',
    prompt: params.prompt || '',
    messages: params.messages || [],
    model: params.model || null,
    max_tokens: params.max_tokens ?? 2000,
    temperature: params.temperature ?? 0.7,
    ...(params.extra || {}),
  });
}

/**
 * Image generation — text-to-image.
 */
export async function aiImage(params = {}) {
  return engineCall({
    type: 'image',
    prompt: params.prompt || params.description || '',
    size: params.size || '1024x1024',
    quality: params.quality || 'standard',
    n: params.n || 1,
    seed: params.seed || null,
    model: params.model || null,
    negative_prompt: params.negative_prompt || '',
    ...(params.extra || {}),
  });
}

/**
 * Analyze — screenshot analysis with optional image.
 */
export async function aiAnalyze(params = {}) {
  return engineCall({
    type: 'analyze',
    prompt: params.prompt || params.description || '',
    image_url: params.imageUrl || params.screenshot_url || '',
    screenshot_url: params.screenshot_url || params.imageUrl || '',
    project_context: params.projectContext || params.context || '',
    model: params.model || null,
    max_tokens: params.max_tokens ?? 2000,
    ...(params.extra || {}),
  });
}

/**
 * Code generation.
 */
export async function aiCode(params = {}) {
  return engineCall({
    type: 'code',
    prompt: params.prompt || params.description || '',
    framework: params.framework || params.type || 'react',
    model: params.model || null,
    max_tokens: params.max_tokens ?? 3000,
    ...(params.extra || {}),
  });
}

/**
 * Research.
 */
export async function aiResearch(params = {}) {
  return engineCall({
    type: 'research',
    topic: params.topic || params.prompt || '',
    niche: params.niche || '',
    model: params.model || null,
    max_tokens: params.max_tokens ?? 2000,
    ...(params.extra || {}),
  });
}

/**
 * Redesign — image-to-image or text-to-image redesign.
 */
export async function aiRedesign(params = {}) {
  return engineCall({
    type: 'redesign',
    prompt: params.prompt || params.description || '',
    image_url: params.imageUrl || params.screenshot_url || '',
    screenshot_url: params.screenshot_url || params.imageUrl || '',
    style: params.style || 'modern-saas',
    project_context: params.projectContext || '',
    model: params.model || null,
    size: params.size || '1024x1024',
    seed: params.seed || null,
    ...(params.extra || {}),
  });
}

/**
 * Copywriting.
 */
export async function aiCopywrite(params = {}) {
  return engineCall({
    type: 'copywrite',
    prompt: params.prompt || params.description || '',
    type_: params.type || 'landing-page',
    product_context: params.productContext || params.description || '',
    tone: params.tone || 'modern',
    model: params.model || null,
    max_tokens: params.max_tokens ?? 2000,
    ...(params.extra || {}),
  });
}

/**
 * UX/UI Consultant.
 */
export async function aiConsult(params = {}) {
  return engineCall({
    type: 'consult',
    question: params.question || params.prompt || '',
    context: params.context || '',
    model: params.model || null,
    max_tokens: params.max_tokens ?? 2000,
    ...(params.extra || {}),
  });
}

/**
 * Auto-detect — let the engine decide the type from the prompt.
 */
export async function aiAuto(params = {}) {
  return engineCall({
    prompt: params.prompt || params.description || '',
    messages: params.messages || [],
    image_url: params.imageUrl || '',
    screenshot_url: params.screenshot_url || '',
    model: params.model || null,
    max_tokens: params.max_tokens ?? 2000,
    temperature: params.temperature ?? 0.7,
    ...(params.extra || {}),
  });
}

// ─── Streaming ───────────────────────────────────────────────────────────────

/**
 * Stream chat responses via SSE.
 *
 * Usage:
 *   const stream = aiStreamChat([{ role: 'user', content: 'Hello' }], {
 *     onChunk: (delta) => setReply(r => r + delta),
 *     onDone: (full) => setReply(full),
 *     onError: (err) => setError(err),
 *     signal: abortController.signal,
 *   })
 *
 * Returns a cleanup function.
 */
export function aiStreamChat(messages, callbacks = {}) {
  const { onChunk, onDone, onError, temperature = 0.7, maxTokens = 2000, signal } = callbacks;
  const token = getToken();

  const body = {
    messages,
    type: 'chat',
    max_tokens: maxTokens,
    temperature,
  };

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let reader;
  let aborted = false;

  fetch(STREAM_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(d => { throw new Error(d.error || `HTTP ${res.status}`); });
      }
      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      function process() {
        reader.read().then(({ done, value }) => {
          if (done || aborted) {
            onDone?.(full);
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const raw of lines) {
            const line = raw.trim();
            if (!line || !line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') { onDone?.(full); return; }

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) { onError?.(parsed.error); return; }
              if (parsed.delta !== undefined) {
                full += parsed.delta;
                onChunk?.(parsed.delta, full);
              }
              if (parsed.done) { full = parsed.reply || full; onDone?.(full); return; }
            } catch {}
          }

          process();
        });
      }

      process();
    })
    .catch(err => {
      if (err.name !== 'AbortError') {
        onError?.(err.message);
      }
    });

  return () => { aborted = true; reader?.cancel(); };
}

// ─── Capabilities ────────────────────────────────────────────────────────────

export const capabilities = {
  chat: true,
  streaming: true,
  vision: true,
  image: true,
  code: true,
  analyze: true,
  research: true,
  redesign: true,
  copywrite: true,
  consult: true,
};
