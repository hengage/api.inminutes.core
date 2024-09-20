import fileUpload from "express-fileupload";

/**
 * Represents the uploaded files in an Express request.
 * The keys in the object are the field names from the form submission,
 * and the values are either the full `Express.Request["files"]` object
 * or a single `fileUpload.UploadedFile` instance.
 */
export interface UploadedFiles {
    [fieldname: string]: Express.Request["files"] | fileUpload.UploadedFile;
  }