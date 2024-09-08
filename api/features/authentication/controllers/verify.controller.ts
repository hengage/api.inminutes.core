import { Request, Response } from "express";
import { STATUS_CODES, handleErrorResponse } from "../../../utils";
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
      handleErrorResponse(res, error, "Failed");
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
      handleErrorResponse(res, error);
    }
  };
}

export const verifyController = new VerifyController();
