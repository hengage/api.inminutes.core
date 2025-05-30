import { Request, Response } from "express";
import {
  AdminOpsForErrandsService,
  GetErrandsFilter,
} from "../services/errands.services";
import { handleErrorResponse, Msg } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

export const AdminOpsForErrandsController = {
  async getList(req: Request, res: Response) {
    try {
      const filter: GetErrandsFilter = req.query;
      const errands = await AdminOpsForErrandsService.getList(filter);
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { errands });
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

  async addPackageType(req: Request, res: Response) {
    try {
      const packageType = await AdminOpsForErrandsService.addPackageType(
        req.body
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.CREATED, { packageType });
    } catch (error: unknown) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async updatePackageType(req: Request, res: Response) {
    try {
      const { packageTypeId } = req.params;
      const packageType = await AdminOpsForErrandsService.updatePackageType(
        packageTypeId,
        req.body
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { packageType });
    } catch (error: unknown) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
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
  },
};
