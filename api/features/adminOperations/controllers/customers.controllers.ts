
import { Request, Response } from "express";
import { AdminOpsForCustomersService, GetCustomersFilter } from "../services/customers.services";
import { handleErrorResponse } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

export const AdminOpsForCustomersController = {
    async getList(req: Request, res: Response) {
        try {
            const page = req.query.page as unknown as number;
            const filter: GetCustomersFilter = {
                searchQuery: req.query.searchQuery as string,
                fromDateJoined: req.query.fromDateJoined as string,
                toDateJoined: req.query.toDateJoined as string
            };

            const customers = await AdminOpsForCustomersService.getList(page, filter);
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { customers });
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },

    async customerDetails(req: Request, res: Response) {
        try {
            const customer = await AdminOpsForCustomersService.customerDetails(req.params.customerId)
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { customer });
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }
}
