/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";

export const deleteUploadedFileFromCloudinary = async (req: Request) => {
  try {
    const filesToDelete = [];
    if (req.file && req.file?.path) {
      filesToDelete.push(req.file.path);
    } else if (
      req.files &&
      typeof req.files === "object" &&
      !Array.isArray(req.files)
    ) {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => {
            if (file && file?.path) {
              filesToDelete.push(file.path);
            }
          });
        }
      });
    } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file && file?.path) {
          filesToDelete.push(file.path);
        }
      });
    }
    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map(async (url) => {
          deleteFileFromCloudinary(url);
        }),
      );
      console.log(
        `\nDeleted ${filesToDelete.length} uploaded files from Cloudinary due to an error during request processing.\n`,
      );
    }
  } catch (error: any) {
    console.error("Error deleting uploaded files from Cloudinary:", error);
  }
};
