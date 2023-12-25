import { Router } from "express";
import { customersController } from "../controller/customers.controllers";

class CustomersRoutes {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(`/signup`, customersController.signup);

  }
}

export const customersRoutes = new CustomersRoutes();
