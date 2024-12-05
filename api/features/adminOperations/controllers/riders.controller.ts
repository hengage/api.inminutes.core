import { handleErrorResponse, HTTP_STATUS_CODES } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { adminOpsRidersService } from "../services/riders.service";
import { Request, Response } from "express";

interface AdminOpsRidersController {
    getRiders(req: Request, res: Response): Promise<void>;
}

export const adminOpsRidersController: AdminOpsRidersController = {
    async getRiders(req: Request, res: Response): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const riders = await adminOpsRidersService.getRiders(page);
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, riders);
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }
};