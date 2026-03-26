

## Plan: Create a Test Edge Function to Preview All Email Templates

### What This Does

Creates a **single new edge function** (`test-send-all-emails`) that renders every email template with sample data and sends them all to `celestinsteeve738@gmail.com`. Zero changes to existing code — purely additive.

### Emails to Send (16 templates total)

| # | Template | Source |
|---|----------|--------|
| 1 | Welcome | `send-welcome-email` |
| 2 | Email Confirmation (signup) | `send-confirmation-email` |
| 3 | Password Reset | `send-password-reset-email` |
| 4 | Device Verification | `send-device-verification-email` |
| 5 | Login Notification | `send-login-notification` |
| 6 | Onboarding Day 1 | `check-onboarding-emails` |
| 7 | Onboarding Day 3 | `check-onboarding-emails` |
| 8 | Onboarding Day 7 | `check-onboarding-emails` |
| 9 | Subscription Confirmation | `_shared/emails.ts` |
| 10 | Subscription Invoice | `_shared/emails.ts` |
| 11 | Gift Student Activation | `_shared/emails.ts` |
| 12 | Gift Payer Invoice | `_shared/emails.ts` |
| 13 | Gift Payer Thank You | `_shared/emails.ts` |
| 14 | Renewal Student | `_shared/emails.ts` |
| 15 | Renewal Payer Receipt | `_shared/emails.ts` |
| 16 | Donation Thank You | `send-donation-thank-you` |
| 17 | Report Confirmation | `send-report-confirmation` |
| 18 | Farewell / Account Deleted | `send-farewell-email` |
| 19 | Admin Post Deleted | `admin-delete-post` |
| 20 | Birthday | `check-birthdays` |

### How It Works

- New file: `supabase/functions/test-send-all-emails/index.ts`
- Imports template builders from `_shared/emails.ts`
- Copies/inlines the template HTML from functions that don't export their builders (welcome, confirmation, password reset, etc.)
- Sends each email with a numbered subject prefix (`[1/20] Template Name`) so you can identify them in your inbox
- Uses sample/dummy data (fake name, fake amounts, fake codes)
- Protected by `X-Internal-Secret` header so only you can trigger it
- Returns a JSON summary of which emails succeeded/failed

### What Gets Modified

- **Created:** `supabase/functions/test-send-all-emails/index.ts` (1 new file)
- **Modified:** Nothing. Zero changes to any existing file.

### After Testing

Once you've reviewed all emails, we simply delete the test function. No cleanup needed.

### Technical Details

- Each email is sent with a 500ms delay between sends to avoid Resend rate limits
- All emails go to `celestinsteeve738@gmail.com` regardless of template
- Sample data used: name "Steeve Celestin", amount "500 HTG", verification code "123456", etc.
- The function is invoked manually via the backend functions panel or curl

