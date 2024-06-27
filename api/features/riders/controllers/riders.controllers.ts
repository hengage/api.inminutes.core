import { Request, Response } from "express";
import {
  STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { validateRider } from "../validators/riders.validators";
import { RidersService } from "../services/riders.service";
class RidersController {
  public ridersService: RidersService;

  constructor() {
    this.ridersService = new RidersService();
  }

  signup = async (req: Request, res: Response) => {
    // async  signup (req: Request, res: Response) {
    try {
      await validateRider.signUp(req.body);
      const rider = await this.ridersService.signup(req.body);

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
  };

  login = async (req: Request, res: Response) => {
    try {
      await validateRider.login(req.body);
      const rider = await this.ridersService.login(req.body);

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
  };

  getMe = async (req: Request, res: Response) => {
    const id = (req as any).user._id;
    try {
      const rider = await this.ridersService.getMe(id);
      res.status(STATUS_CODES.OK).json({
        message: "Success",
        data: { rider },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };
}

export const ridersController = new RidersController();
