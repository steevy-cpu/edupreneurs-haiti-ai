

# Switch Avatar Generation to OpenAI DALL-E 3

## Why
The Lovable AI Gateway Gemini image models are returning persistent 500 errors. The `OPENAI_API_KEY` is already configured as a secret, so we can switch to DALL-E 3 with no secret setup needed.

## Single File Change

**`supabase/functions/generate-custom-avatar/index.ts`**

### Remove
- The `tryGenerateImage()` helper function (lines 8-23)
- `LOVABLE_API_KEY` env read and check (lines 89-92)
- Primary/fallback model constants and Gemini gateway calls (lines 127-137)
- Gemini-specific response parsing (`choices[0].message.images[0].image_url.url`)

### Add
- Read `OPENAI_API_KEY` from `Deno.env`
- Single `fetch` to `https://api.openai.com/v1/images/generations` with:
  - `Authorization: Bearer ${OPENAI_API_KEY}`
  - Body: `{ model: "dall-e-3", prompt, n: 1, size: "1024x1024", quality: "standard", response_format: "url" }`
- Extract `data[0].url` from response

### Keep unchanged
- Zod input validation schema
- JWT authentication check
- Rate limiting (RESOURCE_INTENSIVE)
- Prompt construction logic (same detailed prompt text)
- Response shape: `{ success: true, imageUrl: string }`
- CORS and security headers
- Error handling for 429 (rate limit) and generic errors
- The 402 check can be removed (OpenAI uses different error codes)

### Post-deploy
- Deploy the function
- Test with a sample invocation to confirm it works

## Safety

| Check | Status |
|---|---|
| Frontend changes? | None |
| Database changes? | None |
| New secrets needed? | No -- OPENAI_API_KEY already exists |
| Response shape preserved? | Yes |
| Auth/rate limiting preserved? | Yes |
| Prompt logic preserved? | Yes |
| Fallback UI preserved? | Yes -- frontend unchanged |

