import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { timeSlotService } from "../services/timeSlot.service";

class TimeSlotController {
  async bookSlot(req: Request, res: Response) {
    const riderId = (req as any).user._id;
    console.log({ body: req.body, riderId });
    try {
      const slot = timeSlotService.bookSlot({
        riderId,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      });
      res.status(HTTP_STATUS_CODES.CREATED).json({
        message: "Success",
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async cancelSlot(req: Request, res: Response) {
    const riderId = (req as any).user._id;

    try {
      const cancelledSlot = await timeSlotService.cancelSlot(req.body.slotId);
      console.log({cancelledSlot})
      return res.status(HTTP_STATUS_CODES.OK).json({
        message: "Success"
      })
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const timeSlotController = new TimeSlotController();
