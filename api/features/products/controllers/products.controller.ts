import { Request, Response } from "express";

import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { ProductsRepository } from "../repository/products.repo";
import { validateProducts } from "../validators/products.validators";
import { productsService } from "../services/products.service";

export class ProductsController {
  private productsRepo: ProductsRepository;

  constructor() {
    this.productsRepo = new ProductsRepository();
  }

  getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await this.productsRepo.getCategories();
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { categories },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };

  addProduct = async (req: Request, res: Response) => {
    try {
      await validateProducts.addProduct(req.body);
      const vendor = (req as any).user._id;
      const product = await this.productsRepo.addProduct(req.body, vendor);
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: { product },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };

  details = async (req: Request, res: Response) => {
    try {
      const product = await productsService.details(req.params.productId);
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: { product },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };

  async deleteProduct(req: Request, res: Response) {
    try {
      const vendor = (req as any).user;
      console.log(vendor);
      await this.productsRepo.deleteProduct(req.params.productId, vendor._id);
      res.status(STATUS_CODES.OK).json({
        message: "success",
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  searchProducts = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string);

    try {
      await validateProducts.productSearch(req.body);
      const products = await this.productsRepo.searchProducts({
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
  };

  getProductsByCategory = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    try {
      const products = await this.productsRepo.getProductsByCategory({
        categoryId: req.params.categoryId,
        page,
      });

      console.log({ products });
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { products },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };
}
