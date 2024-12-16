import { Request, Response } from "express";

import { HandleException, handleErrorResponse } from "../../../utils";
import { MediaService } from "../services/media.service";
import { UploadedFiles } from "../media.interface";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

export class MediaController {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }
  public uploadMedia = async (req: Request, res: Response): Promise<void> => {
    const files = req.files as UploadedFiles;
    const tags = req.query.tags as string;

    try {
      if (!tags) {
        throw new HandleException(400, "Please provide at least a tag");
      }

      if (!files) {
        throw new HandleException(
          400,
          "No file selected. Please select a file.",
        );
      }

      const fileUrls = await this.mediaService.uploadToCloudinary(files, tags);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { fileUrls },
        "File uploaded",
      );
    } catch (error: unknown) {
      console.error("Error uploading media:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
