import { Request, Response } from "express";
import { STATUS_CODES } from "../../../utils";
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
      await passwordService.resetPassword(
        req.body.phoneNumber,
        req.body.newPassword,
        accountType.toLowerCase()
      );
      res
        .status(STATUS_CODES.OK)
        .json({ message: "Password reset successful" });
    } catch (error: any) {
      res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
        message: "Password reset failed",
        error: error.message || "Server error",
      });
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
    const userId = (req as any).user._id
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
      res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
        message: "Password change failed",
        error: error.message || "Server error",
      });
    }
  }
}

export const passwordController = new PasswordController();
