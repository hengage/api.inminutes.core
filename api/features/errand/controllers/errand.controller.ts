import { Request, Response } from "express";
import { errandService } from "../services/errand.service";
import { handleErrorResponse, STATUS_CODES } from "../../../utils";

export class ErrandController {
  // private errandService: ErrandService;
  constructor() {
    // this.errandService = new ErrandService();
  }

  create = async (req: Request, res: Response) => {
    const customer = (req as any).user._id;
    const data = {
      customer: customer,
      ...req.body,
    };

    try {
      const errand = await errandService.create(data);

      res.status(STATUS_CODES.CREATED).json({
        message: "success",
        data: { errand },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };

  getErrand = async (req: Request, res: Response) => {
    try {
      const errand = await errandService.getErrand(req.params.errandId);
      console.log({errand})
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { errand },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };
}
