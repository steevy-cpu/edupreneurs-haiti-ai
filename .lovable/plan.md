

## Plan: Grant Admin Access to bekerbeauchard@gmail.com

**User ID** (from auth logs): `12c484aa-e752-4253-8e01-48a3a12185e4`

### 1. Content Editor Admin
Insert a row into `content_editor_roles` with role `admin` for this user. Straightforward data operation.

### 2. Control Center Admin
The Control Center currently only allows access to founders (hardcoded UUIDs in `founderConstants.ts`). This user is not a founder. Two options:

**Option A — Quick fix**: Add this user's UUID to `FOUNDER_USER_IDS` in `founderConstants.ts`. Downside: they'll be treated as a founder everywhere (hidden from leaderboards, special profile display, bypass grade restrictions, etc.).

**Option B — Proper admin system** (recommended): Modify `useFounderCheck` and `ControlCenter.tsx` to also grant access to users who have `admin` role in `content_editor_roles`. This way, any content editor admin automatically gets Control Center access without being flagged as a founder.

The change would be small:
- **`useFounderCheck.ts`**: After checking `isFounder()`, also query `content_editor_roles` for an `admin` role. Return `true` if either condition matches.
- No database changes needed — reuses the existing `content_editor_roles` table.
- Founder-specific behaviors (leaderboard exclusion, etc.) remain separate and unaffected.

### Technical steps
1. Insert `content_editor_roles` row: user_id = `12c484aa-...`, role = `admin`
2. Update `useFounderCheck.ts` to also check `content_editor_roles` for admin role
3. Rename the hook's return value from `isFounder` to something like `isFounder || isAdmin` internally, keeping the same API shape

