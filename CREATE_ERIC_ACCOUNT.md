# Create Eric's Account - Instructions

Follow these steps to create Eric's account on the platform:

## Step 1: Sign Up as Eric

1. Go to the `/auth` page
2. Create a new account with these details:
   - **Email**: `eric@edupreneurs.app` (or any email you prefer)
   - **Password**: Choose a secure password
   - **Full Name**: `Eric`
   - **Nickname**: `Eric`
   - **Academic Grade**: Choose any appropriate grade
   - **Phone Number**: Provide a valid phone number
   - **School**: Add school information
   - **Gender**: Select appropriate option

## Step 2: Verify Email with Code

**IMPORTANT**: After signing up, you MUST verify the email:

1. Check the email inbox for `eric@edupreneurs.app`
2. Find the verification email with a 6-digit code
3. Enter the code on the verification page
4. Once verified, you can proceed to login

⚠️ **Note**: Without email verification, Eric's account will not be able to login. The system blocks access until the email is confirmed.

## Step 3: Update Eric's Profile in Database

After email verification, update Eric's profile in the backend:

1. Open your backend dashboard
2. Go to the `profiles` table
3. Find Eric's profile
4. Update these fields:
   - `avatar_url`: Set to `eric`
   - `verified`: Set to `true`
   - `is_system_account`: Set to `true`
   - `email_confirmed`: Should already be `true` (from verification)
   - `bio`: Add "Assistant IA éducatif d'Edupreneurs"

## Step 4: Verify It Works

1. Log in with Eric's account (email and password)
2. System will check that email is confirmed before allowing login
3. You should be redirected to the dashboard
4. Log out and log in with a regular user account
5. Visit Eric's profile page to verify:
   - Eric's welcome image as the avatar
   - Blue verification checkmark
   - The bio you added

## Step 5: Test Eric's Social Features

Eric can now:
- Post content on the Feed
- Comment on posts
- Like posts
- Send messages to users
- Receive follow requests

## Security Notes

- **Email verification is mandatory**: Users cannot login until they verify their email
- The 6-digit verification code is sent via EmailJS
- Verification code is stored temporarily in the `confirmation_code` field
- After successful verification:
  - `email_confirmed` is set to `true`
  - `confirmation_code` is cleared
  - Welcome email is sent
- Login attempts with unverified emails are blocked and user is signed out immediately

## Notes

- The `verified` field shows the checkmark badge
- The `is_system_account` field marks Eric as a system account
- Eric's avatar uses the welcoming Eric image from the assets
- Email confirmation is separate from the verified badge (blue checkmark)
