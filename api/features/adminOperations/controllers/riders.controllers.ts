import { Request, Response } from "express";
import { adminOpsForRidersService } from "../services/riders.services";
import { handleErrorResponse, HTTP_STATUS_CODES } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";

class AdminOpsForRidersController {

    async createWorkArea(req: Request, res: Response) {
        const { name, coordinates, maxSlotsRequired } = req.body;

        try {
            const workArea = await adminOpsForRidersService.createWorkArea({
                name,
                coordinates,
                maxSlotsRequired,
            });
            handleSuccessResponse(res, HTTP_STATUS_CODES.CREATED, { workArea });
        }
        catch (error: unknown) {
            console.log("Error creating work area: ", error);
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }
}

export const adminOpsForRidersController = new AdminOpsForRidersController();
