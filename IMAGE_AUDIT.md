# Image Generation Pipeline Audit — 2026-07-23

## Architecture

```
Frontend                    Backend (Laravel)              External
───────────────────────────────────────────────────────────────────────
AIChatPage
  generateImage()
    ↓
ImageService (NEW) ────────────────────────────────────────────────────
  .generate(prompt, opts)                                             
    ↓                                                                 
  Pollinations URL ────────── <img src="..."> (direct, no proxy)      
  (https://image.pollinations.ai/prompt/...)                          
                                                                     │
AIRedesignPage                                                         
  generateAIPreview() ───→ ImageService ──────────────────────────────
                                                                     │
Backend API ──────────────────────────────────────────────────────────
  POST /api/ai/image ──→ AIChatController::image() ──→ OpenAIProvider::image()
       │                   (provider=openai)          (falls back to Pollinations if no key)
       │
       └─→ Pollinations URL returned
```

## Pipeline Verification

| Component | Status | Notes |
|---|---|---|
| Chat (OpenClaw/MiniMax) | ✅ Working | Text chat via gateway |
| Image Generation (Pollinations) | ✅ Working | Free, no API key |
| ImageService (shared) | ✅ Created | `src/services/ImageService.js` |
| AIChatPage → ImageService | ✅ Fixed | Uses Pollinations directly |
| AIRedesignPage → ImageService | ✅ Fixed | Uses shared service |
| Image display in `<img>` | ✅ Fixed | Pollinations URLs work directly |
| Model validation | ✅ Implemented | Only image-capable models |
| Error handling | ✅ Improved | Meaningful error messages |
| Loading states | ✅ Implemented | `imageGenerating` state |

## ImageService API

```javascript
import { ImageGenerationService } from '../services/ImageService';

const svc = new ImageGenerationService(token);

// Generate one image
const result = await svc.generate('a sunset', { size: '1024x1024' });
// → { imageUrl: 'https://image.pollinations.ai/prompt/...', model: 'Pollinations AI (Free)', seed: 12345, ... }

// Generate multiple variants
const results = await svc.generateMultiple('a dashboard', { n: 3 });

// Check if model supports images
svc.isImageModel('dall-e-3'); // true
svc.isImageModel('gpt-4o');   // false
```

## Key Design Decisions

1. **Pollinations is the default** — Free, reliable, works without any API key
2. **Direct URL in `<img>` src** — No proxy needed; Pollinations returns proper CORS headers
3. **Backend `/api/ai/image` still available** — For cases where you need OpenAI DALL-E with a key
4. **Shared service** — All image features (AI Chat, AI Redesign) use the same ImageService

## Environment Variables

```
# OpenClaw gateway (for chat)
OPENCLAW_GATEWAY_TOKEN=c11301b2d79af120e1a150539bb2ab0b50d999d1a302a810

# OpenAI (for DALL-E — optional, Pollinations is the free fallback)
OPENAI_API_KEY=sk-...  # NOT set — using Pollinations
```

## Testing

```bash
# Chat (MiniMax)
curl -X POST "http://uiinspectore.167.233.101.27.nip.io/api/ai/chat/ui" \
  -H "Content-Type: application/json" \
  -d '{"provider":"openclaw","model":"openclaw","messages":[{"role":"user","content":"hi"}],"max_tokens":20}'

# Image generation
curl -X POST "http://uiinspectore.167.233.101.27.nip.io/api/ai/image" \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","prompt":"a server dashboard","size":"1024x1024"}'

# Direct Pollinations
curl -s -I "https://image.pollinations.ai/prompt/a%20cat?width=100&height=100"
```
