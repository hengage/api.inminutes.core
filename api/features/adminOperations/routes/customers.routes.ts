
import { Router } from "express";
import { AdminOpsForCustomersController } from "../controllers/customers.controllers";

export class AdminOpsCustomersRoutes {
    router = Router();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.route("/").get(AdminOpsForCustomersController.getList);
        this.router.route("/:customerId").get(AdminOpsForCustomersController.customerDetails);
    }
}

