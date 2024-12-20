
import { Request, Response } from "express";
import { AdminOpsForCustomersService, GetCustomersFilter } from "../services/customers.services";
import { handleErrorResponse } from "../../../utils";

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
            return res.status(200).json(customers);
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }
}
