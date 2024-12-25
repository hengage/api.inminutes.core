import { Request, Response } from 'express';
import { AdminOpsForErrandsService, GetErrandsFilter } from '../services/errands.services';
import { handleErrorResponse } from '../../../utils';
import { handleSuccessResponse } from '../../../utils/response.utils';
import { HTTP_STATUS_CODES } from '../../../constants';

export const AdminOpsForErrandsController = {
    async getList(req: Request, res: Response) {
        try {
            const filter: GetErrandsFilter = req.query;
            const errands = await AdminOpsForErrandsService.getList(
                Number(req.query.page),
                filter
            );
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { errands })
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },

    async getDetails(req: Request, res: Response) {
        try {
            const { errandId } = req.params;
            const errand = await AdminOpsForErrandsService.getDetails(errandId);
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { errand });
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },
}

