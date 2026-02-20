

# Community Plan C — Technical Debt Cleanup

## Overview

Two targeted fixes: replace the `doc:` encoding hack with proper database columns, and delete the dead `useCommunityData` hook. No changes to Plan A or Plan B code.

---

## Fix 1 — Replace Document Sharing Hack

### 1a. Database migration

```sql
ALTER TABLE messages ADD COLUMN IF NOT EXISTS document_url text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS document_name text;

-- Safety net: migrate any existing doc: encoded messages (currently 0 rows)
UPDATE messages
SET document_name = split_part(image_url, ':', 2),
    document_url  = substring(image_url FROM position(':' IN substring(image_url FROM position(':' IN image_url) + 1)) + position(':' IN image_url) + 1),
    image_url     = NULL
WHERE image_url LIKE 'doc:%';
```

### 1b. Type update

**File:** `src/types/community.ts`

Add to the `Message` interface:
```typescript
document_url?: string | null;
document_name?: string | null;
```

### 1c. Frontend — sending documents

**File:** `src/pages/Community.tsx` (lines 1514-1528)

Replace the `doc:` encoding at line 1515:
```typescript
// Before:
imageUrl = `doc:${currentMediaFile.name}:${publicUrl}`;

// After:
documentUrl = publicUrl;
documentName = currentMediaFile.name;
```

Update the insert payload (lines 1520-1528) to include `document_url` and `document_name` instead of encoding into `image_url`. Add two variables (`documentUrl`, `documentName`) initialized to `null` alongside `imageUrl` and `videoUrl`.

### 1d. Frontend — displaying documents

**File:** `src/components/community/MessageBubble.tsx` (lines 222-230, 242, 253, 268, 297)

Replace the `doc:` parsing block (lines 222-230):
```typescript
// Before:
const isDocument = message.image_url?.startsWith('doc:');
const documentInfo = isDocument ? (() => { ... })() : null;

// After:
const isDocument = !!message.document_url;
const documentInfo = isDocument ? {
  name: message.document_name || 'Document',
  url: message.document_url!,
} : null;
```

All downstream references to `isDocument` and `documentInfo` (lines 242, 253, 268-294, 297) remain identical since the variable shape is unchanged. The rendering UI stays exactly the same.

---

## Fix 2 — Delete Dead Hook

**File:** `src/hooks/useCommunityData.ts`

Delete entirely. Confirmed zero imports anywhere in the codebase. Both `useCommunityData` and `usePrefetchCommunity` exports are unused.

---

## Files Changed

| File | Change |
|---|---|
| Database migration | Add `document_url` and `document_name` columns, migrate any `doc:` rows |
| `src/types/community.ts` | Add `document_url` and `document_name` to Message interface |
| `src/pages/Community.tsx` | Replace `doc:` encoding with direct column assignment in insert payload |
| `src/components/community/MessageBubble.tsx` | Replace `doc:` string parsing with direct column reads |
| `src/hooks/useCommunityData.ts` | Delete file |

## Safety Verification

| Check | Status |
|---|---|
| Document upload still works (upload to storage, insert with new columns) | Yes -- same storage flow, new columns in payload |
| Document display still works (filename, download button, styling) | Yes -- same `documentInfo` shape, different data source |
| `doc:` parsing code fully removed from MessageBubble.tsx | Yes -- replaced with direct column reads |
| `doc:` encoding code fully removed from Community.tsx | Yes -- replaced with separate column assignment |
| Existing 844 messages unaffected (new columns default to null) | Yes -- `IF NOT EXISTS` + null defaults |
| `useCommunityData.ts` deleted with no broken imports | Yes -- zero references confirmed |
| No conflicts with Plan A or B changes | Correct -- different code paths |
| No new dependencies | Correct |

