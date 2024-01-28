import { Request, Response } from "express";
import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { adminOpsForProductsService } from "../services/products.services";

class AdminOpsForProductsController {
  async createCategory(req: Request, res: Response) {
    try {
      const category = await adminOpsForProductsService.createCategory(
        req.body
      );
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: { category },
      });
    } catch (error: any) {
      return handleErrorResponse(res, error);
    }
  }

  async approveProduct(req: Request, res: Response) {
    try {
      await adminOpsForProductsService.approveProduct(req.params.productId);
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
      });
    } catch (error: any) {
      return handleErrorResponse(res, error);
    }
  }
}

export const adminOpsForProductsController =
  new AdminOpsForProductsController();
