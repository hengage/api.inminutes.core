import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { CustomersOrdersService } from "../services/customerOrders.service";
import { handleSuccessResponse } from "../../../utils/response.utils";

export class CustomersOrdersController {
  private customersOrdersService: CustomersOrdersService;

  constructor() {
    this.customersOrdersService = new CustomersOrdersService();
  }

  orderMetrics = async (req: Request, res: Response) => {
    const customerId = (req as any).user._id;
    try {
      const orderMetrics = await this.customersOrdersService.orderMetrics(
        customerId
      );

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { orderMetrics },
      );
    } catch (error: any) {
      console.error('Error fetching order metrics:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  orders = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const customerId = (req as any).user._id;
    try {
      const orders = await this.customersOrdersService.orders({
        customerId,
        page,
      });

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { orders },
      );
    } catch (error: any) {
      console.error('Error fetching orders for customer:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
