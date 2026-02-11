
# Fix NatCash Provider References and Add App Payment Option

## Problem
1. All NatCash-related code incorrectly references "Digicel" instead of "Natcom"
2. Users only see USSD instructions -- but NatCash also has a mobile app that many users may prefer

## Changes

### 1. Fix all "Digicel" --> "Natcom" references

**Files affected:**

| File | What to fix |
|------|-------------|
| `src/components/subscription/NatCashPaymentFlow.tsx` | "Votre numero NatCash (Digicel)" --> "(Natcom)", "telephone Digicel" --> "telephone Natcom", "numero Digicel" --> "numero Natcom" |
| `src/pages/NatCashDemo.tsx` | "telephone Digicel" --> "telephone Natcom", "NatCash/Digicel" --> "NatCash/Natcom" |
| `supabase/functions/natcash-create-order/index.ts` | French + English steps: "Digicel" --> "Natcom" |

### 2. Add NatCash App as alternative payment method

Update `NatCashPaymentFlow.tsx` instructions step to present **two options** side by side:

**Option A: Via USSD (no internet needed)**
1. Composez `*202#` sur votre telephone Natcom
2. Selectionnez "Transfert d'argent"
3. Entrez le numero: [wallet number]
4. Entrez le montant: [amount] HTG
5. Confirmez avec votre PIN NatCash

**Option B: Via l'application NatCash**
1. Ouvrez l'application NatCash sur votre telephone
2. Selectionnez "Transfert"
3. Entrez le numero: [wallet number]
4. Entrez le montant: [amount] HTG
5. Confirmez le transfert

Add links to download the app:
- Google Play: `https://play.google.com/store/apps/details?id=com.natcash`
- App Store: `https://apps.apple.com/us/app/natcash-natcom/id1613464862`

The UI will use a simple toggle or tabs ("Via USSD" / "Via l'App") inside the instructions card so users pick their preferred method.

### 3. Update edge function instructions

Update `natcash-create-order/index.ts` to return both sets of instructions (USSD and App) so the response is complete even if consumed by other clients.

---

## Technical Details

### `NatCashPaymentFlow.tsx` changes:
- Replace 3 instances of "Digicel" with "Natcom"
- In the `instructions` step, add a small tab toggle between "USSD" and "Application"
- Each tab shows the relevant step-by-step instructions
- Add small app download links below the app instructions (for users who don't have it installed)

### `NatCashDemo.tsx` changes:
- Replace 2 instances of "Digicel" with "Natcom"

### `natcash-create-order/index.ts` changes:
- Replace "Digicel" with "Natcom" in French and English steps
- Add `stepsApp` and `stepsAppEnglish` arrays for the app-based flow

---

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- only text/label changes and additive UI |
| Works with existing data? | Yes -- no schema changes |
| 3G optimized? | Yes -- no new assets, just text |
| Backward compatible? | Yes |
| Edge cases? | Users without the app see download links; USSD always available as fallback |
