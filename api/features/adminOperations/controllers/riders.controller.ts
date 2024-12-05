import { ACCOUNT_STATUS, handleErrorResponse, HTTP_STATUS_CODES } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { adminOpsRidersService } from "../services/riders.service";
import { Request, Response } from "express";

interface AdminOpsRidersController {
    getRiders(req: Request, res: Response): Promise<void>;
}

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
    }
};