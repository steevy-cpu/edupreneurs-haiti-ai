## 1. Mesures TTFB brutes

| Endpoint | Tentative 1 | Tentative 2 | Tentative 3 | Moyenne |
|----------|-------------|-------------|-------------|---------|
| `https://mon-edupreneur.com/` | 0.728844s | 0.613932s | 0.640441s | 0.661072s |
| `https://mon-edupreneur.com/dashboard` | 0.838255s | 0.823029s | 0.982299s | 0.881194s |
| `https://mon-edupreneur.com/assets/index-CJNUMaaK.js` | 0.772648s | 0.619009s | 0.517729s | 0.636462s |
| `https://mon-edupreneur.com/logo.png` | 0.636248s | 0.559941s | 0.726040s | 0.640743s |

Mesures détaillées landing:

```text
Attempt 1 — DNS: 0.041453s | Connect: 0.084641s | TLS: 0.127138s | TTFB: 0.728844s | Total: 0.739139s | Size: 11317 bytes
Attempt 2 — DNS: 0.002299s | Connect: 0.047286s | TLS: 0.084834s | TTFB: 0.613932s | Total: 0.622398s | Size: 11317 bytes
Attempt 3 — DNS: 0.002261s | Connect: 0.025922s | TLS: 0.093052s | TTFB: 0.640441s | Total: 0.653618s | Size: 11317 bytes
```

Asset JS détecté depuis le HTML:

```text
assets/index-CJNUMaaK.js
assets/react-core-DDpP164a.js
assets/supabase-1svEVe4i.js
```

Lecture rapide:
- Le HTML est lent.
- Le dashboard est encore plus lent.
- Le JS hashé et `logo.png` restent anormalement élevés pour des assets censés être servis très vite par CDN.

## 2. Headers critiques

### index.html
- Server: `cloudflare`
- Cache-Control: `no-cache, must-revalidate, max-age=0`
- Cache status: aucun `CF-Cache-Status`, `X-Vercel-Cache`, `X-Cache`
- Age: absent
- Content-Encoding: absent dans la réponse `HEAD`
- Strict-Transport-Security: `max-age=31536000; includeSubDomains`
- X-* custom:
  - `x-content-type-options: nosniff`
- Autres en-têtes visibles:
  - `referrer-policy: strict-origin-when-cross-origin`
  - cookie Cloudflare `__cf_bm`

Extrait:

```text
HTTP/2 200
content-type: text/html
cache-control: no-cache, must-revalidate, max-age=0
strict-transport-security: max-age=31536000; includeSubDomains
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
server: cloudflare
cf-ray: 9ef8c1698e549341-MIA
```

### Asset JS hashed
- Server: `cloudflare`
- Cache-Control: absent
- Cache status: aucun `CF-Cache-Status`, `X-Vercel-Cache`, `X-Cache`
- Age: absent
- Content-Encoding: absent dans la réponse `HEAD`
- Strict-Transport-Security: `max-age=31536000; includeSubDomains`
- X-* custom:
  - `x-content-type-options: nosniff`

Extrait:

```text
HTTP/2 200
content-type: text/javascript
etag: "0fa45ff1c6d76364d90e02bc7674d99a"
strict-transport-security: max-age=31536000; includeSubDomains
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
server: cloudflare
cf-ray: 9ef8c16cb8a738d3-MIA
```

### logo.png
- Server: `cloudflare`
- Cache-Control: absent
- Cache status: aucun `CF-Cache-Status`, `X-Vercel-Cache`, `X-Cache`
- Age: absent
- Content-Encoding: non applicable pour PNG
- Strict-Transport-Security: `max-age=31536000; includeSubDomains`
- X-* custom:
  - `x-content-type-options: nosniff`

Extrait:

```text
HTTP/2 200
content-type: image/png
etag: "6864acf973faf40849dde37fda681fe3"
strict-transport-security: max-age=31536000; includeSubDomains
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
server: cloudflare
cf-ray: 9ef8c170dc589aa6-MIA
```

## 3. Infrastructure détectée

- CDN: Cloudflare
- Région hébergement (IP): Cloudflare anycast, IP `185.158.133.1`, géolocalisée par `ipinfo` en Pologne (`Dźwirzyno`, `AS13335 Cloudflare, Inc.`)
- Distance Haïti → serveur: estimation non fiable côté origine réelle, car l’IP exposée est anycast Cloudflare. Le POP observé est `MIA` dans `cf-ray`, donc point d’entrée vraisemblablement Miami.
- Protocole: HTTP/2 confirmé

DNS:

```text
mon-edupreneur.com A 185.158.133.1
CNAME: aucun
```

Latence réseau pure:

```text
round-trip min/avg/max/stddev = 26.381/38.509/46.408/7.385 ms
```

Lecture rapide:
- Le réseau brut vers le POP Cloudflare est ~38.5 ms.
- Le TTFB HTML ~661 ms est donc majoritairement au-dessus de la latence transport.

## 4. Configuration locale

- Fichier `_headers` / `vercel.json` / `netlify.toml`: absents
- Service Worker PWA: actif
- Vite build output: `dist/` absent dans ce workspace

Lovable:

```text
./.lovable
.lovable/plan.md
```

Vite:

```text
13: cacheDir: "node_modules/.vite-edupreneurs-v4",
81: cache: false,
```

Service Worker:

```text
public/sw.js
src/main.tsx:41: navigator.serviceWorker.register('/sw.js')
index.html:8: <link rel="manifest" href="/manifest.webmanifest" />
```

Constats locaux:
- Aucun fichier repo ne définit des headers CDN/edge (`_headers`, `vercel.json`, `netlify.toml` absents).
- Le service worker ne peut pas expliquer le TTFB de première visite, car il s’enregistre après chargement.
- `public/sw.js` met en cache des assets et API après coup, utile pour réutilisation, pas pour le premier octet initial.

## 5. Edge Functions

- TTFB `indexnow-submit` (peu utilisée → cold): 351 ms, 304 ms, 263 ms, moyenne 306 ms
- TTFB `jude-ai-tutor` (souvent utilisée → warm): 491 ms, 311 ms, 267 ms, moyenne 356 ms
- Delta cold vs warm: environ 50 ms en moyenne, mais la première tentative Jude est la plus lente
- TTFB Supabase REST: 258 ms
- → Verdict: cold start confirmé NON de manière forte. Il existe un échauffement modéré sur la première requête, mais rien proche des ~660-880 ms observés côté site principal.

Détails:

```text
Edge func attempt 1 — TTFB: 0.351249s | Total: 0.351288s
Edge func attempt 2 — TTFB: 0.304101s | Total: 0.304154s
Edge func attempt 3 — TTFB: 0.263485s | Total: 0.263525s

Jude edge attempt 1 — TTFB: 0.491066s
Jude edge attempt 2 — TTFB: 0.310880s
Jude edge attempt 3 — TTFB: 0.267211s

Supabase REST — TTFB: 0.257886s
```

## 6. Benchmark comparatif

| Site | TTFB moyen |
|------|-----------|
| `mon-edupreneur.com` | 0.970167s |
| `google.com` | 0.249307s |
| `cloudflare.com` | 0.168448s |
| `vercel.com` | 0.232500s |
| `supabase.com` | 0.239245s |

Lecture rapide:
- `mon-edupreneur.com` est ~4x plus lent que les références majeures depuis la même machine.
- Le problème est spécifique à la chaîne de livraison du site, pas à la connexion locale.

## 7. DIAGNOSTIC

### Cause racine probable
Le TTFB élevé provient principalement d’un HTML non cacheable en edge combiné à une distribution Cloudflare qui ne semble pas servir efficacement les assets depuis un cache CDN observable.

### Causes secondaires
- `index.html` est explicitement servi avec `Cache-Control: no-cache, must-revalidate, max-age=0`.
- Les assets hashés et `logo.png` n’exposent ni `Cache-Control` longue durée, ni `Age`, ni `CF-Cache-Status`.
- La présence du cookie `__cf_bm` suggère un traitement Cloudflare Bot Management/WAF sur chaque requête.
- Aucun fichier de config repo ne définit les politiques de cache edge.
- Le service worker aide après chargement, mais pas au premier hit.
- La page dashboard subit probablement du routage SPA / fallback HTML avec le même coût que l’index, voire plus.

### Recommandations (par ordre d'impact)
1. Mettre en place un cache edge explicite pour `index.html` ou une stratégie ISR/HTML edge-cache contrôlée côté hébergeur/CDN — Gain TTFB estimé: `-250 à -450 ms`
2. Forcer des headers longs sur les assets hashés (`Cache-Control: public, max-age=31536000, immutable`) et sur `logo.png` — Gain TTFB estimé: `-150 à -350 ms` sur assets
3. Vérifier et réduire les règles Cloudflare Bot/WAF appliquées aux assets publics — Gain TTFB estimé: `-50 à -150 ms`
4. Ajouter une configuration de headers côté hébergement (`_headers`, `vercel.json`, ou config Lovable/Cloudflare`) au lieu de dépendre uniquement du comportement par défaut — Gain TTFB estimé: `-100 à -250 ms`
5. Pré-rendre ou mettre en cache edge la landing si elle est majoritairement statique — Gain TTFB estimé: `-200 à -400 ms`
6. Vérifier si l’origine derrière Cloudflare est géographiquement éloignée ou lente au moment de servir le HTML — Gain TTFB estimé: variable, `-50 à -200 ms`

### Changements requis (mais NON appliqués)
- Fichier à modifier: `public/_headers` ou équivalent hébergeur
- Type de changement: headers/cache
- Risque: faible

- Fichier à modifier: `vercel.json` ou `netlify.toml` ou config Lovable/Cloudflare externe
- Type de changement: edge/CDN routing + cache
- Risque: moyen

- Fichier à modifier: `vite.config.ts`
- Type de changement: optimisation build, éventuellement stratégie d’assets/manifest, mais impact indirect sur TTFB
- Risque: faible

- Fichier à modifier: `src/main.tsx`
- Type de changement: service worker registration strategy uniquement si besoin d’ajuster le caching post-load
- Risque: faible

- Fichier à modifier: configuration d’hébergement non versionnée dans ce repo
- Type de changement: cache HTML / bypass WAF sur assets publics
- Risque: moyen à élevé selon la plateforme
