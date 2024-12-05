import { ACCOUNT_STATUS, handleErrorResponse, HTTP_STATUS_CODES } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { adminOpsRidersService } from "../services/riders.service";
import { Request, Response } from "express";


export const adminOpsRidersController: AdminOpsRidersController = {
    async getRiders(req: Request, res: Response): Promise<void> {
        try {
            const riders = await adminOpsRidersService.getRiders(
                req.query.page as unknown as number,
                {
                    searchQuery: req.query.searchQuery as string,
                    vehicleType: req.query.vehicleType as string,
                    currentlyWorking: req.query.currentlyWorking as string,
                    accountStatus: req.query.accountStatus as ACCOUNT_STATUS,
                }
            );
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, riders);
        } catch (error) {
            console.error("Error getting riders: ", error);
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },

    async riderDetails(req: Request, res: Response): Promise<void> {
        try {
            const rider = await adminOpsRidersService.riderDetails(
                req.params.riderId
            );
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, rider);
        } catch (error) {
            console.error("Error getting rider details: ", error);
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },

    async setAccountStatus(req: Request, res: Response): Promise<void> {
        try {
            await adminOpsRidersService.setAccountStatus(
                req.params.riderId,
                req.body.status
            );
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, {
                message: "Rider account status updated successfully",
            });
        } catch (error) {
            console.error("Error setting rider account status: ", error);
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },
};

interface AdminOpsRidersController {
    getRiders(req: Request, res: Response): Promise<void>;
    riderDetails(req: Request, res: Response): Promise<void>;
    setAccountStatus(req: Request, res: Response): Promise<void>;
}