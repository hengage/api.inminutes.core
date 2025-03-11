import { ACCOUNT_STATUS, HTTP_STATUS_CODES } from "../../../constants";
import { handleErrorResponse } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { ridersService } from "../../riders";
import { validateRider } from "../../riders/validators/riders.validators";
import { adminOpsRidersService } from "../services/riders.service";
import { Request, Response } from "express";

export const adminOpsRidersController: AdminOpsRidersController = {
  async getRiders(req: Request, res: Response): Promise<void> {
    try {
      const riders = await adminOpsRidersService.getRiders(
        req.query.page as unknown as number,
        {
          searchQuery: req.query.searchQuery as string,
          vehicleType: req.query.vehicleType as string,
          currentlyWorking: req.query.currentlyWorking as string,
          accountStatus: req.query.accountStatus as ACCOUNT_STATUS,
        },
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { riders });
    } catch (error) {
      console.error("Error getting riders: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async riderDetails(req: Request, res: Response): Promise<void> {
    try {
      const rider = await adminOpsRidersService.riderDetails(
        req.params.riderId,
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { rider });
    } catch (error) {
      console.error("Error getting rider details: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async setAccountStatus(req: Request, res: Response): Promise<void> {
    try {
      await adminOpsRidersService.setAccountStatus(
        req.params.riderId,
        req.body.status,
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, {
        message: `Rider is now ${req.body.status.toLowerCase()}`,
      });
    } catch (error) {
      console.error("Error setting rider account status: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async setApprovalStatus(req: Request, res: Response): Promise<void> {
    try {
      await adminOpsRidersService.setApprovalStatus(
        req.params.riderId,
        req.body.status,
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, {
        message: `Rider approval request has been ${req.body.status.toLowerCase()}`,
      });
    } catch (error) {
      console.error("Error setting rider approval status: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async createRider(req: Request, res: Response): Promise<void> {
    try {
      await validateRider.signUp(req.body);
      const rider = await ridersService.signup(req.body);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        rider,
        "Rider account created",
      );
    } catch (error: any) {
      console.error("Error signing up rider:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async updateRider(req: Request, res: Response): Promise<void> {
    try {
      
    } catch (error) {
      
    }
  },

  async getRiderWallet(req: Request, res: Response): Promise<void> {
    try {
      
    } catch (error) {
      
    }
  }
};

interface AdminOpsRidersController {
  getRiders(req: Request, res: Response): Promise<void>;
  riderDetails(req: Request, res: Response): Promise<void>;
  setAccountStatus(req: Request, res: Response): Promise<void>;
  setApprovalStatus(req: Request, res: Response): Promise<void>;
  createRider(req: Request, res: Response): Promise<void>;
  updateRider(req: Request, res: Response): Promise<void>;
  getRiderWallet(req: Request, res: Response): Promise<void>;
}
