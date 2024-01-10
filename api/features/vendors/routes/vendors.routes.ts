import { Router } from "express";
import { vendorsController } from "../controllers/vendors.controller";

class VendorsRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.route("/register").post(vendorsController.signup);
    this.router.route("/login").post(vendorsController.login);
  }
}

export const vendorsRoutes = new VendorsRoutes()
