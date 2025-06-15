import { Router } from "express";
import { adminOpsRidersController } from "../controllers/riders.controller";

export class AdminOpsRidersRoutes {
  public router: Router;
  private adminOpsForRidersController: typeof adminOpsRidersController;

  constructor() {
    this.adminOpsForRidersController = adminOpsRidersController;

    this.router = Router();
    this.initializeRoutes();
  }

  async initializeRoutes() {
    this.router.route("/").get(this.adminOpsForRidersController.getRiders);

    this.router
      .route("/top")
      .get(this.adminOpsForRidersController.getTopRiders);
    this.router
      .route("/:riderId/wallet")
      .get(this.adminOpsForRidersController.getRiderWallet);
    this.router
      .route("/summary")
      .get(this.adminOpsForRidersController.getRidersSummary);
    this.router
      .route("/metrics")
      .get(this.adminOpsForRidersController.getRiderMetrics);

    this.router
      .route("/:riderId")
      .get(this.adminOpsForRidersController.riderDetails);
    this.router
      .route("/:riderId/account-status")
      .patch(this.adminOpsForRidersController.setAccountStatus);
    this.router
      .route("/:riderId/approval")
      .patch(this.adminOpsForRidersController.setApprovalStatus);
    this.router.route("/").post(this.adminOpsForRidersController.createRider);
    this.router
      .route("/:riderId")
      .put(this.adminOpsForRidersController.updateRider);
    this.router
      .route("/:riderId")
      .delete(this.adminOpsForRidersController.deleteRider);
  }
}
