import { Request, Response } from "express";
import {
  STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { validateRider } from "../validators/riders.validators";
import { ridersService } from "../services/riders.service";

class RidersController {
  constructor() {}

  async signup(req: Request, res: Response) {
    try {
      await validateRider.signUp(req.body);
      const rider = await ridersService.signup(req.body);

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
      await validateRider.login(req.body);
      const rider = await ridersService.login(req.body);

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
      const rider = await ridersService.getMe(id);
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
