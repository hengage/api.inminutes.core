import { Request, Response } from "express";
import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { vendorsCategoryService } from "../services/category.services";

class VendorsCategoryController {
  async getCategories(req: Request, res: Response) {
    try {
      const catgories = await vendorsCategoryService.getCategories();
      res.status(STATUS_CODES.OK).json({
        message: "Successful",
        data: { catgories },
      });
    } catch (error: any) {
      return handleErrorResponse(res, error);
    }
  }

  async getSubCategoriesByCategory(req: Request, res: Response) {
    try {
      const subCatgories =
        await vendorsCategoryService.getSubCategoriesByCategory(
          req.params.categoryId
        );
      res.status(STATUS_CODES.OK).json({
        message: "Successful",
        data: { subCatgories },
      });
    } catch (error: any) {
      return handleErrorResponse(res, error);
    }
  }
}

export const vendorsCategoryController = new VendorsCategoryController();
