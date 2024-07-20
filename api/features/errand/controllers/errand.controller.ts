import { Request, Response } from "express";
import { ErrandService } from "../services/errand.service";
import { handleErrorResponse, STATUS_CODES } from "../../../utils";
import { ValidateErrand } from "../validation/errand.validation";

export class ErrandController {
  private errandService: ErrandService;
  private validateErrand: ValidateErrand;

  constructor() {
    this.errandService = new ErrandService();
    this.validateErrand  = new ValidateErrand();

  }

  create = async (req: Request, res: Response) => {
    const customer = (req as any).user._id;
    const data = {
      customer: customer,
      ...req.body,
    };

    try {
      await this.validateErrand.create(data);
      const errand = await this.errandService.create(data);

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
      const errand = await this.errandService.getErrand(req.params.errandId);
      console.log({ errand });
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { errand },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  };
}
