import { Request, Response } from "express";
import {
  HTTP_STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { validateRider } from "../validators/riders.validators";
import { ridersService } from "../services/riders.service";
import { handleSuccessResponse } from "../../../utils/response.utils";
class RidersController {

  constructor() {
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      await validateRider.signUp(req.body);
      const rider = await ridersService.signup(req.body);

      const jwtPayload = { _id: rider._id, email: rider.email };
      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { rider, accessToken, refreshToken },
        "Rider account created"
      );
    } catch (error: any) {
      console.error("Error signing up rider:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error)
      res.status(statusCode).json(errorJSON);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      await validateRider.login(req.body);
      const rider = await ridersService.login(req.body);

      const jwtPayload = { _id: rider._id, phoneNumber: rider.phoneNumber };
      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      handleSuccessResponse(res,
        HTTP_STATUS_CODES.OK,
        { rider, accessToken, refreshToken },
        "Login successful",
      );
    } catch (error: unknown) {
      console.error("Error on rider login:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error)
      res.status(statusCode).json(errorJSON);
    }
  };

  getMe = async (req: Request, res: Response) => {
    const id = (req as any).user._id;
    try {
      const rider = await ridersService.getMe(id);

      handleSuccessResponse(
        res, HTTP_STATUS_CODES.OK, { rider }
      )
    } catch (error: unknown) {
      console.error("Error getting rider:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error)
      res.status(statusCode).json(errorJSON);
    }
  };
}

export const ridersController = new RidersController();
