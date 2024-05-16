import { Router } from "express";
import { transactionController } from "../controllers/transactions.controller";
import { verifyAuthTokenMiddleware } from "../../../middleware";

class TransactionRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use(verifyAuthTokenMiddleware);
    
    this.router.route("/initialize").post(transactionController.initialize);
  }
}

export const transactionRoutes = new TransactionRoutes();
