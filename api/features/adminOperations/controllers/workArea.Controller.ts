import { Request, Response } from "express";
import { addWorkAreaData, adminOpsWorkAreaService } from "../services/workArea.service";
import { HTTP_STATUS_CODES } from "../../../constants";
import { handleErrorResponse, handleSuccessResponse } from "../../../utils/response.utils";
import { capitalize } from "../../../utils";

export const AdminOpsworkAreaController = {
    async addWorkArea(req: Request, res: Response) {

        try {
            // Todo: validatee req body data
            const workArea = await adminOpsWorkAreaService.addWorkArea(
                req.body as addWorkAreaData
            );
            handleSuccessResponse(
                res,
                HTTP_STATUS_CODES.CREATED,
                { workArea },
                `Added work area - ${capitalize(workArea.name!)}`,
            );
        }
        catch (error: unknown) {
            console.log("Error adding work area: ", error);
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }
}