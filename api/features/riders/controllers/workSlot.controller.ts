import { Request, Response } from "express";
import { handleErrorResponse } from "../../../utils";
import { workSlotService } from "../services/workSlot.service";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

class WorkSlotController {
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
        "Slot booked",
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
        "Your work slot has been cancelled",
      );
    } catch (error: unknown) {
      console.log("Error cancelling slot:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const workSlotController = new WorkSlotController();
