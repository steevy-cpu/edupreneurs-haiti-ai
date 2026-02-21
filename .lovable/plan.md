

# Deletion Plan A: Harden Account Deletion Flow

## Overview
Three surgical fixes to the account deletion flow: protect founder accounts from self-deletion, add password re-entry confirmation on the Settings page, and clean up orphaned storage files before deletion.

---

## Fix 1 -- Protect founder accounts in self-delete

**File:** `supabase/functions/delete-user-account/index.ts`

The `admin-delete-user-account` already protects founders (Steevy + Djood) via its `PROTECTED_USER_IDS` array. The self-delete function only protects the Jude AI account.

**Change:** Add founder UUIDs to the existing `PROTECTED_USER_IDS` array at line 177, matching the admin function:

```
const PROTECTED_USER_IDS = [
  '68f2f959-e14a-47f9-8277-07df3a6fcd79', // Jude AI
  '0de08330-4183-48f9-b169-19b92f4d114f', // Steevy (founder)
  '7580cd10-e18c-4b2f-ac50-def28d046c9d', // Djood (founder)
];
```

Update the error response at line 179-181 to return a 403 with the French message:
```
return new Response(
  JSON.stringify({ error: 'Les comptes fondateurs ne peuvent pas être supprimés via cette interface. Contactez le support technique.' }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
);
```

---

## Fix 2 -- Add password re-entry confirmation to Settings page

**File:** `src/pages/Settings.tsx`

**New state variables:**
- `showPasswordConfirm` (boolean) -- controls the second Dialog
- `deletePassword` (string) -- password input value
- `deleteVerifying` (boolean) -- loading state for password check

**Flow change:**
1. Existing AlertDialog "Oui, supprimer mon compte" button no longer calls `handleDeleteAccount` directly
2. Instead it sets `showPasswordConfirm = true`
3. A new Dialog appears with:
   - Title: "Confirmation de suppression"
   - Password input with label "Entrez votre mot de passe pour confirmer"
   - "Confirmer la suppression" button (destructive) and "Annuler" button
4. On confirm: call `supabase.auth.signInWithPassword({ email: user.email, password })` to verify
5. If password wrong: toast error "Mot de passe incorrect. Suppression annulee." and abort
6. If password correct: call existing `handleDeleteAccount()`
7. On cancel/close: clear password input and close dialog

**New imports needed:** `Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter` (already available in the project).

---

## Fix 3 -- Clean up orphaned storage files on deletion

**File:** `supabase/functions/delete-user-account/index.ts`

After the farewell email block (line 222) and before the `deleteUser()` call (line 225), add storage cleanup:

```typescript
// Clean up user storage files before account deletion
// Wrapped in try/catch -- storage cleanup failure must NOT block deletion
try {
  const { data: avatarFiles } = await supabaseAdmin.storage
    .from('avatars')
    .list(user.id);
  
  if (avatarFiles && avatarFiles.length > 0) {
    const filePaths = avatarFiles.map(f => `${user.id}/${f.name}`);
    const { error: storageError } = await supabaseAdmin.storage
      .from('avatars')
      .remove(filePaths);
    
    if (storageError) {
      console.error('Storage cleanup error:', storageError);
    } else {
      console.log(`Cleaned up ${filePaths.length} avatar files for user ${user.id}`);
    }
  }
} catch (storageCleanupError) {
  console.error('Storage cleanup failed (non-blocking):', storageCleanupError);
}
```

This lists all files in the user's avatar folder, then removes them in one batch call. The entire block is wrapped in try/catch so storage API failures never prevent account deletion.

---

## Files touched (2 total)

| File | Change type |
|------|------------|
| `supabase/functions/delete-user-account/index.ts` | UPDATE -- add founder protection + storage cleanup |
| `src/pages/Settings.tsx` | UPDATE -- add password re-entry Dialog before deletion |

---

## Technical details

### Settings.tsx state additions
```typescript
const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
const [deletePassword, setDeletePassword] = useState('');
const [deleteVerifying, setDeleteVerifying] = useState(false);
```

### Password verification function
```typescript
const handlePasswordVerifyAndDelete = async () => {
  if (!deletePassword.trim()) {
    toast.error("Veuillez entrer votre mot de passe");
    return;
  }
  setDeleteVerifying(true);
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: deletePassword,
    });
    if (error) {
      toast.error("Mot de passe incorrect. Suppression annulée.");
      return;
    }
    setShowPasswordConfirm(false);
    setDeletePassword('');
    await handleDeleteAccount();
  } catch {
    toast.error("Erreur de vérification. Réessayez.");
  } finally {
    setDeleteVerifying(false);
  }
};
```

---

## Safety verification

| Check | Status |
|-------|--------|
| No DB changes | Correct |
| No new dependencies | Correct |
| RLS unaffected | Correct |
| Rate limiting unchanged | Correct |
| Existing email templates unchanged | Correct |
| Storage cleanup non-blocking | Correct -- wrapped in try/catch |
| Password never logged or stored | Correct -- cleared on cancel/close |
| Founder IDs match founderConstants.ts | Correct -- same two UUIDs |
| 3G performance impact | None -- Dialog is lightweight, password check is a single auth call |

