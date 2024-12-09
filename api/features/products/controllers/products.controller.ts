import { Request, Response } from "express";

import { handleErrorResponse } from "../../../utils";
import { ProductsRepository } from "../repository/products.repo";
import { validateProducts } from "../validators/products.validators";
import { productsService } from "../services/products.service";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

export class ProductsController {
  private productsRepo: ProductsRepository;

  constructor() {
    this.productsRepo = new ProductsRepository();
  }

  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.productsRepo.getCategories();

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { categories },
      );

    } catch (error: unknown) {
      console.log("Error getting categories: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      await validateProducts.addProduct(req.body);
      const vendor = (req as any).user._id;
      const product = await this.productsRepo.addProduct(req.body, vendor);

      res.status(HTTP_STATUS_CODES.CREATED).json({
        message: "Success",
        data: { product },
      });

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { product },
        "Product added"
      );
    } catch (error: unknown) {
      console.log("Error adding product: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  details = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await productsService.details(req.params.productId);

      handleSuccessResponse(
        res, HTTP_STATUS_CODES.OK,
        { product },
      )
    } catch (error: unknown) {
      console.log("Error getting product details: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const vendor = (req as any).user;
      await this.productsRepo.deleteProduct(req.params.productId, vendor._id);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "Product deleted"
      );
    } catch (error: any) {
      console.log("Error deleting product: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  searchProducts = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string);

    try {
      await validateProducts.productSearch(req.body);
      const products = await this.productsRepo.searchProducts({
        page,
        term: req.body.term,
      });

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { products },
      );
    } catch (error: unknown) {
      console.error("Error querying for products:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getProductsByCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    try {
      const products = await this.productsRepo.getProductsByCategory({
        categoryId: req.params.categoryId,
        page,
      });

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { products });
    } catch (error: unknown) {
      console.error("Error getting products by category:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
