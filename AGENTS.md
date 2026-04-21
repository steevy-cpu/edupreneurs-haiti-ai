# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the Vite React app. Put route-level screens in `src/pages/`, reusable UI in `src/components/`, shared logic in `src/hooks/`, `src/contexts/`, `src/providers/`, and utilities in `src/utils/` and `src/lib/`. Feature-focused code can live under `src/features/`, while static assets belong in `src/assets/` or `public/`. Backend work lives in `supabase/functions/` for Edge Functions and `supabase/migrations/` for SQL changes. Use the real paths, not macOS metadata files such as `._*`.

## Build, Test, and Development Commands
Run `npm install` once after cloning. Use `npm run dev` to start the local Vite server, `npm run build` to produce the production bundle, `npm run build:dev` to test the development build profile, `npm run preview` to serve the built app locally, and `npm run lint` to check TypeScript and React lint rules. Example: `npm run lint && npm run build` before opening a PR.

## Coding Style & Naming Conventions
This codebase uses TypeScript, React 18, and the `@/*` import alias for `src/`. Follow the existing style: double quotes, semicolons, and PascalCase for components (`GiftPaymentSuccess.tsx`), camelCase for hooks/utilities (`useSubscription.ts`, `dateUtils.ts`), and descriptive folder names by domain. ESLint is configured in `eslint.config.js` with `@eslint/js`, `typescript-eslint`, `react-hooks`, and `react-refresh`; fix warnings before merging.

## Testing Guidelines
There is no dedicated automated test runner wired into `package.json` yet. Treat `npm run lint` and `npm run build` as the minimum validation for every change. For features touching routing, auth, payments, or Supabase calls, add a short manual test note in the PR describing the path exercised, expected result, and any edge cases checked.

## Commit & Pull Request Guidelines
Recent history mixes conventional commits (`security: ...`, `chore: ...`) with brief fix-oriented messages. Prefer concise, scoped subjects in the imperative mood, for example `fix: restore OAuth redirect flow` or `chore: remove debug logs`. PRs should include a clear summary, linked issue or task when applicable, screenshots for UI changes, and notes for schema, env var, or Edge Function updates.

## Security & Configuration Tips
Keep secrets out of the repo. Frontend variables should use `VITE_` prefixes in local env files, while server-side secrets belong in Supabase project secrets. Review `README.md`, `ARCHITECTURE.md`, and `DATABASE.md` before making structural changes to routing, data access, or migrations.
