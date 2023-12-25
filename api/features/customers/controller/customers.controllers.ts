import { Request, Response } from "express";
import { customerRepo } from "../repo/customers.repo";
import { STATUS_CODES } from "../../../utils";

class CustomerController {
  async signup(req: Request, res: Response) {
    try {
      const customer = await customerRepo.signup(req.body);
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: { customer },
      });
    } catch (error: any) {
      res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
        message: "Failed",
        error: error.message || "Server error",
      });
    }
  }
}

export const customerController = new CustomerController();
