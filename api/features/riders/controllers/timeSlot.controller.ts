import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { timeSlotService } from "../services/timeSlot.service";
import { handleSuccessResponse } from "../../../utils/response.utils";

class TimeSlotController {
  async bookSlot(req: Request, res: Response) {
    const riderId = (req as any).user._id;
    try {
      const slot = timeSlotService.bookSlot({
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
      const cancelledSlot = await timeSlotService.cancelSlot(req.body.slotId);

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

export const timeSlotController = new TimeSlotController();
