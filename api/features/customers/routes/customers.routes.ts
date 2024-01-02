import { Router } from "express";
import { customersController } from "../controller/customers.controllers";
import { customersAuthentication } from "../auth/customers.auth";
import { verifyAuthTokenMiddleware } from "../../../middleware";

class CustomersRoutes {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(`/signup`, customersController.signup);
    this.router.post("/login", customersAuthentication.login);

    this.router.use(verifyAuthTokenMiddleware);
    this.router.route("/me").get(customersController.getProfile);
  }
}

export const customersRoutes = new CustomersRoutes();
