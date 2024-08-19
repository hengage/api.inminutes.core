import { Request, Response } from "express";
import { CustomerErrandService } from "../services/customerErrand.service";
import { handleErrorResponse, STATUS_CODES } from "../../../utils";

export class CustomerErrandController {
  private customerErrandService: CustomerErrandService;
  constructor() {
    this.customerErrandService = new CustomerErrandService();
  }

  getHistory = async (req: Request, res: Response) => {
    const userType = req.query.usertype as "customer";
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const customerId = (req as any).user._id;

    console.log({ userType, customerId, page, limit });

    try {
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
  };
}
