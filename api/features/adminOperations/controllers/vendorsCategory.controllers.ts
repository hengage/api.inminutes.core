import { Request, Response } from "express";
import { HTTP_STATUS_CODES, capitalize, handleErrorResponse } from "../../../utils";
import { AdminOpsVendorsCategoryService } from "../services/vendorsCategory.service";
import { ValidateAdminVendorsOps } from "../validators/adminVendorsOps.validate";
import { handleSuccessResponse } from "../../../utils/response.utils";

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
        req.body
      );

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { category },
        `${capitalize(category.name)} category created`
      );
    } catch (error: any) {
      console.log("Error creating category: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  createSubCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.validateAdminVendorsOps.createSubCategory(req.body);

      const subCategory =
        await this.adminOpsVendorsCategoryService.createSubCategory(req.body);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { subCategory },
        `${capitalize(subCategory.name)} sub-category created`
      );
    } catch (error: any) {
      console.log("Error creating sub-category: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}