import { Request, Response } from "express";
import { handleErrorResponse } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { vendorsCategoryRepo } from "../repository/vendorsCategory.repo";
import { HTTP_STATUS_CODES } from "../../../constants";

class VendorsCategoryController {
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await vendorsCategoryRepo.getCategories(Number(req.query.page), Number(req.query.limit));

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { categories });
    } catch (error: unknown) {
      console.error("Error fetching categories:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async getSubCategoriesByCategory(req: Request, res: Response) {
    try {
      const subCatgories = await vendorsCategoryRepo.getSubCategoriesByCategory(
        req.params.categoryId,
      );

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { subCatgories });
    } catch (error: unknown) {
      console.error("Error fetching subcategories:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async getLocalMarketSubcategories(req: Request, res: Response) {
    try {
      const subCatgories =
        await vendorsCategoryRepo.getLocalMarketSubcategories();

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { subCatgories });
    } catch (error: any) {
      console.error("Error fetching local market subcategory:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const vendorsCategoryController = new VendorsCategoryController();
