import { z } from 'zod';

// User registration validation schema
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .refine((phone) => {
      // Remove spaces and validate phone number (international format)
      const cleanedPhone = phone.replace(/\s/g, '');
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      return phoneRegex.test(cleanedPhone);
    }, 'Invalid phone number format'),
  referralCode: z.string()
    .max(10, 'Referral code is too long')
    .optional()
});

// User login validation schema
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required')
});

// Phone verification validation schema
export const phoneVerificationSchema = z.object({
  phone: z.string()
    .min(1, 'Phone number is required')
    .refine((phone) => {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      return phoneRegex.test(phone);
    }, 'Invalid phone number format'),
  verificationCode: z.string()
    .min(4, 'Verification code must be at least 4 digits')
    .max(6, 'Verification code must be at most 6 digits')
});

// Email validation helper
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  // Check for common temporary email domains
  const tempEmailDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'tempmail.org',
    'mailinator.com',
    'temp-mail.org',
    'throwaway.email',
    'getnada.com',
    'maildrop.cc'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && tempEmailDomains.includes(domain)) {
    return { isValid: false, error: 'Temporary email addresses are not allowed' };
  }
  
  return { isValid: true };
};

// Phone number validation helper
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it starts with + and has 10-15 digits
  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    if (digits.length < 10 || digits.length > 15) {
      return { isValid: false, error: 'Phone number must be 10-15 digits after country code' };
    }
  } else {
    // If no country code, assume it's a local number
    if (cleaned.length < 10 || cleaned.length > 15) {
      return { isValid: false, error: 'Phone number must be 10-15 digits' };
    }
  }
  
  return { isValid: true };
};

// Referral code validation
export const validateReferralCode = (code: string): { isValid: boolean; error?: string } => {
  if (!code) return { isValid: true };
  
  if (code.length < 6 || code.length > 10) {
    return { isValid: false, error: 'Referral code must be 6-10 characters' };
  }
  
  if (!/^[A-Z0-9]+$/.test(code)) {
    return { isValid: false, error: 'Referral code must contain only uppercase letters and numbers' };
  }
  
  return { isValid: true };
};

// Password validation helper
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
