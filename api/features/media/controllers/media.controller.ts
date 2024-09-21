import { Request, Response } from "express";

import {
  HandleException,
  HTTP_STATUS_CODES,
  handleErrorResponse,
} from "../../../utils";
import { MediaService } from "../services/media.service";
import { UploadedFiles } from "../media.interface";

export class MediaController {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }
  public uploadMedia = async (req: Request, res: Response) => {
    const files = req.files as UploadedFiles;
    const tags = req.query.tags as string;

    try {
      if (!tags) {
        throw new HandleException(400, "Please provide at least a tag");
      }

      if (!files) {
        throw new HandleException(400, "No file selected. Please select a file.");
      }

      const fileUrls = await this.mediaService.uploadToCloudinary(files, tags);
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "File successfully uploaded",
        data: fileUrls,
      });
    } catch (error: any) {
      console.error("Error uploading media:", error);
      const {statusCode, errorJSON} = handleErrorResponse(error)
      res.status(statusCode).json(errorJSON);
    }
  };
}
