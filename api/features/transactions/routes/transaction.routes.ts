import { Router } from "express";
import { transactionController } from "../controllers/transactions.controller";
import { verifyAuthTokenMiddleware } from "../../../middleware";
import { transferController } from "../controllers/transfer.controller";

class TransactionRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.route("/webhook").post(transactionController.webhook);

    this.router.use(verifyAuthTokenMiddleware);

    this.router.route("/initialize").post(transactionController.initialize);

    this.router
      .route("/create-transfer-recipient")
      .post(transferController.createTransferReipient);

    this.router
      .route("/initialize-transfer")
      .post(transferController.initialize);
  }
}

export const transactionRoutes = new TransactionRoutes();
