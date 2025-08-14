import twilio from 'twilio';
import crypto from 'crypto';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  console.warn('Twilio environment variables not set. SMS functionality will be disabled.');
}

export const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Validate that a webhook request came from Twilio
 */
export function validateTwilioSignature(
  twilioSignature: string,
  url: string,
  body: string
): boolean {
  if (!authToken) {
    console.warn('Twilio auth token not set, skipping signature validation');
    return true; // In development, skip validation if not configured
  }

  try {
    return twilio.validateRequest(authToken, twilioSignature, url, body);
  } catch (error) {
    console.error('Error validating Twilio signature:', error);
    return false;
  }
}

/**
 * Send an SMS message using Twilio
 */
export async function sendSms(to: string, message: string): Promise<boolean> {
  if (!twilioClient || !fromNumber) {
    console.error('Twilio not configured properly');
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Format phone number to E.164 format for Twilio
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add +1 if it's a 10-digit US number
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // Add + if it's missing
  if (cleaned.length > 10 && !phoneNumber.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return phoneNumber;
}