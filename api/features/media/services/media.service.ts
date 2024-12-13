import { MediaUploadConfig } from "../../../config/cloudinary.config";
import { HTTP_STATUS_CODES } from "../../../constants";
import { HandleException } from "../../../utils";
import { UploadedFiles } from "../media.interface";

export class MediaService {
  private mediaUploadConfig: MediaUploadConfig;

  constructor() {
    this.mediaUploadConfig = new MediaUploadConfig();
  }
  /**
   * @param  {object} mediaFiles - The media files to upload.
   * @param  {string} mediaTags - The tags to associate with the uploaded media.
   * @returns {Promise<Record<string, string>>} An object with the uploaded file URLs.
   */
  public uploadToCloudinary = async (
    mediaFiles: UploadedFiles,
    mediaTags: string,
  ): Promise<Record<string, string>> => {
    try {
      const uploadPromises: Promise<string>[] = [];
      const fileUrls: Record<string, string> = {};

      for (const fieldName in mediaFiles) {
        const file = mediaFiles[fieldName];

        // Upload the file using the cloudinary upload instance
        if (typeof file?.tempFilePath === "string") {
          const uploadPromise = this.mediaUploadConfig.cloudinaryConfig(
            file.tempFilePath,
            [mediaTags],
          );

          uploadPromises.push(uploadPromise);

          // Store the promise result in the fileUrls object
          uploadPromise.then((url) => {
            fileUrls[fieldName] = url;
          });
        } else {
          throw new HandleException(
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid file type. Only images and videos are allowed.",
          );
        }
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      return fileUrls;
    } catch (error: any) {
      throw new HandleException(
        error.status || HTTP_STATUS_CODES.SERVER_ERROR,
        error.message,
      );
    }
  };
}
