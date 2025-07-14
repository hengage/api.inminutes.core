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

  async getVendorsChart(req: Request, res: Response) {
    try {
      const { fromDate, toDate } = req.query;
      const metrics = await AdminOpsMetricsService.getVendorsChart(
        fromDate as string,
        toDate as string
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, metrics);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getRidersSummary(req: Request, res: Response) {
    try {
      const summary = await AdminOpsMetricsService.getRidersSummary();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, summary);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getTopRiders(req: Request, res: Response) {
    try {
      const topRiders = await AdminOpsMetricsService.getTopRiders();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, topRiders);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getRidersChart(req: Request, res: Response) {
    try {
      const { fromDate, toDate } = req.query;
      const metrics = await AdminOpsMetricsService.getRidersChart(
        fromDate as string,
        toDate as string
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, metrics);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getProductsSummary(req: Request, res: Response) {
    try {
      const summary = await AdminOpsMetricsService.getProductsSummary();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, summary);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getTopProducts(req: Request, res: Response) {
    try {
      const topProducts = await AdminOpsMetricsService.getTopProducts();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, topProducts);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getTopProductCategories(req: Request, res: Response) {
    try {
      const topProductCategories =
        await AdminOpsMetricsService.getTopProductCategories();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, topProductCategories);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getProductsChart(req: Request, res: Response) {
    try {
      const { fromDate, toDate } = req.query;
      const metrics = await AdminOpsMetricsService.getProductsChart(
        fromDate as string,
        toDate as string
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, metrics);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getCustomersSummary(req: Request, res: Response) {
    try {
      const summary = await AdminOpsMetricsService.getCustomersSummary();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, summary);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getTopCustomers(req: Request, res: Response) {
    try {
      const topCustomers = await AdminOpsMetricsService.getTopCustomers();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, topCustomers);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getCustomersChart(req: Request, res: Response) {
    try {
      const { fromDate, toDate } = req.query;
      const customersChart = await AdminOpsMetricsService.getCustomersChart(
        fromDate as string,
        toDate as string
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, customersChart);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },
};
