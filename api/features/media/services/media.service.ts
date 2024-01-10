import { mediaUploadConfig } from "../../../config/cloudinary.config";
import { HandleException, STATUS_CODES } from "../../../utils";

class MediaService {
    public uploadToCloudinary = async (mediaFiles: any, mediaTags: string) => {
      try {
        const files = mediaFiles;
        const uploadPromises: Promise<string>[] = [];
        const fileUrls: Record<string, string> = {};
        const tags = mediaTags;
  
        for (const fieldName in files) {
          const file = files[fieldName];
  
  
          // Upload the file using the cloudinary upload instance
          const uploadPromise = mediaUploadConfig.cloudinaryConfig(
            file.tempFilePath,
            [tags]
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
          error.status || STATUS_CODES.SERVER_ERROR,
          error.message
        );
      }
    };
  }
  
  export const mediaService = new MediaService;