import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "./secrets.config";

export class MediaUploadConfig {
  constructor() {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }

  public async cloudinaryConfig(imagePath: string, tags: string[]) {
    const options = {
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      tags: tags.join(","),
    };

    const result = await cloudinary.uploader.upload(imagePath, options);

    return result.secure_url;
  }
}
