# Generate VAPID Keys for Push Notifications

Your current VAPID keys are invalid. Follow these steps to generate proper P-256 curve VAPID keys:

## Step 1: Generate Keys

Run this command in your terminal:

```bash
npx web-push generate-vapid-keys
```

This will output something like:
```
=======================================
Public Key:
BKxS...very_long_base64_string...Abc=

Private Key:
xyz123...another_long_base64_string...789=
=======================================
```

## Step 2: Update Your Code

After generating the keys, update these files:

### 1. Update Edge Function (`supabase/functions/send-push-notification/index.ts`)

Replace lines 18-19 with your new keys:
```typescript
const VAPID_PUBLIC_KEY = 'YOUR_NEW_PUBLIC_KEY_HERE';
const VAPID_PRIVATE_KEY = 'YOUR_NEW_PRIVATE_KEY_HERE';
```

### 2. Update Frontend (`src/utils/pushNotifications.ts`)

Replace line 59 with your new public key:
```typescript
const vapidPublicKey = 'YOUR_NEW_PUBLIC_KEY_HERE';
```

## Step 3: Test Again

1. Go to `/dev/push`
2. Click "Request Permission" (grant if needed)
3. Click "Subscribe to Push"
4. Click "Send Test Notification"

You should now receive the notification!

## Important Notes

- The public key should be the same in both frontend and backend
- The private key should ONLY be in the backend
- These keys must be proper base64url-encoded P-256 elliptic curve keys
- If you get 401/403 errors, the keys are still invalid or don't match
