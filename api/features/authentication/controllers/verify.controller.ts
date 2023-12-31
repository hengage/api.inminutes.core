import { Request, Response } from "express";
import { STATUS_CODES } from "../../../utils";
import { verifyService } from "../services/verify.service";

class VerifyController {
  sendVerificationCode = async (req: Request, res: Response) => {
    const { recipientPhoneNumber } = req.body;
    try {
      await verifyService.sendVerificationCode(recipientPhoneNumber);
      res.status(STATUS_CODES.OK).json({
        message: "OTP sent",
      });
    } catch (error: any) {
      res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
        message: "Failed to send otp",
        error: error.message,
      });
    }
  };

  checkVerificationCode = async (req: Request, res: Response) => {
    const { recipientPhoneNumber, otpCode } = req.body;
    try {
      await verifyService.checkVerificationCode(recipientPhoneNumber, otpCode);
      res.status(STATUS_CODES.OK).json({
        message: "Verification successful",
      });
    } catch (error: any) {
      res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
        message: "Verification failed",
        error: error.message,
      });
    }
  };
}

export const verifyController = new VerifyController();
