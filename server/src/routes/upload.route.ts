import { Router } from "express";

import { UploadResponse } from "../common/types/index";
import {
  uploadMiddleware,
  uploadToGridFS,
} from "../middlewares/upload.middleware";

const uploadRoutes = Router();

/**
 * POST /upload
 * Upload a PDF file to GridFS
 */
uploadRoutes.post("/", uploadMiddleware, uploadToGridFS, (req, res) => {
  try {
    if (!req.uploadedFile) {
      return res.status(500).json({
        success: false,
        error: "Upload processing failed",
      });
    }

    const response: UploadResponse = {
      fileId: req.uploadedFile.fileId,
      fileName: req.uploadedFile.fileName,
      message: "File uploaded successfully",
    };

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process upload",
    });
  }
});

export default uploadRoutes;
