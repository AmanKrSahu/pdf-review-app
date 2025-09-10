import multer from "multer";
import { Readable } from "stream";
import { Request, Response, NextFunction } from "express";

import { config } from "../common/config/app.config";
import { getGridFSBucket } from "../common/config/database";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(config.MAX_FILE_SIZE || "26214400"), // 25MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Middleware to handle GridFS upload
export const uploadToGridFS = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No file provided",
    });
  }

  try {
    const bucket = getGridFSBucket();
    const filename = `${Date.now()}-${req.file.originalname}`;

    // Create upload stream
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
        uploadDate: new Date(),
      },
    });

    // Create readable stream from buffer
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    // Handle upload completion
    uploadStream.on("finish", () => {
      req.uploadedFile = {
        fileId: filename,
        fileName: req.file!.originalname,
        gridFSId: uploadStream.id,
      };
      next();
    });

    uploadStream.on("error", (error) => {
      console.error("GridFS upload error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to upload file",
      });
    });

    // Pipe the readable stream to upload stream
    readableStream.pipe(uploadStream);
  } catch (error) {
    console.error("Upload middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Upload processing failed",
    });
  }
};

// Export the multer upload middleware
export const uploadMiddleware = upload.single("file");

// Extend Request interface to include uploaded file info
declare global {
  namespace Express {
    interface Request {
      uploadedFile?: {
        fileId: string;
        fileName: string;
        gridFSId: any;
      };
    }
  }
}
