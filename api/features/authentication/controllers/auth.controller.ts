import { Request, Response } from "express";
import { handleErrorResponse } from "../../../utils";
import { UsersService } from "../../../services";
import { authService } from "../services/auth.service";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

class AuthController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  checkPhoneNumberIstaken = async (req: Request, res: Response) => {
    try {
      await this.usersService.isPhoneNumberTaken(req.body.phoneNumber);

      handleSuccessResponse(res, HTTP_STATUS_CODES.NO_CONTENT, null);
    } catch (error: unknown) {
      console.error("Error checking phone number:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  async refreshAccessToken(req: Request, res: Response) {
    try {
      const accessToken = await authService.refreshAccessToken(
        req.body.refreshToken,
      );

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { accessToken });
    } catch (error: unknown) {
      console.error("Error generating access token:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const authController = new AuthController();
