import { Request, Response } from "express";
import {
  addWorkAreaData,
  adminOpsWorkAreaService,
} from "../services/workAreaAndSessions.service";
import { HTTP_STATUS_CODES } from "../../../constants";
import {
  handleErrorResponse,
  handleSuccessResponse,
} from "../../../utils/response.utils";
import { capitalize } from "../../../utils";
import { ValidateAdminOpsWorkAreaAndSessions } from "../validators/adminWorkAreaAndSessions.validate";

export const AdminOpsworkAreaController = {
  async addWorkArea(req: Request, res: Response) {
    try {
      // Todo: validatee req body data
      await ValidateAdminOpsWorkAreaAndSessions.addWorkArea(req.body);
      const workArea = await adminOpsWorkAreaService.addWorkArea(
        req.body as addWorkAreaData
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { workArea },
        `Added work area - ${capitalize(workArea.name!)}`
      );
    } catch (error: unknown) {
      console.log("Error adding work area: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getWorkAreas(req: Request, res: Response) {
    try {
      const workAreas = await adminOpsWorkAreaService.getWorkAreas();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, workAreas);
    } catch (error: unknown) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getWorkSessionsPerArea(req: Request, res: Response) {
    try {
      ValidateAdminOpsWorkAreaAndSessions.getWorkSessionsPerArea({
        workAreaId: req.params.workAreaId,
        date: req.query.date as unknown as Date,
      });
      const timeSlots = await adminOpsWorkAreaService.getWorkSessionsPerArea(
        req.params.workAreaId,
        req.query.date as unknown as Date
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { timeSlots });
    } catch (error: unknown) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getBookedRidersForSession(req: Request, res: Response) {
    try {
      const bookedRiders =
        await adminOpsWorkAreaService.getBookedRidersForSession(
          req.params.workSessionId
        );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { bookedRiders });
    } catch (error: unknown) {
      console.log("Error getting booked riders: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },
};
