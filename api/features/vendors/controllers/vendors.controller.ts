import { Request, Response } from "express";
import {
  STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { vendorsRepo } from "../repository/vendors.repo";
import { usersService } from "../../../services";
import { vendorsService } from "../services/vendor.services";
import { validateVendor } from "../validators/vendors.validators";

class VendorsController {
  async signup(req: Request, res: Response) {
    try {
      await validateVendor.signUp(req.body);
      await vendorsService.checkBusinnessNameIstaken(req.body.businessName);
      await usersService.isEmailTaken(req.body.email);
      await usersService.isPhoneNumberTaken(req.body.phoneNumber);

      const vendor = await vendorsRepo.signup(req.body);

      const jwtPayload = { _id: vendor._id, email: vendor.email };
      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: { vendor, accessToken, refreshToken },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      await validateVendor.login(req.body)
      const vendor = await vendorsRepo.login(req.body.email, req.body.password);

      const jwtPayload = { _id: vendor._id, email: vendor.email };
      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      res.status(STATUS_CODES.OK).json({
        message: "Login successful",
        data: { vendor, accessToken, refreshToken },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const vendorsController = new VendorsController();
