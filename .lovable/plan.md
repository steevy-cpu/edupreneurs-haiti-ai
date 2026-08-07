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

## 4. Lovable-side options without a Supabase dashboard (rewritten, with evidence)

The Cloud UI does not expose JWT signing keys or the JWT secret, and the owner cannot flip that himself. Lovable does expose an agent-side tool, `supabase--migrate_signing_keys`, which I can run. Here is its description **verbatim**, as surfaced in my tool schema:

```text
Migrates a Lovable Cloud project's Supabase auth to asymmetric (ES256) JWT signing keys, which MCP OAuth
requires. Projects on the legacy symmetric HS256 secret have an empty JWKS, so Supabase refuses to sign the
OIDC ID token at /oauth/token and MCP sign-in fails with "HS256 is not supported for ID token signing".
Idempotent: a no-op when an asymmetric key is already active; otherwise activates an existing standby
asymmetric key, or imports the legacy secret (when the project has no keys) and then creates and activates a
new ES256 key. Existing HS256-signed sessions keep verifying until they expire. Applies when an MCP client
cannot complete OAuth against a Lovable Cloud project and supabase--debug_oauth_server or the JWKS endpoint
shows no asymmetric signing key. When the project has separate Test and Live databases, pass
environment=production: published-app MCP OAuth runs against the Live instance.
```

Input schema, verbatim: `{"properties":{},"required":[]}`.

- **a) Idempotency — stated by the tool, not my inference.** The word "Idempotent" and the "no-op when an asymmetric key is already active" clause are the tool's own text. My earlier plan asserted it without the quote; that was the defect you caught.
- **b) Legacy-token survival — stated by the tool, but with no stated window.** Verbatim: "Existing HS256-signed sessions keep verifying until they expire." It does **not** state a rotation window length, and it does not state whether the legacy secret is retained as an explicit verification-only key. **Assumption (labelled as such):** Supabase's standard rotation keeps the previous key in a `previously_used` state so already-issued tokens verify until their natural (~1h) expiry, after which refresh re-mints under ES256. I have **not** verified that for this project — treat the exact retention behaviour as **unknown**.
- **c) Parameters — none.** The declared input schema has no properties and no required fields: there is **no** `environment`, key-type, or confirmation flag I can pass, despite the description mentioning `environment=production`. That mismatch matters — **I cannot explicitly target Test vs Live**; the tool acts on whatever instance it resolves internally. Unknown, not assumed.

### Rollback path (Addition 2)

- **a) There is no revert tool on my side.** The Lovable tool surface exposes `supabase--migrate_signing_keys` only; there is no revert counterpart, and `supabase--configure_auth` does not cover signing keys. Reverting to HS256 is a Supabase dashboard/API operation. Since the owner has no dashboard access: **this change is effectively irreversible for him.**
- **b) Worst realistic failure mode:** newly issued tokens are ES256 while some component still expects HS256, breaking sign-in or session refresh for live students. Recovery would mean going through Lovable support to restore key state — not doable in-product by either of us, potentially hours of disruption for ~50 students. Lower-severity mode: existing sessions invalidate early and students must sign in again (annoying, self-healing).
- **c) Standby/previous key:** Supabase does maintain key states (`standby`, `in_use`, `previously_used`), and the tool's own text references "an existing standby asymmetric key". Promoting a key back is a dashboard/API action, so the same access constraint applies. **Unknown** whether the legacy HS256 secret is retained here in a promotable state.

**Consequence for scheduling:** run this in a low-traffic window (Haiti overnight), never mid-day.

### Verification checklist — all must pass before reconnecting the connector (Addition 3)

Run in order. Any FAIL stops the process and is reported before touching Claude.

0. **Pre-migration capture.** Mint and save a current HS256 access token + refresh token from the signed-in preview session. Pass = both saved and the access token returns 200 from `/auth/v1/user`. (Needed for steps 2-3.)
1. **JWKS publishes an asymmetric key.** `curl .../auth/v1/.well-known/jwks.json`. Pass = at least one key with `kty` `EC`/`RSA`/`OKP` and `alg: ES256`. Fail = `{"keys":[]}`.
2. **A pre-migration session still works — the load-bearing test for live students.** Replay the step-0 token: `GET /auth/v1/user` with that Bearer + `apikey`. Pass = 200, same user id. Fail = 401 → students mid-session were logged out; report immediately, do not proceed.
3. **Session refresh succeeds.** `POST /auth/v1/token?grant_type=refresh_token` with the saved refresh token. Pass = 200, new access token whose header decodes to `alg: ES256`, and that token returns 200 from `/auth/v1/user`.
4. **Fresh email/password sign-in.** `POST /auth/v1/token?grant_type=password` with a disposable test account. Pass = 200 with `access_token` + `refresh_token`, and the new token verifies at `/auth/v1/user`.
5. **RLS-protected read still scoped correctly.** With the step-4 token, run the exact query `get_my_profile` uses against `/rest/v1/profiles`. Pass = only that user's row, zero foreign rows. Fail = 401, 403, or any other user's data.
6. **Google OAuth sign-in.** Drive the published sign-in page with Playwright through the Google hand-off; with a test Google account, complete it. Pass = redirect back with a session and `/auth/v1/user` 200. Without a test account, the honest partial check is that `/auth/v1/authorize?provider=google` still 302s to `accounts.google.com` with a valid `state` — that proves provider config survived, **not** a full round-trip, and I will label it partial.

Only after 1-6 pass do we reconnect the connector in Claude and expect `tools/list` to return six tools.

### Pre-planned second failure mode: `requireOAuthClientClaim` (Addition 4)

`dist/cors-i00R-ohe.js:638-643`:

```js
/** Rejects copied app-session JWTs that were not issued to an OAuth client. */
...
if (auth.requireOAuthClientClaim !== false && !clientId) {
  throw new OAuthTokenError(401, "invalid_token", "OAuth client claim is required");
}
```

and `:664`: `clientId: stringClaim(claims, "client_id") ?? stringClaim(claims, "azp")`.

- **a) How we determine whether Claude's token carries `client_id`/`azp`:** after migration and a Claude reconnect attempt, pull `supabase--edge_function_logs` for `mcp`. This branch fails with `invalid_token` / "OAuth client claim is required", textually distinct from today's signature failure — that alone tells us which branch we are in, without printing any token. If the claim set must be inspected directly, decode the *unverified* payload and log only claim **names** plus presence/absence of `client_id`/`azp` — never the token, never `sub`.
- **b) The exact change if it is missing:** one line inside `auth.oauth.issuer({ ... })` in `src/lib/mcp/index.ts`: `requireOAuthClientClaim: false,`. What we give up is precisely the guard quoted above — the server would then accept **any** valid Supabase-issued user JWT, including a plain app-session token copied out of a student's browser localStorage, as a legitimate MCP caller. It stops being "only tokens minted for a registered OAuth client".
- **c) Acceptable for a platform holding minors' data? No — not as a first move.** It widens the accepted set from OAuth-client tokens to every app session token in existence, and a copied session token is exactly the leak path this product must assume. Better options, in order: (1) confirm Supabase's OAuth 2.1 authorization-code flow does stamp `client_id` — the managed server issues client-bound tokens, so the likely outcome is this branch never fires; (2) if it genuinely does not, treat it as a provider-side gap worth escalating rather than silently disabling the check; (3) only if forced, set the flag false **and** compensate inside every tool (reject in `src/lib/mcp/tools/*` unless `ctx.getClaims()` shows an OAuth-issued token shape) so the check moves rather than disappears. Plain removal with no compensation is not on the table.


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
