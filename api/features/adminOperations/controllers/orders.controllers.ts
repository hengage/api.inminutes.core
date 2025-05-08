import { Request, Response } from "express";
import { AdminOpsForOrdersService, GetOrdersFilter } from "../services/orders.services";
import { handleErrorResponse } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES, ORDER_TYPE, SORT_ORDER } from "../../../constants";
import { ValidateAdminOpsOrders } from "../validators/adminOpsOrders.validate";

export const AdminOpsForOrdersController = {
    async getList(req: Request, res: Response) {
        try {
            const { page, searchQuery, fromDate, toDate, sort, limit } = req.query;

            // await ValidateAdminOpsOrders.getList({
            //     page: req.query.page as unknown as number,
            //     searchQuery: searchQuery as string,
            //     fromDate: fromDate as string,
            //     toDate: toDate as string,
            //     sort: sort as SORT_ORDER,
            //     type: req.query.type as ORDER_TYPE,
            //     rider: req.query.rider as string,
            //     customer: req.query.customer as string,
            //     vendor: req.query.vendor as string,
            // });

            const filter: GetOrdersFilter = req.query;
            const orders = await AdminOpsForOrdersService.getList(
                Number(page),
                filter,
                Number(limit)
            );

            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { orders })
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
            console.log('Error getting order: ', error)
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },

    async assignRider(req: Request, res: Response) {
        try {
            await ValidateAdminOpsOrders.assignRider({
                orderId: req.params.orderId,
                riderId: req.body.riderId
            });

            const order = await AdminOpsForOrdersService.assignRider(
                req.params.orderId,
                req.body.riderId
            );
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { order });
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
                status: req.body.status
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
}
