import { z } from "zod";

// Phone number validation - supports various formats
const phoneNumberSchema = z.string()
  .regex(/^(\+)?[\d\s\-()]{10,}$/, "Invalid phone number format")
  .transform(val => val.replace(/[\s\-()]/g, ''))
  .refine(val => /^(\+)?[\d]{10,15}$/.test(val), "Phone number must have 10-15 digits");

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  try {
    phoneNumberSchema.parse(phoneNumber);
    return true;
  } catch {
    return false;
  }
};

export const normalizePhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  return '+' + cleaned;
};

export const validateAccessToken = (token: string): boolean => {
  return token.trim().length > 10 && /^[a-zA-Z0-9_\-]+$/.test(token);
};

// Simulated WhatsApp API verification
// In production, this would call the actual WhatsApp API
export const verifyWhatsAppAccount = async (
  phoneNumber: string,
  accessToken: string
): Promise<{ valid: boolean; error?: string; message?: string }> => {
  try {
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return { valid: false, error: "Invalid WhatsApp Number" };
    }

    // Validate token format
    if (!validateAccessToken(accessToken)) {
      return { valid: false, error: "Invalid Token" };
    }

    // In production, call actual WhatsApp API
    // For now, simulate successful verification
    const normalized = normalizePhoneNumber(phoneNumber);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if token looks valid (in production, verify with actual API)
    return {
      valid: true,
      message: `Successfully verified WhatsApp account for ${normalized}`
    };
  } catch (error) {
    return { valid: false, error: "Verification Failed" };
  }
};

// Verify if a number is registered on WhatsApp
export const verifyWhatsAppNumber = async (
  phoneNumber: string
): Promise<{ isWhatsApp: boolean; status: "REGISTERED" | "NOT_REGISTERED" | "ERROR" }> => {
  try {
    if (!validatePhoneNumber(phoneNumber)) {
      return { isWhatsApp: false, status: "ERROR" };
    }

    // In production, call WhatsApp API to verify
    // For now, simulate - all properly formatted numbers are considered registered
    await new Promise(resolve => setTimeout(resolve, 200));

    return { isWhatsApp: true, status: "REGISTERED" };
  } catch {
    return { isWhatsApp: false, status: "ERROR" };
  }
};
