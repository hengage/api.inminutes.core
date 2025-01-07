import { Request, Response } from "express";
import { capitalize, handleErrorResponse } from "../../../utils";
import { AdminOpsForProductsService, GetProductsFilter } from "../services/products.services";
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
        req.body,
      );

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { category },
        `${capitalize(category.name)} category created`,
      );
    } catch (error: unknown) {
      console.log("Error creating category: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  approveProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.adminOpsForProductsService.approveProduct(
        req.params.productId,
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        `Product '${req.params.productId}' has been approved`,
      );
    } catch (error: unknown) {
      console.log("Error approving product: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  rejectProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.adminOpsForProductsService.rejectProduct(req.params.productId);
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        `Product '${req.params.productId}' has been rejected`,
      );
    } catch (error: unknown) {
      console.error("Error rejecting product:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  getProductList = async (req: Request, res: Response): Promise<void> => {
    try {
      const filter: GetProductsFilter = req.query;
      const page = Number(req.query.page) || 1;
      const products = await this.adminOpsForProductsService.getList(page, filter);
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { products });
    } catch (error: unknown) {
      console.error("Error fetching products list:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  getProductDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const product = await this.adminOpsForProductsService.getProductDetails(productId);
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { product });
    } catch (error: unknown) {
      console.error("Error fetching product details:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  metrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await this.adminOpsForProductsService.metrics();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { metrics });
    } catch (error: unknown) {
      console.error("Error fetching product metrics:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  pendingProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.adminOpsForProductsService.
        pendingProducts(Number(req.query.page))
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { products })
    } catch (error: unknown) {
      console.error("Error fetching products:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}
