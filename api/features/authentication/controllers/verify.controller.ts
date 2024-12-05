import { Request, Response } from "express";
import { handleErrorResponse } from "../../../utils";
import { verifyService } from "../services/verify.service";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

class VerifyController {
  sendVerificationCode = async (req: Request, res: Response) => {
    const { recipientPhoneNumber } = req.body;
    try {
      await verifyService.sendVerificationCode(recipientPhoneNumber);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "OTP sent",
      )
    } catch (error: unknown) {
      console.error("Error sending verification code: ", error)
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  checkVerificationCode = async (req: Request, res: Response) => {
    const { recipientPhoneNumber, otpCode } = req.body;
    try {
      await verifyService.checkVerificationCode(recipientPhoneNumber, otpCode);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "OTP verified",
      )
    } catch (error: unknown) {
      console.error("Error checking verification code: ", error)
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}

export const verifyController = new VerifyController();
