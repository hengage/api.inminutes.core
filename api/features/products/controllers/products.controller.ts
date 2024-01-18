import { Request, Response } from "express";

import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { productsRepo } from "../repository/products.repo";
import { validateProducts } from "../validators/products.validators";

class ProductsController {
  async addProduct(req: Request, res: Response) {
    try {
      await validateProducts.addProduct(req.body)
      const vendor = (req as any).user._id
      const product = await productsRepo.addProduct(req.body, vendor);
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: { product },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const productsController = new ProductsController();
