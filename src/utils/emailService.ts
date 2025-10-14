import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'C_V2c_IWNGZI6Kqyo';
const EMAILJS_SERVICE_ID = 'service_aitv0m5';
const EMAILJS_TEMPLATE_VERIFICATION = 'template_cj0crr9';
const EMAILJS_TEMPLATE_WELCOME = 'template_ts6ib4o';
const EMAILJS_TEMPLATE_RESET = 'template_cpj0l0l';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

interface VerificationEmailParams {
  to_email: string;
  to_name: string;
  confirmation_code: string;
  nickname?: string;
  academic_grade?: string;
}

interface WelcomeEmailParams {
  to_email: string;
  to_name: string;
  nickname?: string;
}

interface PasswordResetParams {
  to_email: string;
  reset_url: string;
}

/**
 * Send verification email with confirmation code
 */
export const sendVerificationEmail = async (params: VerificationEmailParams) => {
  try {
    const templateParams = {
      user_email: params.to_email,
      to_email: params.to_email,
      reply_to: params.to_email,
      to_name: params.to_name,
      user_name: params.to_name,
      confirmation_code: params.confirmation_code,
      nickname: params.nickname || params.to_name,
      academic_grade: params.academic_grade || '',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_VERIFICATION,
      templateParams
    );

    console.log('Verification email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send welcome email after successful registration
 */
export const sendWelcomeEmail = async (params: WelcomeEmailParams) => {
  try {
    const templateParams = {
      to_email: params.to_email,
      to_name: params.to_name,
      nickname: params.nickname || params.to_name,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_WELCOME,
      templateParams
    );

    console.log('Welcome email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (params: PasswordResetParams) => {
  try {
    const templateParams = {
      to_email: params.to_email,
      reset_url: params.reset_url,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_RESET,
      templateParams
    );

    console.log('Password reset email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Generate a 6-digit confirmation code
 */
export const generateConfirmationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
