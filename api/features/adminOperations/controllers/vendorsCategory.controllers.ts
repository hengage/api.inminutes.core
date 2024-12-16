import { Request, Response } from "express";
import { capitalize, handleErrorResponse } from "../../../utils";
import { AdminOpsVendorsCategoryService } from "../services/vendorsCategory.service";
import { ValidateAdminVendorsOps } from "../validators/adminVendorsOps.validate";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

export class AdminOpsVendorsCategoryController {
  private validateAdminVendorsOps: ValidateAdminVendorsOps;
  private adminOpsVendorsCategoryService: AdminOpsVendorsCategoryService;

  constructor() {
    this.validateAdminVendorsOps = new ValidateAdminVendorsOps();
    this.adminOpsVendorsCategoryService = new AdminOpsVendorsCategoryService();
  }

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.validateAdminVendorsOps.createCategory(req.body);

      const category = await this.adminOpsVendorsCategoryService.createCategory(
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
  };

  createSubCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.validateAdminVendorsOps.createSubCategory(req.body);

      const subCategory =
        await this.adminOpsVendorsCategoryService.createSubCategory(req.body);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { subCategory },
        `${capitalize(subCategory.name)} sub-category created`,
      );
    } catch (error: unknown) {
      console.log("Error creating sub-category: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories =
        await this.adminOpsVendorsCategoryService.getCategories();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { categories });
    } catch (error: unknown) {
      console.log("Error getting categories: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await this.adminOpsVendorsCategoryService.getCategory(
        req.params.categoryId,
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { category });
    } catch (error: unknown) {
      console.log("Error getting category: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      // await this.validateAdminVendorsOps.updateCategory(req.body);
      // Todo: validate req
      const category = await this.adminOpsVendorsCategoryService.updateCategory(
        req.params.categoryId,
        req.body,
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { category },
        `${capitalize(category.name)} category updated`,
      );
    } catch (error: unknown) {
      console.log("Error updating category: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.adminOpsVendorsCategoryService.deleteCategory(
        req.params.categoryId,
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, {}, "Category deleted");
    } catch (error: unknown) {
      console.log("Error deleting category: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
