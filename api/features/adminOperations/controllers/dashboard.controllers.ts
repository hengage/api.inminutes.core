
import { Request, Response } from "express";
import { handleErrorResponse, Msg } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";
import { AdminOpsForDashboardService, Timeframe } from "../services/dashboard.services";

export const AdminOpsForDashboardController = {
    async getTotalStats(req: Request, res: Response) {
        try {
            const {startDate, endDate} = req.query;
            const data = await AdminOpsForDashboardService.getStats(startDate as string, endDate as string);
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { data });
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },

    async graphData(req: Request, res: Response) {
        try {
            const {service, timeframe, startDate, endDate}: {
                service: "customers" | "riders" | "vendors";
                timeframe: Timeframe;
                startDate: string;
                endDate: string;
            } = req.query as any;
            const data = await AdminOpsForDashboardService.graphData(service , timeframe, startDate, endDate)
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { data });
        } catch (error) {
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }

}
