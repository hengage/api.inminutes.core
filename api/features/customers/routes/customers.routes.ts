import { Router } from "express";
import { customersController } from "../controller/customers.controllers";
import { customersAuthentication } from "../auth/customers.auth";
import { verifyAuthTokenMiddleware } from "../../../middleware";
import { customersOrdersController } from "../controller/customersOrders.controller";

class CustomersRoutes {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post("/send-otp", customersController.signupVerificationCode);
    this.router.post(`/signup`, customersController.signup);
    this.router.post("/login", customersAuthentication.login);

    this.router.use(verifyAuthTokenMiddleware);
    this.router.route("/me").get(customersController.getProfile);
    this.router.route("/").patch(customersController.updateProfile);
    this.router
      .route("/update-photo")
      .patch(customersController.updateDIsplayPhoto);
    this.router
      .route("/delivery-address")
      .patch(customersController.updateDeliveryAddress);
    this.router.route("/").delete(customersController.deleteAccount);

    this.router.route("/orders").get(customersOrdersController.orders);
    this.router
      .route("/order-metrics")
      .get(customersOrdersController.orderMetrics);
    this.router.route("/wishlist").get(customersController.getWishList);
  }
}

export const customersRoutes = new CustomersRoutes();
