
import { Request, Response } from "express";
import { AdminOpsForCustomersService, GetCustomersFilter } from "../services/customers.services";
import { handleErrorResponse, Msg } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";
import { ValidateAdminOpsCustomers } from "../validators/adminOpsCustomers.validate";

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
    },

    async setAccountStatus(req: Request, res: Response) {
        try {
            await ValidateAdminOpsCustomers.setAccountStatus(req.body);
            const { customerId } = req.params;
            const { status } = req.body;

            await AdminOpsForCustomersService.setAccountStatus(customerId, status);
            handleSuccessResponse(
                res, HTTP_STATUS_CODES.OK, null,
                Msg.USER_ACCOUNT_STATUS_UPDATED(customerId, req.body.status)
            );
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },
}
