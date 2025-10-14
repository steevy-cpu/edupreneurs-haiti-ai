import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'C_V2c_IWNGZI6Kqyo';
const EMAILJS_SERVICE_ID = 'service_edupreneurs'; // You'll need to create this in EmailJS
const EMAILJS_TEMPLATE_VERIFICATION = 'template_verification'; // You'll need to create this
const EMAILJS_TEMPLATE_WELCOME = 'template_welcome'; // You'll need to create this
const EMAILJS_TEMPLATE_RESET = 'template_reset'; // You'll need to create this

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
      to_email: params.to_email,
      to_name: params.to_name,
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
