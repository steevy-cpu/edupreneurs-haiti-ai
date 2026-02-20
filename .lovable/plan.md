

# Replace 'Utilisateur' Fallbacks Across Frontend

## Scope
19 instances across 13 files. Two patterns applied by context.

## Pattern A — Own user context
`nickname ?? full_name?.split(' ')[0] ?? 'toi'`

| # | File | Line | Current | New |
|---|------|------|---------|-----|
| 1 | `src/pages/Settings.tsx` | 536 | `profile?.nickname \|\| "Utilisateur"` | `profile?.nickname ?? profile?.full_name?.split(' ')[0] ?? 'toi'` |
| 2 | `src/components/shared/QuickMessageFAB.tsx` | 106 | `profile?.nickname \|\| "Utilisateur"` | `profile?.nickname ?? profile?.full_name?.split(' ')[0] ?? 'toi'` |
| 3 | `src/pages/Affiliations.tsx` | 130 | `profile?.full_name \|\| "Utilisateur"` | `profile?.full_name ?? 'Étudiant'` |
| 4 | `src/pages/Affiliations.tsx` | 131 | `profile?.nickname \|\| "utilisateur"` | `profile?.nickname ?? 'etudiant'` |

**Note on Affiliations lines 130-131:** These are actually referral data (other users who signed up via the current user's link), so they show *other* users. Correcting to Pattern B instead. See below.

## Pattern B — Other user context
`nickname ?? full_name ?? 'Étudiant'`

| # | File | Line | Current | New |
|---|------|------|---------|-----|
| 3 | `src/pages/Affiliations.tsx` | 130 | `profile?.full_name \|\| "Utilisateur"` | `profile?.full_name ?? 'Étudiant'` |
| 4 | `src/pages/Affiliations.tsx` | 131 | `profile?.nickname \|\| "utilisateur"` | `profile?.nickname ?? 'étudiant'` |
| 5 | `src/pages/Affiliations.tsx` | 342 | `referral.profiles?.full_name \|\| "Utilisateur"` | `referral.profiles?.full_name ?? 'Étudiant'` |
| 6 | `src/pages/Affiliations.tsx` | 344 | `referral.profiles?.nickname \|\| "utilisateur"` | `referral.profiles?.nickname ?? 'étudiant'` |
| 7 | `src/pages/Feed.tsx` | 896 | `comment.profile?.nickname \|\| "Utilisateur"` | `comment.profile?.nickname ?? comment.profile?.full_name ?? 'Étudiant'` |
| 8 | `src/pages/Feed.tsx` | 1083 | `post.profile?.full_name \|\| "Utilisateur"` | `post.profile?.full_name ?? post.profile?.nickname ?? 'Étudiant'` |
| 9 | `src/pages/Notifications.tsx` | 233 | `nickname: "Utilisateur inconnu"` | `nickname: "Étudiant"` |
| 10 | `src/pages/Notifications.tsx` | 234 | `full_name: "Utilisateur inconnu"` | `full_name: "Étudiant"` |
| 11 | `src/components/feed/PostCard.tsx` | 141 | `post.profile?.full_name \|\| "Utilisateur"` | `post.profile?.full_name ?? post.profile?.nickname ?? 'Étudiant'` |
| 12 | `src/components/community/ConversationSidebar.tsx` | 161 | `conv.otherUser?.nickname \|\| conv.otherUser?.full_name \|\| "Utilisateur"` | `conv.otherUser?.nickname ?? conv.otherUser?.full_name ?? 'Étudiant'` |
| 13 | `src/components/community/ChatViewHeader.tsx` | 91 | `conversation?.otherUser?.nickname \|\| conversation?.otherUser?.full_name \|\| "Utilisateur"` | `conversation?.otherUser?.nickname ?? conversation?.otherUser?.full_name ?? 'Étudiant'` |
| 14 | `src/components/community/ConversationListItem.tsx` | 94 | `conv.otherUser?.nickname \|\| conv.otherUser?.full_name \|\| "Utilisateur"` | `conv.otherUser?.nickname ?? conv.otherUser?.full_name ?? 'Étudiant'` |
| 15 | `src/components/content-editor/RoleManagement.tsx` | 267 | `editor.profiles?.full_name \|\| editor.profiles?.nickname \|\| 'Utilisateur'` | `editor.profiles?.full_name ?? editor.profiles?.nickname ?? 'Étudiant'` |
| 16 | `src/components/content-editor/LessonComments.tsx` | 71 | `nickname: 'Utilisateur'` | `nickname: 'Étudiant'` |
| 17 | `src/components/ebook/EbookComments.tsx` | 149 | `comment.profile?.nickname \|\| 'Utilisateur'` | `comment.profile?.nickname ?? 'Étudiant'` |
| 18 | `src/hooks/useCommunityData.ts` | 106 | `full_name: "Utilisateur"` | `full_name: "Étudiant"` |

## Pattern A (own user) — Final list

| # | File | Line | New |
|---|------|------|----|
| 1 | `src/pages/Settings.tsx` | 536 | `profile?.nickname ?? profile?.full_name?.split(' ')[0] ?? 'toi'` |
| 2 | `src/components/shared/QuickMessageFAB.tsx` | 106 | `profile?.nickname ?? profile?.full_name?.split(' ')[0] ?? 'toi'` |

## Edge function (special case)

| # | File | Line | New |
|---|------|------|----|
| 19 | `supabase/functions/eric-chat/index.ts` | 116 | `profileMap.get(msg.sender_id) \|\| 'Étudiant'` |

## Total: 19 instances across 13 files

## Technical notes
- Switching from `\|\|` to `??` where appropriate: `??` only falls through on `null`/`undefined`, not empty string. This is correct here since DB values are `null` when unset, not empty string.
- QuickMessageFAB line 106 is showing other users in conversation list, but the user asked for Pattern A there. Will follow the user's instruction.
- No database changes, no new imports, no bundle impact.

## Safety Verification

| Check | Status |
|---|---|
| Existing functionality preserved | Yes -- only fallback strings change |
| Auth services (items 19-32) untouched | Yes |
| Edge functions untouched except eric-chat L116 | Yes |
| RLS impact | None |
| Bundle size | No change |
| 3G performance | No change |

