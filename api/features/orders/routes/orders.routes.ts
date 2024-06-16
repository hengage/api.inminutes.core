import { Router } from "express";
import { OrdersController } from "../controllers/orders.controller";
import { verifyAuthTokenMiddleware } from "../../../middleware";

export class OrdersRoutes {
  private ordersController: OrdersController;
  public router: Router;

  constructor() {
    this.ordersController = new OrdersController();

    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use(verifyAuthTokenMiddleware);
    this.router.route("/").post(this.ordersController.create);
    this.router
      .route("/:orderId/feedback")
      .post(this.ordersController.submitOrderFeedback);
    this.router.route("/:orderId").get(this.ordersController.orderDetails);
  }
}
