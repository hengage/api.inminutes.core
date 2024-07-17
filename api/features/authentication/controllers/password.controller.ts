import { Request, Response } from "express";
import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { passwordService } from "../services/password.service";

class PasswordController {
  public async resetPassword(req: Request, res: Response) {
    const accountType = req.query.accountType as string;
    if (!accountType) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: "Password reset failed",
        error: "Provide account type",
      });
    }

    try {
      await passwordService.resetPassword({
        phoneNumber: req.body.phoneNumber,
        newPassword: req.body.newPassword,
        token: req.body.token,
        accountType: accountType.toLowerCase(),
      });
      res
        .status(STATUS_CODES.OK)
        .json({ message: "Password reset successful" });
    } catch (error: any) {
      handleErrorResponse(res, error, "Password reset failed");
    }
  }

  public async changePassword(req: Request, res: Response) {
    const accountType = req.query.accountType as string;
    if (!accountType) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
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
      res.status(STATUS_CODES.OK).json({
        message: "Password changed",
      });
    } catch (error: any) {
      handleErrorResponse(res, error, "Password change failed");
    }
  }
}

export const passwordController = new PasswordController();
