import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import {UsersService } from "../../../services";
import { authService } from "../services/auth.service";

class AuthController {
  private usersService: UsersService

  constructor(){
    this.usersService = new UsersService()
  }

  async checkPhoneNumberIstaken(req: Request, res: Response) {
    try {
      await this.usersService.isPhoneNumberTaken(req.body.phoneNumber);
      res.status(HTTP_STATUS_CODES.NO_CONTENT).json({
        message: "succesful",
      });
    } catch (error: any) {
      console.error('Error checking phone number:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async refreshAccessToken(req: Request, res: Response) {
    try {
      const accessToken = await authService.refreshAccessToken(
        req.body.refreshToken
      );
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "Access token generated",
        data: { accessToken },
      });
    } catch (error: any) {
      console.error('Error generating access token:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const authController = new AuthController();
