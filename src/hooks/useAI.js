/**
 * useAI — Unified AI hook for UI Inspectore.
 * ALL AI modules MUST use this hook. No duplicate AI logic.
 *
 * Architecture:
 * - All requests go through /api/ai/engine (backend AIEngine)
 * - Auto-detects request type from prompt if type not specified
 * - Supports: chat, image, analyze, code, research, redesign, copywrite, consult
 *
 * Usage:
 *
 *   const ai = useAI()
 *
 *   // Auto-detect (type inferred from prompt)
 *   const result = await ai.chat({ prompt: 'Explain Flexbox' })
 *
 *   // Explicit type
 *   const result = await ai.chat({ prompt: '...', type: 'chat' })
 *   const result = await ai.image({ prompt: 'Generate a dashboard' })
 *   const result = await ai.analyze({ imageUrl: '...', prompt: '...' })
 *   const result = await ai.code({ prompt: 'Create a React login page' })
 *   const result = await ai.research({ topic: 'UI trends' })
 *   const result = await ai.redesign({ imageUrl: '...', style: 'modern-saas' })
 *   const result = await ai.copywrite({ prompt: 'Write landing page copy' })
 *   const result = await ai.consult({ question: 'Should I use Flexbox or Grid?' })
 *
 *   // Streaming
 *   const stream = ai.streamChat([{ role: 'user', content: 'Hello' }])
 *   for await (const chunk of stream) { ... }
 *
 *   // Capabilities check
 *   const caps = ai.getCapabilities()
 *   if (!caps.image) showMessage('Image generation not available')
 */

import { useState, useCallback, useRef } from 'react';

const ENGINE_URL = '/api/ai/engine';
const STREAM_URL = '/api/ai/engine/stream';

function getToken() {
  return localStorage.getItem('ui_inspectore_token');
}

function getCapabilities() {
  return {
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
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  /**
   * Call the unified AI engine.
   * @param {object} request - Request payload
   * @returns {Promise<object>} Structured response
   */
  const call = useCallback(async (request) => {
    setLoading(true);
    setError(null);

    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(ENGINE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errMsg = data.error || `Request failed (${res.status})`;
        setError(errMsg);
        return data;
      }

      return data;
    } catch (err) {
      const msg = err.message || 'Network error';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Auto-detecting chat — type inferred from prompt.
   * Fallback: text chat.
   */
  const chat = useCallback(async (params = {}) => {
    return call({
      type: 'chat',
      prompt: params.prompt || '',
      messages: params.messages || [],
      model: params.model || null,
      max_tokens: params.max_tokens || 2000,
      temperature: params.temperature ?? 0.7,
    });
  }, [call]);

  /**
   * Image generation (text-to-image).
   */
  const image = useCallback(async (params = {}) => {
    return call({
      type: 'image',
      prompt: params.prompt || params.description || '',
      size: params.size || '1024x1024',
      quality: params.quality || 'standard',
      n: params.n || 1,
      seed: params.seed || null,
      model: params.model || null,
      negative_prompt: params.negative_prompt || '',
    });
  }, [call]);

  /**
   * Image analysis (with optional image attachment).
   */
  const analyze = useCallback(async (params = {}) => {
    return call({
      type: 'analyze',
      prompt: params.prompt || params.description || '',
      image_url: params.imageUrl || params.screenshot_url || '',
      screenshot_url: params.screenshot_url || params.imageUrl || '',
      project_context: params.projectContext || params.context || '',
      model: params.model || null,
      max_tokens: params.max_tokens || 2000,
    });
  }, [call]);

  /**
   * Code generation.
   */
  const code = useCallback(async (params = {}) => {
    return call({
      type: 'code',
      prompt: params.prompt || params.description || '',
      framework: params.framework || params.type || 'react',
      model: params.model || null,
      max_tokens: params.max_tokens || 3000,
    });
  }, [call]);

  /**
   * Research on a topic.
   */
  const research = useCallback(async (params = {}) => {
    return call({
      type: 'research',
      topic: params.topic || params.prompt || '',
      niche: params.niche || '',
      model: params.model || null,
      max_tokens: params.max_tokens || 2000,
    });
  }, [call]);

  /**
   * UI Redesign (image-to-image or text-to-image redesign).
   */
  const redesign = useCallback(async (params = {}) => {
    return call({
      type: 'redesign',
      prompt: params.prompt || params.description || '',
      image_url: params.imageUrl || params.screenshot_url || '',
      screenshot_url: params.screenshot_url || params.imageUrl || '',
      style: params.style || 'modern-saas',
      project_context: params.projectContext || '',
      model: params.model || null,
      size: params.size || '1024x1024',
      seed: params.seed || null,
    });
  }, [call]);

  /**
   * Copywriting.
   */
  const copywrite = useCallback(async (params = {}) => {
    return call({
      type: 'copywrite',
      prompt: params.prompt || params.description || '',
      type_: params.type || 'landing-page',
      product_context: params.productContext || params.description || '',
      tone: params.tone || 'modern',
      model: params.model || null,
      max_tokens: params.max_tokens || 2000,
    });
  }, [call]);

  /**
   * UX/UI Consultant.
   */
  const consult = useCallback(async (params = {}) => {
    return call({
      type: 'consult',
      question: params.question || params.prompt || '',
      context: params.context || '',
      model: params.model || null,
      max_tokens: params.max_tokens || 2000,
    });
  }, [call]);

  /**
   * Auto-detect and route.
   * Uses the engine's auto-detection — just pass the raw prompt.
   */
  const auto = useCallback(async (params = {}) => {
    return call({
      prompt: params.prompt || params.description || '',
      messages: params.messages || [],
      image_url: params.imageUrl || '',
      screenshot_url: params.screenshot_url || '',
      model: params.model || null,
      max_tokens: params.max_tokens || 2000,
      temperature: params.temperature ?? 0.7,
    });
  }, [call]);

  return {
    loading,
    error,
    setError,

    // Capabilities (static for now — could be fetched from /api/ai/capabilities)
    getCapabilities,

    // All AI operations
    auto,       // ← Auto-detect type from prompt
    chat,
    image,
    analyze,
    code,
    research,
    redesign,
    copywrite,
    consult,
  };
}

/**
 * useStreamingAI — Streaming chat with SSE support.
 *
 * Usage:
 *   const stream = useStreamingAI()
 *   stream.send('Hello')           — starts streaming
 *   stream.stop()                  — aborts
 *   stream.messages                — [{role, text, id}]
 *   stream.loading                 — bool
 *
 *   for await (const chunk of stream.stream()) {
 *     if (chunk.done) break
 *     if (chunk.error) { setError(chunk.error); break }
 *     setReply(r => r + chunk.delta)
 *   }
 */
export function useStreamingAI(options = {}) {
  const token = getToken();
  const [messages, setMessages] = useState(options.initialMessages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const send = useCallback(async (text, extraMessages = []) => {
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    setError(null);

    // Build message list (last 20 messages for context)
    const allMessages = [
      ...messages.slice(-20).map(s => ({
        role: s.role === 'ai' ? 'assistant' : (s.role === 'user' ? 'user' : s.role),
        content: s.text || s.content || '',
      })),
      ...extraMessages.map(s => ({
        role: s.role === 'ai' ? 'assistant' : (s.role === 'user' ? 'user' : s.role),
        content: s.text || s.content || '',
      })),
      { role: 'user', content: text },
    ];

    const body = {
      messages: allMessages,
      type: 'chat',
      max_tokens: 2000,
      temperature: 0.7,
    };

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const sid = `a-${Date.now()}`;
    setMessages(m => [...m, { id: sid, role: 'ai', text: '' }]);

    try {
      const res = await fetch(STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const raw of lines) {
          const line = raw.trim();
          if (!line || !line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              setMessages(m => m.map(msg => msg.id === sid ? { ...msg, error: parsed.error } : msg));
              setError(parsed.error);
              break;
            }
            if (parsed.delta !== undefined) {
              full += parsed.delta;
              setMessages(m => m.map(msg => msg.id === sid ? { ...msg, text: full } : msg));
              scrollToBottom();
            }
            if (parsed.done) {
              full = parsed.reply || full;
              setMessages(m => m.map(msg => msg.id === sid ? { ...msg, text: full } : msg));
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const msg = err.message || 'Stream failed';
        setError(msg);
        setMessages(m => m.map(msg => msg.id === sid ? { ...msg, error: msg.text || msg.error || msg } : msg));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [messages, token]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const setMessagesExternal = setMessages;

  return {
    messages,
    loading,
    error,
    send,
    stop,
    clear,
    setMessages: setMessagesExternal,
  };
}

function scrollToBottom() {
  setTimeout(() => {
    const el = document.querySelector('[data-chat-scroller]') ||
               document.querySelector('[data-ai-messages]') ||
               document.querySelector('.flex-1.overflow-y-auto');
    if (el) el.scrollTop = el.scrollHeight;
  }, 30);
}
