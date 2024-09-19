import { Request, Response } from "express";
import {
  HTTP_STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { validateRider } from "../validators/riders.validators";
import { ridersService } from "../services/riders.service";
import { handleError } from "../../../utils/response.utils";
class RidersController {

  constructor() {
  }

  signup = async (req: Request, res: Response) => {
    // async  signup (req: Request, res: Response) {
    try {
      await validateRider.signUp(req.body);
      const rider = await ridersService.signup(req.body);

      const jwtPayload = { _id: rider._id, email: rider.email };
      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      res.status(HTTP_STATUS_CODES.CREATED).json({
        message: "Success",
        data: { rider, accessToken, refreshToken },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
      const {statusCode, errorResponse} = handleError(error)
      res.status(statusCode).json(errorResponse);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      await validateRider.login(req.body);
      const rider = await ridersService.login(req.body);

      const jwtPayload = { _id: rider._id, phoneNumber: rider.phoneNumber };
      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      res.status(HTTP_STATUS_CODES.OK).json({
        message: "Login successful",
        data: { rider, accessToken, refreshToken },
      });
    } catch (error: any) {
      const {statusCode, errorResponse} = handleError(error)
      res.status(statusCode).json(errorResponse);
    }
  };

  getMe = async (req: Request, res: Response) => {
    const id = (req as any).user._id;
    try {
      const rider = await ridersService.getMe(id);
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "Success",
        data: { rider },
      });
    } catch (error: any) {
      const {statusCode, errorResponse} = handleError(error)
      res.status(statusCode).json(errorResponse);
    }
  };
}

export const ridersController = new RidersController();
