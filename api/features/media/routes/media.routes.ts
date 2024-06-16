import { Router } from "express";
import { MediaController } from "../controllers/media.controller";

export class MediaRoutes {
  public mediaController: MediaController;
  public router = Router();

  constructor() {
    this.mediaController = new MediaController()
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router
      .route(`/files/upload`)
      .post(this.mediaController.uploadMedia);
  }
}