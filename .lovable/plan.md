

## Plan: Grant Admin Access to Rose Medjina Joseph

**User found:** Rose Medjina Joseph — `user_id: a72154dd-97ae-4dfe-a939-b48ecc7764fb`, nickname: "Rose"

### What "same access as Steevy" means

Steevy has **two layers** of access:

1. **Founder status** (hardcoded in `src/lib/founderConstants.ts`) — grants:
   - Control Center access
   - Analytics access
   - Hidden from leaderboards
   - Bypass grade restrictions (Super User)
   - Sidebar shows admin section

2. **Admin role** in `content_editor_roles` table — grants:
   - Full Content Editor access (create, edit, delete, publish lessons/blog)
   - Role management (grant/revoke editor roles)

### Changes required

**1. Add Rose to `FOUNDER_USER_IDS`** in `src/lib/founderConstants.ts`
- Add `'a72154dd-97ae-4dfe-a939-b48ecc7764fb'` with comment `// Rose`

**2. Add Rose to the `is_founder()` database functions**
- Two SQL functions (`is_founder()` and `is_founder(uuid)`) hardcode founder UUIDs — Rose's ID must be added to both via a migration

**3. Insert admin role in `content_editor_roles`**
- `INSERT INTO content_editor_roles (user_id, role, granted_by)` with Rose's user_id, role `admin`, granted by Steevy's ID

### Impact
- Rose will see the Control Center and Analytics links in the sidebar
- Rose will have full Content Editor permissions (create, edit, delete, publish, manage roles)
- Rose will be hidden from public leaderboards (founder behavior)
- Rose will bypass grade restrictions as a Super User

