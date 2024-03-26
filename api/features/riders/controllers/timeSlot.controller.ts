import { Request, Response } from "express";
import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { timeSlotService } from "../services/timeSlot.service";

class TimeSlotController {
  async bookSlot(req: Request, res: Response) {
    const riderId = (req as any).user._id;
    console.log({body: req.body, riderId})
    try {
      const slot = timeSlotService.bookSlot({
        riderId,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      });
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const timeSlotController = new TimeSlotController();
