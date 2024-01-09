import { Router } from "express";
import { customersRoutes } from "./features/customers";
import { authRoutes } from "./features/authentication";
import { vendorsRoutes } from "./features/vendors";

class Routes {
  /*
        Imports and sets up all the necessary routes classes for use in the application.
        The main purpose of this class is to provide a centralized location to manage
        the routing configuration for the application, making it easier  to add, modify, or remove routes as needed.
    */
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use("/auth", authRoutes.router);
    this.router.use("/customers", customersRoutes.router);
    this.router.use("/vendors", vendorsRoutes.router);
  }
}

export const routes = new Routes();
