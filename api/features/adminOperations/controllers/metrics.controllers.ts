import { Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../../../constants";
import { handleErrorResponse, handleSuccessResponse } from "../../../utils";
import { AdminOpsMetricsService } from "../services/metrics.services";

export const MetricsController = {
  async getVendorsSummary(req: Request, res: Response) {
    try {
      const summary = await AdminOpsMetricsService.getVendorsSummary();
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        summary,
        "Vendors summary retrieved successfully"
      );
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getTopVendors(req: Request, res: Response) {
    try {
      const topVendors = await AdminOpsMetricsService.getTopVendors();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, topVendors);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getTopVendorCategories(req: Request, res: Response) {
    try {
      const topVendorCategories =
        await AdminOpsMetricsService.getTopVendorCategories();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, topVendorCategories);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },
};
