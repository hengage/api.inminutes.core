import { Request, Response } from "express";
import { customersRepo } from "../repo/customers.repo";
import {
  STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { validateCustomer } from "../validators/customers.validator";
import { customersService } from "../services/customers.services";
import { usersService } from "../../../services";

class CustomersController {
  async signup(req: Request, res: Response) {
    try {
      await validateCustomer.signUp(req.body);
      await usersService.isDisplayNameTaken(req.body.displayName);
      const customer = await customersRepo.signup(req.body);
      const jwtPayload = {
        _id: customer._id,
        phoneNumber: customer.phoneNumber,
      };

      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: {
          customer: { _id: customer._id },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async getProfile(req: Request, res: Response) {
    const _id = (req as any).user._id;
    try {
      const customer = await customersRepo.getProfile(_id);
      res.status(STATUS_CODES.OK).json({
        message: "Fetched customer profile",
        data: { customer },
      });
    } catch (error: any) {
      res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
        message: "Error getting profile",
        error: error.message || "Server error",
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    const customer = (req as any).user._id;

    try {
      await validateCustomer.updateProfile(req.body);
      const profile = await customersRepo.updateProfile(customer, req.body);
      res.status(STATUS_CODES.OK).json({
        message: "Success",
        data: { profile },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async deleteAccount(req: Request, res: Response) {
    const customer = (req as any).user._id;

    try {
      await customersRepo.deleteAccount(customer);
      res.status(STATUS_CODES.OK).json({
        message: "Success",
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const customersController = new CustomersController();
