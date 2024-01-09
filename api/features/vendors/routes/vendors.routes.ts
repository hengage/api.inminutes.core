import { Router } from "express";
import { vendorsController } from "../controllers/vendors.controller";

class VendorsRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.route("/register").post(vendorsController.signup);
  }
}

export const vendorsRoutes = new VendorsRoutes()
