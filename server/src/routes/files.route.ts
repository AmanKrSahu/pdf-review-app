import { Router } from "express";

import { getGridFSBucket } from "../common/config/database";

const fileRoutes = Router();

/**
 * GET /files/:fileId
 * Serve PDF file from GridFS
 */
fileRoutes.get("/:fileId", async (req, res) => {
  try {
    const bucket = getGridFSBucket();
    const { fileId } = req.params;

    // Find file
    const files = await bucket.find({ filename: fileId }).toArray();

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const file = files[0];

    // Set appropriate headers
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${
        file.metadata?.originalName || fileId
      }"`,
      "Content-Length": file.length.toString(),
    });

    // Create download stream and pipe to response
    const downloadStream = bucket.openDownloadStreamByName(fileId);

    downloadStream.on("error", (error) => {
      console.error("File stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Failed to stream file",
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("File serve error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to serve file",
    });
  }
});

export default fileRoutes;
