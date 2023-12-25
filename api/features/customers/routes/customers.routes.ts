import { Router } from "express";
import { customersController } from "../controller/customers.controllers";
import { customersAuthentication } from "../auth/customers.auth";

class CustomersRoutes {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(`/signup`, customersController.signup);
    this.router.post("/login", customersAuthentication.login);
  }
}

export const customersRoutes = new CustomersRoutes();
