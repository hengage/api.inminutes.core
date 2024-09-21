import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { CustomersOrdersService } from "../services/customerOrders.service";

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
      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: { orderMetrics },
      });
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
      console.log({ orders });
      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: { orders },
      });
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
