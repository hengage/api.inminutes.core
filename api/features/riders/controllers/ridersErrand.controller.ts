import { Request, Response } from "express";
import { handleErrorResponse } from "../../../utils";
import { RiderErrandService } from "../services/ridersErrand.service";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES, USER_TYPE } from "../../../constants";

export class RiderErrandController {
  private riderErrandService: RiderErrandService;
  constructor() {
    this.riderErrandService = new RiderErrandService();
  }

  getHistory = async (req: Request, res: Response) => {
    const userType = req.query.usertype as USER_TYPE.RIDER;
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const riderId = (req as any).user._id;

    try {
      const history = await this.riderErrandService.getHistory({
        userType,
        riderId,
        page,
        limit,
      });

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { history });
    } catch (error: unknown) {
      console.error("Error fetching history:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
