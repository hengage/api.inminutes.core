import { Request, Response } from "express";

import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { productsRepo } from "../repository/products.repo";
import { validateProducts } from "../validators/products.validators";

class ProductsController {
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await productsRepo.getCategories();
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { categories },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async addProduct(req: Request, res: Response) {
    try {
      await validateProducts.addProduct(req.body);
      const vendor = (req as any).user._id;
      const product = await productsRepo.addProduct(req.body, vendor);
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: { product },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async productDetails(req: Request, res: Response) {
    try {
      const product = await productsRepo.productDetails(req.params.productId);
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: { product },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const vendor = (req as any).user;
      console.log(vendor);
      await productsRepo.deleteProduct(req.params.productId, vendor._id);
      res.status(STATUS_CODES.OK).json({
        message: "success",
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async searchProducts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string);

    try {
      await validateProducts.productSearch(req.body);
      const products = await productsRepo.searchProducts({
        page,
        term: req.body.term,
      });
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { products },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const productsController = new ProductsController();
