import { Router } from "express";
import { AdminOpsWalletController } from "../controllers/wallet.controller";

export class AdminOpsWalletRoutes {
    public router: Router;
    private adminOpsWalletController: AdminOpsWalletController;

    constructor() {
        this.adminOpsWalletController = new AdminOpsWalletController();

        this.router = Router();
        this.initializeRoutes();
    }

    async initializeRoutes() {
        this.router
            .route("/merchant/:merchantId")
            .get(this.adminOpsWalletController.getWalletForMerchant);

    }
}