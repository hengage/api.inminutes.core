import passport from "passport";
import { Request, Response, NextFunction } from "express";
import {
  STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { ICustomer } from "../customers.interface";
import { validateCustomer } from "../validators/customers.validator";

class CustomersAuthentication {
  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await validateCustomer.login(req.body);

      passport.authenticate(
        "local",
        { session: false },
        async (err: any, user: ICustomer, info: any) => {
          if (err) {
            return next(err);
          }

          if (!user) {
            return handleErrorResponse(res, {
              status: STATUS_CODES.UNAUTHORIZED,
              message: info.message,
            });
          }

          console.log({ user });
          const jwtPayload = {
            _id: user._id,
            phoneNumber: user.phoneNumber,
          };

          const accessToken = generateJWTToken(jwtPayload, "1h");
          const refreshToken = generateJWTToken(jwtPayload, "14d");

          res.status(STATUS_CODES.OK).json({
            message: "Successful",
            data: { customer: { _id: user._id }, accessToken, refreshToken },
          });
        }
      )(req, res, next);
    } catch (error: any) {
      return handleErrorResponse(res, error);
    }
  }
}

export const customersAuthentication = new CustomersAuthentication();
