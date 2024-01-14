import { Request, Response } from "express";
import {
  STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { usersService } from "../../../services";
import { ridersRepo } from "../repository/riders.repo";
import { validateRider } from "../validators/riders.validators";

class RidersController {
  async signup(req: Request, res: Response) {
    try {
      await validateRider.signUp(req.body)
      await usersService.isEmailTaken(req.body.email);
      await usersService.isPhoneNumberTaken(req.body.phoneNumber);
      await usersService.isDisplayNameTaken(req.body.displayName);

      const rider = await ridersRepo.signup(req.body);

      const jwtPayload = { _id: rider._id, email: rider.email };
      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: { rider, accessToken, refreshToken },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      await validateRider.login(req.body)
      const rider = await ridersRepo.login(req.body.email, req.body.password);

      const jwtPayload = { _id: rider._id, phoneNumber: rider.phoneNumber };
      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      res.status(STATUS_CODES.OK).json({
        message: "Login successful",
        data: { rider, accessToken, refreshToken },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async getMe(req: Request, res: Response) {
    const id = (req as any).user._id;
    try {
      const rider = await ridersRepo.getMe(id);
      res.status(STATUS_CODES.OK).json({
        message: "Success",
        data: { rider },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const ridersController = new RidersController();
