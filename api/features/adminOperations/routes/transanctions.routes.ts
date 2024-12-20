import { Router } from "express";
import { adminOpsTransactionsController } from "../controllers/transactions.controller";

export class AdminOpsTransactionsRoutes {
    public router: Router;
    private adminOpsForTransactionsController: typeof adminOpsTransactionsController;

    constructor() {
        this.adminOpsForTransactionsController = adminOpsTransactionsController;

        this.router = Router();
        this.initializeRoutes();
    }

    async initializeRoutes() {
        this.router.route("/").get(this.adminOpsForTransactionsController.getTransactions);
        this.router
            .route("/:transactionId")
            .get(this.adminOpsForTransactionsController.getDetails);
    }
}
