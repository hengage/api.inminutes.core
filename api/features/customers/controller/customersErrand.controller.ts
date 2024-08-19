import { Request, Response } from "express";
import { CustomerErrandService } from "../services/customerErrand.service";
import { handleErrorResponse, STATUS_CODES } from "../../../utils";
import { ValidateCustomer } from "../validators/customers.validator";

export class CustomerErrandController {
  private customerErrandService: CustomerErrandService;
  private validateCustomer: ValidateCustomer;
  constructor() {
    this.customerErrandService = new CustomerErrandService();
    this.validateCustomer = new ValidateCustomer();
  }

  async getHistory(req: Request, res: Response) {
    const userType = req.query.usertype as "customer" ;
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const customerId = (req as any).user._id;

    console.log({ userType, customerId, page, limit });

    try {
    //   await this.validateCustomer.errandHistory(userType, res);
      const history = await this.customerErrandService.getHistory({
        userType,
        customerId,
        page,
        limit,
      });
      res.status(STATUS_CODES.OK).json({
        message: "History retrieved",
        history,
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}
