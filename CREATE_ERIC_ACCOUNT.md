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

## Step 2: Update Eric's Profile

After signing up, you'll need to update Eric's profile in the database:

1. Open your backend dashboard
2. Go to the `profiles` table
3. Find Eric's profile (the one you just created)
4. Update these fields:
   - `avatar_url`: Set to `eric`
   - `verified`: Set to `true`
   - `is_system_account`: Set to `true`
   - `bio`: Add a description like "Assistant IA éducatif d'Edupreneurs" or similar

## Step 3: Verify It Works

1. Log out from Eric's account
2. Log in with your regular user account
3. Visit Eric's profile page
4. You should see:
   - Eric's welcome image as the avatar
   - A blue verification checkmark next to Eric's name
   - The bio you added

## Step 4: Test Eric's Social Features

Eric can now:
- Post content on the Feed
- Comment on posts
- Like posts
- Send messages to users
- Receive follow requests

The verification badge will appear everywhere Eric's name is shown (posts, comments, messages, profiles).

## Notes

- The `verified` field shows the checkmark badge
- The `is_system_account` field marks Eric as a system account for potential future features
- Eric's avatar uses the welcoming Eric image from the assets
