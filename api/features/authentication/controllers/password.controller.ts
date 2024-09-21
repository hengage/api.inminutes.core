import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { passwordService } from "../services/password.service";

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
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ message: "Password reset successful" });
    } catch (error: unknown) {
      console.log(res, error, "Password reset failed", error);
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
    } catch (error: unknown) {
      console.log("Password change failed: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const passwordController = new PasswordController();
