import { Request, Response } from "express";
import { capitalize, handleErrorResponse } from "../../../utils";
import { AdminOpsForProductsService } from "../services/products.services";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

export class AdminOpsForProductsController {
  private adminOpsForProductsService: AdminOpsForProductsService;

  constructor() {
    this.adminOpsForProductsService = new AdminOpsForProductsService();
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = await this.adminOpsForProductsService.createCategory(
        req.body
      );

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { category },
        `${capitalize(category.name)} category created`
      );
    } catch (error: unknown) {
      console.log("Error creating category: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async approveProduct(req: Request, res: Response): Promise<void> {
    try {
      await this.adminOpsForProductsService.approveProduct(
        req.params.productId
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "Product has been approved"
      );
    } catch (error: unknown) {
      console.log("Error approving product: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async rejectProduct(req: Request, res: Response): Promise<void> {
    try {
      await this.adminOpsForProductsService.rejectProduct(req.params.productId);
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "Product has been rejected"
      );
    } catch (error: any) {
      console.error("Error rejecting product:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}
