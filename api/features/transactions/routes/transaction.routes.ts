import { Router } from "express";
import { transactionController } from "../controllers/transactions.controller";
import { verifyAuthTokenMiddleware } from "../../../middleware";
import { cashoutTransferController } from "../controllers/cashoutTransfer.controller";
import { cashoutLimiter } from "../../../middleware/auth.middleware";

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
      .route("/history/:walletId")
      .get(transactionController.getHistory);
    this.router.route("/:transactionId").get(transactionController.getDetails);

    this.router
      .route("/add-cashout-account")
      .post(cashoutTransferController.addCashoutAccount);

    this.router
      .route("/merchant-cashout")
      .post(cashoutLimiter, cashoutTransferController.initialize);
  }
}

export const transactionRoutes = new TransactionRoutes();
