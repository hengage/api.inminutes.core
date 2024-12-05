import { Request, Response } from "express";
import { errandService } from "../services/errand.service";
import { handleErrorResponse } from "../../../utils";
import { ValidateErrand } from "../validation/errand.validation";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

export class ErrandController {
  // private errandService: ErrandService;
  // this.errandService = new ErrandService();
  private validateErrand: ValidateErrand;

  constructor() {
    this.validateErrand = new ValidateErrand();

  }

  create = async (req: Request, res: Response) => {
    const customer = (req as any).user._id;
    const data = {
      customer: customer,
      ...req.body,
    };

    try {
      await this.validateErrand.create(data);
      const errand = await errandService.create(data);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        errand
      )
    } catch (error: unknown) {
      console.log("Error creating errand: ", error)
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getErrand = async (req: Request, res: Response) => {
    try {
      const errand = await errandService.getErrand(req.params.errandId);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        errand
      )
    } catch (error: unknown) {
      console.log("Error getting errand: ", error)
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
