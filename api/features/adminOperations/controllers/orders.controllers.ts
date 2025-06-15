import { Request, Response } from "express";
import { AdminOpsForOrdersService } from "../services/orders.services";
import { capitalize, handleErrorResponse } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";
import { ValidateAdminOpsOrders } from "../validators/adminOpsOrders.validate";
import { GetOrdersQueryParams } from "../interfaces/orders.interface";

export const AdminOpsForOrdersController = {
  async getList(req: Request, res: Response) {
    try {
      await ValidateAdminOpsOrders.getList(req.query as GetOrdersQueryParams);

      const orders = await AdminOpsForOrdersService.getList(
        req.query as GetOrdersQueryParams
      );

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { orders });
    } catch (error: unknown) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getDetails(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      await ValidateAdminOpsOrders.getDetails({ orderId });

      const order = await AdminOpsForOrdersService.getDetails(orderId);

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { order });
    } catch (error: unknown) {
      console.log("Error getting order: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async assignRider(req: Request, res: Response) {
    try {
      await ValidateAdminOpsOrders.assignRider({
        orderId: req.params.orderId,
        riderId: req.body.riderId,
      });

      const order = await AdminOpsForOrdersService.assignRider(
        req.params.orderId,
        req.body.riderId
      );

      const riderName = capitalize(order?.rider?.fullName as string);
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { order },
        `You have assigned ${riderName} (id: ${order?.rider?._id}) to this order`
      );
    } catch (error: unknown) {
      console.log("Error asigning rider: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      await ValidateAdminOpsOrders.updateStatus({
        orderId: req.params.orderId,
        status: req.body.status,
      });

      const order = await AdminOpsForOrdersService.updateStatus(
        req.params.orderId,
        req.body.status
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { order });
    } catch (error: unknown) {
      console.log("Error updating order status: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },
};
