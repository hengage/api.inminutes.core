import { Request, Response } from "express";
import {
  addWorkAreaData,
  adminOpsWorkAreaService,
} from "../services/workArea.service";
import { HTTP_STATUS_CODES } from "../../../constants";
import {
  handleErrorResponse,
  handleSuccessResponse,
} from "../../../utils/response.utils";
import { capitalize } from "../../../utils";

export const AdminOpsworkAreaController = {
  async addWorkArea(req: Request, res: Response) {
    try {
      // Todo: validatee req body data
      const workArea = await adminOpsWorkAreaService.addWorkArea(
        req.body as addWorkAreaData,
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { workArea },
        `Added work area - ${capitalize(workArea.name!)}`,
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
      console.log("Error getting work areas: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getWorkSlotSessionsPerArea(req: Request, res: Response) {
    try {
      const timeSlots =
        await adminOpsWorkAreaService.getWorkSlotSessionsPerArea(
          req.params.workAreaId,
          req.query.date as unknown as Date,
        );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { timeSlots });
    } catch (error: unknown) {
      console.log("Error getting time slots: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getBookedRidersForSession(req: Request, res: Response) {
    try {
      const bookedRiders =
        await adminOpsWorkAreaService.getBookedRidersForSession(
          req.params.workSessionId,
        );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { bookedRiders });
    } catch (error: unknown) {
      console.log("Error getting booked riders: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },
};
