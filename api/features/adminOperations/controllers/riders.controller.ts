import { Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../../../constants";
import { handleErrorResponse } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { ridersService } from "../../riders";
import { validateRider } from "../../riders/validators/riders.validators";
import {
  FindNearbyRidersParams,
  GetRidersQueryparams,
} from "../interfaces/rider.interface";
import { adminOpsRidersService } from "../services/riders.service";
import { ValidateAdminOpsRiders } from "../validators/adminOpsRiders.validate";
import { Coordinates } from "../../../types";

export const adminOpsRidersController: AdminOpsRidersController = {
  async getRiders(req: Request, res: Response): Promise<void> {
    try {
      const query: GetRidersQueryparams = req.query;

      await ValidateAdminOpsRiders.getRiders(query);
      const riders = await adminOpsRidersService.getRiders(query);
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
        req.params.riderId
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
        req.body.status
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
        req.body.status
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
        "Rider account created"
      );
    } catch (error: unknown) {
      console.error("Error signing up rider:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async updateRider(req: Request, res: Response): Promise<void> {
    try {
      const { params, body } = req;
      const rider = await adminOpsRidersService.updateRider(
        params.riderId,
        body
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, rider);
    } catch (error) {
      console.error("Error updating rider:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getRiderWallet(req: Request, res: Response): Promise<void> {
    try {
      const wallet = await adminOpsRidersService.getRiderWallet(
        req.params.riderId
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        wallet,
        "Rider Wallet is successfully"
      );
    } catch (error) {
      console.error("Error fetching  rider wallet:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getTopRiders(req: Request, res: Response): Promise<void> {
    try {
      const topRiders = await adminOpsRidersService.getTopList(
        req.query.page as unknown as number,
        req.query as unknown as GetRidersQueryparams
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        topRiders,
        "Top Riders are successfully fetched"
      );
    } catch (error) {
      console.error("Error fetching top riders:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },
  async getRidersSummary(req: Request, res: Response): Promise<void> {
    try {
      const riderSummary = await adminOpsRidersService.getRiderSummary();
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        riderSummary,
        "Rider Summary is successfully fetched"
      );
    } catch (error) {
      console.error("Error fetching rider summary:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },
  async getRiderMetrics(req: Request, res: Response): Promise<void> {
    try {
      const riderMetrics = await adminOpsRidersService.getRiderMetrics({
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
      });
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        riderMetrics,
        "Rider Metrics are successfully fetched"
      );
    } catch (error) {
      console.error("Error fetching rider metrics:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async findNearbyRiders(req: Request, res: Response): Promise<void> {
    try {
      await ValidateAdminOpsRiders.findNearbyRiders(
        req.query as unknown as FindNearbyRidersParams
      );

      const coordinates: Coordinates = [
        parseFloat(req.query.lng as string),
        parseFloat(req.query.lat as string),
      ];
      const distanceInKM: number = parseFloat(req.query.distanceInKM as string);

      const riders = await adminOpsRidersService.findNearbyRiders({
        coordinates,
        distanceInKM,
      });
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, riders);
    } catch (error) {
      console.log("Error finding nearby riders:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async deleteRider(req: Request, res: Response): Promise<void> {
    try {
      await adminOpsRidersService.deleteRider(req.params.riderId);
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.NO_CONTENT,
        null,
        "Rider deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting rider:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },
};

interface AdminOpsRidersController {
  getRiders(req: Request, res: Response): Promise<void>;
  riderDetails(req: Request, res: Response): Promise<void>;
  setAccountStatus(req: Request, res: Response): Promise<void>;
  setApprovalStatus(req: Request, res: Response): Promise<void>;
  createRider(req: Request, res: Response): Promise<void>;
  updateRider(req: Request, res: Response): Promise<void>;
  getRiderWallet(req: Request, res: Response): Promise<void>;
  getTopRiders(req: Request, res: Response): Promise<void>;
  getRidersSummary(req: Request, res: Response): Promise<void>;
  getRiderMetrics(req: Request, res: Response): Promise<void>;
  findNearbyRiders(req: Request, res: Response): Promise<void>;
  deleteRider(req: Request, res: Response): Promise<void>;
}
