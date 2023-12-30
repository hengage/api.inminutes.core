import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { STATUS_CODES, generateJWTToken } from "../../../utils";
import { ICustomer } from "../customers.interface";

class CustomersAuthentication {
  public login(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate(
      "local",
      { session: false },
      (err: any, user: ICustomer, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message });
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
  }
}

export const customersAuthentication = new CustomersAuthentication();
