# MCP connector returns zero tools — diagnosis

## Section 1 — Edge function logs (`mcp`)

The function serving `/functions/v1/mcp` is `supabase/functions/mcp` (auto-generated from `src/lib/mcp/index.ts`; entry at `supabase/functions/mcp/index.ts:250` — `Deno.serve(createSupabaseHandler(mcp_default, { functionName: "mcp" }))`).

a) **The log query returns nothing at all**: `No logs found for edge function 'mcp'`. No `initialize`, no `tools/list`, no `OPTIONS`, no status lines.

b) No raw lines to quote — the log stream is empty.

c) Because of that, logs alone cannot distinguish gateway rejection from a routing problem. So I issued live unauthenticated probes against the deployed endpoint instead. Those show our handler **is** running:

- `POST /functions/v1/mcp` (initialize, `Accept: application/json, text/event-stream`) → `HTTP/2 401`, body `{"error":"unauthorized"}`, with
  `www-authenticate: Bearer realm="mcp", resource_metadata="https://<ref>.supabase.co/functions/v1/mcp/.well-known/oauth-protected-resource"`
  and `access-control-expose-headers: WWW-Authenticate, Mcp-Session-Id, Mcp-Protocol-Version`.
  A bare gateway 401 would carry none of those headers — this is the SDK's own OAuth challenge.
- `POST` `tools/list` unauthenticated → same 401 challenge.
- `OPTIONS` preflight → `HTTP/2 204`, `access-control-allow-headers: Authorization, Content-Type, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID`, `access-control-allow-methods: POST, OPTIONS`.
- `GET /functions/v1/mcp/.well-known/oauth-protected-resource` → `HTTP/2 200`
  `{"resource":".../functions/v1/mcp","authorization_servers":["https://<ref>.supabase.co/auth/v1"],"bearer_methods_supported":["header"],"resource_name":"edupreneurs-haiti-ai"}`

Conclusion for this section: requests reach our code; the empty log view is a log-surfacing gap, not evidence of gateway blocking.

## Section 2 — Function source

a) **Protocol.** The JSON-RPC layer (`initialize`, `notifications/initialized`, `tools/list`, `tools/call`) lives inside `@lovable.dev/mcp-js@0.26.1`'s `createSupabaseHandler`, not in our file, so the advertised `protocolVersion` string is not visible in project source. The tool list is static, built from the `tools:` array at `supabase/functions/mcp/index.ts:245` (six tools: `get_my_profile`, `list_subjects`, `list_lessons`, `get_lesson`, `list_my_completed_lessons`, `get_word_of_the_day`), mirrored in `.lovable/mcp/manifest.json`. It cannot legitimately come back empty — an empty tool list in the client means `tools/list` never returned 200, not that the array is empty.

b) **Transport.** Streamable HTTP via the SDK handler; the OPTIONS response allows only `POST, OPTIONS` and exposes `Mcp-Session-Id` / `Mcp-Protocol-Version`, and `Last-Event-ID` is allowlisted (SSE resume). The `Accept: application/json, text/event-stream` header was sent in my probe and was not the cause of the 401.

c) **Auth.** `supabase/functions/mcp/index.ts:241-244` — `auth.oauth.issuer({ issuer: "https://xdyavylcmucjpueybdku.supabase.co/auth/v1", acceptedAudiences: "authenticated" })`. With no bearer token the handler returns the 401 + `WWW-Authenticate` challenge shown above. Each tool additionally guards with `ctx.isAuthenticated()` (e.g. `:68`, `:96`, `:126`) and queries through `supabaseForUser(ctx)` (`:51-58`), which forwards the user's token so RLS applies.

d) **CORS/OPTIONS.** Handled, 204, and both `Mcp-Session-Id` and `Mcp-Protocol-Version` **are** in `access-control-allow-headers`. Not the cause.

## Section 3 — Config

`supabase/config.toml:249-253` has the block:

```
[functions.mcp]
verify_jwt = false
```

It is present and correct, and the live probes confirm it took effect (our handler, not the gateway, produced the 401).

## Actual cause vs. merely suspicious

**Actual cause (high confidence): the project's auth still uses legacy symmetric (HS256) signing keys, so the resource server cannot verify any access token.**

```
GET https://xdyavylcmucjpueybdku.supabase.co/auth/v1/.well-known/jwks.json
→ {"keys":[]}
```

The authorization-server metadata is otherwise healthy (authorize, token, and `oauth/clients/register` endpoints all present, so OAuth 2.1 + dynamic client registration are enabled). `auth.oauth.issuer` verifies bearer tokens against that JWKS. With zero published keys, **every** authenticated request fails verification and returns the same 401 challenge — which is exactly the observed behaviour: Claude completes registration/consent and shows "connected", then its `tools/list` 401s and it renders zero tools.

Merely suspicious, ruled out:
- Gateway JWT rejection — ruled out, `verify_jwt = false` is in place and our handler answers.
- CORS / missing `mcp-session-id`, `mcp-protocol-version` allowlist — ruled out, both allowed.
- Empty/dynamic tool array — ruled out, the list is static with six tools.
- Empty logs — a log-surfacing gap; the probes substitute for it.

## Proposed fix (not applied — diagnosis only)

1. Migrate the project's auth signing keys to asymmetric (ECC/RSA) so `/auth/v1/.well-known/jwks.json` publishes a key. This is the single blocking change and is a project auth setting, not code.
2. Re-run the unauthenticated probes (expect unchanged 401 challenge), then reconnect the connector in Claude and confirm `tools/list` returns the six tools.
3. If tools still do not appear after the key migration, capture the token Claude presents and check the `client_id` claim (`requireOAuthClientClaim` defaults to true) before touching any tool code.
