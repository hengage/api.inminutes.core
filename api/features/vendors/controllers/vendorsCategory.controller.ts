import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { vendorsCategoryRepo } from "../repository/vendorsCategory.repo";

class VendorsCategoryController {
  async getCategories(req: Request, res: Response) {
    try {
      const catgories = await vendorsCategoryRepo.getCategories();
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "Successful",
        data: { catgories },
      });
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async getSubCategoriesByCategory(req: Request, res: Response) {
    try {
      const subCatgories =
        await vendorsCategoryRepo.getSubCategoriesByCategory(
          req.params.categoryId
        );
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "Successful",
        data: { subCatgories },
      });
    } catch (error: any) {
      console.error('Error fetching subcategories:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async getLocalMarketSubcategories(req: Request, res: Response) {
    try {
      const subCatgories =
        await vendorsCategoryRepo.getLocalMarketSubcategories();
      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        message: subCatgories,
      });
    } catch (error: any) {
      console.error('Error fetching local market subcategory:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const vendorsCategoryController = new VendorsCategoryController();
