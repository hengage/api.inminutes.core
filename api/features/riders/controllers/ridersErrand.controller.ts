import { Request, Response } from "express";
import { handleErrorResponse, HTTP_STATUS_CODES } from "../../../utils";
import { RiderErrandService } from "../services/ridersErrand.service";

export class RiderErrandController {
  private riderErrandService: RiderErrandService;
  constructor() {
    this.riderErrandService = new RiderErrandService();
  }

  getHistory = async (req: Request, res: Response) => {
    const userType = req.query.usertype as "rider";
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const riderId = (req as any).user._id;

    console.log({ userType, riderId, page, limit });

    try {
      const history = await this.riderErrandService.getHistory({
        userType,
        riderId,
        page,
        limit,
      });
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "success",
        history,
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };
}
