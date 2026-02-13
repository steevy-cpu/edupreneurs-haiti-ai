

# Make Email Field Mandatory on Donation Page

## Change
Update `src/components/donate/DonationCard.tsx` to make the email field required instead of optional:

1. Change the placeholder from "Votre email (optionnel)" to "Votre email *"
2. Add email validation (basic format check)
3. Disable the donate button if email is empty or invalid
4. Add a small required indicator or helper text

## Technical Details

In `DonationCard.tsx`:
- Add a simple email validation check: `const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())`
- Update both donate buttons' `disabled` condition to include `!isValidEmail`
- Update the placeholder text to indicate it's required
- The name and message fields remain optional

This ensures we always have an email to send the thank-you email to, which aligns with the new email flow we just built.

