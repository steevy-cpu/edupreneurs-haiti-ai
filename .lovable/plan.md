# MCP zero-tools — package-level investigation (read-only)

## 1. Auth strategies exported by `@lovable.dev/mcp-js@0.26.1`

`node_modules/@lovable.dev/mcp-js/dist/index.d.ts:51-56`:

```ts
declare const auth: Readonly<{
  oauth: Readonly<{
    issuer: typeof issuer;
  }>;
}>;
```

**`auth.oauth.issuer` is the only strategy the package exports.** Signature (`index.d.ts:50`): `declare function issuer(options: IssuerOAuthOptions): McpAuthConfig`. It verifies bearer JWTs against the issuer's JWKS.

- a) **Symmetric / HS256 verifier — does not exist, and is explicitly forbidden.** `dist/index.js:24`:
  `if (/^HS\d+$/i.test(algorithm) || algorithm.toLowerCase() === "none") throw new Error(`@lovable.dev/mcp-js: auth.algorithms cannot include "${algorithm}"; this verifier is JWKS-only`);`
  There is no `secret` option anywhere in the auth types.
- b) **Custom verifier hook — does not exist.** No `verify`, `verifyToken`, `validate`, or callback field exists in `IssuerOAuthOptionsBase` (`index.d.ts:21-33`) or `McpAuthConfig` (`dist/types-C0Wgm9zp.d.ts:45-85`). There is no way to hand the SDK our own async token validator, so the "call `supabase.auth.getUser(token)` ourselves" idea is not expressible through the package.
- c) **No-auth / public mode — exists**, by omitting `auth`: `readonly auth?: McpAuthConfig;` (`types-C0Wgm9zp.d.ts:300`). That makes every tool unauthenticated (`ctx.getToken()` returns nothing), which is unusable here — all six tools read per-student RLS data.
- d) **Static bearer token / API-key mode — does not exist.**

## 2. Every `auth.oauth.issuer` option

`dist/index.d.ts:20-48` and `dist/types-C0Wgm9zp.d.ts:45-85`:

| Option | Type | Default / behaviour |
| --- | --- | --- |
| `issuer` | `string` (required) | Discovery + `iss` check (`iss` accepted with or without trailing slash, `cors-i00R-ohe.js:594`) |
| `acceptedAudiences` / `resource` | `string \| readonly string[]` (one required) | Audience acceptance policy |
| `jwksUri` | `string` | **Exists.** Optional override; must be HTTPS (`index.js:37`). Defaults to the issuer's discovered `jwks_uri`. Still JWKS-only — cannot help an HS256 project. |
| `algorithms` | `readonly string[]` | Defaults to `DEFAULT_JWT_ALGORITHMS` (asymmetric). HS* and `none` rejected at construction. |
| `requireOAuthClientClaim` | `boolean` | **Default true.** `cors-i00R-ohe.js:638-643`: rejects any token lacking `client_id`/`azp` — "Rejects copied app-session JWTs that were not issued to an OAuth client." |
| `acceptResourceClaim` | `boolean` | Default true (`types:65-72`) |
| `accessTokenTyp` | `readonly string[]` | Defaults to `["at+jwt","JWT"]` |
| `clockToleranceSeconds` | `number` | `DEFAULT_CLOCK_TOLERANCE_SECONDS` |
| `requiredScopes` | `readonly string[]` | Unset (correct for Supabase) |
| `resourceName`, `resourceDocumentation`, `protectedResourceMetadataUrl` | `string` | Metadata only |

No `secret`, no `verify`, no `verifyToken`.

## 3. Custom-verifier code sketch

Not applicable — item 1b does not exist in the package, so there is no auth block to write. I am not proposing an approximation (e.g. moving `getUser(token)` into each tool handler) because with `auth` omitted `ctx.getToken()` returns nothing and `supabaseForUser(ctx)` (`src/lib/mcp/supabase.ts:60-67`) has no token to forward; the raw bearer never reaches tool code in public mode.

## 4. Lovable-side options without a Supabase dashboard

The Cloud UI does not expose JWT signing keys or the JWT secret, and the owner cannot flip that himself. **But the migration does not need him or the dashboard** — Lovable exposes an agent-side tool, `supabase--migrate_signing_keys`, that migrates this project's auth to asymmetric ES256 keys (idempotent; existing HS256 sessions keep verifying until they expire). So the fix is fully actionable from here, just not from his side. My previous "you must migrate keys in the dashboard" framing was wrong about who can do it.

## 5. Diagnosis re-verified with a real user token

Minted from the live preview session (`LOVABLE_BROWSER_AUTH_STATUS=injected`):

- Token header: `{"alg":"HS256","typ":"JWT"}`
- Claims: `iss=https://xdyavylcmucjpueybdku.supabase.co/auth/v1`, `aud=["authenticated"]`, `role=authenticated`, `client_id=null`, `azp=null`

`POST /functions/v1/mcp` with `{"jsonrpc":"2.0","id":2,"method":"tools/list"}` and that Bearer token:

```
STATUS 401
WWW-Authenticate: Bearer realm="mcp", resource_metadata=".../.well-known/oauth-protected-resource",
                  error="invalid_token", error_description="Invalid access token"
{"error":"unauthorized"}
```

**It 401'd with a valid user token — token verification is confirmed as the failing step.** It did not return the six tools. Two independent reasons, in order of firing:
1. The token is HS256 and JWKS is empty (`{"keys":[]}`), so `jwtVerify` cannot verify it at all — and the SDK refuses HS* by design.
2. Even if it verified, `client_id`/`azp` are null and `requireOAuthClientClaim` defaults to true, so a plain app-session JWT is rejected. A real OAuth-client token from Claude's flow would carry `client_id`, so this second reason applies only to my probe, not to Claude.

Ruled out earlier and still ruled out: gateway `verify_jwt` (`supabase/config.toml:249-253` sets it false, and our handler answers), CORS/`Mcp-Session-Id`/`Mcp-Protocol-Version` allowlist, and an empty tool array (static six at `supabase/functions/mcp/index.ts:245`).

## Recommended next action (not applied)

Run `supabase--migrate_signing_keys` (production environment) from the Lovable side, re-check that `/auth/v1/.well-known/jwks.json` publishes an ES256 key, then reconnect the connector in Claude and confirm `tools/list` returns six tools. No change to `src/lib/mcp/**` is warranted — no code-only workaround exists in this package version.
