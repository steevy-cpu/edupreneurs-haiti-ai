

# Update DonateHero Section

## Changes

### 1. Add Edupreneurs logo to project assets

Copy the uploaded logo image to `src/assets/edupreneurs-logo.png` so it can be imported as an ES6 module.

### 2. Update `src/components/donate/DonateHero.tsx`

- **Replace image**: Remove Jude avatar and its import. Import the new Edupreneurs logo instead. Remove the `rounded-full` class since the logo is not circular -- use standard sizing (e.g., `w-24 h-24 sm:w-32 sm:h-32`).
- **Update heading**: Change from "Ede m transfòme edikasyon ann Ayiti!" to "Ede nou transfòme edikasyon an nan Ayiti!"
- **Update description**: Change from the current text to "Chaque don nous aide a ameliorer l'experience de l'eleve avec l'intelligence artificielle."

### 3. Clean up `src/pages/Donate.tsx`

Remove the unused `judeAvatar` variable and `getAvatarUrl` import, since the Jude avatar was also used there for the OG meta tag. Replace the OG image meta tag with the new logo path or remove it.

## File Summary

| File | Action |
|------|--------|
| `src/assets/edupreneurs-logo.png` | Create (copy from upload) |
| `src/components/donate/DonateHero.tsx` | Edit -- swap image, update text |
| `src/pages/Donate.tsx` | Edit -- remove unused Jude avatar references |

## Safety Checklist

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- text and image swap only |
| 3G optimized? | Yes -- single small logo image |
| Backward compatible? | Yes |

