import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { AdminOpsVendorsCategoryService } from "../services/vendorsCategory.service";
import { ValidateAdminVendorsOps } from "../validators/adminVendorsOps.validate";

export class AdminOpsVendorsCategoryController {
  private validateAdminVendorsOps: ValidateAdminVendorsOps;
  private adminOpsVendorsCategoryService: AdminOpsVendorsCategoryService;

  constructor() {
    this.validateAdminVendorsOps = new ValidateAdminVendorsOps();
    this.adminOpsVendorsCategoryService = new AdminOpsVendorsCategoryService();
  }

  async createCategory(req: Request, res: Response) {
    try {
      await this.validateAdminVendorsOps.createCategory(req.body);

      const category = await this.adminOpsVendorsCategoryService.createCategory(
        req.body
      );
      
      return res.status(HTTP_STATUS_CODES.CREATED).json({
        message: "Successful",
        data: { category },
      });
    } catch (error: any) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async createSubCategory(req: Request, res: Response) {
    try {
      await this.validateAdminVendorsOps.createSubCategory(req.body);

      const subCategory =
        await this.adminOpsVendorsCategoryService.createSubCategory(req.body);

      return res.status(HTTP_STATUS_CODES.CREATED).json({
        message: "Successful",
        data: { subCategory },
      });
    } catch (error: any) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}