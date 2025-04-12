import { Request, Response } from "express";
import { AdminOpsVendorsService } from "../services/vendors.service";
import { ACCOUNT_STATUS, HTTP_STATUS_CODES, USER_APPROVAL_STATUS } from "../../../constants";
import { Msg } from "../../../utils";
import {
  handleErrorResponse,
  handleSuccessResponse,
} from "../../../utils/response.utils";
import { ValidateAdminVendorsOps } from "../validators/adminVendorsOps.validate";
import { validateVendor } from "../../vendors/validators/vendors.validators";
import { vendorsService } from "../../vendors/services/vendor.services";
import { vendorsRepo } from "../../vendors";

export class AdminOpsVendorsController {
  private adminVendorsService = new AdminOpsVendorsService();
  private validateAdminVendorsOps = new ValidateAdminVendorsOps();
  private vendorService = vendorsService;
  private validateVendor = validateVendor;
  private vendorRepo = vendorsRepo;
  
  getAllVendors = async (req: Request, res: Response): Promise<void> => {
    try {

      const {page, status, approvalStatus, category, subCategory, search, startDate, endDate} = req.query
      const vendors = await this.adminVendorsService.getAllVendors(
        page as unknown as number,
        {
          accountStatus: status as ACCOUNT_STATUS,
          approvalStatus: approvalStatus as USER_APPROVAL_STATUS,
          category: category as string,
          subCategory: subCategory as string,
          searchQuery: search as string,
          startDate: startDate as string,
          endDate: endDate as string,
        },
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { vendors });
    } catch (error) {
      console.error("Error getting vendors: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      const vendor = await this.adminVendorsService.getVendor(req.params.vendorId);
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { vendor });
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  setAccountStatus = async (req: Request, res: Response): Promise<void> => {
    // Todo: Add validation for req.body.status
    try {
      await this.validateAdminVendorsOps.updateAccountStatus(req.body);
      await this.adminVendorsService.setAccountStatus(
        req.params.vendorId,
        req.body.status as ACCOUNT_STATUS,
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        Msg.USER_ACCOUNT_STATUS_UPDATED(req.params.vendorId, req.body.status),
      );
    } catch (error) {
      console.error("Error setting vendor account status: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  setApprovalStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.adminVendorsService.setApprovalStatus(
        req.params.vendorId,
        req.body.approve,
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        req.body.approve
          ? Msg.APPROVED("vendor", req.params.vendorId)
          : Msg.DISAPPROVED("vendor", req.params.vendorId),
      );
    } catch (error) {
      console.error("Error approving or disapproving vendor: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  productMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await this.adminVendorsService.productMetrics(
        req.params.vendorId,
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { metrics });
    } catch (error) {
      console.error("Error getting product metrics: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getTopList = async (req: Request, res: Response): Promise<void> => {
    try {
      const topVendors = await this.adminVendorsService.getTopList(
        req.query.page as unknown as number,
        req.query.limit as unknown as number,
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { topVendors });
    } catch (error) {
      console.error("Error getting top vendors: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getVendorSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const summary = await this.adminVendorsService.getVendorSummary();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { summary });
    } catch (error) {
      console.error("Error getting vendor summary: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getVendorMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await this.adminVendorsService.getVendorMetrics({
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { metrics });
    } catch (error) {
      console.error("Error getting vendor metrics: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };


  registerVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.validateVendor.signUp(req.body);
      
      await Promise.all([
        this.vendorService.checkEmailIstaken(req.body.email),
        this.vendorService.checkPhoneNumberIstaken(req.body.phoneNumber),
      ]);

      const vendor = await this.vendorRepo.signup(req.body);
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        vendor,
        "Vendor account created",
      );
    } catch (error: unknown) {
      console.error("Error registering vendor from admin:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  updateVendor = async(req: Request, res: Response): Promise<void> => {
    try {
      await this.validateVendor.update(req.body);
      const vendor = await this.adminVendorsService.updateVendor(req.params.vendorId, req.body);
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, vendor, "Vendor updated successfully");
    } catch (error: unknown) {
      console.error("Error updating vendor from admin:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
      
    }

  }

  deleteVendor = async(req: Request, res: Response): Promise<void> => {
    const deleted = await this.adminVendorsService.deleteVendor(req.params.vendorId);
    if(deleted){
      handleSuccessResponse(res, HTTP_STATUS_CODES.NO_CONTENT, null, "Vendor deleted successfully");
    }
    
    handleSuccessResponse(res, HTTP_STATUS_CODES.NOT_FOUND, null, "Vendor not found");

  }
}
