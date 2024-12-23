
import { Request, Response } from "express";
import { AdminOpsForOrdersService } from "../services/orders.services";
import { handleErrorResponse } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

export const AdminOpsForOrdersController = {
    async getList(req: Request, res: Response) {
        try {
            const { page = 1, searchQuery, fromDate, toDate, sort } = req.query;

            const orders = await AdminOpsForOrdersService.getList(Number(page), {
                searchQuery: searchQuery as string,
                fromDate: fromDate as string,
                toDate: toDate as string,
                sort: sort as 'asc' | 'desc'
            });

            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { orders })
        } catch (error: unknown) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },
    async getDetails(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
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
    }
}
