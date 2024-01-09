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
      await validateVendor.signUp(req.body)
      await vendorsService.checkBusinnessNameIstaken(req.body.businessName);
      await usersService.isEmailTaken(req.body.email);
      await usersService.isPhoneNumberTaken(req.body.phoneNumber);

      const vendor = await vendorsRepo.signup(req.body);

      const jwtPayload = { _id: vendor._id, phoneNumber: vendor.phoneNumber };
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
}

export const vendorsController = new VendorsController();
