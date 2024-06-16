import { Request, Response } from "express";
import { STATUS_CODES, handleErrorResponse } from "../../../utils";
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
      res.status(STATUS_CODES.NO_CONTENT).json({
        message: "succesful",
      });
    } catch (error: any) {
      // if ()
      res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
        message: "Failed ",
        error: error.message || "Server error",
      });
    }
  }

  async refreshAccessToken(req: Request, res: Response) {
    try {
      const accessToken = await authService.refreshAccessToken(
        req.body.refreshToken
      );
      res.status(STATUS_CODES.OK).json({
        message: "Access token generated",
        data: { accessToken },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const authController = new AuthController();
