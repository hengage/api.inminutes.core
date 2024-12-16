import { Request, Response } from "express";
import { HandleException, Msg, handleErrorResponse } from "../../../utils";
import { passwordService } from "../services/password.service";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

class PasswordController {
  public async resetPassword(req: Request, res: Response) {
    const accountType = req.query.accountType as string;
    if (!accountType) {
      throw new HandleException(
        HTTP_STATUS_CODES.BAD_REQUEST,
        Msg.ERROR_USER_TYPE_MISSING(),
      );
    }

    try {
      await passwordService.resetPassword({
        phoneNumber: req.body.phoneNumber,
        newPassword: req.body.newPassword,
        token: req.body.token,
        accountType: accountType.toLowerCase(),
      });
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "Password reset successful",
      );

    } catch (error: unknown) {
      console.error(res, error, "Password reset failed", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  public async changePassword(req: Request, res: Response) {
    const accountType = req.query.accountType as string;
    if (!accountType) {
      throw new HandleException(
        HTTP_STATUS_CODES.BAD_REQUEST,
        Msg.ERROR_USER_TYPE_MISSING(),
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user._id;
    try {
      await passwordService.changePassword(
        userId,
        req.body.currentPassword,
        req.body.newPassword,
        accountType.toLowerCase(),
      );

      res.status(HTTP_STATUS_CODES.OK).json({
        message: "Password changed",
      });

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "Password changed",
      );
    } catch (error: unknown) {
      console.error("Password change failed: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const passwordController = new PasswordController();
