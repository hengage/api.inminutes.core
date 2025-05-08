
import { Router } from "express";
import { AdminOpsForDashboardController } from "../controllers/dashboard.controllers";

export class AdminOpsDashboardRoutes {
    router = Router();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.route("/").get(AdminOpsForDashboardController.getTotalStats);
        this.router.route("/graph").get(AdminOpsForDashboardController.graphData);
        
    }
}

