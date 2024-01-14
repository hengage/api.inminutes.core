import { Router } from "express";
import { adminOpsVendorsRoutes } from "./vendors.routes";

class AdminOpsRoutes {
 
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use("/vendors", adminOpsVendorsRoutes.router);
  }
}

export const adminOpsRoutes = new AdminOpsRoutes();
