# EmailJS Setup Guide for Email Verification Flow

## Overview
This project uses EmailJS for sending emails during the verification flow. Your credentials are already configured:
- **Public Key**: C_V2c_IWNGZI6Kqyo
- **Private Key**: 6ijbql2JWvCgrHkh3i6Hj

## Steps to Complete Setup

### 1. Create EmailJS Account & Service
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Create a new service (Gmail, Outlook, etc.)
3. Note your **Service ID** (e.g., `service_edupreneurs`)

### 2. Create Email Templates

You need to create **3 email templates** in EmailJS:

#### Template 1: Verification Email (`template_verification`)
**Template ID**: `template_verification`

**Subject**: Confirmez votre adresse email

**Template Variables**:
- `{{to_name}}` - Full name of the user
- `{{to_email}}` - User's email address
- `{{confirmation_code}}` - 6-digit verification code
- `{{nickname}}` - User's nickname
- `{{academic_grade}}` - User's academic grade

**Example Template HTML**:
```html
<h2>Bonjour {{to_name}},</h2>
<p>Merci de vous être inscrit sur Edupreneurs!</p>
<p>Votre code de confirmation est:</p>
<h1 style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;">{{confirmation_code}}</h1>
<p><strong>Pseudo:</strong> {{nickname}}</p>
<p><strong>Niveau:</strong> {{academic_grade}}</p>
<p>Entrez ce code dans l'application pour vérifier votre email.</p>
<p>Ce code expire dans 24 heures.</p>
```

#### Template 2: Welcome Email (`template_welcome`)
**Template ID**: `template_welcome`

**Subject**: Bienvenue sur Edupreneurs!

**Template Variables**:
- `{{to_name}}` - Full name of the user
- `{{to_email}}` - User's email address
- `{{nickname}}` - User's nickname

**Example Template HTML**:
```html
<h2>Bienvenue {{to_name}} ({{nickname}})!</h2>
<p>Nous sommes ravis de vous accueillir sur Edupreneurs!</p>
<p>Votre compte a été vérifié avec succès.</p>
<h3>Prochaines étapes:</h3>
<ul>
  <li>Complétez votre profil</li>
  <li>Explorez les cours disponibles</li>
  <li>Rejoignez la communauté</li>
  <li>Invitez vos amis et gagnez des points</li>
</ul>
<p>Bon apprentissage!</p>
```

#### Template 3: Password Reset (`template_reset`)
**Template ID**: `template_reset`

**Subject**: Réinitialisation de votre mot de passe

**Template Variables**:
- `{{to_email}}` - User's email address
- `{{reset_url}}` - Password reset link

**Example Template HTML**:
```html
<h2>Réinitialisation de mot de passe</h2>
<p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
<p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe:</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="{{reset_url}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser le mot de passe</a>
</div>
<p>Ou copiez ce lien dans votre navigateur:</p>
<p style="background: #f4f4f4; padding: 10px; word-break: break-all;">{{reset_url}}</p>
<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
<p>Ce lien expire dans 1 heure.</p>
```

### 3. Update Configuration

After creating the templates, update the following in `src/utils/emailService.ts`:

```typescript
const EMAILJS_SERVICE_ID = 'your_service_id'; // Replace with your actual Service ID
```

### 4. Test the Setup

1. Navigate to `/emailjs-test` in your app
2. Enter your email address
3. Test each email type:
   - Verification email
   - Welcome email
   - Password reset email
4. Check your inbox for the emails

## Email Flow Integration

### Database Fields
The `profiles` table includes:
- `confirmation_code` - Stores the 6-digit verification code
- `email_confirmed` - Boolean flag for email verification status
- `phone_confirmed` - Boolean flag for phone verification status

### Usage in Application

**Send Verification Email**:
```typescript
import { sendVerificationEmail, generateConfirmationCode } from '@/utils/emailService';

const code = generateConfirmationCode(); // Generates 6-digit code
await sendVerificationEmail({
  to_email: user.email,
  to_name: user.full_name,
  confirmation_code: code,
  nickname: user.nickname,
  academic_grade: user.academic_grade,
});
// Store code in database: profiles.confirmation_code
```

**Send Welcome Email**:
```typescript
import { sendWelcomeEmail } from '@/utils/emailService';

await sendWelcomeEmail({
  to_email: user.email,
  to_name: user.full_name,
  nickname: user.nickname,
});
```

**Send Password Reset**:
```typescript
import { sendPasswordResetEmail } from '@/utils/emailService';

await sendPasswordResetEmail({
  to_email: user.email,
  reset_url: `${window.location.origin}/reset-password?token=${token}`,
});
```

## Troubleshooting

### Emails Not Sending
1. Check that your Service ID is correct in `emailService.ts`
2. Verify template IDs match exactly
3. Check EmailJS dashboard for error logs
4. Ensure email service (Gmail, etc.) is properly connected

### Template Variables Not Showing
1. Make sure variable names match exactly (case-sensitive)
2. Use double curly braces: `{{variable_name}}`
3. Test in EmailJS template editor first

### Rate Limits
- Free tier: 200 emails/month
- Consider upgrading if needed

## Security Notes
- Public key is safe to include in frontend code
- Private key should never be exposed (currently in frontend for testing only)
- For production, consider moving email sending to backend edge functions
