import { Router } from "express";
import { verifyController } from "../controllers/verify.controller";
import { passwordController } from "../controllers/password.controller";

class AuthRoutes {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router
      .route("/verify/phone-number/send-code")
      .post(verifyController.sendVerificationCode);

    this.router
      .route("/verify/phone-number/check-code")
      .post(verifyController.checkVerificationCode);

    this.router.route("password/reset").post(passwordController.resetPassword);
    this.router
      .route("password/change")
      .post(passwordController.changePassword);
  }
}

export const authRoutes = new AuthRoutes();
