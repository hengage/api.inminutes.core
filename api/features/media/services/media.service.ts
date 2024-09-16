import { MediaUploadConfig } from "../../../config/cloudinary.config";
import { DynamicObject } from "../../../types";
import { HandleException, HTTP_STATUS_CODES } from "../../../utils";

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
  public uploadToCloudinary = async (mediaFiles: DynamicObject, mediaTags: string) => {
    console.log({ mediaFiles });
    try {
      const uploadPromises: Promise<string>[] = [];
      let fileUrls: Record<string, string> = {};

      for (const fieldName in mediaFiles) {
        const file = mediaFiles[fieldName];

        // Upload the file using the cloudinary upload instance
        const uploadPromise = this.mediaUploadConfig.cloudinaryConfig(
          file.tempFilePath,
          [mediaTags]
        );

        uploadPromises.push(uploadPromise);

        // Store the promise result in the fileUrls object
        uploadPromise.then((url) => {
          fileUrls[fieldName] = url;
        });
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      return fileUrls;
    } catch (error: any) {
      throw new HandleException(
        error.status || HTTP_STATUS_CODES.SERVER_ERROR,
        error.message
      );
    }
  };
}
