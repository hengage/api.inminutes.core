import { Router } from "express";
import { mediaController } from "../controllers/media.controller";

class MediaRoutes {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router
      .route(`/files/upload`)
      .post(mediaController.uploadMedia);
  }
}

export const mediaRoutes = new MediaRoutes;
