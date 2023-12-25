import { Request, Response } from "express";
import { customerRepo } from "../repo/customers.repo";

class CustomerController {
  async signup(req: Request, res: Response) {
    try {
      const customer = await customerRepo.signup(req.body);
      res.status(200).json({
        message: "Success",
        data: { customer },
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        message: "Failed",
        error: error.message || "Server error",
      });
    }
  }
}

export const customerController = new CustomerController();
