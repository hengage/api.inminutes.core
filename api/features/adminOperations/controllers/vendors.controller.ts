import { Request, Response } from "express";
import { AdminOpsVendorsService } from "../services/vendors.service";
import { ACCOUNT_STATUS, HTTP_STATUS_CODES, Msg } from "../../../utils";
import { handleErrorResponse, handleSuccessResponse } from "../../../utils/response.utils";
import { ValidateAdminVendorsOps } from "../validators/adminVendorsOps.validate";

export class AdminOpsVendorsController {
    private vendorsService = new AdminOpsVendorsService();
    private validateAdminVendorsOps = new ValidateAdminVendorsOps
    getAllVendors = async (req: Request, res: Response): Promise<void> => {
        try {
            const vendors = await this.vendorsService.getAllVendors(req.query.page as unknown as number);
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, vendors);

        } catch (error) {
            console.error('Error getting vendors: ', error)
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }

    getVendor = async (req: Request, res: Response): Promise<void> => {
        try {
            const vendor = await this.vendorsService.getVendor(req.params.vendorId);
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, vendor);
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }

    setAccountStatus = async (req: Request, res: Response): Promise<void> => {
        // Todo: Add validation for req.body.status
        try {
            await this.validateAdminVendorsOps.updateAccountStatus(req.body);
            await this.vendorsService.setAccountStatus(
                req.params.vendorId,
                req.body.status as ACCOUNT_STATUS
            );
            handleSuccessResponse(
                res,
                HTTP_STATUS_CODES.OK,
                null,
                Msg.USER_ACCOUNT_STATUS_UPDATED(
                    req.params.vendorId,
                    req.body.status)
            );
        } catch (error) {
            console.error("Error setting vendor account status: ", error);
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }
}
