import { Twilio } from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SID,
} from "../../../config";
import { HandleException, STATUS_CODES } from "../../../utils";
import { redisClient } from "../../../services";
const { v4: uuidv4 } = require("uuid");

class VerifyService {
  private twilioClient: Twilio;
  private verifyServiceSID: string;

  constructor() {
    this.twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    this.verifyServiceSID = `${TWILIO_VERIFY_SID}`;
  }

  sendVerificationCode = async (recipientPhoneNumber: string) => {
    try {
      const verification = await this.twilioClient.verify.v2
        .services(this.verifyServiceSID)
        .verifications.create({
          to: recipientPhoneNumber,
          channel: "sms",
        });
      return verification;
    } catch (error) {
      throw error;
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
        // Save a uuid token for reset password endpoint
        const uuid = uuidv4();
        const cacheKey = `password-reset:${recipientPhoneNumber}`;
        redisClient.setWithExpiry(cacheKey, uuid, 1800).catch((error) => {
          console.error("Error setting password reset key:", error);
        });

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
