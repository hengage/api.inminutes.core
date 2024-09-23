import { Request, Response } from "express";
import { CustomerErrandService } from "../services/customerErrand.service";
import { handleErrorResponse, HTTP_STATUS_CODES } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";

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

    try {
      const history = await this.customerErrandService.getHistory({
        userType,
        customerId,
        page,
        limit,
      });

      return handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { history });
    } catch (error: unknown) {
      console.error("Error getting errand history: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
