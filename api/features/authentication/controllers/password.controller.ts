import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { passwordService } from "../services/password.service";
import { handleSuccessResponse } from "../../../utils/response.utils";

class PasswordController {
  public async resetPassword(req: Request, res: Response) {
    const accountType = req.query.accountType as string;
    if (!accountType) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "Password reset failed",
        error: "Provide account type",
      });
    }

    try {
      await passwordService.resetPassword(
        req.body.phoneNumber,
        req.body.newPassword,
        accountType.toLowerCase()
      );

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "Password reset successful",
      )
    } catch (error: unknown) {
      console.error(res, error, "Password reset failed", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  public async changePassword(req: Request, res: Response) {
    const accountType = req.query.accountType as string;
    if (!accountType) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "Password change failed",
        error: "Provide account type",
      });
    }
    const userId = (req as any).user._id;
    try {
      await passwordService.changePassword(
        userId,
        req.body.currentPassword,
        req.body.newPassword,
        accountType.toLowerCase()
      );

      res.status(HTTP_STATUS_CODES.OK).json({
        message: "Password changed",
      });

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "Password changed successfully",
      )
    } catch (error: unknown) {
      console.error("Password change failed: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const passwordController = new PasswordController();
