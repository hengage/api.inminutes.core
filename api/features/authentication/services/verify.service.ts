import { Twilio } from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SID,
} from "../../../config";
import { HandleException } from "../../../utils";
import { HTTP_STATUS_CODES, OTP_CHANNEL } from "../../../constants";

const VERIFICATION_CHANNELS = {
  SMS: "sms",
  WHATSAPP: "whatsapp",
} as const;

type VerificationChannel = keyof typeof VERIFICATION_CHANNELS;

class VerifyService {
  private twilioClient: Twilio;
  private verifyServiceSID: string;

  constructor() {
    this.twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    this.verifyServiceSID = `${TWILIO_VERIFY_SID}`;
  }

  sendVerificationCode = async (
    recipientPhoneNumber: string,
    channel: VerificationChannel = OTP_CHANNEL.SMS,
  ) => {
    try {
      const verification = await this.twilioClient.verify.v2
        .services(this.verifyServiceSID)
        .verifications.create({
          to: this.formatPhoneNumber(recipientPhoneNumber),
          channel: VERIFICATION_CHANNELS[channel],
        });
      return verification;
    } catch (error) {
      console.error("Error sending verification code:", error);
      throw new HandleException(
        HTTP_STATUS_CODES.SERVER_ERROR,
        "Failed to send otp",
      );
    }
  };

  checkVerificationCode = async (
    recipientPhoneNumber: string,
    otpCode: string,
  ) => {
    try {
      const verificationCheck = await this.twilioClient.verify.v2
        .services(this.verifyServiceSID)
        .verificationChecks.create({
          to: this.formatPhoneNumber(recipientPhoneNumber),
          code: otpCode,
        });

      console.log(verificationCheck);
      if (verificationCheck.status === "approved") {
        return true;
      } else {
        throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, "Invalid otp");
      }
    } catch (error: any) {
      if (error.status === 404) {
        throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, "Invalid otp");
      }
      throw error;
    }
  };

  private formatPhoneNumber = (phoneNumber: string): string => {
    // Remove any non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, "");

    // Check if the number starts with '234' (Nigeria's country code)
    if (digitsOnly.startsWith("234")) {
      return `+${digitsOnly}`;
    }

    // If it starts with '0', replace it with '+234'
    if (digitsOnly.startsWith("0")) {
      return `+234${digitsOnly.slice(1)}`;
    }

    // If it doesn't start with '0' or '234', assume it's a local number and add '+234'
    return `+234${digitsOnly}`;
  };
}

export const verifyService = new VerifyService();
