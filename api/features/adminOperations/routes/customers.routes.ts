
import { Router } from "express";
import { AdminOpsForCustomersController } from "../controllers/customers.controllers";

export class AdminOpsCustomersRoutes {
    router = Router();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.route("/").get(AdminOpsForCustomersController.getList);
        this.router.route("/top").get(AdminOpsForCustomersController.getTopList);
        this.router.route("/summary").get(AdminOpsForCustomersController.getCustomerSummary);
        this.router.route("/metrics").get(AdminOpsForCustomersController.getCustomerMetrics);
        this.router.route("/:customerId").get(AdminOpsForCustomersController.customerDetails);
        this.router
            .route("/:customerId/status")
            .patch(AdminOpsForCustomersController.setAccountStatus);
        
    }
}

