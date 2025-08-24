import { Request, Response } from "express";
import { handleErrorResponse } from "../../../utils";
import { workSlotService } from "../services/workSlot.service";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";
import { validateRider } from "../validators/riders.validators";

class WorkSlotController {
  async getWorkAreas(req: Request, res: Response) {
    try {
      const { limit, page } = req.query;
      const workAreas = await workSlotService.getWorkAreas({
        limit: Number(limit),
        page: Number(page),
      });
      return handleSuccessResponse(res, HTTP_STATUS_CODES.OK, workAreas);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async getWorkSessionsForArea(req: Request, res: Response) {
    const areaId = req.params.areaId;
    const date = req.query.date;
    try {
      validateRider.getWorkSessionsForArea({ areaId, date: date as string });
      const workSessions = await workSlotService.getWorkSessionsForArea(
        areaId,
        new Date(date as string)
      );
      return handleSuccessResponse(res, HTTP_STATUS_CODES.OK, workSessions);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async bookSlot(req: Request, res: Response) {
    const riderId = (req as any).user._id;
    // Todo: validate endpoint data
    try {
      const slot = await workSlotService.bookSlot({
        riderId,
        areaId: req.body.areaId,
        date: req.body.date,
        session: req.body.session,
      });

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { slot },
        "Slot booked"
      );
    } catch (error: any) {
      console.error("Error booking slot:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async cancelSlot(req: Request, res: Response) {
    try {
      const cancelledSlot = await workSlotService.cancelSlot(req.body.slotId);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { cancelledSlot },
        "Your work slot has been cancelled"
      );
    } catch (error: unknown) {
      console.log("Error cancelling slot:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const workSlotController = new WorkSlotController();
