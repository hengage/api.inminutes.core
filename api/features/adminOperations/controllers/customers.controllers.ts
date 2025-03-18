
import { Request, Response } from "express";
import { AdminOpsForCustomersService } from "../services/customers.services";
import { handleErrorResponse, Msg } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { ACCOUNT_STATUS, HTTP_STATUS_CODES } from "../../../constants";
import { ValidateAdminOpsCustomers } from "../validators/adminOpsCustomers.validate";
import { CustomerMetricsRange, GetCustomersFilter } from "../Interfaces/customer.interface";

export const AdminOpsForCustomersController = {
    async getList(req: Request, res: Response) {
        try {
            const page = req.query.page as unknown as number;
            const filter: GetCustomersFilter = {
                searchQuery: req.query.searchQuery as string,
                fromDateJoined: req.query.fromDateJoined as string,
                toDateJoined: req.query.toDateJoined as string,
                accountStatus: req.query.status as ACCOUNT_STATUS
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

    async getTopList(req: Request, res: Response) {
        try {
            const page = req.query.page as unknown as number;
            const limit = req.query.limit as unknown as number || 5;
            const filter: GetCustomersFilter = {
                searchQuery: req.query.searchQuery as string,
                fromDateJoined: req.query.fromDateJoined as string,
                toDateJoined: req.query.toDateJoined as string,
                accountStatus: req.query.status as ACCOUNT_STATUS
            };

            const topCustomers = await AdminOpsForCustomersService.getTopList(page, filter, limit);
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { topCustomers });
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },

    async getCustomerSummary(req: Request, res: Response) {
        try {
            const summary = await AdminOpsForCustomersService.getCustomerSummary();
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { summary });
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },

    async getCustomerMetrics(req: Request, res: Response) {
        try {
            const data: CustomerMetricsRange = {
                startDate: new Date(req.query.startDate as string).toISOString(),
                endDate: new Date(req.query.endDate as string).toISOString()
            };

            const metrics = await AdminOpsForCustomersService.getCustomerMetrics(data);
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { metrics });
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }
}
