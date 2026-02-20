

# Settings Plan A — Critical Bug Fixes

## Step 1: Database Migration (run first)

Normalize all legacy grade values in `profiles` and fix inverted formats in language practice tables:

```sql
-- Normalize legacy grade values in profiles
UPDATE profiles SET academic_grade = '7AF' WHERE academic_grade IN ('7e', '7ème');
UPDATE profiles SET academic_grade = '8AF' WHERE academic_grade IN ('8e', '8ème');
UPDATE profiles SET academic_grade = '9AF' WHERE academic_grade IN ('9e', '9ème');
UPDATE profiles SET academic_grade = 'NS1' WHERE academic_grade = 'S1';
UPDATE profiles SET academic_grade = 'NS2' WHERE academic_grade = 'S2';
UPDATE profiles SET academic_grade = 'NS3' WHERE academic_grade IN ('Rheto', 'Rhéto');
UPDATE profiles SET academic_grade = 'NS4' WHERE academic_grade = 'Philo';

-- Fix inverted format in language practice tables
UPDATE english_practice_conversations SET grade_level = '8AF' WHERE grade_level = 'AF8';
UPDATE english_practice_conversations SET grade_level = '9AF' WHERE grade_level = 'AF9';
UPDATE spanish_practice_conversations SET grade_level = '8AF' WHERE grade_level = 'AF8';
UPDATE spanish_practice_conversations SET grade_level = '9AF' WHERE grade_level = 'AF9';
```

## Step 2: Frontend Changes (Settings.tsx only)

### Fix 1 -- Grade Dropdown (lines 649-663)

Replace the hardcoded `<option>` elements with the correct standardized values:

```
7AF  ->  "7eme Annee Fondamentale"
8AF  ->  "8eme Annee Fondamentale"
9AF  ->  "9eme Annee Fondamentale"
NS1  ->  "Premiere (NS1)"
NS2  ->  "Seconde (NS2)"
NS3  ->  "Rheto (NS3)"
NS4  ->  "Philosophie (NS4)"
UNIV ->  "Universite"
NONE ->  "Autre / Non scolarise"
```

### Fix 2 -- Add Gender Field

- Add `gender` to the `profileForm` state (line 106-113), initialized from `profile.gender`
- Add `gender` to `fetchUserData` form initialization (line 173-180)
- Insert a gender selector between the academic grade row and the phone number row (after line 678)
- Two toggle-style buttons: "Garcon" and "Fille" -- styled as selectable outline buttons
- Include `gender` in the `handleProfileUpdate` save payload (line 298-307)

### Fix 3 -- Add Date of Birth Field

- Add `dateOfBirth` to the `profileForm` state, initialized from `profile.date_of_birth`
- Add `dateOfBirth` to `fetchUserData` form initialization
- Insert a date input below the phone number field (after line 678, in the same grid row as gender)
- Max date = today, min date = 1950-01-01
- Helper text: "Pour recevoir un email special le jour de ton anniversaire!"
- Include `date_of_birth` in the save payload

### Fix 4 -- Add Logout Button

- Import `LogOut` from lucide-react (line 14-30)
- Add a logout button in the Account tab between the email card (ends line 751) and the password change card (starts line 753)
- Full-width outline button: "Se deconnecter" with LogOut icon
- Calls the existing `handleLogout` function (line 218) -- no changes to that function

### Fix 5 -- Update UserProfile Interface

- Add `gender`, `date_of_birth` to the `UserProfile` interface (lines 56-66) so TypeScript is happy when reading these fields from the profile query

## Files Changed

Only `src/pages/Settings.tsx` -- no other files touched.

## Safety Verification

| Check | Status |
|---|---|
| Migration normalizes exactly 6 legacy profile rows | Yes -- 7e, Philo, S1, S2 confirmed in audit |
| Migration fixes 15 inverted language rows | Yes -- AF8/AF9 confirmed |
| Grade dropdown pre-fills correctly after migration | Yes -- values now match option values |
| Gender saves to profiles table | Yes -- added to update payload |
| Date of birth saves to profiles table | Yes -- added to update payload |
| Logout calls existing handleLogout unchanged | Yes -- function at line 218 untouched |
| Matieres page unaffected | Yes -- content tables already use standardized codes |
| No new dependencies | Correct -- all components already in project |
| Bundle size impact | Negligible -- only adding form fields |
| 3G performance | No impact -- no new queries or API calls |

