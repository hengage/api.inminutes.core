import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { AdminOpsForProductsService } from "../services/products.services";

export class AdminOpsForProductsController {
  private adminOpsForProductsService: AdminOpsForProductsService;

  constructor() {
    this.adminOpsForProductsService = new AdminOpsForProductsService();
  }

  async createCategory(req: Request, res: Response) {
    try {
      const category = await this.adminOpsForProductsService.createCategory(
        req.body
      );
      res.status(HTTP_STATUS_CODES.CREATED).json({
        message: "Success",
        data: { category },
      });
    } catch (error: any) {
      return handleErrorResponse(res, error);
    }
  }

  async approveProduct(req: Request, res: Response) {
    try {
      await this.adminOpsForProductsService.approveProduct(
        req.params.productId
      );
      res.status(HTTP_STATUS_CODES.CREATED).json({
        message: "Success",
      });
    } catch (error: any) {
      return handleErrorResponse(res, error);
    }
  }

  async rejectProduct(req: Request, res: Response) {
    try {
      await this.adminOpsForProductsService.rejectProduct(req.params.productId);
      res.status(HTTP_STATUS_CODES.CREATED).json({
        message: "Success",
      });
    } catch (error: any) {
      return handleErrorResponse(res, error);
    }
  }
}
