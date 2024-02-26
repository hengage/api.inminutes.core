import { Router } from "express";
import { ordersController } from "../controllers/orders.controller";
import { verifyAuthTokenMiddleware } from "../../../middleware";

class OrdersRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use(verifyAuthTokenMiddleware);
    this.router.route("/").post(ordersController.create);
    this.router.route("/:orderId").get(ordersController.orderDetails);
  }
}

export const ordersRoutes = new OrdersRoutes();
