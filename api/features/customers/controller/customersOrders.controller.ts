import { Request, Response } from "express";
import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { CustomersOrdersService } from "../services/customerOrders.service";

export class CustomersOrdersController {
  private customersOrdersService: CustomersOrdersService;

  constructor(){
    this.customersOrdersService = new CustomersOrdersService()
  }

  async orderMetrics(req: Request, res: Response) {
    const customerId = (req as any).user._id;
    try {
      const orderMetrics = await this.customersOrdersService.orderMetrics(
        customerId
      );
      res.status(STATUS_CODES.OK).json({
        success: true,
        data: { orderMetrics },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async orders(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const customerId = (req as any).user._id;
    try {
      const orders = await this.customersOrdersService.orders({ customerId, page });
      console.log({orders})
      res.status(STATUS_CODES.OK).json({
        success: true,
        data: { orders },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}