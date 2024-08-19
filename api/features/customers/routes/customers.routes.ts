import { Router } from "express";
import { CustomersController } from "../controller/customers.controllers";
import { CustomersAuthentication } from "../auth/customers.auth";
import { verifyAuthTokenMiddleware } from "../../../middleware";
import { CustomersOrdersController } from "../controller/customersOrders.controller";
import { CustomerErrandController } from "../controller/customersErrand.controller";

class CustomersRoutes {
  private customersController: CustomersController;
  private customersAuthentication: CustomersAuthentication
  private customersOrdersController: CustomersOrdersController 
  private customerErrandController: CustomerErrandController

  public router = Router();
  
  constructor() {
    this.customersController = new CustomersController()
    this.customersAuthentication = new CustomersAuthentication();
    this.customersOrdersController = new CustomersOrdersController()
    this.customerErrandController = new CustomerErrandController()

    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post("/send-otp", this.customersController.signupVerificationCode);
    this.router.post(`/signup`, this.customersController.signup);
    this.router.post("/login", this.customersAuthentication.login);

    this.router.use(verifyAuthTokenMiddleware);
    this.router.route("/me").get(this.customersController.getProfile);
    this.router.route("/").patch(this.customersController.updateProfile);
    this.router
      .route("/update-photo")
      .patch(this.customersController.updateDIsplayPhoto);
    this.router
      .route("/delivery-address")
      .patch(this.customersController.updateDeliveryAddress);
    this.router.route("/").delete(this.customersController.deleteAccount);

    this.router.route("/orders").get(this.customersOrdersController.orders);
    this.router
      .route("/order-metrics")
      .get(this.customersOrdersController.orderMetrics);
    this.router.route("/wishlist").get(this.customersController.getWishList);

    this.router.route('/errands').get(this.customerErrandController.getHistory)
  }
}

export const customersRoutes = new CustomersRoutes();
