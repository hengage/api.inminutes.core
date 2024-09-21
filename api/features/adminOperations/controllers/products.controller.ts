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
    } catch (error: unknown) {
      console.log('Error creating category: ', error)
      const { statusCode, errorJSON } = handleErrorResponse(error);
      return res.status(statusCode).json(errorJSON);
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
    } catch (error: unknown) {
      console.log('Error approving product: ', error)
      const { statusCode, errorJSON } = handleErrorResponse(error);
      return res.status(statusCode).json(errorJSON);
    }
  }

  async rejectProduct(req: Request, res: Response) {
    try {
      await this.adminOpsForProductsService.rejectProduct(req.params.productId);
      res.status(HTTP_STATUS_CODES.CREATED).json({
        message: "Success",
      });
    } catch (error: any) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      return res.status(statusCode).json(errorJSON);
    }
  }
}
