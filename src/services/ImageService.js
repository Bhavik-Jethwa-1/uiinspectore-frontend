/**
 * ImageGenerationService — Frontend service for AI image generation.
 *
 * Uses MiniMax image-01 model via the backend API.
 *
 * IMPORTANT: If MiniMax API key is not configured on the server,
 * image generation will fail with a clear error message.
 * There is NO Pollinations, Google Images, Bing, or any web search fallback.
 *
 * The caller MUST handle error responses and display them to the user.
 *
 * Usage:
 *   const svc = new ImageGenerationService(token);
 *   const result = await svc.generate('a beautiful sunset', { size: '1024x1024' });
 *
 *   if (!result.success) {
 *     setError(result.error);  // Show exact error to user
 *     return;
 *   }
 *
 *   setImageUrl(result.images[0]);
 */

const API_BASE = '/api/ai';

// MiniMax image model definitions
export const IMAGE_MODELS = {
  'image-01': {
    id: 'image-01',
    name: 'MiniMax Image-01',
    provider: 'minimax',
    isFree: false,
    description: 'Native MiniMax image generation',
    sizes: ['1024x1024', '1024x1792', '1792x1024', '768x1024', '1024x768'],
  },
};

function parseSize(sizeStr) {
  // MiniMax uses 1:1, 16:9, 9:16, 3:4, 4:3 or pixel dimensions
  const defaults = { width: 1024, height: 1024 };
  if (!sizeStr) return defaults;

  if (sizeStr.includes('x')) {
    const [w, h] = sizeStr.split('x').map(Number);
    return { width: w || 1024, height: h || 1024 };
  }
  if (sizeStr.includes('×')) {
    const [w, h] = sizeStr.split('×').map(Number);
    return { width: w || 1024, height: h || 1024 };
  }
  return defaults;
}

export class ImageGenerationService {
  /**
   * @param {string|null} token - Auth token
   */
  constructor(token = null) {
    this.token = token;
  }

  /**
   * Generate images using MiniMax image-01 via the backend API.
   *
   * @param {string} prompt - Text description of the image
   * @param {object} opts
   * @param {string} opts.size - Image size (e.g. "1024x1024", "1024x1792", "1792x1024")
   * @param {number} opts.n - Number of images (1-4)
   *
   * @returns {Promise<{
   *   success: boolean,
   *   images?: string[],
   *   model?: string,
   *   prompt?: string,
   *   error?: string,
   *   request_id?: string
   * }>}
   */
  async generate(prompt, opts = {}) {
    if (!prompt || !prompt.trim()) {
      return {
        success: false,
        error: 'Prompt is required',
      };
    }

    const size = opts.size || '1024x1024';
    const n = Math.min(Math.max(1, parseInt(opts.n || '1', 10)), 4);

    // Use selected provider/model if passed, otherwise detect from selected model, else default MiniMax
    const selectedId = opts.model || 'image-01';
    const selectedProvider = opts.provider || 'minimax';

    // Detect provider from selected model ID
    const model = selectedId.startsWith('agent_')
      ? selectedId
      : (selectedProvider === 'openai' ? 'dall-e-3' : 'image-01');
    const provider = selectedProvider === 'openai' ? 'openai' : 'minimax';

    const body = {
      type: 'image',
      prompt: prompt.trim(),
      size,
      n,
      provider,
      model,
    };

    // Call backend API → MiniMaxService.image()
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    let response;
    try {
      response = await fetch(`${API_BASE}/image`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch (err) {
      return {
        success: false,
        error: `Network error: ${err.message}`,
      };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: `Server returned invalid JSON (HTTP ${response.status})`,
      };
    }

    // Handle error responses — images array present = success
    if (!response.ok || !(data.images && data.images.length > 0)) {
      return {
        success: false,
        error: data.error || `Image generation failed (HTTP ${response.status})`,
        request_id: data.request_id || null,
      };
    }

    // Success
    if (!data.images || !data.images.length) {
      return {
        success: false,
        error: 'MiniMax returned no images',
      };
    }

    // Guard: reject any image URL that does not come from MiniMax/Aliyun CDN.
    // If an image URL is from ANY other domain (Google, Unsplash, etc.),
    // treat it as a failure — do NOT display it.
    // Allow:
    // 1. Local/relative URLs (e.g. /storage/auto_designer/images/...)
    // 2. Current origin (e.g. http://uiinspectore.167.233.101.27.nip.io)
    // 3. MiniMax CDN domains
    const firstUrl = data.images[0];
    const isRelative = firstUrl.startsWith('/') || firstUrl.startsWith('data:');
    const isCurrentOrigin = firstUrl.startsWith(window.location.origin + '/');
    const ALLOWED_IMAGE_DOMAINS = [
      'hailuo-image-algeng-data-us.oss-us-east-1.aliyuncs.com',
      'hailuo-image-algeng-data.oss-cn-shanghai.aliyuncs.com',
      'hailuo-video.netesonn.com',
    ];
    const isAllowed = isRelative || isCurrentOrigin || ALLOWED_IMAGE_DOMAINS.some(domain => firstUrl.includes(domain));
    if (!isAllowed) {
      console.error('[ImageService] Blocked suspicious image URL:', firstUrl);
      return {
        success: false,
        error: 'Image source rejected — expected local path or MiniMax CDN, got: ' + (isRelative ? firstUrl : (new URL(firstUrl).hostname || firstUrl)),
      };
    }

    return {
      success: true,
      images: data.images,
      model: data.model || 'image-01',
      prompt: data.prompt || prompt,
      request_id: data.request_id || null,
    };
  }

  /**
   * Generate multiple images.
   */
  async generateMultiple(prompt, opts = {}) {
    const n = Math.min(opts.n || 1, 4);
    const results = [];

    for (let i = 0; i < n; i++) {
      const result = await this.generate(prompt, { ...opts, n: 1 });
      results.push(result);
      if (i < n - 1) await new Promise(r => setTimeout(r, 500));
    }

    return results;
  }

  /**
   * Check if a model supports image generation.
   */
  isImageModel(modelId) {
    return modelId in IMAGE_MODELS;
  }

  /**
   * Get all available image models.
   */
  getAvailableModels() {
    return Object.values(IMAGE_MODELS);
  }

  /**
   * Get model info.
   */
  getModel(modelId) {
    return IMAGE_MODELS[modelId] || null;
  }
}

// ─── Convenience Functions ──────────────────────────────────────────────────

/**
 * Generate an image with default settings.
 *
 * Returns: { success, images?, error? }
 */
export async function generateImage(prompt, options = {}) {
  const svc = new ImageGenerationService(
    localStorage.getItem('ui_inspectore_token')
  );
  return svc.generate(prompt, options);
}
