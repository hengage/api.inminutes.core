import { Twilio } from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SID,
} from "../../../config";
import { HandleException, STATUS_CODES } from "../../../utils";

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
    channel: VerificationChannel = "SMS"
  ) => {
    try {
      const verification = await this.twilioClient.verify.v2
        .services(this.verifyServiceSID)
        .verifications.create({
          to: recipientPhoneNumber,
          channel: VERIFICATION_CHANNELS[channel],
        });
      return verification;
    } catch (error) {
      console.error("Error sending verification code:", error);
      throw new HandleException(
        STATUS_CODES.SERVER_ERROR,
        "Failed to send otp"
      );
    }
  };

  checkVerificationCode = async (
    recipientPhoneNumber: string,
    otpCode: string
  ) => {
    try {
      const verificationCheck = await this.twilioClient.verify.v2
        .services(this.verifyServiceSID)
        .verificationChecks.create({
          to: recipientPhoneNumber,
          code: otpCode,
        });

      console.log(verificationCheck);
      if (verificationCheck.status === "approved") {
        return true;
      } else {
        throw new HandleException(STATUS_CODES.BAD_REQUEST, "Invalid otp");
      }
    } catch (error: any) {
      if (error.status === 404) {
        throw new HandleException(STATUS_CODES.BAD_REQUEST, "Invalid otp");
      }
      throw error;
    }
  };
}

export const verifyService = new VerifyService();
