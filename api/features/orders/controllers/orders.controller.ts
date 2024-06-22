import { Request, Response } from "express";

import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { OrdersRepository } from "../repository/orders.repo";
import { OrdersService } from "../services/orders.service";
import { ValidateOrders } from "../validation/orders.validation";

export class OrdersController {
  private ordersRepo: OrdersRepository;
  private ordersService: OrdersService;
  private validateOrders: ValidateOrders;

  constructor() {
    this.ordersRepo = new OrdersRepository();
    this.ordersService = new OrdersService();
    this.validateOrders = new ValidateOrders();
  }
  create = async (req: Request, res: Response) => {
    const customer = (req as any).user._id;

    try {
      const order = await this.ordersService.create({
        orderData: req.body,
        customer,
      });
      res.status(STATUS_CODES.CREATED).json({
        message: "success",
        data: { order },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };

  orderDetails = async (req: Request, res: Response) => {
    try {
      const order = await this.ordersService.details(req.params.orderId);
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { order },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };

  submitOrderFeedback = async (req: Request, res: Response) => {
    const {
      vendorId,
      vendorRating,
      riderId,
      riderRating,
      remarkOnVendor,
      remarkOnRider,
    } = req.body;
    const { orderId } = req.params;
    try {
      await this.validateOrders.orderFeedback(req.body);
      await this.ordersService.submitOrderFeedback({
        orderId,
        vendorId,
        vendorRating,
        riderRating,
        riderId,
        remarkOnVendor,
        remarkOnRider,
      });
      res.status(200).json({
        message: "Success",
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };
}
