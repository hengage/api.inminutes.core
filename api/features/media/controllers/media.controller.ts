import { Request, Response } from "express";

import { HandleException, STATUS_CODES, handleErrorResponse } from "../../../utils";
import { MediaService } from "../services/media.service";

export class MediaController {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }
  public uploadMedia = async (req: Request, res: Response) => {
    const files = req.files as Record<string, any>;
    const tags = req.query.tags as string;

    try {
      if (!tags) {
        throw new HandleException(400, "Please provide at least a tag");
      }

      if (!files) {
        throw new HandleException(400, "No file selected");
      }

      const fileUrls = await this.mediaService.uploadToCloudinary(files, tags);
      res.status(STATUS_CODES.OK).json({
        message: "File successfully uploaded",
        data: fileUrls,
      });
    } catch (error: any) {
      handleErrorResponse(res, error)
    }
  };
}