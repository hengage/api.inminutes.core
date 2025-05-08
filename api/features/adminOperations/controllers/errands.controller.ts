import { Request, Response } from 'express';
import { AdminOpsForErrandsService, GetErrandsFilter } from '../services/errands.services';
import { handleErrorResponse, Msg } from '../../../utils';
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

    async getErrands(req: Request, res: Response){
        try {
          const { userId, page, limit, status, search, startDate, endDate } = req.query; 
          const errands = await AdminOpsForErrandsService.getErrands(
            {
              userId: userId as string, 
              page: Number(page), 
              limit: Number(limit),
              status: status as string,
              search: search as string,
              startDate: startDate as string,
              endDate: endDate as string
            }
          );
    
          handleSuccessResponse(res, HTTP_STATUS_CODES.OK, errands);
        } catch (error: unknown) {
          console.log("Error getting errand: ", error);
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

    async addPackageType(req: Request, res: Response) {
        try {
            const packageType = await AdminOpsForErrandsService.addPackageType(req.body);
            handleSuccessResponse(res, HTTP_STATUS_CODES.CREATED, { packageType });
        } catch (error: unknown) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },

    async updatePackageType(req: Request, res: Response) {

        try {
            const { packageTypeId } = req.params;
            const packageType = await AdminOpsForErrandsService.updatePackageType(packageTypeId, req.body);
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { packageType });
        } catch (error: unknown) {
            const { statusCode, errorJSON } = handleErrorResponse(error)
            res.status(statusCode).json(errorJSON);
        }
    },

    async deletePackageType(req: Request, res: Response) {
        try {
            const { packageTypeId } = req.params;
            await AdminOpsForErrandsService.deletePackageType(packageTypeId);
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, {
                message: Msg.DELETE_SUCCESS("package type"),
            });
        } catch (error: unknown) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }
}