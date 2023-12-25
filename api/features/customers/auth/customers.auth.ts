import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { STATUS_CODES } from "../../../utils";
import { ICustomer } from "../customers.interface";

class CustomersAuthentication {
  public login(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("local", { session: false }, (err: any, user: ICustomer, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      res.status(STATUS_CODES.OK).json({
        message: "Successful",
        data: { useer: user._id}
      })
    })(req, res, next);
  }
}

export const customersAuthentication = new CustomersAuthentication()
