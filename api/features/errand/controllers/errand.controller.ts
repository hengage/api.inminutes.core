import { Request, Response } from "express";
import { ErrandService } from "../services/errand.service";
import { handleErrorResponse, STATUS_CODES } from "../../../utils";

export class ErrandController {
  private errandService: ErrandService;
  constructor() {
    this.errandService = new ErrandService();
  }

  create = async (req: Request, res: Response) => {
    const customer = (req as any).user._id;
    const data = {
      customer: customer,
      ...req.body,
    };

    try {
      const errand = await this.errandService.create(data);

      res.status(STATUS_CODES.CREATED).json({
        message: "success",
        data: { errand },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };
}
