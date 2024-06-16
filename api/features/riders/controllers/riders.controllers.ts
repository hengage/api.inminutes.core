import { Request, Response } from "express";
import {
  STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { UsersService } from "../../../services";
import { ridersRepo } from "../repository/riders.repo";
import { validateRider } from "../validators/riders.validators";
import { ridersService } from "../services/riders.service";

class RidersController {
  private usersService: UsersService;

  constructor(){
    this.usersService = new UsersService();
  }

  async signup(req: Request, res: Response) {
    try {
      await validateRider.signUp(req.body);

      
    await Promise.all([
      this.usersService.isDisplayNameTaken(req.body.displayName),
      ridersService.checkEmailIstaken(req.body.email),
      ridersService.checkPhoneNumberIstaken(req.body.phoneNumber),
    ]);

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
      await validateRider.login(req.body);
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
